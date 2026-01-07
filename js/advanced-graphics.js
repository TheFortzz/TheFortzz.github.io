// Advanced Graphics System - Enhanced Visual Effects
class AdvancedGraphics {
  constructor() {
    this.particles = [];
    this.trails = [];
    this.explosions = [];
    this.lightSources = [];
    this.postProcessingEffects = [];

    // Graphics settings
    this.settings = {
      particleQuality: 'high', // low, medium, high, ultra
      enableTrails: true,
      enableLighting: true,
      enablePostProcessing: true,
      enableReflections: true,
      shadowQuality: 'high'
    };

    // Particle pools for performance
    this.particlePool = [];
    this.trailPool = [];

    this.initializeShaders();
  }

  initializeShaders() {
    // WebGL shader setup for advanced effects
    this.shaders = {
      bloom: this.createBloomShader(),
      glow: this.createGlowShader(),
      distortion: this.createDistortionShader(),
      lighting: this.createLightingShader()
    };
  }

  // Enhanced Particle System
  createParticle(config) {
    const particle = this.getPooledParticle() || {
      x: 0, y: 0, vx: 0, vy: 0,
      life: 1, maxLife: 1,
      size: 1, color: '#ffffff',
      alpha: 1, rotation: 0,
      rotationSpeed: 0,
      gravity: 0, friction: 1,
      type: 'default'
    };

    Object.assign(particle, config);
    particle.life = particle.maxLife;
    this.particles.push(particle);
    return particle;
  }

  // Explosion Effects
  createExplosion(x, y, size = 1, type = 'default') {
    const explosion = {
      x, y, size,
      type,
      life: 1,
      maxLife: 1,
      rings: [],
      sparks: [],
      smoke: [],
      shockwave: { radius: 0, maxRadius: size * 100 }
    };

    // Create explosion rings
    for (let i = 0; i < 3; i++) {
      explosion.rings.push({
        radius: 0,
        maxRadius: size * (50 + i * 30),
        alpha: 1,
        delay: i * 0.1
      });
    }

    // Create sparks
    const sparkCount = Math.floor(size * 20);
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.PI * 2 * i / sparkCount + Math.random() * 0.5;
      const speed = (2 + Math.random() * 4) * size;

      explosion.sparks.push({
        x: 0, y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        size: 1 + Math.random() * 2,
        color: this.getExplosionColor(type)
      });
    }

    // Create smoke particles
    const smokeCount = Math.floor(size * 10);
    for (let i = 0; i < smokeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 * size;

      explosion.smoke.push({
        x: Math.random() * 20 - 10,
        y: Math.random() * 20 - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1 + Math.random(),
        size: 5 + Math.random() * 10,
        alpha: 0.3 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1
      });
    }

    this.explosions.push(explosion);

    // Screen shake based on distance and size
    if (typeof GameplayEnhancements !== 'undefined') {
      GameplayEnhancements.applyScreenShake(size * 15, 300);
    }

