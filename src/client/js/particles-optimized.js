// Optimized Particle System with Object Pooling

const OptimizedParticles = {
  // Particle pools
  pools: {
    explosion: null,
    smoke: null,
    bullet: null,
    impact: null
  },

  // Active particles
  active: {
    explosion: [],
    smoke: [],
    bullet: [],
    impact: []
  },

  // Max particles per type
  maxParticles: {
    explosion: 200,
    smoke: 300,
    bullet: 100,
    impact: 150
  },

  // Particle update batching
  batchSize: 50,

  init() {
    // Create object pools
    if (window.PerformanceOptimizer) {
      this.pools.explosion = window.PerformanceOptimizer.createObjectPool(
        () => this.createExplosionParticle(),
        50
      );

      this.pools.smoke = window.PerformanceOptimizer.createObjectPool(
        () => this.createSmokeParticle(),
        100
      );

      this.pools.bullet = window.PerformanceOptimizer.createObjectPool(
        () => this.createBulletTrail(),
        50
      );

      this.pools.impact = window.PerformanceOptimizer.createObjectPool(
        () => this.createImpactParticle(),
        50
      );
    }

    console.log('✓ Optimized particle system initialized');
  },

  // Create particle templates
  createExplosionParticle() {
    return {
      x: 0, y: 0,
      vx: 0, vy: 0,
      size: 3,
      life: 1,
      decay: 0.02,
      color: '#FF6B00',
      active: false
    };
  },

  createSmokeParticle() {
    return {
      x: 0, y: 0,
      vx: 0, vy: 0,
      size: 2,
      life: 1,
      decay: 0.03,
      rotation: 0,
      rotationSpeed: 0,
      active: false
    };
  },

  createBulletTrail() {
    return {
      x: 0, y: 0,
      vx: 0, vy: 0,
      size: 2,
      life: 1,
      decay: 0.05,
      color: 'blue',
      active: false
    };
  },

  createImpactParticle() {
    return {
      x: 0, y: 0,
      vx: 0, vy: 0,
      size: 2,
      life: 1,
      decay: 0.03,
      color: '#FFD700',
      active: false
    };
  },

  // Spawn explosion
  spawnExplosion(x, y, size = 1) {
    const count = Math.min(Math.floor(30 * size), this.maxParticles.explosion);

    for (let i = 0; i < count; i++) {
      if (this.active.explosion.length >= this.maxParticles.explosion) break;

      const particle = this.pools.explosion ? this.pools.explosion.get() : this.createExplosionParticle();

      const angle = Math.PI * 2 * i / count;
      const speed = 3 + Math.random() * 4 * size;

      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.size = (2 + Math.random() * 3) * size;
      particle.life = 1;
      particle.decay = 0.02 + Math.random() * 0.02;
      particle.color = i % 3 === 0 ? '#FF6B00' : i % 3 === 1 ? '#FFD700' : '#FF0000';
      particle.active = true;

      this.active.explosion.push(particle);
    }
  },

  // Spawn smoke
  spawnSmoke(x, y, vx, vy, isSprint = false) {
    if (this.active.smoke.length >= this.maxParticles.smoke) return;

    const particle = this.pools.smoke ? this.pools.smoke.get() : this.createSmokeParticle();

    particle.x = x;
    particle.y = y;
    particle.vx = vx;
    particle.vy = vy;
    particle.size = (isSprint ? 1.5 : 1) + Math.random() * 1.5;
    particle.life = 1;
    particle.decay = 0.03 + Math.random() * 0.02;
    particle.rotation = Math.random() * Math.PI * 2;
    particle.rotationSpeed = (Math.random() - 0.5) * 0.06;
    particle.active = true;

    this.active.smoke.push(particle);
  },

  // Update all particles (batched)
  update() {
    // Update in batches for better performance
    this.updateBatch('explosion');
    this.updateBatch('smoke');
    this.updateBatch('bullet');
    this.updateBatch('impact');
  },

  updateBatch(type) {
    const particles = this.active[type];
    const pool = this.pools[type];

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Apply physics
      if (type === 'explosion' || type === 'impact') {
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.vy += 0.15; // Gravity
      } else if (type === 'smoke') {
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.rotation += p.rotationSpeed;
        p.size += 0.15;
      } else if (type === 'bullet') {
        p.x += p.vx * 0.3;
        p.y += p.vy * 0.3;
      }

      // Update life
      p.life -= p.decay;

      // Remove dead particles
      if (p.life <= 0) {
        p.active = false;
        if (pool) pool.release(p);
        particles.splice(i, 1);
      }
    }
  },

  // Render all particles (optimized)
  render(ctx) {
    ctx.save();

    // Render each type
    this.renderBatch(ctx, 'explosion');
    this.renderBatch(ctx, 'smoke');
    this.renderBatch(ctx, 'bullet');
    this.renderBatch(ctx, 'impact');

    ctx.restore();
  },

  renderBatch(ctx, type) {
    const particles = this.active[type];

    particles.forEach((p) => {
      if (!p.active) return;

      ctx.globalAlpha = p.life;

      if (type === 'smoke') {
        // Smoke with gradient
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        gradient.addColorStop(0, `rgba(80, 80, 90, ${p.life * 0.4})`);
        gradient.addColorStop(1, 'rgba(40, 40, 50, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else {
        // Simple particles
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = type === 'explosion' ? 10 : 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.shadowBlur = 0;
  },

  // Clear all particles
  clear() {
    Object.keys(this.active).forEach((type) => {
      this.active[type].forEach((p) => {
        if (this.pools[type]) this.pools[type].release(p);
      });
      this.active[type] = [];
    });
  },

  // Get particle count
  getCount() {
    return Object.values(this.active).reduce((sum, arr) => sum + arr.length, 0);
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => OptimizedParticles.init());
} else {
  OptimizedParticles.init();
}

// Export
window.OptimizedParticles = OptimizedParticles;