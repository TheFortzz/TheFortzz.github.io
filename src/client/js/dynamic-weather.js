// Dynamic Weather System - Real-time weather effects that impact gameplay
class DynamicWeather {
  constructor() {
    this.currentWeather = 'clear';
    this.weatherIntensity = 0;
    this.transitionProgress = 0;
    this.weatherDuration = 0;
    this.nextWeatherChange = 0;

    this.particles = [];
    this.windDirection = 0;
    this.windStrength = 0;

    this.settings = {
      enableWeather: true,
      weatherChangeInterval: 120000, // 2 minutes
      maxParticles: 500,
      particleQuality: 'high'
    };

    this.weatherTypes = {
      clear: {
        name: 'Clear',
        visibility: 1.0,
        friction: 1.0,
        windEffect: 0.1,
        particleCount: 0,
        lightingMod: 1.0,
        soundAmbient: null
      },
      rain: {
        name: 'Rain',
        visibility: 0.7,
        friction: 0.9,
        windEffect: 0.3,
        particleCount: 200,
        lightingMod: 0.6,
        soundAmbient: 'rain',
        gameplayEffects: {
          slippery: true,
          reducedVisibility: true,
          electricalInterference: false
        }
      },
      storm: {
        name: 'Thunderstorm',
        visibility: 0.5,
        friction: 0.8,
        windEffect: 0.6,
        particleCount: 300,
        lightingMod: 0.4,
        soundAmbient: 'storm',
        gameplayEffects: {
          slippery: true,
          reducedVisibility: true,
          electricalInterference: true,
          lightning: true
        }
      },
      snow: {
        name: 'Snow',
        visibility: 0.6,
        friction: 0.7,
        windEffect: 0.4,
        particleCount: 150,
        lightingMod: 0.8,
        soundAmbient: 'wind',
        gameplayEffects: {
          slippery: true,
          reducedVisibility: true,
          coldEffect: true
        }
      },
      fog: {
        name: 'Fog',
        visibility: 0.3,
        friction: 1.0,
        windEffect: 0.2,
        particleCount: 100,
        lightingMod: 0.5,
        soundAmbient: 'fog',
        gameplayEffects: {
          reducedVisibility: true,
          dampedSound: true
        }
      },
      sandstorm: {
        name: 'Sandstorm',
        visibility: 0.4,
        friction: 0.9,
        windEffect: 0.8,
        particleCount: 250,
        lightingMod: 0.3,
        soundAmbient: 'sandstorm',
        gameplayEffects: {
          reducedVisibility: true,
          abrasiveDamage: true,
          equipmentDamage: true
        }
      }
    };

    this.lightningTimer = 0;
    this.lightningFlashes = [];

    this.initialize();
  }

  initialize() {
    this.setWeather('clear');
    this.scheduleNextWeatherChange();

    console.log('🌤️ Dynamic Weather System initialized');
  }

  update(deltaTime, gameState) {
    if (!this.settings.enableWeather) return;

    // Check for weather changes
    if (Date.now() >= this.nextWeatherChange) {
      this.changeWeather();
    }

    // Update current weather
    this.updateWeatherEffects(deltaTime, gameState);

    // Update particles
    this.updateWeatherParticles(deltaTime);

    // Update lightning
    if (this.currentWeather === 'storm') {
      this.updateLightning(deltaTime);
    }

    // Apply gameplay effects
    this.applyGameplayEffects(gameState);
  }

  changeWeather() {
    const weatherTypes = Object.keys(this.weatherTypes);
    const currentIndex = weatherTypes.indexOf(this.currentWeather);

    // Choose new weather (avoid immediate repeat)
    let newWeather;
    do {
      newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    } while (newWeather === this.currentWeather && weatherTypes.length > 1);

    this.setWeather(newWeather);
    this.scheduleNextWeatherChange();

    // Notify players
    if (typeof showNotification === 'function') {
      const weatherData = this.weatherTypes[newWeather];
      showNotification(`Weather changing to ${weatherData.name}`, '#87CEEB', 3000);
    }

    console.log(`🌦️ Weather changed to: ${newWeather}`);
  }

