// Game state management
const GameState = {
    playerId: null,
    players: {},
    bullets: [],
    gameWidth: 7500,
    gameHeight: 7500,
    camera: {
        x: (window.CONFIG?.GAME?.WIDTH || 7500) / 2,
        y: (window.CONFIG?.GAME?.HEIGHT || 7500) / 2
    },
    isConnected: false,
    gameWidth: CONFIG.GAME.WIDTH,
    gameHeight: CONFIG.GAME.HEIGHT,
    camera: { x: CONFIG.GAME.WIDTH / 2, y: CONFIG.GAME.HEIGHT / 2 },
    keys: {},
    mouse: { x: 0, y: 0, angle: 0 },
    selectedTank: {
        color: 'blue',
        body: 'body_halftrack',
        weapon: 'turret_01_mk1'
    },
    velocity: { x: 0, y: 0 },
    lastShootTime: 0,

    getPlayer() {
        return this.players[this.playerId];
    },

    updateCamera() {
        const player = this.getPlayer();
        if (!player) return;

        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        this.camera.x = player.x - canvas.width / 2;
        this.camera.y = player.y - canvas.height / 2;
    },

    reset() {
        this.players = {};
        this.bullets = [];
        this.velocity = { x: 0, y: 0 };
        this.lastShootTime = 0;
    },

    updatePlayer(data) {
        const player = this.players[data.id];
        if (player) {
            // Calculate velocity for animation
            const oldX = player.x;
            const oldY = player.y;
            player.x = data.x;
            player.y = data.y;
            player.vx = data.x - oldX;
            player.vy = data.y - oldY;
            player.angle = data.angle;
            player.health = data.health;
            player.score = data.score;
            player.kills = data.kills;
        } else {
            this.players[data.id] = {
                id: data.id,
                x: data.x,
                y: data.y,
                vx: 0,
                vy: 0,
                angle: data.angle,
                health: data.health,
                score: data.score || 0,
                kills: data.kills || 0,
                name: data.name || 'Tank',
                animFrame: 0,
                lastAnimUpdate: Date.now()
            };
        }
    },
};

window.GameState = GameState;