/**
 * ImageLoader - Centralized image loading and asset management
 * Consolidates all image loading logic from game.js
 * 
 * Global compatibility: This module exposes images globally for backward compatibility
 * while using proper module structure internally.
 */

import { TANK_CONFIG, UI_CONFIG } from '../core/Config.js';

class ImageLoader {
  constructor() {
    // Image caches
    this.tankImages = {};
    this.weaponImages = {};
    this.lobbyTankImages = {}; // GIF images for lobby preview
    this.lobbyWeaponImages = {}; // GIF images for lobby preview
    this.asteroidImages = {};
    this.shopTankImageCache = {};

    // Global image caches for different vehicle types
    this.jetImageCache = {};
    this.raceImageCache = {};

    // Loading state
    this.imagesLoaded = false;
    this.lobbyImagesLoaded = false;
    this.asteroidsLoaded = false;
    this.shopImagesPreloaded = false;

    // Loading progress tracking
    this.loadedImageCount = 0;
    this.totalImagesToLoad = 0;
    this.loadingStartTime = Date.now();

    // Animation state
    this.lobbyAnimationId = null;

    // Expose globally for compatibility
    this.exposeGlobally();
  }

  /**
   * Expose image caches globally for backward compatibility
   */
  exposeGlobally() {
    if (typeof window !== 'undefined') {
      window.tankImages = this.tankImages;
      window.weaponImages = this.weaponImages;
      window.lobbyTankImages = this.lobbyTankImages;
      window.lobbyWeaponImages = this.lobbyWeaponImages;
      window.jetImageCache = this.jetImageCache;
      window.raceImageCache = this.raceImageCache;
      window.fortzCoinImg = null; // Will be loaded on demand
    }
  }

  /**
   * Initialize and start loading all tank images
   */
  initializeTankImages() {
    console.log('🚀 Starting tank image loading...');

    // Calculate total images to load
    this.totalImagesToLoad = TANK_CONFIG.colors.length * (TANK_CONFIG.bodies.length + TANK_CONFIG.weapons.length);

    // Load all tank body and weapon images
    TANK_CONFIG.colors.forEach((color) => {
      this.tankImages[color] = {};
      this.weaponImages[color] = {};
      this.lobbyTankImages[color] = {};
      this.lobbyWeaponImages[color] = {};

      TANK_CONFIG.bodies.forEach((body) => {
        this.loadWeaponImagePngFirst(`/assets/tank/tanks/${color}/${color}_${body}`, (img, success) => {
          this.tankImages[color][body] = img;
          this.checkImagesLoaded(success);
        });

        // Load GIF version for lobby
        this.loadGifImage(`/assets/tank/tanks/${color}/${color}_${body}.gif`, (img) => {
          this.lobbyTankImages[color][body] = img;
        });
      });

      TANK_CONFIG.weapons.forEach((weapon) => {
        this.loadWeaponImagePngFirst(`/assets/tank/tanks/${color}/${color}_${weapon}`, (img, success) => {
          this.weaponImages[color][weapon] = img;
          this.checkImagesLoaded(success);
        });

        // Load GIF version for lobby
        this.loadGifImage(`/assets/tank/tanks/${color}/${color}_${weapon}.gif`, (img) => {
          this.lobbyWeaponImages[color][weapon] = img;
        });
      });
    });
  }

  /**
   * Load GIF images directly for lobby previews
   */
  loadGifImage(path, callback) {
    const img = new Image();
    img.onload = () => {
      callback(img);
    };
    img.onerror = () => {
      console.warn(`Failed to load GIF: ${path}`);
      callback(null);
    };
    img.src = path;
  }

  /**
   * Load image with PNG/GIF fallback
   */
  loadImageWithFallback(basePath, callback) {
    const img = new Image();

    img.onload = () => {
      callback(img, true); // Pass success flag
    };

    img.onerror = () => {
      // Try GIF fallback
      const gifImg = new Image();
      gifImg.onload = () => {
        callback(gifImg, true); // Pass success flag
      };
      gifImg.onerror = () => {
        console.warn(`Failed to load both PNG and GIF for: ${basePath}`);
        callback(null, false); // Pass null and failure flag
      };
      gifImg.src = basePath + '.gif';
    };

    img.src = basePath + '.png';
  }

