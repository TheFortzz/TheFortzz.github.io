// Image Fallback System - Handles missing images gracefully

const ImageFallback = {
  // Cache of failed images
  failedImages: new Set(),

  // Fallback images
  fallbacks: {
    'level': '/assets/images/ui/lvl1.png', // Use lvl1 as fallback for all levels
    'tank': '/assets/images/blue_body_halftrack.png',
    'weapon': '/assets/images/blue_turret_01_mk1.png',
    'powerup': '/assets/images/bluehealth100+.png',
    'logo': '/assets/images/ui/logo.png'
  },

  // Level thresholds and their corresponding images
  levelThresholds: [
  { level: 1, image: '/assets/images/ui/lvl1.png' },
  { level: 10, image: '/assets/images/ui/lvl10.png' },
  { level: 20, image: '/assets/images/ui/lvl20.png' },
  { level: 35, image: '/assets/images/ui/lvl35.png' },
  { level: 50, image: '/assets/images/ui/lvl50.png' },
  { level: 70, image: '/assets/images/ui/lvl70.png' },
  { level: 100, image: '/assets/images/ui/lvl100.png' },
  { level: 150, image: '/assets/images/ui/lvl150.png' }],


  // Get the level badge image for a given level
  getLevelBadge(level) {
    let badge = this.levelThresholds[0].image; // Default to lvl1
    for (const threshold of this.levelThresholds) {
      if (level >= threshold.level) {
        badge = threshold.image;
      } else {
        break;
      }
    }
    return badge;
  },

  init() {
    this.setupImageErrorHandling();
    console.log('✓ Image fallback system initialized');
  },

  // Setup global image error handling
  setupImageErrorHandling() {
    // Override Image constructor
    const originalImage = window.Image;

    window.Image = function () {
      const img = new originalImage();

      const originalOnerror = img.onerror;
      img.onerror = function (e) {
        const src = this.src;

        // Mark as failed
        ImageFallback.failedImages.add(src);

        // Try fallback
        const fallback = ImageFallback.getFallback(src);
        if (fallback && fallback !== src) {
          console.warn(`Image failed: ${src}, using fallback: ${fallback}`);
          this.src = fallback;
        } else {
          console.error(`Image failed with no fallback: ${src}`);
        }

        // Call original error handler
        if (originalOnerror) {
          originalOnerror.call(this, e);
        }
      };

      return img;
    };
  },

  // Get fallback for failed image
  getFallback(src) {
    // Check if it's a level icon
    if (src.includes('level') && src.includes('.png')) {
      return this.fallbacks.level;
    }

    // Check if it's a tank
    if (src.includes('body_')) {
      return this.fallbacks.tank;
    }

    // Check if it's a weapon
    if (src.includes('turret_')) {
      return this.fallbacks.weapon;
    }

    // Check if it's a powerup
    if (src.includes('health') || src.includes('speed') || src.includes('teleport') || src.includes('bullet')) {
      return this.fallbacks.powerup;
    }

    // Check if it's a logo
    if (src.includes('logo')) {
      return this.fallbacks.logo;
    }

    return null;
  },

  // Check if image failed
  hasFailed(src) {
    return this.failedImages.has(src);
  },

  // Preload critical images
  preloadCriticalImages() {
    const critical = [
    '/assets/images/logo.png',
    '/assets/images/ui/lvl1.png',
    '/assets/images/fortz-coin.png',
    '/assets/images/blue_body_halftrack.png',
    '/assets/images/blue_turret_01_mk1.png'];


    let loaded = 0;
    const total = critical.length;

    return new Promise((resolve) => {
      critical.forEach((src) => {
        const img = new Image();
        img.onload = () => {
          loaded++;
          if (loaded === total) {
            console.log('✓ Critical images preloaded');
            resolve();
          }
        };
        img.onerror = () => {
          loaded++;
          console.warn('Failed to preload:', src);
          if (loaded === total) {
            resolve();
          }
        };
        img.src = src;
      });
    });
  },

  // Create placeholder image
  createPlaceholder(width, height, text = '?') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw placeholder
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    ctx.fillStyle = '#999';
    ctx.font = `${height / 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    return canvas;
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ImageFallback.init();
    ImageFallback.preloadCriticalImages();
  });
} else {
  ImageFallback.init();
  ImageFallback.preloadCriticalImages();
}

// Export
window.ImageFallback = ImageFallback;