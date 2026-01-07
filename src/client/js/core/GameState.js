/**
 * Centralized game state management
 * Provides a single source of truth for all game state
 */

import { DEFAULT_GAME_STATE, DEFAULT_LOCKER_STATE } from './Config.js';

class GameStateManager {
  constructor() {
    this.gameState = { ...DEFAULT_GAME_STATE };
    this.lockerState = { ...DEFAULT_LOCKER_STATE };
    this.listeners = new Map();

    // Expose globally for backward compatibility
    if (typeof window !== 'undefined') {
      window.gameState = this.gameState;
    }
  }

  /**
   * Get the current game state
   * @returns {Object} Current game state
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * Get the current locker state
   * @returns {Object} Current locker state
   */
  getLockerState() {
    return this.lockerState;
  }

  /**
   * Update game state properties
   * @param {Object} updates - Object containing state updates
   */
  updateGameState(updates) {
    const oldState = { ...this.gameState };
    Object.assign(this.gameState, updates);

    // Notify listeners of state changes
    this.notifyListeners('gameState', oldState, this.gameState);
  }

  /**
   * Update locker state properties
   * @param {Object} updates - Object containing locker state updates
   */
  updateLockerState(updates) {
    const oldState = { ...this.lockerState };
    Object.assign(this.lockerState, updates);

    // Notify listeners of state changes
    this.notifyListeners('lockerState', oldState, this.lockerState);
  }

  /**
   * Reset game state to defaults
   */
  resetGameState() {
    this.gameState = { ...DEFAULT_GAME_STATE };
    this.notifyListeners('gameState', {}, this.gameState);
  }

  /**
   * Reset locker state to defaults
   */
  resetLockerState() {
    this.lockerState = { ...DEFAULT_LOCKER_STATE };
    this.notifyListeners('lockerState', {}, this.lockerState);
  }

  /**
   * Add a state change listener
   * @param {string} stateType - Type of state to listen to ('gameState' or 'lockerState')
   * @param {string} listenerId - Unique identifier for the listener
   * @param {Function} callback - Callback function to call on state change
   */
  addListener(stateType, listenerId, callback) {
    if (!this.listeners.has(stateType)) {
      this.listeners.set(stateType, new Map());
    }
    this.listeners.get(stateType).set(listenerId, callback);
  }

  /**
   * Remove a state change listener
   * @param {string} stateType - Type of state listener is for
   * @param {string} listenerId - Unique identifier for the listener
   */
  removeListener(stateType, listenerId) {
    if (this.listeners.has(stateType)) {
      this.listeners.get(stateType).delete(listenerId);
    }
  }

  /**
   * Notify all listeners of state changes
   * @param {string} stateType - Type of state that changed
   * @param {Object} oldState - Previous state
   * @param {Object} newState - New state
   */
  notifyListeners(stateType, oldState, newState) {
    if (this.listeners.has(stateType)) {
      this.listeners.get(stateType).forEach((callback) => {
        try {
          callback(oldState, newState);
        } catch (error) {
          console.error('Error in state change listener:', error);
        }
      });
    }
  }

  /**
   * Initialize player in game state
   * @param {string} playerId - Player ID
   * @param {Object} playerData - Player data
   */
  initializePlayer(playerId, playerData) {
    if (!this.gameState.players) {
      this.gameState.players = {};
    }

    // Handle both Map and Object implementations
    if (this.gameState.players instanceof Map) {
      this.gameState.players.set(playerId, playerData);
    } else {
      this.gameState.players[playerId] = playerData;
    }
    this.notifyListeners('gameState', {}, this.gameState);
  }

  /**
   * Remove player from game state
   * @param {string} playerId - Player ID to remove
   */
  removePlayer(playerId) {
    if (!this.gameState.players) return;

    // Handle both Map and Object implementations
    if (this.gameState.players instanceof Map) {
      if (this.gameState.players.has(playerId)) {
        this.gameState.players.delete(playerId);
        this.notifyListeners('gameState', {}, this.gameState);
      }
    } else {
      if (this.gameState.players[playerId]) {
        delete this.gameState.players[playerId];
        this.notifyListeners('gameState', {}, this.gameState);
      }
    }
  }

  /**
   * Update player data
   * @param {string} playerId - Player ID
   * @param {Object} updates - Player data updates
   */
  updatePlayer(playerId, updates) {
    if (!this.gameState.players) return;

    // Handle both Map and Object implementations
    if (this.gameState.players instanceof Map) {
      if (this.gameState.players.has(playerId)) {
        const player = this.gameState.players.get(playerId);
        Object.assign(player, updates);
        this.notifyListeners('gameState', {}, this.gameState);
      }
    } else {
      if (this.gameState.players[playerId]) {
        Object.assign(this.gameState.players[playerId], updates);
        this.notifyListeners('gameState', {}, this.gameState);
      }
    }
  }
}

// Create singleton instance
const gameStateManager = new GameStateManager();

// Export both the manager and the state objects for backward compatibility
export default gameStateManager;
export const gameState = gameStateManager.getGameState();
export const lockerState = gameStateManager.getLockerState();