  /**
   * Load weapon images with PNG priority (for sprite sheet animation)
   */
  loadWeaponImagePngFirst(basePath, callback) {
    const pngImg = new Image();

    pngImg.onload = () => {
      callback(pngImg, true); // Pass success flag - PNG loaded
    };

    pngImg.onerror = () => {
      // Try GIF fallback if PNG doesn't exist
      const gifImg = new Image();
      gifImg.onload = () => {
        callback(gifImg, true); // Pass success flag - GIF loaded
      };
      gifImg.onerror = () => {
        console.warn(`Failed to load both PNG and GIF for: ${basePath}`);
        callback(null, false); // Pass null and failure flag
      };
      gifImg.src = basePath + '.gif';
    };

    pngImg.src = basePath + '.png';
  }

  /**
   * Check if all images have been loaded
   */
  checkImagesLoaded(success = true) {
    if (success) {
      this.loadedImageCount++;
    }

    // Check if we've attempted to load all images
    const totalAttempts = Object.values(this.tankImages).reduce((count, colorImages) =>
    count + Object.keys(colorImages).length, 0) +
    Object.values(this.weaponImages).reduce((count, colorImages) =>
    count + Object.keys(colorImages).length, 0);

    if (totalAttempts >= this.totalImagesToLoad) {
      this.imagesLoaded = true;
      console.log(`Image loading completed: ${this.loadedImageCount}/${this.totalImagesToLoad} loaded successfully`);

      // Update global references for map creator
      this.exposeGlobally();

      // Wait for both image loading AND minimum time
      this.waitForLoadingComplete();
    }
  }

  /**
   * Wait for both image loading completion AND minimum loading time
   */
  waitForLoadingComplete() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (!loadingOverlay) return;

    // Calculate how much time has passed since loading started
    const elapsedTime = Date.now() - this.loadingStartTime;
    const minLoadingTime = UI_CONFIG.LOADING_MIN_TIME; // 5 seconds minimum
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

    console.log(`⏱️ Images loaded, waiting ${remainingTime}ms more for minimum loading time`);

