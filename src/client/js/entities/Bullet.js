/**
 * Bullet entity class
 * Manages bullet physics and rendering
 */

import { PHYSICS_CONFIG } from '../core/Config.js';

class Bullet {
  constructor(bulletData = {}) {
    this.x = bulletData.x || 0;
    this.y = bulletData.y || 0;
    this.vx = bulletData.vx || 0;
    this.vy = bulletData.vy || 0;
    this.rotation = bulletData.rotation || 0;
    this.ownerId = bulletData.ownerId || null;
    this.color = bulletData.color || 'blue';
    this.damage = bulletData.damage || 25;
    this.createdAt = bulletData.createdAt || Date.now();
    this.lifetime = bulletData.lifetime || 3000; // 3 seconds default
    this.isActive = true;
  }

  /**
   * Update bullet position
   * @param {number} deltaTime - Time since last update in milliseconds
   */
  update(deltaTime) {
    if (!this.isActive) return;

    // Update position based on velocity
    this.x += this.vx * (deltaTime / 16.67); // Normalize to 60fps
    this.y += this.vy * (deltaTime / 16.67);

    // Check if bullet has exceeded lifetime
    const age = Date.now() - this.createdAt;
    if (age > this.lifetime) {
      this.isActive = false;
    }
  }

  /**
   * Render bullet on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} bulletColors - Color configuration for bullet
   */
  render(ctx, bulletColors = null) {
    if (!this.isActive) return;

    const currentTime = Date.now();
    const animationTime = (currentTime - this.createdAt) * 0.01;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    ctx.save();
    ctx.translate(this.x, this.y);

    // Rotate bullet based on movement direction
    const rotationAngle = Math.atan2(this.vy, this.vx);
    ctx.rotate(rotationAngle);

    // Enhanced pulsing effect
    const pulseScale = 1.3 + Math.sin(animationTime * 0.8) * 0.2;
    ctx.scale(pulseScale, pulseScale);

    // Use provided colors or default blue
    const colors = bulletColors || this.getDefaultColors();

    // Subtle glow effect
    const baseGlow = 3;
    const glowIntensity = baseGlow + Math.sin(animationTime * 0.6) * 1;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = glowIntensity;

    // Bullet trail
    const trailLength = Math.min(8, 4 + speed * 0.12);
    const gradient = ctx.createLinearGradient(-trailLength, 0, 0, 0);
    gradient.addColorStop(0, `rgba(${colors.trail[0]}, ${colors.trail[1]}, ${colors.trail[2]}, 0)`);
    gradient.addColorStop(0.3, `rgba(${colors.mid[0]}, ${colors.mid[1]}, ${colors.mid[2]}, 1.0)`);
    gradient.addColorStop(1, `rgba(${colors.main[0]}, ${colors.main[1]}, ${colors.main[2]}, 1.0)`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-trailLength, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Bullet body
    ctx.shadowBlur = glowIntensity * 2;

    // Outer bullet shell
    ctx.fillStyle = colors.outer;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Inner energy core
    ctx.save();
    ctx.rotate(-animationTime * 1.2);
    ctx.fillStyle = colors.inner;
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bright center
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
    ctx.beginPath();
    ctx.arc(-0.05, -0.05, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Outer ring for visibility
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Get default color configuration for blue bullets
   * @returns {Object} Color configuration
   */
  getDefaultColors() {
    return {
      glow: '#4A9EFF',
      trail: [100, 150, 255],
      mid: [150, 200, 255],
      main: [200, 230, 255],
      outer: '#4A9EFF',
      inner: '#87CEEB'
    };
  }

  /**
   * Check collision with a point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} radius - Collision radius
   * @returns {boolean} True if collision detected
   */
  checkCollision(x, y, radius = 32) {
    if (!this.isActive) return false;

    const dx = this.x - x;
    const dy = this.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < radius;
  }

  /**
   * Deactivate bullet (e.g., after collision)
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * Get bullet speed
   * @returns {number} Speed magnitude
   */
  getSpeed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  /**
   * Get bullet direction angle
   * @returns {number} Angle in radians
   */
  getDirection() {
    return Math.atan2(this.vy, this.vx);
  }

  /**
   * Get bullet age in milliseconds
   * @returns {number} Age in milliseconds
   */
  getAge() {
    return Date.now() - this.createdAt;
  }

  /**
   * Check if bullet is expired
   * @returns {boolean} True if bullet has exceeded lifetime
   */
  isExpired() {
    return this.getAge() > this.lifetime;
  }

  /**
   * Serialize bullet data
   * @returns {Object} Serializable bullet data
   */
  serialize() {
    return {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      rotation: this.rotation,
      ownerId: this.ownerId,
      color: this.color,
      damage: this.damage,
      createdAt: this.createdAt,
      lifetime: this.lifetime,
      isActive: this.isActive
    };
  }

  /**
   * Create bullet from serialized data
   * @param {Object} data - Serialized bullet data
   * @returns {Bullet} New bullet instance
   */
  static deserialize(data) {
    return new Bullet(data);
  }

  /**
   * Create bullet from player position and angle
   * @param {Object} player - Player object with position and rotation
   * @param {Object} options - Additional options
   * @returns {Bullet} New bullet instance
   */
  static createFromPlayer(player, options = {}) {
    const {
      speed = PHYSICS_CONFIG.BULLET_SPEED || 10,
      offset = 30,
      color = 'blue',
      damage = 25
    } = options;

    const rotation = player.rotation || 0;
    const bulletX = player.x + Math.cos(rotation) * offset;
    const bulletY = player.y + Math.sin(rotation) * offset;

    return new Bullet({
      x: bulletX,
      y: bulletY,
      vx: Math.cos(rotation) * speed,
      vy: Math.sin(rotation) * speed,
      rotation: rotation,
      ownerId: player.id,
      color: color,
      damage: damage,
      createdAt: Date.now()
    });
  }
}

export default Bullet;