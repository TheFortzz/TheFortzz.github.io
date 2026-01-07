// Performance Configuration and Auto-Adjustment

const PerformanceConfig = {
  // Quality settings
  quality: 'high', // 'low', 'medium', 'high'

  // Feature toggles
  features: {
    particles: true,
    shadows: true,
    weather: false, // Disabled by default for performance
    trails: true,
    explosions: true,
    smoke: true
  },

  // Limits
  limits: {
    maxParticles: 500,
    maxBullets: 100,
    maxPlayers: 50,
    renderDistance: 2000
  },

  // FPS targets
  fpsTarget: {
    low: 30,
    medium: 45,
    high: 60
  },

  // Auto-adjust based on performance
  autoAdjust: true,
  adjustInterval: 5000, // Check every 5 seconds
  lastAdjustTime: 0,

  // Performance history
  fpsHistory: [],
  historySize: 60, // Keep last 60 samples

  init() {
    // Load saved settings
    this.loadSettings();

    // Start auto-adjustment if enabled
    if (this.autoAdjust) {
      setInterval(() => this.checkPerformance(), this.adjustInterval);
    }

    console.log('✓ Performance config initialized:', this.quality);
  },

  loadSettings() {
    try {
      const saved = localStorage.getItem('performanceSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.quality = settings.quality || 'high';
        this.features = { ...this.features, ...settings.features };
        this.autoAdjust = settings.autoAdjust !== undefined ? settings.autoAdjust : true;
      }
    } catch (e) {
      console.warn('Could not load performance settings:', e);
    }
  },

  saveSettings() {
    try {
      localStorage.setItem('performanceSettings', JSON.stringify({
        quality: this.quality,
        features: this.features,
        autoAdjust: this.autoAdjust
      }));
    } catch (e) {
      console.warn('Could not save performance settings:', e);
    }
  },

  setQuality(quality) {
    this.quality = quality;

    switch (quality) {
      case 'low':
        this.features.particles = false;
        this.features.shadows = false;
        this.features.weather = false;
        this.features.trails = false;
        this.features.smoke = false;
        this.limits.maxParticles = 100;
        break;

      case 'medium':
        this.features.particles = true;
        this.features.shadows = false;
        this.features.weather = false;
        this.features.trails = true;
        this.features.smoke = true;
        this.limits.maxParticles = 300;
        break;

      case 'high':
        this.features.particles = true;
        this.features.shadows = true;
        this.features.weather = false;
        this.features.trails = true;
        this.features.explosions = true;
        this.features.smoke = true;
        this.limits.maxParticles = 500;
        break;
    }

    this.saveSettings();
    console.log('✓ Quality set to:', quality);
  },

  recordFPS(fps) {
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }
  },

  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  },

  checkPerformance() {
    if (!this.autoAdjust) return;

    const avgFPS = this.getAverageFPS();

    // Auto-adjust quality based on FPS
    if (avgFPS < 25 && this.quality !== 'low') {
      console.warn('⚠ Low FPS detected, switching to low quality');
      this.setQuality('low');
    } else if (avgFPS < 40 && this.quality === 'high') {
      console.warn('⚠ Medium FPS detected, switching to medium quality');
      this.setQuality('medium');
    } else if (avgFPS > 55 && this.quality === 'low') {
      console.log('✓ Good FPS, upgrading to medium quality');
      this.setQuality('medium');
    } else if (avgFPS > 58 && this.quality === 'medium') {
      console.log('✓ Excellent FPS, upgrading to high quality');
      this.setQuality('high');
    }
  },

  // Check if feature is enabled
  isEnabled(feature) {
    return this.features[feature] !== false;
  },

  // Get current limits
  getLimit(limit) {
    return this.limits[limit];
  },

  // Toggle feature
  toggleFeature(feature) {
    this.features[feature] = !this.features[feature];
    this.saveSettings();
    console.log(`✓ ${feature}:`, this.features[feature] ? 'enabled' : 'disabled');
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PerformanceConfig.init());
} else {
  PerformanceConfig.init();
}

// Export
window.PerformanceConfig = PerformanceConfig;