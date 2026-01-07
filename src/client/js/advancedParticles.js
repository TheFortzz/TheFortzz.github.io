/**
 * Advanced Particle System for TheFortz
 * Professional-grade particle effects for explosions, trails, impacts, and more
 */

class Particle {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.life = config.life || 1.0;
    this.maxLife = config.life || 1.0;
    this.size = config.size || 5;
    this.color = config.color || '#ffffff';
    this.alpha = config.alpha || 1.0;
    this.gravity = config.gravity || 0;
    this.friction = config.friction || 0.98;
    this.rotation = config.rotation || 0;
    this.rotationSpeed = config.rotationSpeed || 0;
    this.type = config.type || 'circle';
    this.glow = config.glow || false;
    this.fadeRate = config.fadeRate || 0.02;
    this.shrinkRate = config.shrinkRate || 0;
  }

  update(deltaTime = 1) {
    // Apply physics
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity * deltaTime;

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime;

    // Update life
    this.life -= this.fadeRate * deltaTime;
    this.alpha = Math.max(0, this.life / this.maxLife);

    // Shrink if needed
    if (this.shrinkRate > 0) {
      this.size = Math.max(0, this.size - this.shrinkRate * deltaTime);
    }

    return this.life > 0;
  }

  render(ctx) {
    if (this.life <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    if (this.glow) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
    }

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    switch (this.type) {
      case 'circle':
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'square':
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;

      case 'triangle':
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fill();
        break;

      case 'spark':
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }
}

class ParticleEmitter {
  constructor(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.particles = [];
    this.maxParticles = config.maxParticles || 100;
    this.emissionRate = config.emissionRate || 10;
    this.particleConfig = config.particleConfig || {};
    this.active = true;
    this.duration = config.duration || -1; // -1 = infinite
    this.elapsed = 0;
  }

  emit(count = 1) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const config = {
        x: this.x,
        y: this.y,
        ...this.particleConfig
      };

      this.particles.push(new Particle(config));
    }
  }

  update(deltaTime = 1) {
    if (!this.active) return;

    // Update duration
    if (this.duration > 0) {
      this.elapsed += deltaTime;
      if (this.elapsed >= this.duration) {
        this.active = false;
      }
    }

    // Emit particles
    if (this.active) {
      this.emit(this.emissionRate * deltaTime / 60);
    }

    // Update particles
    this.particles = this.particles.filter((p) => p.update(deltaTime));
  }

  render(ctx) {
    this.particles.forEach((p) => p.render(ctx));
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  stop() {
    this.active = false;
  }

  clear() {
    this.particles = [];
  }
}

