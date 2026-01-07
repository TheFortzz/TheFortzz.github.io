// Tank Animation Manager - Handles sprite animations for tank bodies only

const TankAnimationManager = {
  animations: {
    tanks: {}
  },

  init() {
    console.log('✓ Tank Animation Manager initialized');
  },

  // Create tank body animation
  createTankBodyAnimation(playerId, tankConfig) {
    const key = `${playerId}_${tankConfig.color}_${tankConfig.body}`;

    if (!this.animations.tanks[key]) {
      this.animations.tanks[key] = {
        currentFrame: 0,
        frameCount: 2,
        frameDuration: 40,
        lastFrameTime: Date.now(),
        isPlaying: false
      };
    }
  },

  // Update movement animation
  updateMovementAnimation(playerId, velocity) {
    // Find tank animation for this player
    Object.keys(this.animations.tanks).forEach((key) => {
      if (key.startsWith(playerId)) {
        const anim = this.animations.tanks[key];
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        anim.isPlaying = speed > 0.1;
      }
    });
  },

  // Update all animations
  update() {
    const now = Date.now();

    // Update tank animations
    Object.values(this.animations.tanks).forEach((anim) => {
      if (anim.isPlaying && now - anim.lastFrameTime >= anim.frameDuration) {
        anim.currentFrame = (anim.currentFrame + 1) % anim.frameCount;
        anim.lastFrameTime = now;
      }
    });
  },

  // Get animation for player
  getAnimation(playerId, type) {
    const animations = this.animations.tanks;

    for (const key in animations) {
      if (key.startsWith(playerId)) {
        return animations[key];
      }
    }

    return null;
  },

  // Clear animations for player
  clearPlayerAnimations(playerId) {
    Object.keys(this.animations.tanks).forEach((key) => {
      if (key.startsWith(playerId)) {
        delete this.animations.tanks[key];
      }
    });
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    TankAnimationManager.init();
    window.tankAnimationManager = TankAnimationManager;
  });
} else {
  TankAnimationManager.init();
  window.tankAnimationManager = TankAnimationManager;
}

// Export
window.TankAnimationManager = TankAnimationManager;
window.tankAnimationManager = TankAnimationManager;