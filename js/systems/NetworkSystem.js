/**
 * Network system for socket communication
 * Handles WebSocket connections and message handling
 */

import { NETWORK_CONFIG } from '../core/Config.js';

class NetworkSystem {
  constructor(gameStateManager) {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
    this.messageHandlers = new Map();
    this.updateInterval = null;
    this.initialized = false;
    this.gameStateManager = gameStateManager;
    this.socketIntervalId = null;

    // Bind methods to preserve context
    this.connectToServer = this.connectToServer.bind(this);
    this.handleServerMessage = this.handleServerMessage.bind(this);
    this.sendToServer = this.sendToServer.bind(this);
    this.startMovementUpdates = this.startMovementUpdates.bind(this);
    this.stopMovementUpdates = this.stopMovementUpdates.bind(this);
    this.sendMovementUpdates = this.sendMovementUpdates.bind(this);
  }

  /**
   * Initialize network system
   * @param {string} serverUrl - WebSocket server URL
   */
  initialize(serverUrl = null) {
    this.serverUrl = serverUrl || this.getDefaultServerUrl();
    this.setupMessageHandlers();
    this.initialized = true;
    console.log('🌐 NetworkSystem initialized');
  }

  /**
   * Get default server URL
   * @returns {string} Default WebSocket URL
   */
  getDefaultServerUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}`;
  }

  /**
   * Connect to the server
   * @param {string} gameMode - Selected game mode
   * @returns {Promise} Connection promise
   */
  connectToServer(gameMode = 'ffa') {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let host = window.location.host;
    // Fix for 0.0.0.0 - use localhost instead
    if (host.startsWith('0.0.0.0')) {
      host = host.replace('0.0.0.0', 'localhost');
    }
    const wsUrl = `${protocol}//${host}/ws?mode=${gameMode}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log(`Connected to ${gameMode.toUpperCase()} game server`);
      this.isConnected = true;
      this.gameStateManager.updateGameState({ isConnected: true });

      // Confirm map play count now that we've successfully connected
      if (typeof window.confirmMapPlay === 'function') {
        window.confirmMapPlay();
      }

      // Send selected tank and username to server
      if (this.socket.readyState === WebSocket.OPEN) {
        const gameState = this.gameStateManager.getGameState();
        this.socket.send(JSON.stringify({
          type: 'setPlayerData',
          selectedTank: gameState.selectedTank,
          username: window.currentUser ? window.currentUser.username : null
        }));
      }

      // Start sending movement updates once connected
      this.startMovementUpdates();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleServerMessage(data);
      } catch (error) {
        console.error('Error parsing server message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('Disconnected from game server');
      this.isConnected = false;
      this.gameStateManager.updateGameState({ isConnected: false });
      this.stopMovementUpdates(); // Stop sending updates on disconnect

      // Only attempt to reconnect if we're still in game (not if user left)
      const gameState = this.gameStateManager.getGameState();
      if (!gameState.isInLobby) {
        setTimeout(() => this.connectToServer(gameMode), 3000);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
    this.stopUpdateInterval();
    this.isConnected = false;
    console.log('🔌 Disconnected from server');
  }

  /**
   * Handle server disconnection
   */
  handleDisconnection() {
    this.isConnected = false;
    this.stopUpdateInterval();
    console.log('🔌 Server connection lost');

    // Attempt reconnection
    if (this.reconnectAttempts < NETWORK_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting reconnection (${this.reconnectAttempts}/${NETWORK_CONFIG.MAX_RECONNECT_ATTEMPTS})`);

      setTimeout(() => {
        this.connectToServer().catch((error) => {
          console.error('❌ Reconnection failed:', error);
        });
      }, NETWORK_CONFIG.RECONNECT_DELAY);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  /**
   * Send message to server
   * @param {string} type - Message type
   * @param {Object} data - Message data
   */
  sendToServer(type, data = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...data }));
    }
  }

  /**
   * Handle player update messages
   * @param {Object} data - Player update data
   */
  handlePlayerUpdate(data) {
    const gameState = this.gameStateManager.getGameState();
    const currentPlayers = { ...gameState.players };

    if (!currentPlayers[data.id]) {
      currentPlayers[data.id] = {
        id: data.id,
        x: data.x || 0,
        y: data.y || 0,
        angle: data.angle || 0,
        tankDirection: data.tankDirection || 0,
        name: data.name || '',
        score: data.score || 0,
        level: data.level || 1,
        selectedTank: data.selectedTank,
        targetX: data.x || 0,
        targetY: data.y || 0,
        lastUpdateTime: Date.now()
      };

      if (typeof window.initializePlayerAnimations === 'function') {
        window.initializePlayerAnimations(data.id);
      }
    }

    const player = currentPlayers[data.id];

    // Store previous position for interpolation
    if (typeof data.x === 'number' && typeof data.y === 'number') {
      player.targetX = data.x;
      player.targetY = data.y;
      player.lastUpdateTime = Date.now();
    }

    if (typeof data.angle === 'number') player.angle = data.angle;
    if (typeof data.tankDirection === 'number') player.tankDirection = data.tankDirection;
    if (data.name !== undefined) player.name = data.name;
    if (data.score !== undefined) player.score = data.score;
    if (data.level !== undefined) player.level = data.level;
    if (data.health !== undefined) player.health = data.health;
    if (data.maxHealth !== undefined) player.maxHealth = data.maxHealth;
    if (data.shield !== undefined) player.shield = data.shield;
    if (data.maxShield !== undefined) player.maxShield = data.maxShield;

    if (data.selectedTank !== undefined) {
      player.selectedTank = data.selectedTank;
      if (typeof window.initializePlayerAnimations === 'function') {
        window.initializePlayerAnimations(data.id);
      }
    }

    this.gameStateManager.updateGameState({ players: currentPlayers });
  }

  /**
   * Handle shapes position update
   * @param {Object} data - Shapes position data
   */
  handleShapesPositionUpdate(data) {
    if (data.shapes) {
      const gameState = this.gameStateManager.getGameState();
      const updatedShapesPosition = gameState.shapes.map((shape) => {
        const updatedShape = data.shapes.find((s) => s.id === shape.id);
        if (updatedShape) {
          return {
            ...shape,
            prevX: shape.x,
            prevY: shape.y,
            targetX: updatedShape.x,
            targetY: updatedShape.y,
            knockbackVX: updatedShape.knockbackVX || 0,
            knockbackVY: updatedShape.knockbackVY || 0,
            lastUpdate: Date.now(),
            x: updatedShape.x,
            y: updatedShape.y
          };
        }
        return shape;
      });
      this.gameStateManager.updateGameState({ shapes: updatedShapesPosition });
    }
  }

  /**
   * Handle bullet fired message
   * @param {Object} data - Bullet fired data
   */
  handleBulletFired(data) {
    const gameState = this.gameStateManager.getGameState();
    const updatedBulletsFired = [...gameState.bullets, data.bullet];
    this.gameStateManager.updateGameState({ bullets: updatedBulletsFired });

    // Create bullet trail
    if (typeof window.createBulletTrail === 'function') {
      window.createBulletTrail(data.bullet);
    }

    // Add gun recoil animation for other players when they shoot
    if (data.bullet.playerId && data.bullet.playerId !== gameState.playerId) {
      if (typeof window.otherPlayerGunRecoils !== 'undefined') {
        if (!window.otherPlayerGunRecoils[data.bullet.playerId]) {
          window.otherPlayerGunRecoils[data.bullet.playerId] = { left: 0, shake: 0 };
        }
        window.otherPlayerGunRecoils[data.bullet.playerId].left = 4;
        window.otherPlayerGunRecoils[data.bullet.playerId].shake = 1;
      }

      // Trigger weapon shooting animation for other players
      const shootingPlayer = gameState.players[data.bullet.playerId];
      if (shootingPlayer && shootingPlayer.selectedTank) {
        if (typeof window.triggerWeaponAnimation === 'function') {
          window.triggerWeaponAnimation(shootingPlayer.selectedTank, data.bullet.playerId);
        }
        if (typeof window.triggerTankBodyAnimation === 'function') {
          window.triggerTankBodyAnimation(shootingPlayer.selectedTank, data.bullet.playerId);
        }
        if (typeof window.triggerMuzzleFlash === 'function') {
          window.triggerMuzzleFlash(data.bullet.playerId);
        }
      } else {
        // Fallback if shooting player's tank data is missing
        if (typeof window.triggerWeaponAnimation === 'function') {
          window.triggerWeaponAnimation(gameState.selectedTank, data.bullet.playerId);
        }
        if (typeof window.triggerTankBodyAnimation === 'function') {
          window.triggerTankBodyAnimation(gameState.selectedTank, data.bullet.playerId);
        }
        if (typeof window.triggerMuzzleFlash === 'function') {
          window.triggerMuzzleFlash(data.bullet.playerId);
        }
      }
    }
  }

  /**
   * Handle bullets update message
   * @param {Object} data - Bullets update data
   */
  handleBulletsUpdate(data) {
    if (data.bullets) {
      const gameState = this.gameStateManager.getGameState();
      data.bullets.forEach((updatedBullet) => {
        const bullet = gameState.bullets.find((b) => b.id === updatedBullet.id);
        if (bullet) {
          bullet.x = updatedBullet.x;
          bullet.y = updatedBullet.y;
          bullet.vx = updatedBullet.vx;
          bullet.vy = updatedBullet.vy;
          bullet.angle = updatedBullet.angle;
        }
      });
    }
  }

  /**
   * Handle wall impact animation
   * @param {Object} data - Impact data
   */
  handleWallImpact(data) {
    if (data.impactType === 'wall' && typeof window.wallHitAnimations !== 'undefined') {
      const gameState = this.gameStateManager.getGameState();
      const wall = gameState.walls.find((w) => w.id === data.wallId);
      if (wall) {
        const existingAnim = window.wallHitAnimations.find((a) => a.wallId === wall.id);
        if (existingAnim) {
          existingAnim.intensity = Math.max(existingAnim.intensity, 1.0);
        } else {
          window.wallHitAnimations.push({
            wallId: wall.id,
            intensity: 1.0,
            startTime: Date.now()
          });
        }
      }
    }
  }

  /**
   * Handle score update message
   * @param {Object} data - Score update data
   */
  handleScoreUpdate(data) {
    const gameState = this.gameStateManager.getGameState();
    if (data.playerId && gameState.players[data.playerId]) {
      gameState.players[data.playerId].score = data.score;
      gameState.players[data.playerId].level = data.level;

      if (data.playerId === gameState.playerId && typeof window.updatePlayerStats === 'function') {
        window.updatePlayerStats({ score: data.score, level: data.level });
      }
    }
  }

  /**
   * Handle player damaged message
   * @param {Object} data - Player damage data
   */
  handlePlayerDamaged(data) {
    const gameState = this.gameStateManager.getGameState();
    if (data.playerId === gameState.playerId) {
      // Trust server values for health and shield but clamp to max 100
      if (typeof window.playerHealth !== 'undefined') {
        window.playerHealth = Math.min(100, Math.max(0, data.health || 0));
      }
      if (typeof window.playerShield !== 'undefined') {
        window.playerShield = Math.min(100, Math.max(0, data.shield || 0));
      }

      // Initialize display values if not set
      if (typeof window.displayHealth === 'undefined' && typeof window.playerHealth !== 'undefined') {
        window.displayHealth = window.playerHealth;
      }
      if (typeof window.displayShield === 'undefined' && typeof window.playerShield !== 'undefined') {
        window.displayShield = window.playerShield;
      }

      if (typeof window.updateHealthDisplay === 'function') {
        window.updateHealthDisplay();
      }

      // Return to lobby only when health is exactly 0
      if (window.playerHealth === 0) {
        console.log('Player eliminated - returning to lobby...');

        // Show midgame ad after death (CrazyGames SDK)
        if (window.CrazyGamesIntegration) {
          window.CrazyGamesIntegration.showMidgameAd().then(() => {
            if (typeof window.returnToLobby === 'function') {
              window.returnToLobby();
            }
          });
        } else {
          if (typeof window.returnToLobby === 'function') {
            window.returnToLobby();
          }
        }
      }
    }
  }

  /**
   * Handle damage number message
   * @param {Object} data - Damage number data
   */
  handleDamageNumber(data) {
    if (typeof window.damageNumbers !== 'undefined') {
      window.damageNumbers.push({
        x: data.x,
        y: data.y,
        damage: data.damage,
        startTime: Date.now(),
        duration: 1000
      });
    }
  }

  /**
   * Handle kill reward message
   * @param {Object} data - Kill reward data
   */
  handleKillReward(data) {
    if (data.amount) {
      // Use server's authoritative balance if provided, otherwise increment locally
      if (data.newBalance !== undefined) {
        this.gameStateManager.updateGameState({ fortzCurrency: data.newBalance });
        console.log(`Earned ${data.amount} Fortz for kill! Balance synced from server: ${data.newBalance}`);
      } else {
        // Guest player - local increment only
        const gameState = this.gameStateManager.getGameState();
        const newBalance = (gameState.fortzCurrency || 0) + data.amount;
        this.gameStateManager.updateGameState({ fortzCurrency: newBalance });
        console.log(`Earned ${data.amount} Fortz for kill! Total: ${newBalance} (not saved - login to persist)`);
      }

      if (typeof window.updateFortzDisplay === 'function') {
        window.updateFortzDisplay();
      }
      if (typeof window.showNotification === 'function') {
        window.showNotification(`+${data.amount} Fortz (Kill!)`, '#FFD700', 32);
      }

      if (data.message && typeof window.showNotification === 'function') {
        setTimeout(() => window.showNotification(data.message, '#FFA500', 24), 1500);
      }
    }
  }

  /**
   * Handle messages from server
   * @param {Object} data - Parsed message data
   */
  handleServerMessage(data) {
    const gameState = this.gameStateManager.getGameState();

    switch (data.type) {
      case 'gameState':
        this.gameStateManager.updateGameState({
          players: data.players || {},
          shapes: data.shapes || [],
          walls: data.walls || [],
          bullets: data.bullets || [],
          wallColor: data.wallColor || '#FF6B6B',
          gameWidth: data.gameWidth || 7500,
          gameHeight: data.gameHeight || 7500
        });

        // Sync power-ups from server
        if (typeof window !== 'undefined' && data.powerUps) {
          window.powerUps = data.powerUps;
        }

        // Set playerId if provided
        if (data.playerId) {
          this.gameStateManager.updateGameState({ playerId: data.playerId });
        }
        if (data.clientId) {
          this.gameStateManager.updateGameState({ clientId: data.clientId });
        }

        // Initialize animations for all players
        Object.keys(gameState.players).forEach((playerId) => {
          if (typeof window.initializePlayerAnimations === 'function') {
            window.initializePlayerAnimations(playerId);
          }
        });

        if (typeof window.updateUI === 'function') {
          window.updateUI();
        }
        break;

      case 'playerJoined':
        const updatedPlayersJoin = { ...gameState.players };
        updatedPlayersJoin[data.player.id] = data.player;
        this.gameStateManager.updateGameState({ players: updatedPlayersJoin });
        if (typeof window.updatePlayerCount === 'function') {
          window.updatePlayerCount();
        }
        break;

      case 'playerLeft':
        const updatedPlayersLeave = { ...gameState.players };
        delete updatedPlayersLeave[data.playerId];
        this.gameStateManager.updateGameState({ players: updatedPlayersLeave });
        if (typeof window.updatePlayerCount === 'function') {
          window.updatePlayerCount();
        }
        break;

      case 'playersCleanup':
        if (data.removedPlayers) {
          data.removedPlayers.forEach((playerId) => {
            delete gameState.players[playerId];
          });
          if (typeof window.updatePlayerCount === 'function') {
            window.updatePlayerCount();
          }
        }
        break;

      case 'playerUpdate':
        this.handlePlayerUpdate(data);
        break;

      case 'shapeDestroyed':
        const updatedShapes = gameState.shapes.filter((s) => s.id !== data.shapeId);
        const updatedTimers = { ...gameState.shapeSpawnTimers };
        delete updatedTimers[data.shapeId];
        this.gameStateManager.updateGameState({
          shapes: updatedShapes,
          shapeSpawnTimers: updatedTimers
        });
        break;

      case 'shapeSpawned':
        const updatedShapesSpawn = [...gameState.shapes, data.shape];
        const updatedTimersSpawn = { ...gameState.shapeSpawnTimers };
        if (data.shape.respawnTime) {
          updatedTimersSpawn[data.shape.id] = data.shape.respawnTime;
        }
        this.gameStateManager.updateGameState({
          shapes: updatedShapesSpawn,
          shapeSpawnTimers: updatedTimersSpawn
        });
        break;

      case 'shapeDamaged':
        const updatedShapesDamaged = gameState.shapes.map((s) =>
        s.id === data.shapeId ? { ...s, health: data.health } : s
        );
        this.gameStateManager.updateGameState({ shapes: updatedShapesDamaged });
        break;

      case 'shapesPositionUpdate':
        this.handleShapesPositionUpdate(data);
        break;

      case 'bulletFired':
        this.handleBulletFired(data);
        break;

      case 'bulletsUpdate':
        this.handleBulletsUpdate(data);
        break;

      case 'bulletsDestroyed':
        if (data.bulletIds) {
          const updatedBullets = gameState.bullets.filter((b) => !data.bulletIds.includes(b.id));
          this.gameStateManager.updateGameState({ bullets: updatedBullets });
        }
        break;

      case 'bulletImpact':
        if (typeof window.createBulletImpact === 'function') {
          window.createBulletImpact(data.x, data.y, data.impactType, data.bulletColor);
        }
        this.handleWallImpact(data);
        break;

      case 'scoreUpdate':
        this.handleScoreUpdate(data);
        break;

      case 'playerDamaged':
        this.handlePlayerDamaged(data);
        break;

      case 'damageNumber':
        this.handleDamageNumber(data);
        break;

      case 'lavaDamage':
        if (data.playerId === gameState.playerId && typeof window.showNotification === 'function') {
          window.showNotification('Burning in lava!', '#FF4500', 24);
        }
        break;

      case 'powerUpCollected':
        if (typeof window !== 'undefined' && window.powerUps) {
          window.powerUps = window.powerUps.filter((p) => p.id !== data.powerUpId);
        }
        break;

      case 'powerUpSpawned':
        if (typeof window !== 'undefined' && window.powerUps && data.powerUp) {
          window.powerUps.push(data.powerUp);
        }
        break;

      case 'killReward':
        this.handleKillReward(data);
        break;
    }
  }

  /**
   * Register message handler
   * @param {string} messageType - Type of message to handle
   * @param {Function} handler - Handler function
   */
  registerMessageHandler(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Unregister message handler
   * @param {string} messageType - Type of message handler to remove
   */
  unregisterMessageHandler(messageType) {
    this.messageHandlers.delete(messageType);
  }

  /**
   * Setup default message handlers
   */
  setupMessageHandlers() {
    this.registerMessageHandler('ping', () => {
      this.sendToServer('pong');
    });

    this.registerMessageHandler('playerJoined', (data) => {
      console.log('👤 Player joined:', data.playerId);
    });

    this.registerMessageHandler('playerLeft', (data) => {
      console.log('👋 Player left:', data.playerId);
    });
  }

  /**
   * Start sending movement updates
   */
  startMovementUpdates() {
    // Clear any existing interval to prevent duplicates
    this.stopMovementUpdates();
    // Send updates at a fixed interval
    this.socketIntervalId = setInterval(() => {
      this.sendMovementUpdates();
    }, NETWORK_CONFIG.SOCKET_INTERVAL_TIME);
  }

  /**
   * Stop sending movement updates
   */
  stopMovementUpdates() {
    if (this.socketIntervalId) {
      clearInterval(this.socketIntervalId);
      this.socketIntervalId = null;
    }
  }

  /**
   * Send movement updates to the server
   */
  sendMovementUpdates() {
    const gameState = this.gameStateManager.getGameState();
    if (!this.isConnected || !gameState.playerId) return;

    const player = gameState.players[gameState.playerId];
    if (!player) return;

    // Calculate tank direction from velocity (direction tank body faces)
    let tankDirection = player.tankDirection || 0;
    if (typeof window.lastInputDirection !== 'undefined' && window.lastInputDirection) {
      if (window.lastInputDirection.x !== 0 || window.lastInputDirection.y !== 0) {
        tankDirection = Math.atan2(window.lastInputDirection.y, window.lastInputDirection.x);
      }
    }
    player.tankDirection = tankDirection;

    // Send movement data to server with correct type and all required fields
    this.sendToServer('move', {
      x: player.x,
      y: player.y,
      angle: gameState.mouse ? gameState.mouse.angle : 0,
      tankDirection: tankDirection,
      velocity: typeof window.tankVelocity !== 'undefined' ? window.tankVelocity : { x: 0, y: 0 },
      isSprinting: typeof window.isSprinting !== 'undefined' ? window.isSprinting : false
    });
  }

  /**
   * Send queued messages
   */
  sendQueuedMessages() {
    if (this.isConnected && this.messageQueue.length > 0) {
      const messages = [...this.messageQueue];
      this.messageQueue = [];

      messages.forEach((message) => {
        try {
          this.socket.send(JSON.stringify(message));
        } catch (error) {
          console.error('❌ Failed to send queued message:', error);
          this.messageQueue.push(message);
        }
      });
    }
  }

  /**
   * Update network system (called each frame)
   * @param {number} deltaTime - Time since last update
   * @param {Object} gameState - Current game state
   */
  update(deltaTime, gameState) {
    // Update game state with connection status
    if (gameState) {
      gameState.isConnected = this.isConnected;
    }
  }

  /**
   * Get connection status
   * @returns {boolean} True if connected
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Send player shoot action to server
   * @param {number} angle - Shooting angle
   * @param {Object} tankVelocity - Tank velocity at time of shooting
   */
  sendPlayerShoot(angle, tankVelocity) {
    this.sendToServer('playerShoot', {
      angle: angle,
      tankVelocity: tankVelocity
    });
  }

  /**
   * Send power-up collection to server
   * @param {string} powerUpId - ID of collected power-up
   */
  sendCollectPowerUp(powerUpId) {
    this.sendToServer('collectPowerUp', { powerUpId: powerUpId });
  }

  /**
   * Request shape spawn from server
   * @param {string} type - Shape type to spawn
   * @param {string} color - Shape color
   */
  sendRequestShapeSpawn(type = 'PENTAGON', color = '#1E90FF') {
    this.sendToServer('requestShapeSpawn', { type: type, color: color });
  }

  /**
   * Update Fortz currency on server
   * @param {number} amount - Amount to update
   */
  sendUpdateFortzCurrency(amount) {
    this.sendToServer('updateFortzCurrency', { amount: amount });
  }

  /**
   * Change game mode on server
   * @param {string} mode - New game mode
   */
  sendChangeGameMode(mode) {
    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendToServer('changeGameMode', { mode: mode });
      const gameState = this.gameStateManager.getGameState();
      gameState.selectedGameMode = mode;
      console.log(`Changed game mode to: ${mode}`);
    }
  }

  /**
   * Cleanup network system
   */
  cleanup() {
    this.disconnect();
    this.stopMovementUpdates();
    this.messageHandlers.clear();
    this.messageQueue = [];
    this.initialized = false;
    console.log('🧹 NetworkSystem cleaned up');
  }
}

export default NetworkSystem;