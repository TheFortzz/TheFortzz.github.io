const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const storage = require('./storage');

const app = express();
const PORT = 5000;
const HOST = '0.0.0.0';

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const user = await storage.createUser(username, password);
    const token = await storage.createSession(username);

    res.json({ success: true, user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await storage.authenticateUser(username, password);
    const token = await storage.createSession(username);

    res.json({ success: true, user, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Centralized bullet update system - runs once for all game modes
setInterval(() => {
  Object.keys(gameModes).forEach((modeKey) => {
    const gameState = gameModes[modeKey];

    // Skip if no bullets
    if (gameState.bullets.length === 0) return;

    const bulletsToRemove = [];

    gameState.bullets.forEach((bullet, bulletIndex) => {
      // Update bullet position
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      // Check wall collision
      const hitWall = gameState.walls.some((wall) => {
        const dx = bullet.x - wall.x;
        const dy = bullet.y - wall.y;
        return Math.sqrt(dx * dx + dy * dy) < wall.radius;
      });

      if (hitWall) {
        bulletsToRemove.push(bullet.id);
        broadcastToMode(gameState, {
          type: 'bulletImpact',
          x: bullet.x,
          y: bullet.y,
          impactType: 'wall',
          bulletColor: bullet.color
        });
        return;
      }

      // Check player collision
      for (const [pid, player] of Object.entries(gameState.players)) {
        if (pid === bullet.playerId) continue;

        const dx = bullet.x - player.x;
        const dy = bullet.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // TANK_SIZE = 90 on client, so radius = 45
        if (distance < 45) {
          // Check if player has infinite health power-up
          if (player.infiniteHealth) {
            bulletsToRemove.push(bullet.id);
            broadcastToMode(gameState, {
              type: 'bulletImpact',
              x: bullet.x,
              y: bullet.y,
              impactType: 'player',
              bulletColor: bullet.color
            });
            return;
          }

          let damage = 10;

          if (player.shield > 0) {
            player.shield = Math.max(0, player.shield - damage);
          } else {
            damage = Math.min(damage, player.health, 20);
            player.health = Math.max(0, player.health - damage);
          }

          bulletsToRemove.push(bullet.id);

          broadcastToMode(gameState, {
            type: 'bulletImpact',
            x: bullet.x,
            y: bullet.y,
            impactType: 'player',
            bulletColor: bullet.color
          });

          broadcastToMode(gameState, {
            type: 'playerDamaged',
            playerId: pid,
            health: player.health,
            shield: player.shield
          });

          if (player.health === 0) {
            // Get killer for combo tracking
            const killer = gameState.players[bullet.playerId];
            if (killer) {
              killer.combo = (killer.combo || 0) + 1;
              killer.lastKillTime = Date.now();

              // Award kill reward (10 Fortz per kill) and persist to database
              const rewardAmount = 10;
              if (killer.username) {
                // Update user's Fortz in database
                storage.getUser(killer.username).then((user) => {
                  if (user) {
                    const newBalance = (user.fortzCurrency || 0) + rewardAmount;
                    storage.updateUser(killer.username, { fortzCurrency: newBalance }).
                    then(() => {
                      console.log(`Awarded ${rewardAmount} Fortz to ${killer.username} (new balance: ${newBalance})`);

                      // Send updated balance to the killer
                      gameState.clients.forEach((client) => {
                        if (client.playerId === bullet.playerId && client.readyState === 1) {
                          client.send(JSON.stringify({
                            type: 'killReward',
                            amount: rewardAmount,
                            newBalance: newBalance,
                            victimId: pid
                          }));
                        }
                      });
                    }).
                    catch((err) => console.error('Error updating Fortz:', err));
                  }
                }).catch((err) => console.error('Error getting user:', err));
              } else {
                // Guest player - send reward notification only (not persisted)
                gameState.clients.forEach((client) => {
                  if (client.playerId === bullet.playerId && client.readyState === 1) {
                    client.send(JSON.stringify({
                      type: 'killReward',
                      amount: rewardAmount,
                      victimId: pid,
                      message: 'Login to save your Fortz!'
                    }));
                  }
                });
              }
            }

            broadcastToMode(gameState, {
              type: 'playerDied',
              playerId: pid,
              killerId: bullet.playerId,
              combo: killer ? killer.combo : 1
            });
          }
          return;
        }
      }

      // Check boundary
      if (bullet.x < 0 || bullet.x > gameState.gameWidth ||
      bullet.y < 0 || bullet.y > gameState.gameHeight) {
        bulletsToRemove.push(bullet.id);
        return;
      }

      // Check lifetime (10 seconds)
      if (Date.now() - bullet.createdAt > 10000) {
        bulletsToRemove.push(bullet.id);
      }
    });

    // Remove all bullets that hit something or expired
    if (bulletsToRemove.length > 0) {
      gameState.bullets = gameState.bullets.filter((b) => !bulletsToRemove.includes(b.id));
      broadcastToMode(gameState, {
        type: 'bulletsDestroyed',
        bulletIds: bulletsToRemove
      });
    }
  });
}, 16); // 60fps update rate


app.post('/api/logout', async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      await storage.deleteSession(token);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const user = await storage.getUser(session.username);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/update', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const updates = req.body;
    const user = await storage.updateUser(session.username, updates);

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    const users = await storage.searchUsers(q);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/friends/request', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { toUsername } = req.body;
    await storage.sendFriendRequest(session.username, toUsername);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/friends/requests', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const received = await storage.getFriendRequests(session.username, 'received');
    const sent = await storage.getFriendRequests(session.username, 'sent');

    res.json({ received, sent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/friends/accept', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { fromUsername } = req.body;
    await storage.acceptFriendRequest(fromUsername, session.username);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/friends/reject', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { fromUsername } = req.body;
    await storage.rejectFriendRequest(fromUsername, session.username);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/friends', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const friends = await storage.getFriends(session.username);
    res.json({ friends });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/friends/:username', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { username } = req.params;
    await storage.removeFriend(session.username, username);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/party/invite', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { toUsername } = req.body;
    const invite = await storage.sendPartyInvite(session.username, toUsername);

    res.json({ success: true, invite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/party/invites', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const received = await storage.getPartyInvites(session.username, 'received');
    const sent = await storage.getPartyInvites(session.username, 'sent');

    res.json({ received, sent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/party/accept', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { fromUsername } = req.body;
    const party = await storage.acceptPartyInvite(fromUsername, session.username);

    res.json({ success: true, party });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/party/reject', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { fromUsername } = req.body;
    await storage.rejectPartyInvite(fromUsername, session.username);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/party', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const party = await storage.getParty(session.username);
    res.json({ party });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/party/leave', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    await storage.leaveParty(session.username);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/party/kick', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    await storage.kickPartyMember(session.username, username);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const gameModes = {
  ffa: { players: {}, shapes: [], walls: [], bullets: [], powerUps: [], gameWidth: 7500, gameHeight: 7500, clients: new Set() },
  tdm: { players: {}, shapes: [], walls: [], bullets: [], powerUps: [], gameWidth: 7500, gameHeight: 7500, clients: new Set() },
  ctf: { players: {}, shapes: [], walls: [], bullets: [], powerUps: [], gameWidth: 7500, gameHeight: 7500, clients: new Set() },
  koth: { players: {}, shapes: [], walls: [], bullets: [], powerUps: [], gameWidth: 7500, gameHeight: 7500, clients: new Set() },
  br: { players: {}, shapes: [], walls: [], bullets: [], powerUps: [], gameWidth: 7500, gameHeight: 7500, clients: new Set() },
  dom: { players: {}, shapes: [], walls: [], bullets: [], powerUps: [], gameWidth: 7500, gameHeight: 7500, clients: new Set() }
};

// Track lobby connections
const lobbyClients = new Set();

function broadcastToMode(gameState, message, excludeWs = null) {
  gameState.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

function broadcastPlayerCounts() {
  const counts = {
    ffa: Object.keys(gameModes.ffa.players).length,
    tdm: Object.keys(gameModes.tdm.players).length,
    ctf: Object.keys(gameModes.ctf.players).length,
    koth: Object.keys(gameModes.koth.players).length,
    br: Object.keys(gameModes.br.players).length
  };

  const message = JSON.stringify({
    type: 'playerCounts',
    counts: counts
  });

  lobbyClients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

function generateShapes(count = 80, gameWidth = 7500, gameHeight = 7500) {
  const shapes = [];
  const shapeTypes = ['square', 'triangle', 'pentagon', 'hexagon'];

  for (let i = 0; i < count; i++) {
    shapes.push({
      id: `shape_${i}`,
      type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
      x: Math.random() * (gameWidth - 200) + 100,
      y: Math.random() * (gameHeight - 200) + 100,
      size: 20 + Math.random() * 30,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      health: 100,
      maxHealth: 100
    });
  }
  return shapes;
}


















































function generatePowerUps(count = 10, gameWidth = 7500, gameHeight = 7500) {
  const powerUps = [];
  const types = ['BLUEHEALTH', 'INFINITEHEALTH', 'TELEPORTATION', 'DOUBLEBULLET', 'SPEED2X'];
  const typeConfigs = {
    BLUEHEALTH: { image: '/bluehealth100+.png', color: '#4169E1', duration: 0, effect: 'bluehealth' },
    INFINITEHEALTH: { image: '/infinitehealth.png', color: '#FFD700', duration: 60000, effect: 'infinitehealth' },
    TELEPORTATION: { image: '/teleportation.png', color: '#00FF00', duration: 0, effect: 'teleportation' },
    DOUBLEBULLET: { image: '/doublebullet.png', color: '#FF00FF', duration: 60000, effect: 'doublebullet' },
    SPEED2X: { image: '/speed2x.png', color: '#FF4500', duration: 60000, effect: 'speed2x' }
  };

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const config = typeConfigs[type];

    powerUps.push({
      id: `powerup_${i}`,
      type: type,
      x: 200 + Math.random() * (gameWidth - 400),
      y: 200 + Math.random() * (gameHeight - 400),
      image: config.image,
      color: config.color,
      effect: config.effect,
      duration: config.duration,
      pulse: 0
    });
  }
  return powerUps;
}

Object.keys(gameModes).forEach((mode) => {
  gameModes[mode].shapes = generateShapes(80, gameModes[mode].gameWidth, gameModes[mode].gameHeight);
  gameModes[mode].walls = []; // No walls - removed red wall obstacles
  gameModes[mode].powerUps = generatePowerUps(10, gameModes[mode].gameWidth, gameModes[mode].gameHeight);
});

let clientCounter = 0;

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const mode = url.searchParams.get('mode') || 'ffa';
  const isLobby = url.searchParams.get('lobby') === 'true';

  const gameState = gameModes[mode] || gameModes.ffa;

  const clientId = `client_${++clientCounter}`;
  let playerId = null;

  console.log(`Client connected to ${mode} mode (lobby: ${isLobby})`);

  if (!isLobby) {
    gameState.clients.add(ws);

    playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    gameState.players[playerId] = {
      id: playerId,
      x: Math.random() * (gameState.gameWidth - 200) + 100,
      y: Math.random() * (gameState.gameHeight - 200) + 100,
      angle: 0,
      tankDirection: 0,
      name: `Tank ${Object.keys(gameState.players).length + 1}`,
      score: 0,
      level: 1,
      health: 100,
      shield: 100,
      maxHealth: 100,
      maxShield: 100,
      selectedTank: {
        color: 'blue',
        body: 'body_halftrack',
        weapon: 'turret_01_mk1'
      }
    };

    ws.send(JSON.stringify({
      type: 'gameState',
      playerId: playerId,
      clientId: clientId,
      players: gameState.players,
      shapes: gameState.shapes,
      walls: gameState.walls,
      bullets: gameState.bullets,
      powerUps: gameState.powerUps,
      gameWidth: gameState.gameWidth,
      gameHeight: gameState.gameHeight,
      wallColor: mode === 'ffa' ? '#FF6B6B' : '#6B6FF'
    }));

    broadcastToMode(gameState, {
      type: 'playerJoined',
      player: gameState.players[playerId]
    }, ws);

    // Broadcast updated player counts to all lobby clients
    broadcastPlayerCounts();
  } else {
    // Add to lobby clients
    lobbyClients.add(ws);

    ws.send(JSON.stringify({
      type: 'lobbyState',
      walls: gameState.walls,
      shapes: gameState.shapes,
      gameWidth: gameState.gameWidth,
      gameHeight: gameState.gameHeight
    }));

    // Send current player counts immediately
    broadcastPlayerCounts();
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case 'move':
          if (playerId && gameState.players[playerId]) {
            Object.assign(gameState.players[playerId], {
              x: data.x,
              y: data.y,
              angle: data.angle,
              tankDirection: data.tankDirection,
              velocity: data.velocity,
              infiniteHealth: data.infiniteHealth || false
            });

            broadcastToMode(gameState, {
              type: 'playerUpdate',
              id: playerId,
              x: data.x,
              y: data.y,
              angle: data.angle,
              tankDirection: data.tankDirection
            }, ws);
          }
          break;

        case 'setPlayerData':
          if (playerId && gameState.players[playerId]) {
            if (data.selectedTank) {
              gameState.players[playerId].selectedTank = data.selectedTank;
            }
            if (data.username) {
              gameState.players[playerId].username = data.username;
              gameState.players[playerId].name = data.username; // Use username as display name
            }
            console.log(`Player ${playerId} (${data.username || 'Guest'}) equipped tank:`, data.selectedTank);

            // Broadcast player update to all clients
            broadcastToMode(gameState, {
              type: 'playerUpdate',
              id: playerId,
              name: gameState.players[playerId].name,
              selectedTank: data.selectedTank
            }, ws);
          }
          break;

        case 'playerShoot':
          if (playerId && gameState.players[playerId]) {
            const player = gameState.players[playerId];
            const angle = data.angle;
            const bulletSpeed = 24; // 2x faster (was 12)
            const isDoubleBullet = data.doubleBullet;
            const tankVelocity = data.tankVelocity || { x: 0, y: 0 }; // Get tank velocity from client

            // The angle sent from client is the weapon angle
            // Bullets spawn from weapon tip pointing in weapon direction
            const bulletAngle = angle;
            const weaponOffset = 80; // Distance from tank center to weapon muzzle

            // Create bullets array (1 or 2 bullets based on power-up)
            const bulletsToCreate = [];

            if (isDoubleBullet) {
              // Create two bullets with slight offset angle
              const angleOffset = 0.1; // Small angle difference for spread

              bulletsToCreate.push({
                id: `bullet_${Date.now()}_${Math.random()}`,
                x: player.x + Math.cos(bulletAngle - angleOffset) * weaponOffset,
                y: player.y + Math.sin(bulletAngle - angleOffset) * weaponOffset,
                vx: Math.cos(bulletAngle - angleOffset) * bulletSpeed + tankVelocity.x,
                vy: Math.sin(bulletAngle - angleOffset) * bulletSpeed + tankVelocity.y,
                angle: bulletAngle - angleOffset,
                playerId: playerId,
                color: player.selectedTank?.color || 'blue',
                createdAt: Date.now()
              });

              bulletsToCreate.push({
                id: `bullet_${Date.now()}_${Math.random()}_2`,
                x: player.x + Math.cos(bulletAngle + angleOffset) * weaponOffset,
                y: player.y + Math.sin(bulletAngle + angleOffset) * weaponOffset,
                vx: Math.cos(bulletAngle + angleOffset) * bulletSpeed + tankVelocity.x,
                vy: Math.sin(bulletAngle + angleOffset) * bulletSpeed + tankVelocity.y,
                angle: bulletAngle + angleOffset,
                playerId: playerId,
                color: player.selectedTank?.color || 'blue',
                createdAt: Date.now()
              });
            } else {
              // Single bullet
              bulletsToCreate.push({
                id: `bullet_${Date.now()}_${Math.random()}`,
                x: player.x + Math.cos(bulletAngle) * weaponOffset,
                y: player.y + Math.sin(bulletAngle) * weaponOffset,
                vx: Math.cos(bulletAngle) * bulletSpeed + tankVelocity.x,
                vy: Math.sin(bulletAngle) * bulletSpeed + tankVelocity.y,
                angle: bulletAngle,
                playerId: playerId,
                color: player.selectedTank?.color || 'blue',
                createdAt: Date.now()
              });
            }

            // Process each bullet
            bulletsToCreate.forEach((bullet) => {
              gameState.bullets.push(bullet);

              // Broadcast to ALL clients including sender
              broadcastToMode(gameState, {
                type: 'bulletFired',
                bullet: bullet
              });
            });
          }
          break;

        case 'hit':
          if (data.targetType === 'shape') {
            const shape = gameState.shapes.find((s) => s.id === data.targetId);
            if (shape) {
              shape.health -= data.damage || 25;

              if (shape.health <= 0) {
                const index = gameState.shapes.findIndex((s) => s.id === data.targetId);
                if (index > -1) {
                  gameState.shapes.splice(index, 1);

                  if (playerId && gameState.players[playerId]) {
                    gameState.players[playerId].score += 10;

                    // Health pickup - restore both health and shield
                    const player = gameState.players[playerId];
                    const healthRestore = 30;
                    const shieldRestore = 30;

                    // Restore shield first (up to max 100)
                    const oldShield = player.shield;
                    player.shield = Math.min(100, player.shield + shieldRestore);

                    // Then restore health (up to max 100)
                    const oldHealth = player.health;
                    player.health = Math.min(100, player.health + healthRestore);

                    // Send update to player
                    broadcastToMode(gameState, {
                      type: 'playerDamaged',
                      playerId: playerId,
                      health: player.health,
                      shield: player.shield
                    });
                  }
                }

                setTimeout(() => {
                  const newShape = generateShapes(1, gameState.gameWidth, gameState.gameHeight)[0];
                  newShape.id = data.targetId;
                  gameState.shapes.push(newShape);

                  broadcastToMode(gameState, {
                    type: 'shapeRespawned',
                    shape: newShape
                  });
                }, 3000);
              }

              broadcastToMode(gameState, {
                type: 'shapeHit',
                shapeId: data.targetId,
                health: shape.health
              });
            }
          } else if (data.targetType === 'player') {
            const targetPlayer = gameState.players[data.targetId];
            if (targetPlayer) {
              let damage = 10;

              if (targetPlayer.shield > 0) {
                // Shield absorbs all damage until depleted
                targetPlayer.shield = Math.max(0, targetPlayer.shield - damage);
              } else {
                // No shield, damage health directly
                // Cap damage to remaining health, max 20
                damage = Math.min(damage, targetPlayer.health, 20);
                targetPlayer.health = Math.max(0, targetPlayer.health - damage);
              }

              broadcastToMode(gameState, {
                type: 'playerHit',
                targetId: data.targetId,
                health: targetPlayer.health,
                shield: targetPlayer.shield,
                shooterId: playerId
              });

              // Only die when health is exactly 0
              if (targetPlayer.health === 0) {
                if (playerId && gameState.players[playerId]) {
                  gameState.players[playerId].score += 100;
                }

                broadcastToMode(gameState, {
                  type: 'playerDied',
                  playerId: data.targetId,
                  killerId: playerId
                });
              }
            }
          }
          break;

        case 'respawn':
          if (playerId && gameState.players[playerId]) {
            gameState.players[playerId].health = 100;
            gameState.players[playerId].shield = 100;
            gameState.players[playerId].x = Math.random() * (gameState.gameWidth - 200) + 100;
            gameState.players[playerId].y = Math.random() * (gameState.gameHeight - 200) + 100;

            ws.send(JSON.stringify({
              type: 'respawned',
              x: gameState.players[playerId].x,
              y: gameState.players[playerId].y
            }));
          }
          break;

        case 'lavaDamage':
          const player = gameState.players[playerId]; // Use playerId here
          if (player) {
            let damage = 10;

            if (player.shield > 0) {
              // Shield absorbs all damage until depleted
              player.shield = Math.max(0, player.shield - damage);
            } else {
              // Cap damage to remaining health, max 20
              damage = Math.min(damage, player.health, 20);
              player.health = Math.max(0, player.health - damage);
            }

            broadcastToMode(gameState, {
              type: 'playerDamaged',
              playerId: playerId,
              health: player.health,
              shield: player.shield
            });

            // Only die when health is exactly 0
            if (player.health === 0) {
              broadcastToMode(gameState, {
                type: 'playerDied',
                playerId: playerId,
                killerId: null // No killer for lava damage
              });
            }
          }
          break;

        case 'collectPowerUp':
          if (playerId && gameState.players[playerId]) {
            const powerUpIndex = gameState.powerUps.findIndex((p) => p.id === data.powerUpId);
            if (powerUpIndex !== -1) {
              const powerUp = gameState.powerUps[powerUpIndex];

              // Remove power-up
              gameState.powerUps.splice(powerUpIndex, 1);

              // Broadcast removal to all clients
              broadcastToMode(gameState, {
                type: 'powerUpCollected',
                powerUpId: data.powerUpId,
                playerId: playerId,
                effect: powerUp.effect
              });

              // Respawn power-up after 30 seconds
              setTimeout(() => {
                const newPowerUp = generatePowerUps(1, gameState.gameWidth, gameState.gameHeight)[0];
                newPowerUp.id = data.powerUpId; // Keep same ID
                gameState.powerUps.push(newPowerUp);

                broadcastToMode(gameState, {
                  type: 'powerUpSpawned',
                  powerUp: newPowerUp
                });
              }, 30000);
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected from ${mode} mode (lobby: ${isLobby})`);

    if (isLobby) {
      lobbyClients.delete(ws);
    } else {
      gameState.clients.delete(ws);

      if (playerId && gameState.players[playerId]) {
        delete gameState.players[playerId];

        broadcastToMode(gameState, {
          type: 'playerLeft',
          playerId: playerId
        });

        // Broadcast updated player counts to all lobby clients
        broadcastPlayerCounts();
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`TheFortz server running on http://${HOST}:${PORT}`);
  console.log('NOTE: This server uses in-memory state and is designed for single-instance deployment.');
});