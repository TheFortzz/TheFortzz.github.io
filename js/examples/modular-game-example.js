/**
 * Example of how to use the new modular game architecture
 * This demonstrates the integration of all core modules
 */

import moduleManager from '../core/ModuleManager.js';
import { TANK_CONFIG, PHYSICS_CONFIG } from '../core/Config.js';
import Player from '../entities/Player.js';

/**
 * Initialize and start the modular game
 */































































/**
 * Create a canvas element if one doesn't exist
 */
function createCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.border = '1px solid #ccc';
  document.body.appendChild(canvas);
  return canvas;
}

/**
 * Cleanup and stop the game
 */





// Export functions for use
export {
  initializeModularGame,
  stopModularGame };


// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  window.initializeModularGame = initializeModularGame;
  window.stopModularGame = stopModularGame;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🚀 DOM ready, modular game example available');
      console.log('💡 Call initializeModularGame() to start the game');
    });
  } else {
    console.log('🚀 Modular game example loaded');
    console.log('💡 Call initializeModularGame() to start the game');
  }
}