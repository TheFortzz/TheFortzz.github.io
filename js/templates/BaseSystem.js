/**
 * Base system template
 * Standard interface for all game systems
 */

class BaseSystem {
  constructor() {
    this.initialized = false;
    this.enabled = true;
  }

  /**
   * Initialize the system
   * Override this method in derived classes
   */
  initialize() {
    this.initialized = true;
    console.log(`${this.constructor.name} initialized`);
  }

  /**
   * Update the system (called each frame)
   * Override this method in derived classes
   * @param {number} deltaTime - Time since last update in milliseconds
   * @param {Object} gameState - Current game state
   */
  update(deltaTime, gameState) {


    // Override in derived classes
  } /**
   * Render the system (called each frame for render systems)
   * Override this method in derived classes
   * @param {number} deltaTime - Time since last render in milliseconds
   * @param {Object} gameState - Current game state
   */
  render(deltaTime, gameState) {


    // Override in derived classes
  } /**
   * Enable the system
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable the system
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Check if system is enabled
   * @returns {boolean} True if enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Check if system is initialized
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Cleanup the system
   * Override this method in derived classes
   */
  cleanup() {
    this.initialized = false;
    this.enabled = false;
    console.log(`${this.constructor.name} cleaned up`);
  }
}

export default BaseSystem;