    setTimeout(() => {
      loadingOverlay.style.transition = 'opacity 0.5s ease-out';
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');

        // Trigger loading complete callback if available
        if (typeof window !== 'undefined' && window.onImageLoadingComplete) {
          window.onImageLoadingComplete();
        }
      }, 500);
    }, remainingTime);
  }

  /**
   * Get current tank images based on player selection
   */
  getCurrentTankImages(playerTank, forLobby = false) {
    if (forLobby) {
      // Use GIF images for lobby preview
      const tankImg = this.lobbyTankImages[playerTank.color]?.[playerTank.body];
      const weaponImg = this.lobbyWeaponImages[playerTank.color]?.[playerTank.weapon];
      return { tankImg, weaponImg };
    }

    // Use regular images for game map
    const tankImg = this.tankImages[playerTank.color]?.[playerTank.body];
    const weaponImg = this.weaponImages[playerTank.color]?.[playerTank.weapon];
    return { tankImg, weaponImg };
  }

  /**
   * Preload all shop tank images at game start (GIF for animated preview)
   */
  async preloadShopTankImages() {
    if (this.shopImagesPreloaded) return Promise.resolve();

    const colors = ['blue', 'camo', 'desert', 'purple', 'red'];
    const weapons = ['turret_01_mk1', 'turret_01_mk2', 'turret_01_mk3', 'turret_01_mk4', 'turret_02_mk1', 'turret_02_mk2', 'turret_02_mk3', 'turret_02_mk4'];
    const promises = [];

    colors.forEach((color) => {
      this.shopTankImageCache[color] = { body: null, bodyPng: null, weapons: {}, weaponsPng: {} };

      // Preload body GIF (animated)
      const bodyGifPromise = new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {this.shopTankImageCache[color].body = img;resolve();};
        img.onerror = () => resolve();
        img.src = `/assets/tank/tanks/${color}/${color}_body_halftrack.gif`;
      });
      promises.push(bodyGifPromise);

      // Preload body PNG (fallback)
      const bodyPngPromise = new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {this.shopTankImageCache[color].bodyPng = img;resolve();};
        img.onerror = () => resolve();
        img.src = `/assets/tank/tanks/${color}/${color}_body_halftrack.png`;
      });
      promises.push(bodyPngPromise);

      // Preload weapons GIF and PNG
      weapons.forEach((weapon) => {
        const weaponGifPromise = new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {this.shopTankImageCache[color].weapons[weapon] = img;resolve();};
          img.onerror = () => resolve();
          img.src = `/assets/tank/tanks/${color}/${color}_${weapon}.gif`;
        });
        promises.push(weaponGifPromise);

        const weaponPngPromise = new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {this.shopTankImageCache[color].weaponsPng[weapon] = img;resolve();};
          img.onerror = () => resolve();
          img.src = `/assets/tank/tanks/${color}/${color}_${weapon}.png`;
        });
        promises.push(weaponPngPromise);
      });
    });

    return Promise.all(promises).then(() => {
      this.shopImagesPreloaded = true;
      console.log('✅ Shop tank images preloaded (GIF + PNG)');
    });
  }

  /**
   * Load Fortz coin image on demand
   */
  loadFortzCoinImage() {
    if (typeof window !== 'undefined' && !window.fortzCoinImg) {
      window.fortzCoinImg = new Image();
      window.fortzCoinImg.src = '/assets/images/ui/fortz-coin.png';
    }
    return window.fortzCoinImg;
  }

  /**
   * Load and cache jet images
   */
  loadJetImage(imagePath) {
    if (!this.jetImageCache[imagePath]) {
      const img = new Image();
      img.src = imagePath;
      this.jetImageCache[imagePath] = img;
    }
    return this.jetImageCache[imagePath];
  }

  /**
   * Load and cache race images
   */
  loadRaceImage(imagePath) {
    if (!this.raceImageCache[imagePath]) {
      const img = new Image();
      img.src = imagePath;
      this.raceImageCache[imagePath] = img;
    }
    return this.raceImageCache[imagePath];
  }

  /**
   * Load asteroid images (currently disabled - only map editor asteroids are used)
   */
  loadAsteroidImages() {
    // Asteroid loading disabled - only show asteroids placed in map editor
    this.asteroidsLoaded = true;
    console.log('🌌 Asteroid loading skipped - using map editor asteroids only');
    return;
  }

  /**
   * Create a placeholder image for missing asteroid frames
   */
  createAsteroidPlaceholder(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Different colors for different types
    const colors = {
      'Rock': '#8B4513',
      'Ice': '#87CEEB',
      'Gold': '#FFD700'
    };

    ctx.fillStyle = colors[type] || '#8B4513';
    ctx.beginPath();
    ctx.arc(32, 32, 25, 0, Math.PI * 2);
    ctx.fill();

    // Add some texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(
        20 + Math.random() * 24,
        20 + Math.random() * 24,
        2 + Math.random() * 3,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    return canvas;
  }

  /**
   * Find a working default tank configuration
   */
  findWorkingDefaultTank() {
    // Try to find a working color/body/weapon combination
    for (const color of TANK_CONFIG.colors) {
      for (const body of TANK_CONFIG.bodies) {
        for (const weapon of TANK_CONFIG.weapons) {
          const tankImg = this.tankImages[color]?.[body];
          const weaponImg = this.weaponImages[color]?.[weapon];
          if (tankImg && weaponImg && tankImg.complete && weaponImg.complete) {
            console.log(`Found working default tank: ${color}/${body}/${weapon}`);
            return { color, body, weapon };
          }
        }
      }
    }
    return null;
  }

  /**
   * Verify default tank has valid images
   */
  verifyDefaultTank(selectedTank) {
    const { tankImg, weaponImg } = this.getCurrentTankImages(selectedTank);
    if (!tankImg || !weaponImg) {
      console.warn('Default tank images missing, switching to working default');
      return this.findWorkingDefaultTank();
    }
    return selectedTank;
  }

  /**
   * Get loading progress information
   */
  getLoadingProgress() {
    return {
      loaded: this.loadedImageCount,
      total: this.totalImagesToLoad,
      percentage: this.totalImagesToLoad > 0 ? this.loadedImageCount / this.totalImagesToLoad * 100 : 0,
      isComplete: this.imagesLoaded
    };
  }

  /**
   * Load image with callback for tank rendering
   */
  loadImageWithCallback(imagePath, callback) {
    const img = new Image();
    img.onload = () => {
      if (callback) callback(img, true);
    };
    img.onerror = () => {
      console.warn(`Failed to load image: ${imagePath}`);
      if (callback) callback(null, false);
    };
    img.src = imagePath;
    return img;
  }

  /**
   * Render tank on canvas with proper image loading
   */
  renderTankOnCanvas(canvasId, tankConfig, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas ${canvasId} not found`);
      return;
    }

    // Validate tank config and provide defaults
    if (!tankConfig || !tankConfig.color || !tankConfig.body || !tankConfig.weapon) {
      console.warn('Invalid tank config, using defaults:', tankConfig);
      tankConfig = {
        color: 'blue',
        body: 'body_halftrack',
        weapon: 'turret_01_mk1',
        ...tankConfig
      };
    }

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = options.scale || 0.6;
    const rotation = options.rotation || 0;
    const isLobby = options.isLobby || canvasId === 'playerTankCanvas';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { color, body, weapon } = tankConfig;

    // Use GIF animations for lobby, PNG for game
    if (isLobby && this.lobbyTankImages[color] && this.lobbyWeaponImages[color]) {
      this.renderTankWithGifs(ctx, centerX, centerY, scale, rotation, color, body, weapon);
    } else {
      this.renderTankWithPngs(ctx, centerX, centerY, scale, rotation, color, body, weapon);
    }
  }

  /**
   * Render tank using animated GIF images (for lobby)
   */
  renderTankWithGifs(ctx, centerX, centerY, scale, rotation, color, body, weapon) {
    const bodyImg = this.lobbyTankImages[color] && this.lobbyTankImages[color][body];
    const weaponImg = this.lobbyWeaponImages[color] && this.lobbyWeaponImages[color][weapon];

    if (bodyImg) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      const bodyWidth = bodyImg.width * scale;
      const bodyHeight = bodyImg.height * scale;
      ctx.drawImage(bodyImg, -bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
      ctx.restore();
    }

    if (weaponImg) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      const weaponWidth = weaponImg.width * scale;
      const weaponHeight = weaponImg.height * scale;
      ctx.drawImage(weaponImg, -weaponWidth / 2, -weaponHeight / 2, weaponWidth, weaponHeight);
      ctx.restore();
    }
  }

  /**
   * Render tank using PNG images (for game and fallback)
   */
  renderTankWithPngs(ctx, centerX, centerY, scale, rotation, color, body, weapon) {
    const bodyPath = `/assets/tank/tanks/${color}/${color}_${body}.png`;
    const weaponPath = `/assets/tank/tanks/${color}/${color}_${weapon}.png`;

    // Load body image
    this.loadImageWithCallback(bodyPath, (bodyImg, bodySuccess) => {
      if (!bodySuccess) return;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      const bodyWidth = bodyImg.width * scale;
      const bodyHeight = bodyImg.height * scale;
      ctx.drawImage(bodyImg, -bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
      ctx.restore();

      // Load weapon image
      this.loadImageWithCallback(weaponPath, (weaponImg, weaponSuccess) => {
        if (!weaponSuccess) return;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);

        const weaponWidth = weaponImg.width * scale;
        const weaponHeight = weaponImg.height * scale;
        ctx.drawImage(weaponImg, -weaponWidth / 2, -weaponHeight / 2, weaponWidth, weaponHeight);
        ctx.restore();
      });
    });
  }

  /**
   * Render jet on canvas with proper image loading
   */
  renderJetOnCanvas(canvasId, jetConfig, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas ${canvasId} not found`);
      return;
    }

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = options.scale || 1.0;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { type, color } = jetConfig;
    const jetPath = `/assets/jet/spr_${type}_${color}.png`;

    this.loadImageWithCallback(jetPath, (jetImg, success) => {
      if (!success) return;

      ctx.save();
      ctx.translate(centerX, centerY);

      const jetWidth = jetImg.width * scale;
      const jetHeight = jetImg.height * scale;
      ctx.drawImage(jetImg, -jetWidth / 2, -jetHeight / 2, jetWidth, jetHeight);
      ctx.restore();
    });
  }

  /**
   * Render race car on canvas with proper image loading
   */
  renderRaceOnCanvas(canvasId, raceConfig, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas ${canvasId} not found`);
      return;
    }

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = options.scale || 1.0;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { type, color } = raceConfig;
    const racePath = `/assets/race/sprites/cars/${type}_${color}.png`;

    this.loadImageWithCallback(racePath, (raceImg, success) => {
      if (!success) return;

      ctx.save();
      ctx.translate(centerX, centerY);

      const raceWidth = raceImg.width * scale;
      const raceHeight = raceImg.height * scale;
      ctx.drawImage(raceImg, -raceWidth / 2, -raceHeight / 2, raceWidth, raceHeight);
      ctx.restore();
    });
  }

  /**
   * Start lobby animation loop for GIF rendering
   */
  startLobbyAnimation() {
    if (this.lobbyAnimationId) {
      cancelAnimationFrame(this.lobbyAnimationId);
    }

    this.lobbyRotation = 0; // Initialize rotation

    const animate = () => {
      // Only animate if we're in the lobby and have a game state manager
      if (typeof window !== 'undefined' && window.gameStateManager) {
        const gameState = window.gameStateManager.getGameState();
        
        if (gameState && gameState.isInLobby) {
          // Update rotation for animation
          this.lobbyRotation += 0.01; // Slow rotation speed

          // Re-render player tank with GIF animation and rotation
          if (gameState.selectedTank) {
            this.renderTankOnCanvas('playerTankCanvas', gameState.selectedTank, { 
              isLobby: true, 
              scale: 1.8, // 3 times bigger (0.6 * 3 = 1.8)
              rotation: this.lobbyRotation 
            });
          }

          // Re-render party member tanks if they exist
          for (let i = 1; i <= 2; i++) {
            const partyCanvas = document.getElementById(`partyTank${i}Canvas`);
            if (partyCanvas && gameState.partyMembers && gameState.partyMembers[i-1]) {
              const member = gameState.partyMembers[i-1];
              if (member.selectedTank) {
                this.renderTankOnCanvas(`partyTank${i}Canvas`, member.selectedTank, { 
                  isLobby: true,
                  scale: 1.8,
                  rotation: this.lobbyRotation 
                });
              }
            }
          }
        }
      }

      this.lobbyAnimationId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Stop lobby animation loop
   */
  stopLobbyAnimation() {
    if (this.lobbyAnimationId) {
      cancelAnimationFrame(this.lobbyAnimationId);
      this.lobbyAnimationId = null;
    }
  }

  /**
   * Create fallback image for failed loads
   */
  createFallbackImage(width = 64, height = 64, text = '🚗', color = '#00f7ff') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'rgba(0, 247, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) / 3, 0, Math.PI * 2);
    ctx.fill();

    // Icon
    ctx.fillStyle = color;
    ctx.font = `${Math.min(width, height) / 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    return canvas;
  }

  /**
   * Batch load multiple images with progress callback
   */
  batchLoadImages(imagePaths, progressCallback, completeCallback) {
    let loadedCount = 0;
    const totalCount = imagePaths.length;
    const results = {};

    if (totalCount === 0) {
      if (completeCallback) completeCallback(results);
      return;
    }

    imagePaths.forEach((path) => {
      this.loadImageWithCallback(path, (img, success) => {
        results[path] = { image: img, success };
        loadedCount++;

        if (progressCallback) {
          progressCallback(loadedCount, totalCount, path, success);
        }

        if (loadedCount === totalCount && completeCallback) {
          completeCallback(results);
        }
      });
    });
  }
}

// Create singleton instance
const imageLoader = new ImageLoader();

// Export both the class and the singleton instance
export default imageLoader;
export { ImageLoader };