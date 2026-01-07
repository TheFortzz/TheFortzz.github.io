// Network handling
const Network = {
  socket: null,
  lastSendTime: 0,

  connect(mode = 'ffa') {
    const wsUrl = `${CONFIG.NETWORK.WS_URL}?mode=${mode}`;
    console.log('Connecting to:', wsUrl);

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('Connected to server');
      GameState.isConnected = true;
    };

    this.socket.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data));
    };

    this.socket.onclose = () => {
      console.log('Disconnected from server');
      GameState.isConnected = false;
      GameState.reset();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  },

  handleMessage(data) {
    switch (data.type) {
      case 'gameState':
        GameState.playerId = data.playerId;
        GameState.players = data.players;
        GameState.gameWidth = data.gameWidth;
        GameState.gameHeight = data.gameHeight;
        console.log('Received game state, player ID:', GameState.playerId);
        break;

      case 'playerJoined':
        GameState.players[data.player.id] = data.player;
        console.log('Player joined:', data.player.id);
        break;

      case 'playerLeft':
        delete GameState.players[data.playerId];
        console.log('Player left:', data.playerId);
        break;

      case 'playerUpdate':
        if (GameState.players[data.id] && data.id !== GameState.playerId) {
          GameState.players[data.id].x = data.x;
          GameState.players[data.id].y = data.y;
          GameState.players[data.id].angle = data.angle;
        }
        break;

      case 'bulletSpawned':
        GameState.bullets.push(data.bullet);
        break;

      case 'bulletDestroyed':
        GameState.bullets = GameState.bullets.filter((b) => b.id !== data.bulletId);
        break;
    }
  },

  sendMovement() {
    const now = Date.now();
    if (now - this.lastSendTime < CONFIG.NETWORK.UPDATE_RATE) return;

    const player = GameState.getPlayer();
    if (!player) return;

    this.lastSendTime = now;

    this.socket.send(JSON.stringify({
      type: 'move',
      x: player.x,
      y: player.y,
      angle: player.angle
    }));
  },

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
};

window.Network = Network;