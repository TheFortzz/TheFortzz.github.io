/**
 * Tank entity class
 * Manages tank rendering and behavior
 */

import { TANK_CONFIG } from '../core/Config.js';

class Tank {
  constructor(tankConfig = {}) {
    this.color = tankConfig.color || TANK_CONFIG.colors[0];
    this.body = tankConfig.body || TANK_CONFIG.bodies[0];
    this.weapon = tankConfig.weapon || TANK_CONFIG.weapons[0];
    this.visualSize = 64; // Default visual size for rendering
  }

  /**
   * Get tank configuration
   * @returns {Object} Tank configuration object
   */
  getConfig() {
    return {
      color: this.color,
      body: this.body,
      weapon: this.weapon
    };
  }

  /**
   * Set tank configuration
   * @param {Object} config - Tank configuration
   */
  setConfig(config) {
    if (config.color) this.color = config.color;
    if (config.body) this.body = config.body;
    if (config.weapon) this.weapon = config.weapon;
  }

  /**
   * Get tank asset key for animations
   * @returns {string} Asset key in format "color_body"
   */
  getTankAssetKey() {
    return `${this.color}_${this.body}`;
  }

  /**
   * Get weapon asset key for animations
   * @returns {string} Asset key in format "color_weapon"
   */
  getWeaponAssetKey() {
    return `${this.color}_${this.weapon}`;
  }

  /**
   * Render tank body on canvas - BODY ONLY, NO WEAPON INFLUENCE
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} tankImg - Tank body image
   * @param {Object} options - Rendering options
   */
  renderBody(ctx, tankImg, options = {}) {
    const {
      rotation = 0,
      scale = 1,
      spriteAnimation = null
    } = options;

    if (!tankImg || !tankImg.complete) return;

    // BODY ROTATION ONLY - completely separate from weapon
    ctx.save();
    ctx.rotate(rotation + Math.PI / 2);

    const isTankGif = tankImg.src && tankImg.src.includes('.gif');
    const isTankPng = tankImg.src && tankImg.src.includes('.png');

    // Calculate effective width for consistent scaling
    let effectiveTankWidth = tankImg.width;
    if (isTankGif) {
      // GIF: multiply single frame width by frame count (2 frames for tanks)
      effectiveTankWidth = 128 * 2; // 256px total
    }

    const tankScale = this.visualSize / Math.max(effectiveTankWidth, tankImg.height) * scale;

    if (spriteAnimation && isTankPng) {
      // PNG sprite sheet - draw specific frame
      const frameWidth = spriteAnimation.frameWidth || 128;
      const frameHeight = spriteAnimation.frameHeight || 128;
      const currentFrame = spriteAnimation.currentFrame || 0;

      ctx.drawImage(
        tankImg,
        currentFrame * frameWidth, 0, frameWidth, frameHeight,
        -frameWidth * tankScale / 2, -frameHeight * tankScale / 2,
        frameWidth * tankScale, frameHeight * tankScale
      );
    } else {
      // GIF or static image - draw whole image
      ctx.drawImage(
        tankImg,
        -tankImg.width * tankScale / 2,
        -tankImg.height * tankScale / 2,
        tankImg.width * tankScale,
        tankImg.height * tankScale
      );
    }

    ctx.restore(); // End body rotation - weapon not affected
  }

