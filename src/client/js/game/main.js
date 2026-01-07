// Main game loop
const Game = {
    lastTime: 0,
    animationId: null,

    init() {
        console.log('Initializing game...');
        
        // Initialize systems
        if (!Renderer.init()) {
            console.error('Failed to initialize renderer');
            return;
        }

        // InputHandler.init(); // Disabled - using original game.js input system

        // Hide loading overlay after map images have time to load
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                console.log('🎮 Loading screen hidden - maps should be ready');
            }, 6500); // Extended to 6.5 seconds for map loading
        }

        console.log('Game initialized successfully');
    },

    start() {
        console.log('Starting game...');
        
        // Hide lobby, show game
        document.getElementById('lobbyScreen').classList.add('hidden');
        document.getElementById('ui').classList.remove('hidden');

        GameState.isInLobby = false;

        // Stop lobby animation
        if (window.imageLoader && typeof window.imageLoader.stopLobbyAnimation === 'function') {
            window.imageLoader.stopLobbyAnimation();
        }

        // Initialize player in game
        this.initializePlayer();

        // Input system is already initialized by the main game.js

        // Connect to server
        Network.connect('ffa');

        // Start game loop
        this.lastTime = performance.now();
        this.loop();
    },

    initializePlayer() {
        // Create player with selected tank configuration
        const gameState = window.gameStateManager ? window.gameStateManager.getGameState() : window.gameState;
        if (!gameState) return;

        const playerId = 'player_' + Date.now();
        GameState.playerId = playerId;

        // Add player to game state
        GameState.players[playerId] = {
            id: playerId,
            x: GameState.gameWidth / 2, // Start at center
            y: GameState.gameHeight / 2,
            vx: 0,
            vy: 0,
            angle: 0,
            health: 100,
            score: 0,
            kills: 0,
            name: 'Player',
            animFrame: 0,
            lastAnimUpdate: Date.now(),
            tankConfig: gameState.selectedTank || {
                color: 'blue',
                body: 'body_halftrack',
                weapon: 'turret_01_mk1'
            }
        };

        console.log('🎮 Player initialized:', GameState.players[playerId]);
    },

    loop(currentTime = 0) {
        this.animationId = requestAnimationFrame((time) => this.loop(time));

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update
        this.update(deltaTime);

        // Render
        Renderer.render();
    },

    update(deltaTime) {
        // System updates are handled by GameLoop in game.js
        // This is just a placeholder for any additional main.js specific updates
    },

    stop() {
        console.log('Stopping game...');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        Network.disconnect();

        // Show lobby, hide game
        document.getElementById('lobbyScreen').classList.remove('hidden');
        document.getElementById('ui').classList.add('hidden');

        GameState.isInLobby = true;
        GameState.reset();

        // Start lobby animation
        if (window.imageLoader && typeof window.imageLoader.startLobbyAnimation === 'function') {
            window.imageLoader.startLobbyAnimation();
        }
    }
};

// Game start function (called by game.js joinGame)
window.startGameSystems = function() {
    Game.start();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
    Game.init();
}

window.Game = Game;
