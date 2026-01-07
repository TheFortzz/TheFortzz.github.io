/**
 * Player entity class
 * Manages player-specific logic and state
 */

import { TANK_CONFIG, PHYSICS_CONFIG } from '../core/Config.js';

class Player {
  constructor(playerId, playerData = {}) {
    this.id = playerId;
    this.x = playerData.x || 0;
    this.y = playerData.y || 0;
    this.rotation = playerData.rotation || 0;
    this.velocity = { x: 0, y: 0 };
    this.health = playerData.health || 100;
    this.maxHealth = 100;
    this.selectedTank = playerData.selectedTank || {
      color: TANK_CONFIG.colors[0],
      body: TANK_CONFIG.bodies[0],
      weapon: TANK_CONFIG.weapons[0]
    };
    this.isAlive = true;
    this.lastShotTime = 0;
    this.score = playerData.score || 0;
    this.kills = playerData.kills || 0;
    this.deaths = playerData.deaths || 0;
  }

  /**
   * Update player state
   * @param {number} deltaTime - Time since last update
   * @param {Object} inputState - Current input state
   */
  update(deltaTime, inputState = {}) {
    if (!this.isAlive) return;

    // Update movement based on input
    this.updateMovement(deltaTime, inputState);

    // Update position based on velocity
    this.updatePosition(deltaTime);

    // Apply friction
    this.applyFriction();
  }

  /**
   * Update movement based on input
   * @param {number} deltaTime - Time since last update
   * @param {Object} inputState - Current input state
   */
  updateMovement(deltaTime, inputState) {
    const keys = inputState.keys || {};

    // Rotation
    if (keys['ArrowLeft'] || keys['a']) {
      this.rotation -= PHYSICS_CONFIG.TANK_ROTATION_SPEED * deltaTime;
    }
    if (keys['ArrowRight'] || keys['d']) {
      this.rotation += PHYSICS_CONFIG.TANK_ROTATION_SPEED * deltaTime;
    }

    // Movement
    if (keys['ArrowUp'] || keys['w']) {
      this.velocity.x += Math.cos(this.rotation) * PHYSICS_CONFIG.TANK_SPEED * deltaTime * 0.01;
      this.velocity.y += Math.sin(this.rotation) * PHYSICS_CONFIG.TANK_SPEED * deltaTime * 0.01;
    }
    if (keys['ArrowDown'] || keys['s']) {
      this.velocity.x -= Math.cos(this.rotation) * PHYSICS_CONFIG.TANK_SPEED * deltaTime * 0.01;
      this.velocity.y -= Math.sin(this.rotation) * PHYSICS_CONFIG.TANK_SPEED * deltaTime * 0.01;
    }
  }

  /**
   * Update position based on velocity
   * @param {number} deltaTime - Time since last update
   */
  updatePosition(deltaTime) {
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
  }

  /**
   * Apply friction to velocity
   */
  applyFriction() {
    this.velocity.x *= PHYSICS_CONFIG.FRICTION;
    this.velocity.y *= PHYSICS_CONFIG.FRICTION;
  }

  /**
   * Attempt to shoot
   * @returns {Object|null} Bullet data if shot was fired, null otherwise
   */
  shoot() {
    const currentTime = Date.now();
    const shotCooldown = 500; // 500ms between shots

    if (currentTime - this.lastShotTime < shotCooldown) {
      return null;
    }

    this.lastShotTime = currentTime;

    // Calculate bullet spawn position (at tank front)
    const bulletX = this.x + Math.cos(this.rotation) * 30;
    const bulletY = this.y + Math.sin(this.rotation) * 30;

    return {
      x: bulletX,
      y: bulletY,
      rotation: this.rotation,
      velocity: {
        x: Math.cos(this.rotation) * PHYSICS_CONFIG.BULLET_SPEED,
        y: Math.sin(this.rotation) * PHYSICS_CONFIG.BULLET_SPEED
      },
      ownerId: this.id,
      createdAt: currentTime
    };
  }

  /**
   * Take damage
   * @param {number} damage - Amount of damage to take
   * @returns {boolean} True if player died from this damage
   */
  takeDamage(damage) {
    if (!this.isAlive) return false;

    this.health -= damage;

    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
      this.deaths++;
      return true;
    }

    return false;
  }

  /**
   * Heal the player
   * @param {number} amount - Amount to heal
   */
  heal(amount) {
    if (!this.isAlive) return;

    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * Respawn the player
   * @param {number} x - Spawn X position
   * @param {number} y - Spawn Y position
   */
  respawn(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.velocity = { x: 0, y: 0 };
    this.health = this.maxHealth;
    this.isAlive = true;
  }

  /**
   * Add kill to player's score
   */
  addKill() {
    this.kills++;
    this.score += 100; // 100 points per kill
  }

  /**
   * Get player's position
   * @returns {Object} Position object with x and y
   */
  getPosition() {
    return { x: this.x, y: this.y };
  }

  /**
   * Set player's position
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Get player's tank configuration
   * @returns {Object} Tank configuration
   */
  getTankConfig() {
    return { ...this.selectedTank };
  }

  /**
   * Set player's tank configuration
   * @param {Object} tankConfig - New tank configuration
   */
  setTankConfig(tankConfig) {
    this.selectedTank = { ...tankConfig };
  }

  /**
   * Get player data for serialization
   * @returns {Object} Serializable player data
   */
  serialize() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      velocity: this.velocity,
      health: this.health,
      selectedTank: this.selectedTank,
      isAlive: this.isAlive,
      score: this.score,
      kills: this.kills,
      deaths: this.deaths
    };
  }

  /**
   * Create player from serialized data
   * @param {Object} data - Serialized player data
   * @returns {Player} New player instance
   */
  static deserialize(data) {
    const player = new Player(data.id, data);
    player.velocity = data.velocity || { x: 0, y: 0 };
    player.isAlive = data.isAlive !== undefined ? data.isAlive : true;
    return player;
  }
}

export default Player;