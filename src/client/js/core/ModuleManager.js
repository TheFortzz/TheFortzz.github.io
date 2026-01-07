/**
 * Module Manager
 * Coordinates initialization and integration of all game modules
 */

import gameStateManager from './GameState.js';
import gameLoop from './GameLoop.js';
import RenderSystem from '../systems/RenderSystem.js';
import InputSystem from '../systems/InputSystem.js';
import NetworkSystem from '../systems/NetworkSystem.js';

class ModuleManager {
  constructor() {
    this.systems = new Map();
    this.initialized = false;
  }

  /**
   * Initialize all game modules
   * @param {HTMLCanvasElement} canvas - Main game canvas
   */
  async initialize(canvas) {
    if (this.initialized) {
      console.warn('ModuleManager already initialized');
      return;
    }

    console.log('🚀 Initializing game modules...');

    try {
      // Initialize core systems
      const renderSystem = new RenderSystem();
      const inputSystem = new InputSystem();
      const networkSystem = new NetworkSystem();

      // Initialize systems
      renderSystem.initialize(canvas);
      inputSystem.initialize();
      networkSystem.initialize();

      // Register systems with game loop
      gameLoop.registerSystem(inputSystem, 0); // Input first
      gameLoop.registerSystem(networkSystem, 1); // Network second
      gameLoop.registerRenderSystem(renderSystem, 0); // Render last

      // Store system references
      this.systems.set('render', renderSystem);
      this.systems.set('input', inputSystem);
      this.systems.set('network', networkSystem);

      this.initialized = true;
      console.log('✅ All modules initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize modules:', error);
      throw error;
    }
  }

  /**
   * Start the game systems
   */
  start() {
    if (!this.initialized) {
      throw new Error('ModuleManager not initialized');
    }

    gameLoop.start();
    console.log('🎮 Game systems started');
  }

  /**
   * Stop the game systems
   */
  stop() {
    gameLoop.stop();
    console.log('🛑 Game systems stopped');
  }

  /**
   * Get a system by name
   * @param {string} systemName - Name of the system
   * @returns {Object|null} System instance or null if not found
   */
  getSystem(systemName) {
    return this.systems.get(systemName) || null;
  }

  /**
   * Get game state manager
   * @returns {Object} Game state manager instance
   */
  getGameStateManager() {
    return gameStateManager;
  }

  /**
   * Get game loop
   * @returns {Object} Game loop instance
   */
  getGameLoop() {
    return gameLoop;
  }

  /**
   * Cleanup all modules
   */
  cleanup() {
    this.stop();

    // Cleanup all systems
    this.systems.forEach((system) => {
      if (system.cleanup) {
        system.cleanup();
      }
    });

    this.systems.clear();
    this.initialized = false;
    console.log('🧹 All modules cleaned up');
  }
}

// Create singleton instance
const moduleManager = new ModuleManager();

export default moduleManager;