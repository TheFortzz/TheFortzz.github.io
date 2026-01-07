/**
 * Camera System for TheFortz
 * Advanced camera controls with smooth following, shake, zoom, and cinematic effects
 */

const CameraSystem = {
  // Camera state
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  zoom: 1.0,
  targetZoom: 1.0,
  rotation: 0,
  targetRotation: 0,

  // Camera settings
  smoothing: 0.1,
  zoomSmoothing: 0.05,
  rotationSmoothing: 0.1,
  bounds: null,

  // Effects
  shake: {
    active: false,
    intensity: 0,
    duration: 0,
    elapsed: 0,
    offsetX: 0,
    offsetY: 0
  },

  trauma: 0,
  traumaDecay: 0.8,

  // Follow modes
  followMode: 'smooth', // smooth, instant, predictive, cinematic

  // Initialize camera
  init(x, y, bounds = null) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.bounds = bounds;
  },

  // Update camera
  update(deltaTime) {
    // Update shake
    if (this.shake.active) {
      this.updateShake(deltaTime);
    }

    // Update trauma-based shake
    if (this.trauma > 0) {
      this.updateTrauma(deltaTime);
    }

    // Smooth follow
    switch (this.followMode) {
      case 'smooth':
        this.smoothFollow();
        break;
      case 'instant':
        this.instantFollow();
        break;
      case 'predictive':
        this.predictiveFollow();
        break;
      case 'cinematic':
        this.cinematicFollow();
        break;
    }

    // Smooth zoom
    this.zoom += (this.targetZoom - this.zoom) * this.zoomSmoothing;

    // Smooth rotation
    this.rotation += (this.targetRotation - this.rotation) * this.rotationSmoothing;

    // Apply bounds
    if (this.bounds) {
      this.applyBounds();
    }
  },

  smoothFollow() {
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
  },

  instantFollow() {
    this.x = this.targetX;
    this.y = this.targetY;
  },

  predictiveFollow() {
    // Predict future position based on velocity
    const prediction = 100; // pixels ahead
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const predictedX = this.targetX + dx * 0.1;
    const predictedY = this.targetY + dy * 0.1;

    this.x += (predictedX - this.x) * this.smoothing;
    this.y += (predictedY - this.y) * this.smoothing;
  },

  cinematicFollow() {
    // Slower, more dramatic following
    const cinematicSmoothing = 0.05;
    this.x += (this.targetX - this.x) * cinematicSmoothing;
    this.y += (this.targetY - this.y) * cinematicSmoothing;
  },

  // Set target position
  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  },

  // Set zoom
  setZoom(zoom) {
    this.targetZoom = Math.max(0.5, Math.min(2.0, zoom));
  },

  // Set rotation
  setRotation(rotation) {
    this.targetRotation = rotation;
  },

  // Apply camera shake
  addShake(intensity, duration = 500) {
    this.shake.active = true;
    this.shake.intensity = Math.max(this.shake.intensity, intensity);
    this.shake.duration = duration;
    this.shake.elapsed = 0;
  },

  updateShake(deltaTime) {
    this.shake.elapsed += deltaTime;

    if (this.shake.elapsed >= this.shake.duration) {
      this.shake.active = false;
      this.shake.offsetX = 0;
      this.shake.offsetY = 0;
      return;
    }

    const progress = this.shake.elapsed / this.shake.duration;
    const intensity = this.shake.intensity * (1 - progress);

    this.shake.offsetX = (Math.random() - 0.5) * intensity * 2;
    this.shake.offsetY = (Math.random() - 0.5) * intensity * 2;
  },

  // Trauma-based shake (more realistic)
  addTrauma(amount) {
    this.trauma = Math.min(1, this.trauma + amount);
  },

  updateTrauma(deltaTime) {
    this.trauma = Math.max(0, this.trauma - this.traumaDecay * deltaTime / 1000);

    if (this.trauma > 0) {
      const shake = this.trauma * this.trauma;
      this.shake.offsetX = (Math.random() - 0.5) * shake * 30;
      this.shake.offsetY = (Math.random() - 0.5) * shake * 30;
    }
  },

  // Apply bounds
  applyBounds() {
    const halfWidth = window.innerWidth / 2 / this.zoom;
    const halfHeight = window.innerHeight / 2 / this.zoom;

    this.x = Math.max(this.bounds.minX + halfWidth, Math.min(this.bounds.maxX - halfWidth, this.x));
    this.y = Math.max(this.bounds.minY + halfHeight, Math.min(this.bounds.maxY - halfHeight, this.y));
  },

  // Get camera transform for rendering
  getTransform() {
    return {
      x: this.x + this.shake.offsetX,
      y: this.y + this.shake.offsetY,
      zoom: this.zoom,
      rotation: this.rotation
    };
  },

  // Apply transform to context
  applyTransform(ctx, canvas) {
    const transform = this.getTransform();

    ctx.save();

    // Center on canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply zoom
    ctx.scale(transform.zoom, transform.zoom);

    // Apply rotation
    ctx.rotate(transform.rotation);

    // Apply camera position
    ctx.translate(-transform.x, -transform.y);
  },

  resetTransform(ctx) {
    ctx.restore();
  },

  // Screen to world coordinates
  screenToWorld(screenX, screenY, canvas) {
    const transform = this.getTransform();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const worldX = (screenX - centerX) / transform.zoom + transform.x;
    const worldY = (screenY - centerY) / transform.zoom + transform.y;

    return { x: worldX, y: worldY };
  },

  // World to screen coordinates
  worldToScreen(worldX, worldY, canvas) {
    const transform = this.getTransform();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const screenX = (worldX - transform.x) * transform.zoom + centerX;
    const screenY = (worldY - transform.y) * transform.zoom + centerY;

    return { x: screenX, y: screenY };
  },

  // Check if point is in view
  isInView(x, y, canvas, margin = 100) {
    const transform = this.getTransform();
    const halfWidth = canvas.width / 2 / transform.zoom + margin;
    const halfHeight = canvas.height / 2 / transform.zoom + margin;

    return x > transform.x - halfWidth &&
    x < transform.x + halfWidth &&
    y > transform.y - halfHeight &&
    y < transform.y + halfHeight;
  },

  // Cinematic effects
  panTo(x, y, duration = 2000) {
    const startX = this.x;
    const startY = this.y;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease in-out
      const eased = progress < 0.5 ?
      2 * progress * progress :
      1 - Math.pow(-2 * progress + 2, 2) / 2;

      this.x = startX + (x - startX) * eased;
      this.y = startY + (y - startY) * eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  },

  zoomTo(zoom, duration = 1000) {
    const startZoom = this.zoom;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      const eased = progress < 0.5 ?
      2 * progress * progress :
      1 - Math.pow(-2 * progress + 2, 2) / 2;

      this.zoom = startZoom + (zoom - startZoom) * eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  },

  // Presets
  presets: {
    followPlayer: function (camera, player) {
      camera.setTarget(player.x, player.y);
      camera.followMode = 'smooth';
      camera.smoothing = 0.1;
    },

    spectator: function (camera) {
      camera.followMode = 'cinematic';
      camera.smoothing = 0.05;
    },

    action: function (camera) {
      camera.followMode = 'predictive';
      camera.smoothing = 0.15;
    },

    sniper: function (camera) {
      camera.setZoom(1.5);
      camera.followMode = 'smooth';
      camera.smoothing = 0.05;
    }
  }
};

// Export
if (typeof window !== 'undefined') {
  window.CameraSystem = CameraSystem;
}