  setWeather(weatherType) {
    if (!this.weatherTypes[weatherType]) {
      console.warn(`Unknown weather type: ${weatherType}`);
      return;
    }

    this.currentWeather = weatherType;
    this.weatherIntensity = 0;
    this.transitionProgress = 0;

    const weather = this.weatherTypes[weatherType];

    // Clear existing particles
    this.particles = [];

    // Set wind
    this.windDirection = Math.random() * Math.PI * 2;
    this.windStrength = weather.windEffect;

    // Start ambient sound
    if (weather.soundAmbient && window.EnhancedAudio) {
      window.EnhancedAudio.playAmbientSound(weather.soundAmbient, {
        volume: 0.3,
        loop: true
      });
    }

    // Create initial particles
    this.createWeatherParticles();
  }

  scheduleNextWeatherChange() {
    const baseInterval = this.settings.weatherChangeInterval;
    const variation = baseInterval * 0.5; // ±50% variation
    const interval = baseInterval + (Math.random() - 0.5) * variation;

    this.nextWeatherChange = Date.now() + interval;
    this.weatherDuration = interval;
  }

  updateWeatherEffects(deltaTime, gameState) {
    const weather = this.weatherTypes[this.currentWeather];

    // Gradually increase intensity
    if (this.weatherIntensity < 1) {
      this.weatherIntensity = Math.min(1, this.weatherIntensity + deltaTime * 0.5);
    }

    // Update transition progress
    const elapsed = Date.now() - (this.nextWeatherChange - this.weatherDuration);
    this.transitionProgress = Math.min(1, elapsed / (this.weatherDuration * 0.3));
  }

  createWeatherParticles() {
    const weather = this.weatherTypes[this.currentWeather];
    const targetCount = Math.floor(weather.particleCount * this.getParticleQualityMultiplier());

    for (let i = 0; i < targetCount; i++) {
      this.createWeatherParticle();
    }
  }

  createWeatherParticle() {
    const weather = this.weatherTypes[this.currentWeather];
    let particle;

    switch (this.currentWeather) {
      case 'rain':
        particle = this.createRainParticle();
        break;
      case 'storm':
        particle = this.createStormParticle();
        break;
      case 'snow':
        particle = this.createSnowParticle();
        break;
      case 'fog':
        particle = this.createFogParticle();
        break;
      case 'sandstorm':
        particle = this.createSandParticle();
        break;
      default:
        return;
    }

    if (particle) {
      this.particles.push(particle);
    }
  }

  createRainParticle() {
    return {
      x: Math.random() * window.innerWidth * 2 - window.innerWidth * 0.5,
      y: -50,
      vx: Math.cos(this.windDirection) * this.windStrength * 50,
      vy: 300 + Math.random() * 200,
      life: 1,
      maxLife: 1,
      size: 1 + Math.random() * 2,
      alpha: 0.6 + Math.random() * 0.4,
      color: '#87CEEB',
      type: 'rain'
    };
  }

  createStormParticle() {
    const isHeavyRain = Math.random() < 0.8;

    if (isHeavyRain) {
      return {
        x: Math.random() * window.innerWidth * 2 - window.innerWidth * 0.5,
        y: -50,
        vx: Math.cos(this.windDirection) * this.windStrength * 80,
        vy: 400 + Math.random() * 300,
        life: 1,
        maxLife: 1,
        size: 2 + Math.random() * 3,
        alpha: 0.7 + Math.random() * 0.3,
        color: '#4682B4',
        type: 'heavy_rain'
      };
    } else {
      // Wind debris
      return {
        x: Math.random() * window.innerWidth * 2 - window.innerWidth * 0.5,
        y: Math.random() * window.innerHeight,
        vx: Math.cos(this.windDirection) * this.windStrength * 150,
        vy: Math.sin(this.windDirection) * this.windStrength * 100,
        life: 2 + Math.random() * 3,
        maxLife: 2 + Math.random() * 3,
        size: 3 + Math.random() * 5,
        alpha: 0.4 + Math.random() * 0.3,
        color: '#8B4513',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        type: 'debris'
      };
    }
  }

