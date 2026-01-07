// Optimized Game Loop with Performance Monitoring

const OptimizedGameLoop = {
  // Performance monitoring
  fpsCounter: null,
  frameTime: 0,
  lastFrameTime: 0,

  // Delta time
  deltaTime: 0,

  // Animation frame ID
  animationId: null,

  // Update frequency (can be different from render)
  updateInterval: 1000 / 60, // 60 updates per second
  lastUpdateTime: 0,

  // Render frequency
  renderInterval: 1000 / 60, // 60 FPS
  lastRenderTime: 0,

  // Performance stats
  stats: {
    fps: 60,
    updateTime: 0,
    renderTime: 0,
    totalTime: 0
  },

  // Callbacks
  updateCallback: null,
  renderCallback: null,

  init(updateFunc, renderFunc) {
    this.updateCallback = updateFunc;
    this.renderCallback = renderFunc;

    // Create FPS counter
    if (window.PerformanceOptimizer) {
      this.fpsCounter = window.PerformanceOptimizer.createFPSCounter();
    }

    console.log('✓ Optimized game loop initialized');
  },

  // Main loop
  loop(currentTime) {
    this.animationId = requestAnimationFrame((time) => this.loop(time));

    // Calculate delta time
    this.deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update FPS
    if (this.fpsCounter) {
      this.stats.fps = this.fpsCounter.update();
    }

    // Update game logic (fixed timestep)
    if (currentTime - this.lastUpdateTime >= this.updateInterval) {
      const updateStart = performance.now();

      if (this.updateCallback) {
        this.updateCallback(this.deltaTime);
      }

      this.stats.updateTime = performance.now() - updateStart;
      this.lastUpdateTime = currentTime;
    }

    // Render (can be throttled separately)
    if (currentTime - this.lastRenderTime >= this.renderInterval) {
      const renderStart = performance.now();

      if (this.renderCallback) {
        this.renderCallback(this.deltaTime);
      }

      this.stats.renderTime = performance.now() - renderStart;
      this.lastRenderTime = currentTime;
    }

    this.stats.totalTime = this.stats.updateTime + this.stats.renderTime;
  },

  start() {
    if (this.animationId) return; // Already running

    this.lastFrameTime = performance.now();
    this.lastUpdateTime = this.lastFrameTime;
    this.lastRenderTime = this.lastFrameTime;

    this.animationId = requestAnimationFrame((time) => this.loop(time));
    console.log('✓ Game loop started');
  },

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      console.log('✓ Game loop stopped');
    }
  },

  // Adjust FPS dynamically based on performance
  adjustQuality() {
    if (this.stats.fps < 30) {
      console.warn('⚠ Low FPS detected, reducing quality');
      this.renderInterval = 1000 / 30; // Drop to 30 FPS
      return 'low';
    } else if (this.stats.fps < 45) {
      this.renderInterval = 1000 / 45; // Medium quality
      return 'medium';
    } else {
      this.renderInterval = 1000 / 60; // Full quality
      return 'high';
    }
  },

  // Get performance stats
  getStats() {
    return {
      ...this.stats,
      quality: this.adjustQuality()
    };
  },

  // Display stats on screen (for debugging)
  displayStats(ctx, x = 10, y = 10) {
    ctx.save();
    ctx.font = '14px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.textAlign = 'left';

    ctx.fillText(`FPS: ${this.stats.fps}`, x, y);
    ctx.fillText(`Update: ${this.stats.updateTime.toFixed(2)}ms`, x, y + 20);
    ctx.fillText(`Render: ${this.stats.renderTime.toFixed(2)}ms`, x, y + 40);
    ctx.fillText(`Total: ${this.stats.totalTime.toFixed(2)}ms`, x, y + 60);

    ctx.restore();
  }
};

// Export
window.OptimizedGameLoop = OptimizedGameLoop;