const AdvancedParticles = {
  emitters: [],
  oneTimeParticles: [],

  // Create explosion effect
  createExplosion(x, y, config = {}) {
    const particleCount = config.particleCount || 30;
    const colors = config.colors || ['#ff6b00', '#ff8c00', '#ffa500', '#ffff00', '#ff0000'];
    const speed = config.speed || 5;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.PI * 2 * i / particleCount;
      const velocity = speed * (0.5 + Math.random() * 0.5);

      this.oneTimeParticles.push(new Particle({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1.0,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.1,
        friction: 0.95,
        glow: true,
        fadeRate: 0.015,
        type: Math.random() > 0.5 ? 'circle' : 'square'
      }));
    }

    // Add smoke particles
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 1 + Math.random() * 2;

      this.oneTimeParticles.push(new Particle({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 2.0,
        size: 8 + Math.random() * 12,
        color: `rgba(100, 100, 100, ${0.3 + Math.random() * 0.3})`,
        gravity: -0.05,
        friction: 0.98,
        fadeRate: 0.01,
        type: 'circle'
      }));
    }
  },

  // Create bullet trail
  createBulletTrail(x, y, vx, vy, color = '#FFD700') {
    for (let i = 0; i < 3; i++) {
      this.oneTimeParticles.push(new Particle({
        x: x - vx * i * 0.5,
        y: y - vy * i * 0.5,
        vx: vx * 0.1,
        vy: vy * 0.1,
        life: 0.5,
        size: 3 - i * 0.5,
        color: color,
        friction: 0.9,
        glow: true,
        fadeRate: 0.05,
        type: 'circle'
      }));
    }
  },

  // Create impact effect
  createImpact(x, y, angle, config = {}) {
    const particleCount = config.particleCount || 15;
    const color = config.color || '#ffffff';
    const spread = config.spread || Math.PI / 3;

    for (let i = 0; i < particleCount; i++) {
      const particleAngle = angle + (Math.random() - 0.5) * spread;
      const velocity = 3 + Math.random() * 4;

      this.oneTimeParticles.push(new Particle({
        x: x,
        y: y,
        vx: Math.cos(particleAngle) * velocity,
        vy: Math.sin(particleAngle) * velocity,
        life: 0.8,
        size: 2 + Math.random() * 3,
        color: color,
        gravity: 0.2,
        friction: 0.92,
        glow: true,
        fadeRate: 0.025,
        type: 'spark'
      }));
    }
  },

  // Create engine smoke
  createEngineSmoke(x, y, angle) {
    const offsetX = Math.cos(angle + Math.PI) * 30;
    const offsetY = Math.sin(angle + Math.PI) * 30;

    this.oneTimeParticles.push(new Particle({
      x: x + offsetX,
      y: y + offsetY,
      vx: Math.cos(angle + Math.PI) * 2 + (Math.random() - 0.5),
      vy: Math.sin(angle + Math.PI) * 2 + (Math.random() - 0.5),
      life: 1.5,
      size: 4 + Math.random() * 6,
      color: `rgba(150, 150, 150, ${0.3 + Math.random() * 0.2})`,
      gravity: -0.02,
      friction: 0.97,
      fadeRate: 0.015,
      type: 'circle'
    }));
  },

  // Create power-up collection effect
  createPowerUpEffect(x, y, color = '#FFD700') {
    for (let i = 0; i < 20; i++) {
      const angle = Math.PI * 2 * i / 20;
      const velocity = 3 + Math.random() * 2;

      this.oneTimeParticles.push(new Particle({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1.2,
        size: 3 + Math.random() * 4,
        color: color,
        gravity: -0.1,
        friction: 0.96,
        glow: true,
        fadeRate: 0.02,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        type: Math.random() > 0.5 ? 'circle' : 'square'
      }));
    }
  },

  // Create healing effect
  createHealEffect(x, y) {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 40;

      this.oneTimeParticles.push(new Particle({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        vx: 0,
        vy: -2 - Math.random() * 2,
        life: 1.5,
        size: 3 + Math.random() * 3,
        color: '#00ff00',
        gravity: -0.05,
        friction: 0.99,
        glow: true,
        fadeRate: 0.015,
        type: 'circle'
      }));
    }
  },

  // Create shield effect
  createShieldEffect(x, y, radius = 50) {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.PI * 2 * i / particleCount;

      this.oneTimeParticles.push(new Particle({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5,
        life: 0.8,
        size: 3,
        color: '#00d4ff',
        friction: 0.95,
        glow: true,
        fadeRate: 0.03,
        type: 'circle'
      }));
    }
  },

  // Create damage numbers
  createDamageNumber(x, y, damage, isCritical = false) {
    const color = isCritical ? '#ff0000' : '#ffffff';
    const size = isCritical ? 24 : 18;

    this.oneTimeParticles.push({
      x: x,
      y: y,
      vy: -2,
      life: 1.5,
      damage: damage,
      color: color,
      size: size,
      isCritical: isCritical,
      alpha: 1.0,

      update(deltaTime = 1) {
        this.y += this.vy * deltaTime;
        this.life -= 0.02 * deltaTime;
        this.alpha = Math.max(0, this.life / 1.5);
        return this.life > 0;
      },

      render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = `bold ${this.size}px Arial`;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';

        const text = `-${this.damage}`;
        ctx.strokeText(text, this.x, this.y);
        ctx.fillText(text, this.x, this.y);

        if (this.isCritical) {
          ctx.font = `bold 12px Arial`;
          ctx.fillStyle = '#ffff00';
          ctx.fillText('CRIT!', this.x, this.y - 20);
        }

        ctx.restore();
      }
    });
  },

  // Create level up effect
  createLevelUpEffect(x, y) {
    for (let i = 0; i < 50; i++) {
      const angle = Math.PI * 2 * i / 50;
      const velocity = 4 + Math.random() * 3;

      this.oneTimeParticles.push(new Particle({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 2.0,
        size: 4 + Math.random() * 4,
        color: ['#FFD700', '#FFA500', '#FFFF00'][Math.floor(Math.random() * 3)],
        gravity: -0.15,
        friction: 0.97,
        glow: true,
        fadeRate: 0.01,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)]
      }));
    }
  },

  // Create continuous emitter (e.g., for fire, smoke)
  createEmitter(x, y, config) {
    const emitter = new ParticleEmitter({
      x: x,
      y: y,
      ...config
    });
    this.emitters.push(emitter);
    return emitter;
  },

  // Update all particles
  update(deltaTime = 1) {
    // Update one-time particles
    this.oneTimeParticles = this.oneTimeParticles.filter((p) => p.update(deltaTime));

    // Update emitters
    this.emitters = this.emitters.filter((emitter) => {
      emitter.update(deltaTime);
      return emitter.active || emitter.particles.length > 0;
    });
  },

  // Render all particles
  render(ctx, camera) {
    ctx.save();

    // Render one-time particles
    this.oneTimeParticles.forEach((p) => p.render(ctx));

    // Render emitters
    this.emitters.forEach((emitter) => emitter.render(ctx));

    ctx.restore();
  },

  // Clear all particles
  clear() {
    this.oneTimeParticles = [];
    this.emitters = [];
  },

  // Get particle count (for performance monitoring)
  getParticleCount() {
    let count = this.oneTimeParticles.length;
    this.emitters.forEach((e) => count += e.particles.length);
    return count;
  }
};

// Export for use in game
if (typeof window !== 'undefined') {
  window.AdvancedParticles = AdvancedParticles;
}