  createSnowParticle() {
    return {
      x: Math.random() * window.innerWidth * 2 - window.innerWidth * 0.5,
      y: -50,
      vx: Math.cos(this.windDirection) * this.windStrength * 30,
      vy: 50 + Math.random() * 100,
      life: 3 + Math.random() * 2,
      maxLife: 3 + Math.random() * 2,
      size: 2 + Math.random() * 4,
      alpha: 0.8 + Math.random() * 0.2,
      color: '#FFFFFF',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      type: 'snow'
    };
  }

  createFogParticle() {
    return {
      x: Math.random() * window.innerWidth * 2,
      y: Math.random() * window.innerHeight,
      vx: Math.cos(this.windDirection) * this.windStrength * 20,
      vy: (Math.random() - 0.5) * 10,
      life: 5 + Math.random() * 5,
      maxLife: 5 + Math.random() * 5,
      size: 50 + Math.random() * 100,
      alpha: 0.1 + Math.random() * 0.2,
      color: '#F5F5F5',
      type: 'fog'
    };
  }

  createSandParticle() {
    return {
      x: Math.random() * window.innerWidth * 2 - window.innerWidth * 0.5,
      y: Math.random() * window.innerHeight,
      vx: Math.cos(this.windDirection) * this.windStrength * 200,
      vy: (Math.random() - 0.5) * 50,
      life: 1 + Math.random() * 2,
      maxLife: 1 + Math.random() * 2,
      size: 1 + Math.random() * 3,
      alpha: 0.5 + Math.random() * 0.3,
      color: '#DEB887',
      type: 'sand'
    };
  }