  /**
   * Render tank weapon on canvas - WEAPON ONLY, MOUSE CONTROLLED
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} weaponImg - Weapon image
   * @param {Object} options - Rendering options
   */
  renderWeapon(ctx, weaponImg, options = {}) {
    const {
      weaponAngle = 0,
      scale = 1,
      spriteAnimation = null
    } = options;

    if (!weaponImg || !weaponImg.complete) return;

    // WEAPON ROTATION ONLY - PURE mouse angle, no body influence
    ctx.save();
    ctx.rotate(weaponAngle + Math.PI / 2); // ONLY weapon angle, completely independent

    const isWeaponPng = weaponImg.src && weaponImg.src.includes('.png');

    // Calculate weapon scale - 4.32x multiplier for proper sizing
    const weaponScale = this.visualSize * 4.32 / Math.max(weaponImg.width, weaponImg.height) * scale;

    if (spriteAnimation && isWeaponPng) {
      // PNG sprite sheet - draw specific frame with enhanced animation
      const frameWidth = spriteAnimation.frameWidth || 128;
      const frameHeight = spriteAnimation.frameHeight || 128;
      let currentFrame = spriteAnimation.currentFrame || 0;
      
      // Clamp frame to valid range
      currentFrame = Math.max(0, Math.min(currentFrame, spriteAnimation.numFrames - 1));

      // Add muzzle flash effect on first few frames of shooting animation
      if (spriteAnimation.isPlaying && currentFrame < 3) {
        ctx.save();
        ctx.globalAlpha = 0.8 - (currentFrame * 0.2);
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.restore();
      }

      ctx.drawImage(
        weaponImg,
        currentFrame * frameWidth, 0, frameWidth, frameHeight,
        -frameWidth * weaponScale / 2, -frameHeight * weaponScale / 2,
        frameWidth * weaponScale, frameHeight * weaponScale
      );
    } else {
      // GIF - draw whole image
      ctx.drawImage(
        weaponImg,
        -weaponImg.width * weaponScale / 2,
        -weaponImg.height * weaponScale / 2,
        weaponImg.width * weaponScale,
        weaponImg.height * weaponScale
      );
    }

    ctx.restore(); // End weapon rotation - body not affected
  }

  /**
   * Render complete tank (body + weapon) on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} images - Object containing tankImg and weaponImg
   * @param {Object} options - Rendering options
   */
  render(ctx, images, options = {}) {
    const {
      x = 0,
      y = 0,
      bodyRotation = 0,
      weaponAngle = 0,
      scale = 1,
      tankAnimation = null,
      weaponAnimation = null
    } = options;

    // Render tank body at position - SEPARATE context
    ctx.save();
    ctx.translate(x, y);
    this.renderBody(ctx, images.tankImg, {
      rotation: bodyRotation,
      scale,
      spriteAnimation: tankAnimation
    });
    ctx.restore(); // End body context completely

    // Render weapon at same position - COMPLETELY SEPARATE context
    ctx.save();
    ctx.translate(x, y);
    this.renderWeapon(ctx, images.weaponImg, {
      weaponAngle,
      scale,
      spriteAnimation: weaponAnimation
    });
    ctx.restore(); // End weapon context completely
  }

  /**
   * Get tank stats based on configuration
   * @returns {Object} Tank stats (speed, fireRate, damage, health)
   */
  getStats() {
    // Default stats - can be customized based on tank configuration
    return {
      speed: 100,
      fireRate: 500,
      damage: 25,
      health: 100
    };
  }

  /**
   * Serialize tank configuration
   * @returns {Object} Serializable tank data
   */
  serialize() {
    return {
      color: this.color,
      body: this.body,
      weapon: this.weapon
    };
  }

  /**
   * Create tank from serialized data
   * @param {Object} data - Serialized tank data
   * @returns {Tank} New tank instance
   */
  static deserialize(data) {
    return new Tank(data);
  }

  /**
   * Verify tank configuration is valid
   * @param {Object} config - Tank configuration to verify
   * @returns {boolean} True if configuration is valid
   */
  static isValidConfig(config) {
    if (!config) return false;

    return (
      config.color && TANK_CONFIG.colors.includes(config.color) &&
      config.body && TANK_CONFIG.bodies.includes(config.body) &&
      config.weapon && TANK_CONFIG.weapons.includes(config.weapon));

  }

  /**
   * Get default tank configuration
   * @returns {Object} Default tank configuration
   */
  static getDefaultConfig() {
    return {
      color: TANK_CONFIG.colors[0],
      body: TANK_CONFIG.bodies[0],
      weapon: TANK_CONFIG.weapons[0]
    };
  }
}

export default Tank;