    return explosion;
  }

  getExplosionColor(type) {
    const colors = {
      default: ['#ff6b35', '#f7931e', '#ffcc02'],
      plasma: ['#00f7ff', '#0080ff', '#4040ff'],
      fire: ['#ff4444', '#ff8844', '#ffaa44'],
      ice: ['#44aaff', '#88ccff', '#aaddff'],
      toxic: ['#44ff44', '#88ff44', '#aaff88']
    };

    const colorSet = colors[type] || colors.default;
    return colorSet[Math.floor(Math.random() * colorSet.length)];
  }

  // Advanced Trail System
  createTrail(x, y, config = {}) {
    const trail = {
      points: [],
      maxPoints: config.maxPoints || 20,
      width: config.width || 3,
      color: config.color || '#00f7ff',
      fadeRate: config.fadeRate || 0.05,
      type: config.type || 'default'
    };

    trail.points.push({ x, y, alpha: 1 });
    this.trails.push(trail);
    return trail;
  }

  updateTrail(trail, x, y) {
    if (!trail) return;

    // Add new point
    trail.points.unshift({ x, y, alpha: 1 });

    // Remove excess points
    if (trail.points.length > trail.maxPoints) {
      trail.points.pop();
    }

    // Fade points
    trail.points.forEach((point, index) => {
      point.alpha = Math.max(0, 1 - index / trail.maxPoints);
    });
  }

  // Dynamic Lighting System
  addLightSource(x, y, config = {}) {
    const light = {
      x, y,
      radius: config.radius || 100,
      intensity: config.intensity || 1,
      color: config.color || '#ffffff',
      flickerSpeed: config.flickerSpeed || 0,
      flickerAmount: config.flickerAmount || 0,
      type: config.type || 'point',
      angle: config.angle || 0,
      cone: config.cone || Math.PI * 2
    };

    this.lightSources.push(light);
    return light;
  }

  // Post-Processing Effects
  applyPostProcessing(ctx, canvas) {
    if (!this.settings.enablePostProcessing) return;

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply effects
    this.applyBloom(data, canvas.width, canvas.height);
    this.applyContrast(data, 1.1);
    this.applySaturation(data, 1.2);

    // Put processed data back
    ctx.putImageData(imageData, 0, 0);
  }

  applyBloom(data, width, height) {
    // Simple bloom effect - brighten bright pixels
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness = (r + g + b) / 3;
      if (brightness > 200) {
        const bloomFactor = (brightness - 200) / 55 * 0.3;
        data[i] = Math.min(255, r + r * bloomFactor);
        data[i + 1] = Math.min(255, g + g * bloomFactor);
        data[i + 2] = Math.min(255, b + b * bloomFactor);
      }
    }
  }

  applyContrast(data, contrast) {
    const factor = 259 * (contrast * 255 + 255) / (255 * (259 - contrast * 255));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
    }
  }

  applySaturation(data, saturation) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      data[i] = Math.max(0, Math.min(255, gray + saturation * (r - gray)));
      data[i + 1] = Math.max(0, Math.min(255, gray + saturation * (g - gray)));
      data[i + 2] = Math.max(0, Math.min(255, gray + saturation * (b - gray)));
    }
  }

  // Update all graphics systems
  update(deltaTime) {
    this.updateParticles(deltaTime);
    this.updateTrails(deltaTime);
    this.updateExplosions(deltaTime);
    this.updateLighting(deltaTime);
  }

  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update physics
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.vy += particle.gravity * deltaTime;
      particle.vx *= particle.friction;
      particle.vy *= particle.friction;
      particle.rotation += particle.rotationSpeed * deltaTime;

      // Update life
      particle.life -= deltaTime;
      particle.alpha = particle.life / particle.maxLife;

      // Remove dead particles
      if (particle.life <= 0) {
        this.returnToPool(particle);
        this.particles.splice(i, 1);
      }
    }
  }

  updateExplosions(deltaTime) {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      explosion.life -= deltaTime * 2;

      // Update rings
      explosion.rings.forEach((ring) => {
        if (ring.delay <= 0) {
          ring.radius += (ring.maxRadius - ring.radius) * deltaTime * 8;
          ring.alpha = Math.max(0, explosion.life);
        } else {
          ring.delay -= deltaTime;
        }
      });

      // Update sparks
      explosion.sparks.forEach((spark) => {
        spark.x += spark.vx * deltaTime * 60;
        spark.y += spark.vy * deltaTime * 60;
        spark.vy += 5 * deltaTime; // gravity
        spark.life -= deltaTime;
        spark.vx *= 0.98;
        spark.vy *= 0.98;
      });

      // Update smoke
      explosion.smoke.forEach((smoke) => {
        smoke.x += smoke.vx * deltaTime * 60;
        smoke.y += smoke.vy * deltaTime * 60;
        smoke.life -= deltaTime * 0.5;
        smoke.size += deltaTime * 10;
        smoke.alpha *= 0.995;
        smoke.rotation += smoke.rotationSpeed * deltaTime * 60;
      });

      // Update shockwave
      explosion.shockwave.radius += (explosion.shockwave.maxRadius - explosion.shockwave.radius) * deltaTime * 10;

      // Remove finished explosions
      if (explosion.life <= 0) {
        this.explosions.splice(i, 1);
      }
    }
  }

  updateTrails(deltaTime) {
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const trail = this.trails[i];

      // Fade trail points
      trail.points.forEach((point) => {
        point.alpha -= trail.fadeRate * deltaTime * 60;
      });

      // Remove faded points
      trail.points = trail.points.filter((point) => point.alpha > 0);

      // Remove empty trails
      if (trail.points.length === 0) {
        this.trails.splice(i, 1);
      }
    }
  }

  updateLighting(deltaTime) {
    this.lightSources.forEach((light) => {
      if (light.flickerSpeed > 0) {
        const flicker = Math.sin(Date.now() * light.flickerSpeed * 0.01) * light.flickerAmount;
        light.currentIntensity = light.intensity + flicker;
      } else {
        light.currentIntensity = light.intensity;
      }
    });
  }

  // Render all graphics
  render(ctx, canvas, camera) {
    ctx.save();

    // Render lighting (background)
    if (this.settings.enableLighting) {
      this.renderLighting(ctx, canvas, camera);
    }

    // Render trails
    if (this.settings.enableTrails) {
      this.renderTrails(ctx, camera);
    }

    // Render particles
    this.renderParticles(ctx, camera);

    // Render explosions
    this.renderExplosions(ctx, camera);

    ctx.restore();

    // Apply post-processing
    if (this.settings.enablePostProcessing) {
      this.applyPostProcessing(ctx, canvas);
    }
  }

  renderParticles(ctx, camera) {
    this.particles.forEach((particle) => {
      if (!this.isVisible(particle, camera)) return;

      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.translate(particle.x - camera.x, particle.y - camera.y);
      ctx.rotate(particle.rotation);

      // Different particle types
      switch (particle.type) {
        case 'spark':
          this.renderSpark(ctx, particle);
          break;
        case 'smoke':
          this.renderSmoke(ctx, particle);
          break;
        case 'fire':
          this.renderFire(ctx, particle);
          break;
        default:
          this.renderDefaultParticle(ctx, particle);
      }

      ctx.restore();
    });
  }

  renderSpark(ctx, particle) {
    ctx.fillStyle = particle.color;
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);

    // Add glow
    ctx.shadowBlur = particle.size * 2;
    ctx.shadowColor = particle.color;
    ctx.fillRect(-particle.size / 4, -particle.size / 4, particle.size / 2, particle.size / 2);
  }

  renderSmoke(ctx, particle) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
    gradient.addColorStop(0, `rgba(100, 100, 100, ${particle.alpha * 0.8})`);
    gradient.addColorStop(1, `rgba(100, 100, 100, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  renderFire(ctx, particle) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.5, '#ff8844');
    gradient.addColorStop(1, 'rgba(255, 68, 68, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  renderDefaultParticle(ctx, particle) {
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  renderTrails(ctx, camera) {
    this.trails.forEach((trail) => {
      if (trail.points.length < 2) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < trail.points.length - 1; i++) {
        const point1 = trail.points[i];
        const point2 = trail.points[i + 1];

        if (!this.isVisible(point1, camera) && !this.isVisible(point2, camera)) continue;

        const alpha = Math.min(point1.alpha, point2.alpha);
        const width = trail.width * alpha;

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = trail.color;
        ctx.lineWidth = width;

        ctx.beginPath();
        ctx.moveTo(point1.x - camera.x, point1.y - camera.y);
        ctx.lineTo(point2.x - camera.x, point2.y - camera.y);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  renderExplosions(ctx, camera) {
    this.explosions.forEach((explosion) => {
      if (!this.isVisible(explosion, camera)) return;

      const screenX = explosion.x - camera.x;
      const screenY = explosion.y - camera.y;

      ctx.save();
      ctx.translate(screenX, screenY);

      // Render shockwave
      if (explosion.shockwave.radius > 0) {
        ctx.globalAlpha = Math.max(0, explosion.life * 0.3);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, explosion.shockwave.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Render rings
      explosion.rings.forEach((ring) => {
        if (ring.radius > 0 && ring.alpha > 0) {
          ctx.globalAlpha = ring.alpha * 0.6;
          ctx.strokeStyle = this.getExplosionColor(explosion.type);
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Render sparks
      explosion.sparks.forEach((spark) => {
        if (spark.life > 0) {
          ctx.globalAlpha = spark.life;
          ctx.fillStyle = spark.color;
          ctx.fillRect(spark.x - spark.size / 2, spark.y - spark.size / 2, spark.size, spark.size);
        }
      });

      // Render smoke
      explosion.smoke.forEach((smoke) => {
        if (smoke.life > 0) {
          ctx.save();
          ctx.translate(smoke.x, smoke.y);
          ctx.rotate(smoke.rotation);
          ctx.globalAlpha = smoke.alpha;

          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, smoke.size);
          gradient.addColorStop(0, `rgba(80, 80, 80, ${smoke.alpha})`);
          gradient.addColorStop(1, 'rgba(80, 80, 80, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, smoke.size, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      ctx.restore();
    });
  }

  renderLighting(ctx, canvas, camera) {
    // Create lighting overlay
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'screen';

    this.lightSources.forEach((light) => {
      const screenX = light.x - camera.x;
      const screenY = light.y - camera.y;

      // Skip lights outside screen
      if (screenX < -light.radius || screenX > canvas.width + light.radius ||
      screenY < -light.radius || screenY > canvas.height + light.radius) {
        return;
      }

      const gradient = ctx.createRadialGradient(
        screenX, screenY, 0,
        screenX, screenY, light.radius
      );

      const intensity = light.currentIntensity || light.intensity;
      gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.8})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.4})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, light.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Utility functions
  isVisible(obj, camera) {
    const margin = 100;
    return obj.x > camera.x - margin &&
    obj.x < camera.x + window.innerWidth + margin &&
    obj.y > camera.y - margin &&
    obj.y < camera.y + window.innerHeight + margin;
  }

  getPooledParticle() {
    return this.particlePool.pop();
  }

  returnToPool(particle) {
    this.particlePool.push(particle);
  }

  // Shader creation (placeholder for WebGL implementation)
  createBloomShader() {
    return {
      vertex: `
                attribute vec2 position;
                void main() {
                    gl_Position = vec4(position, 0.0, 1.0);
                }
            `,
      fragment: `
                precision mediump float;
                uniform sampler2D texture;
                void main() {
                    gl_FragColor = texture2D(texture, gl_FragCoord.xy);
                }
            `
    };
  }

  createGlowShader() {
    return { vertex: '', fragment: '' };
  }

  createDistortionShader() {
    return { vertex: '', fragment: '' };
  }

  createLightingShader() {
    return { vertex: '', fragment: '' };
  }

  // Settings management
  setGraphicsQuality(quality) {
    const presets = {
      low: {
        particleQuality: 'low',
        enableTrails: false,
        enableLighting: false,
        enablePostProcessing: false,
        enableReflections: false,
        shadowQuality: 'low'
      },
      medium: {
        particleQuality: 'medium',
        enableTrails: true,
        enableLighting: false,
        enablePostProcessing: false,
        enableReflections: false,
        shadowQuality: 'medium'
      },
      high: {
        particleQuality: 'high',
        enableTrails: true,
        enableLighting: true,
        enablePostProcessing: true,
        enableReflections: false,
        shadowQuality: 'high'
      },
      ultra: {
        particleQuality: 'ultra',
        enableTrails: true,
        enableLighting: true,
        enablePostProcessing: true,
        enableReflections: true,
        shadowQuality: 'ultra'
      }
    };

    if (presets[quality]) {
      Object.assign(this.settings, presets[quality]);
    }
  }

  // Cleanup
  cleanup() {
    this.particles = [];
    this.trails = [];
    this.explosions = [];
    this.lightSources = [];
    this.particlePool = [];
    this.trailPool = [];
  }
}

// Global instance
window.AdvancedGraphics = new AdvancedGraphics();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedGraphics;
}