  updateWeatherParticles(deltaTime) {
    const weather = this.weatherTypes[this.currentWeather];
    const targetCount = Math.floor(weather.particleCount * this.getParticleQualityMultiplier() * this.weatherIntensity);

    // Add particles if needed
    while (this.particles.length < targetCount) {
      this.createWeatherParticle();
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update physics
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.life -= deltaTime;

      if (particle.rotation !== undefined) {
        particle.rotation += particle.rotationSpeed * deltaTime * 60;
      }

      // Apply wind effect
      particle.vx += Math.cos(this.windDirection) * this.windStrength * 10 * deltaTime;
      particle.vy += Math.sin(this.windDirection) * this.windStrength * 5 * deltaTime;

      // Update alpha based on life
      particle.alpha = particle.life / particle.maxLife * (
      particle.type === 'fog' ? 0.3 : 0.8);

      // Remove dead or off-screen particles
      if (particle.life <= 0 ||
      particle.x < -100 || particle.x > window.innerWidth + 100 ||
      particle.y > window.innerHeight + 100) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateLightning(deltaTime) {
    this.lightningTimer += deltaTime;

    // Random lightning strikes
    if (this.lightningTimer > 2 && Math.random() < 0.01) {
      this.createLightningStrike();
      this.lightningTimer = 0;
    }

    // Update existing lightning flashes
    for (let i = this.lightningFlashes.length - 1; i >= 0; i--) {
      const flash = this.lightningFlashes[i];
      flash.life -= deltaTime * 3;
      flash.alpha = Math.max(0, flash.life);

      if (flash.life <= 0) {
        this.lightningFlashes.splice(i, 1);
      }
    }
  }

  createLightningStrike() {
    const flash = {
      x: Math.random() * window.innerWidth,
      y: 0,
      width: 5 + Math.random() * 10,
      height: window.innerHeight,
      life: 1,
      alpha: 1,
      branches: []
    };

    // Create lightning branches
    const branchCount = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < branchCount; i++) {
      flash.branches.push({
        startX: flash.x + (Math.random() - 0.5) * 100,
        startY: Math.random() * window.innerHeight * 0.7,
        endX: flash.x + (Math.random() - 0.5) * 200,
        endY: Math.random() * window.innerHeight * 0.3 + window.innerHeight * 0.7,
        width: 2 + Math.random() * 5
      });
    }

    this.lightningFlashes.push(flash);

    // Thunder sound
    if (window.EnhancedAudio) {
      setTimeout(() => {
        window.EnhancedAudio.playSound('thunder', {
          volume: 0.8 + Math.random() * 0.2
        });
      }, 100 + Math.random() * 2000); // Delay based on distance
    }

    // Screen flash
    if (window.AdvancedGraphics) {
      window.AdvancedGraphics.addLightSource(flash.x, flash.y, {
        radius: 500,
        intensity: 2,
        color: '#FFFFFF',
        flickerSpeed: 0,
        type: 'lightning'
      });
    }
  }

  applyGameplayEffects(gameState) {
    const weather = this.weatherTypes[this.currentWeather];
    const effects = weather.gameplayEffects || {};

    // Apply to all players and AI
    const allEntities = [
    ...Object.values(gameState.players || {}),
    ...(window.AIOpponents ? window.AIOpponents.getAllAITanks() : [])];


    allEntities.forEach((entity) => {
      if (!entity.weatherEffects) entity.weatherEffects = {};

      // Slippery surfaces
      if (effects.slippery) {
        entity.weatherEffects.friction = weather.friction;
      }

      // Reduced visibility
      if (effects.reducedVisibility) {
        entity.weatherEffects.visibility = weather.visibility;
      }

      // Electrical interference
      if (effects.electricalInterference) {
        entity.weatherEffects.radarJam = Math.random() < 0.1;
        entity.weatherEffects.weaponMalfunction = Math.random() < 0.05;
      }

      // Cold effects
      if (effects.coldEffect) {
        entity.weatherEffects.slowMovement = 0.9;
        entity.weatherEffects.slowTurning = 0.8;
      }

      // Abrasive damage
      if (effects.abrasiveDamage && Math.random() < 0.001) {
        if (entity.health) {
          entity.health = Math.max(0, entity.health - 1);
        }
      }

      // Equipment damage
      if (effects.equipmentDamage && Math.random() < 0.0005) {
        entity.weatherEffects.equipmentFailure = true;
      }
    });
  }

  render(ctx, canvas, camera) {
    if (!this.settings.enableWeather) return;

    ctx.save();

    // Render weather particles
    this.renderWeatherParticles(ctx, camera);

    // Render lightning
    if (this.currentWeather === 'storm') {
      this.renderLightning(ctx);
    }

    // Render weather overlay
    this.renderWeatherOverlay(ctx, canvas);

    ctx.restore();
  }

  renderWeatherParticles(ctx, camera) {
    this.particles.forEach((particle) => {
      if (!this.isParticleVisible(particle, camera)) return;

      ctx.save();
      ctx.globalAlpha = particle.alpha * this.weatherIntensity;

      const screenX = particle.x - camera.x;
      const screenY = particle.y - camera.y;

      switch (particle.type) {
        case 'rain':
        case 'heavy_rain':
          this.renderRainParticle(ctx, particle, screenX, screenY);
          break;
        case 'snow':
          this.renderSnowParticle(ctx, particle, screenX, screenY);
          break;
        case 'fog':
          this.renderFogParticle(ctx, particle, screenX, screenY);
          break;
        case 'sand':
          this.renderSandParticle(ctx, particle, screenX, screenY);
          break;
        case 'debris':
          this.renderDebrisParticle(ctx, particle, screenX, screenY);
          break;
      }

      ctx.restore();
    });
  }

  renderRainParticle(ctx, particle, x, y) {
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = particle.size;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - particle.vx * 0.02, y - particle.vy * 0.02);
    ctx.stroke();
  }

  renderSnowParticle(ctx, particle, x, y) {
    ctx.fillStyle = particle.color;
    ctx.translate(x, y);
    ctx.rotate(particle.rotation);

    // Draw snowflake
    const size = particle.size;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();

    // Add sparkle effect
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
  }

