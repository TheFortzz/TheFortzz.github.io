/**
 * Performance Monitor for TheFortz
 * Track FPS, memory usage, and performance metrics
 */

const PerformanceMonitor = {
  // Metrics
  metrics: {
    fps: 0,
    frameTime: 0,
    memory: 0,
    drawCalls: 0,
    particles: 0,
    entities: 0,
    networkLatency: 0
  },

  // History for graphs
  history: {
    fps: [],
    frameTime: [],
    memory: [],
    maxHistoryLength: 60
  },

  // Performance stats
  stats: {
    avgFps: 0,
    minFps: Infinity,
    maxFps: 0,
    avgFrameTime: 0,
    totalFrames: 0
  },

  // Timing
  lastFrameTime: performance.now(),
  frameCount: 0,
  lastFpsUpdate: performance.now(),

  // Settings
  enabled: true,
  displayOverlay: false,

  // Initialize
  init() {
    this.lastFrameTime = performance.now();
    this.lastFpsUpdate = performance.now();
  },

  // Update metrics
  update() {
    if (!this.enabled) return;

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Update frame time
    this.metrics.frameTime = deltaTime;

    // Update FPS
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 1000) {
      this.metrics.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      // Update stats
      this.stats.totalFrames++;
      this.stats.minFps = Math.min(this.stats.minFps, this.metrics.fps);
      this.stats.maxFps = Math.max(this.stats.maxFps, this.metrics.fps);
      this.stats.avgFps = (this.stats.avgFps * (this.stats.totalFrames - 1) + this.metrics.fps) / this.stats.totalFrames;

      // Update history
      this.history.fps.push(this.metrics.fps);
      this.history.frameTime.push(this.metrics.frameTime);

      if (this.history.fps.length > this.history.maxHistoryLength) {
        this.history.fps.shift();
        this.history.frameTime.shift();
      }
    }

    // Update memory (if available)
    if (performance.memory) {
      this.metrics.memory = performance.memory.usedJSHeapSize / 1048576; // MB
      this.history.memory.push(this.metrics.memory);
      if (this.history.memory.length > this.history.maxHistoryLength) {
        this.history.memory.shift();
      }
    }
  },

  // Set entity count
  setEntityCount(count) {
    this.metrics.entities = count;
  },

  // Set particle count
  setParticleCount(count) {
    this.metrics.particles = count;
  },

  // Set draw calls
  setDrawCalls(count) {
    this.metrics.drawCalls = count;
  },

  // Set network latency
  setNetworkLatency(latency) {
    this.metrics.networkLatency = latency;
  },

  // Render overlay
  renderOverlay(ctx, canvas) {
    if (!this.displayOverlay) return;

    ctx.save();
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 180);

    ctx.fillStyle = '#00FF00';
    let y = 30;
    const lineHeight = 16;

    ctx.fillText(`FPS: ${this.metrics.fps}`, 20, y);
    y += lineHeight;
    ctx.fillText(`Frame Time: ${this.metrics.frameTime.toFixed(2)}ms`, 20, y);
    y += lineHeight;
    ctx.fillText(`Memory: ${this.metrics.memory.toFixed(2)}MB`, 20, y);
    y += lineHeight;
    ctx.fillText(`Entities: ${this.metrics.entities}`, 20, y);
    y += lineHeight;
    ctx.fillText(`Particles: ${this.metrics.particles}`, 20, y);
    y += lineHeight;
    ctx.fillText(`Draw Calls: ${this.metrics.drawCalls}`, 20, y);
    y += lineHeight;
    ctx.fillText(`Latency: ${this.metrics.networkLatency}ms`, 20, y);
    y += lineHeight;

    ctx.fillStyle = '#FFFF00';
    ctx.fillText(`Avg FPS: ${this.stats.avgFps.toFixed(1)}`, 20, y);
    y += lineHeight;
    ctx.fillText(`Min/Max: ${this.stats.minFps}/${this.stats.maxFps}`, 20, y);

    // Draw FPS graph
    this.drawGraph(ctx, this.history.fps, 10, 200, 200, 50, '#00FF00', 60);

    ctx.restore();
  },

  drawGraph(ctx, data, x, y, width, height, color, maxValue) {
    if (data.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const stepX = width / (data.length - 1);

    data.forEach((value, index) => {
      const graphX = x + index * stepX;
      const graphY = y + height - value / maxValue * height;

      if (index === 0) {
        ctx.moveTo(graphX, graphY);
      } else {
        ctx.lineTo(graphX, graphY);
      }
    });

    ctx.stroke();

    // Draw baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.stroke();
  },

  // Get performance report
  getReport() {
    return {
      current: this.metrics,
      stats: this.stats,
      history: this.history,
      timestamp: Date.now()
    };
  },

  // Check if performance is good
  isPerformanceGood() {
    return this.metrics.fps >= 30 && this.metrics.frameTime < 33;
  },

  // Get performance grade
  getPerformanceGrade() {
    const fps = this.metrics.fps;
    if (fps >= 60) return 'A';
    if (fps >= 45) return 'B';
    if (fps >= 30) return 'C';
    if (fps >= 20) return 'D';
    return 'F';
  },

  // Toggle overlay
  toggleOverlay() {
    this.displayOverlay = !this.displayOverlay;
  },

  // Reset stats
  reset() {
    this.stats = {
      avgFps: 0,
      minFps: Infinity,
      maxFps: 0,
      avgFrameTime: 0,
      totalFrames: 0
    };
    this.history.fps = [];
    this.history.frameTime = [];
    this.history.memory = [];
  }
};

// Export
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
}