/**
 * GameLoop - Main game loop coordination
 * Orchestrates system updates in the correct order
 */

export default class GameLoop {
    constructor(gameState, systems) {
        this.gameState = gameState;
        this.systems = systems;
        this.animationId = null;
        this.lastFrameTime = Date.now();
    }

    /**
     * Start the game loop
     */
    start() {
        console.log('🎮 Starting game loop, isInLobby:', this.gameState.isInLobby);
        if (!this.gameState.isInLobby) {
            this.loop();
        } else {
            console.log('⏸️ Game loop not started - still in lobby');
        }
    }
    
    /**
     * Force start the game loop (for testing)
     */
    forceStart() {
        console.log('🚀 Force starting game loop...');
        this.loop();
    }

    /**
     * Stop the game loop
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Main game loop - coordinates update and render
     */
    loop() {
        // Always run the loop once started (for testing purposes)
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        this.update(deltaTime);
        this.render();
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    /**
     * Update all game systems
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        const dt = Math.min(deltaTime, 100) / 1000; // Cap at 100ms, convert to seconds

        // Update systems in order
        if (this.systems.inputSystem) {
            this.systems.inputSystem.update(dt * 1000, this.gameState);
        }

        if (this.systems.physicsSystem) {
            this.systems.physicsSystem.update(dt * 1000);
        }

        if (this.systems.particleSystem) {
            this.systems.particleSystem.update();
        }

        if (this.systems.weaponSystem) {
            this.systems.weaponSystem.update(dt, this.systems.activePowerUps || []);
        }

        // Update animation manager
        if (window.tankAnimationManager) {
            window.tankAnimationManager.update();
        }
    }

    /**
     * Render the game
     */
    render() {
        if (this.systems.renderSystem) {
            this.systems.renderSystem.render();
        }
    }
}