  renderFogParticle(ctx, particle, x, y) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size);
    gradient.addColorStop(0, `rgba(245, 245, 245, ${particle.alpha})`);
    gradient.addColorStop(1, 'rgba(245, 245, 245, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  renderSandParticle(ctx, particle, x, y) {
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(x, y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  renderDebrisParticle(ctx, particle, x, y) {
    ctx.fillStyle = particle.color;
    ctx.translate(x, y);
    ctx.rotate(particle.rotation);

    const size = particle.size;
    ctx.fillRect(-size / 2, -size / 2, size, size);
  }

  renderLightning(ctx) {
    this.lightningFlashes.forEach((flash) => {
      ctx.save();
      ctx.globalAlpha = flash.alpha;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = flash.width;
      ctx.lineCap = 'round';

      // Main lightning bolt
      ctx.beginPath();
      ctx.moveTo(flash.x, flash.y);
      ctx.lineTo(flash.x + (Math.random() - 0.5) * 50, flash.height);
      ctx.stroke();

      // Lightning branches
      flash.branches.forEach((branch) => {
        ctx.lineWidth = branch.width;
        ctx.beginPath();
        ctx.moveTo(branch.startX, branch.startY);
        ctx.lineTo(branch.endX, branch.endY);
        ctx.stroke();
      });

      // Glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FFFFFF';
      ctx.stroke();

      ctx.restore();
    });
  }

  renderWeatherOverlay(ctx, canvas) {
    const weather = this.weatherTypes[this.currentWeather];

    // Visibility overlay
    if (weather.visibility < 1) {
      const alpha = (1 - weather.visibility) * this.weatherIntensity * 0.3;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Color tint based on weather
    let tint = null;
    switch (this.currentWeather) {
      case 'storm':
        tint = `rgba(0, 0, 50, ${this.weatherIntensity * 0.2})`;
        break;
      case 'fog':
        tint = `rgba(200, 200, 200, ${this.weatherIntensity * 0.15})`;
        break;
      case 'sandstorm':
        tint = `rgba(139, 69, 19, ${this.weatherIntensity * 0.25})`;
        break;
    }

    if (tint) {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  isParticleVisible(particle, camera) {
    const margin = 100;
    return particle.x > camera.x - margin &&
    particle.x < camera.x + window.innerWidth + margin &&
    particle.y > camera.y - margin &&
    particle.y < camera.y + window.innerHeight + margin;
  }

  getParticleQualityMultiplier() {
    const multipliers = {
      low: 0.3,
      medium: 0.6,
      high: 1.0,
      ultra: 1.5
    };

    return multipliers[this.settings.particleQuality] || 1.0;
  }

  // Public API
  getCurrentWeather() {
    return {
      type: this.currentWeather,
      intensity: this.weatherIntensity,
      data: this.weatherTypes[this.currentWeather]
    };
  }

  setWeatherType(weatherType, intensity = 1) {
    this.setWeather(weatherType);
    this.weatherIntensity = Math.max(0, Math.min(1, intensity));
  }

  getVisibilityModifier() {
    const weather = this.weatherTypes[this.currentWeather];
    return weather.visibility * (1 - this.weatherIntensity * 0.3);
  }

  getFrictionModifier() {
    const weather = this.weatherTypes[this.currentWeather];
    return weather.friction;
  }

  getWindEffect() {
    return {
      direction: this.windDirection,
      strength: this.windStrength * this.weatherIntensity
    };
  }

  // Settings
  setWeatherEnabled(enabled) {
    this.settings.enableWeather = enabled;
    if (!enabled) {
      this.particles = [];
      this.lightningFlashes = [];
    }
  }

  setParticleQuality(quality) {
    this.settings.particleQuality = quality;
  }

  setWeatherChangeInterval(interval) {
    this.settings.weatherChangeInterval = interval;
  }

  // Events
  onWeatherChange(callback) {
    // TODO: Implement event system
    this.weatherChangeCallback = callback;
  }

  // Cleanup
  cleanup() {
    this.particles = [];
    this.lightningFlashes = [];
  }
}

// Global instance
window.DynamicWeather = new DynamicWeather();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DynamicWeather;
}