
/**
 * Advanced Visual Effects System
 * Cinematic effects, depth of field, motion blur, advanced particles
 */

const AdvancedVisualEffects = {
  effects: {
    motionBlur: {
      enabled: true,
      intensity: 0.3,
      trailLength: 5,
      trails: []
    },
    depthOfField: {
      enabled: false,
      focusDistance: 500,
      blurIntensity: 3
    },
    lightRays: {
      enabled: true,
      sources: []
    },
    heatWave: {
      enabled: false,
      intensity: 0,
      offset: 0
    },
    particleTrails: [],
    impactWaves: [],
    energyFields: []
  },

  // Add motion trail for fast-moving object
  addMotionTrail(x, y, vx, vy, color = '#fff') {
    this.effects.motionBlur.trails.push({
      positions: [{ x, y }],
      vx, vy,
      color,
      life: 1,
      decay: 0.05,
      maxLength: this.effects.motionBlur.trailLength
    });
  },

  // Add light ray effect
  addLightRay(x, y, angle, length, color = '#FFD700') {
    this.effects.lightRays.sources.push({
      x, y, angle, length, color,
      life: 1,
      decay: 0.02,
      flicker: Math.random() * 0.3
    });
  },

  // Add impact wave
  addImpactWave(x, y, maxRadius = 100, color = '#00f7ff') {
    this.effects.impactWaves.push({
      x, y,
      radius: 0,
      maxRadius,
      color,
      life: 1,
      expansion: 5
    });
  },

  // Add energy field
  addEnergyField(x, y, radius, color = '#00ff00') {
    this.effects.energyFields.push({
      x, y, radius, color,
      life: 3,
      pulsePhase: 0,
      particles: []
    });

    // Create field particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.PI * 2 * i / 20;
      this.effects.energyFields[this.effects.energyFields.length - 1].particles.push({
        angle,
        distance: radius,
        speed: 0.05
      });
    }
  },

  // Update all effects
  update(deltaTime) {
    // Update motion trails
    this.effects.motionBlur.trails = this.effects.motionBlur.trails.filter((trail) => {
      // Add new position
      const lastPos = trail.positions[trail.positions.length - 1];
      trail.positions.push({
        x: lastPos.x + trail.vx * deltaTime,
        y: lastPos.y + trail.vy * deltaTime
      });

      // Limit trail length
      if (trail.positions.length > trail.maxLength) {
        trail.positions.shift();
      }

      trail.life -= trail.decay;
      return trail.life > 0;
    });

    // Update light rays
    this.effects.lightRays.sources = this.effects.lightRays.sources.filter((ray) => {
      ray.life -= ray.decay;
      ray.flicker = Math.sin(Date.now() * 0.01) * 0.2;
      return ray.life > 0;
    });

    // Update impact waves
    this.effects.impactWaves = this.effects.impactWaves.filter((wave) => {
      wave.radius += wave.expansion;
      wave.life = 1 - wave.radius / wave.maxRadius;
      return wave.radius < wave.maxRadius;
    });

    // Update energy fields
    this.effects.energyFields = this.effects.energyFields.filter((field) => {
      field.life -= deltaTime / 1000;
      field.pulsePhase += 0.1;

      // Update particles
      field.particles.forEach((p) => {
        p.angle += p.speed;
        p.distance = field.radius + Math.sin(p.angle * 3) * 10;
      });

      return field.life > 0;
    });

    // Update heat wave
    if (this.effects.heatWave.enabled) {
      this.effects.heatWave.offset += 0.1;
    }
  },

  // Render all effects
  render(ctx, camera) {
    // Render motion trails
    if (this.effects.motionBlur.enabled) {
      this.renderMotionTrails(ctx);
    }

    // Render light rays
    if (this.effects.lightRays.enabled) {
      this.renderLightRays(ctx);
    }

    // Render impact waves
    this.renderImpactWaves(ctx);

    // Render energy fields
    this.renderEnergyFields(ctx);
  },

  renderMotionTrails(ctx) {
    ctx.save();

    this.effects.motionBlur.trails.forEach((trail) => {
      if (trail.positions.length < 2) return;

      ctx.globalAlpha = trail.life * 0.5;
      ctx.strokeStyle = trail.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(trail.positions[0].x, trail.positions[0].y);

      for (let i = 1; i < trail.positions.length; i++) {
        ctx.lineTo(trail.positions[i].x, trail.positions[i].y);
      }

      ctx.stroke();
    });

    ctx.restore();
  },

  renderLightRays(ctx) {
    ctx.save();

    this.effects.lightRays.sources.forEach((ray) => {
      const alpha = ray.life * (0.3 + ray.flicker);
      ctx.globalAlpha = alpha;

      const gradient = ctx.createLinearGradient(
        ray.x, ray.y,
        ray.x + Math.cos(ray.angle) * ray.length,
        ray.y + Math.sin(ray.angle) * ray.length
      );

      gradient.addColorStop(0, ray.color);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.moveTo(ray.x, ray.y);
      ctx.lineTo(
        ray.x + Math.cos(ray.angle) * ray.length,
        ray.y + Math.sin(ray.angle) * ray.length
      );
      ctx.stroke();
    });

    ctx.restore();
  },

  renderImpactWaves(ctx) {
    ctx.save();

    this.effects.impactWaves.forEach((wave) => {
      ctx.globalAlpha = wave.life;
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner wave
      ctx.globalAlpha = wave.life * 0.5;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.restore();
  },

  renderEnergyFields(ctx) {
    ctx.save();

    this.effects.energyFields.forEach((field) => {
      const pulseRadius = field.radius * (1 + Math.sin(field.pulsePhase) * 0.1);

      // Field glow
      ctx.globalAlpha = field.life * 0.3;
      const gradient = ctx.createRadialGradient(field.x, field.y, 0, field.x, field.y, pulseRadius);
      gradient.addColorStop(0, field.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(field.x, field.y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Field particles
      ctx.globalAlpha = field.life;
      ctx.fillStyle = field.color;

      field.particles.forEach((p) => {
        const px = field.x + Math.cos(p.angle) * p.distance;
        const py = field.y + Math.sin(p.angle) * p.distance;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    ctx.restore();
  },

  // Apply post-processing heat wave effect
  applyHeatWave(ctx, canvas) {
    if (!this.effects.heatWave.enabled || this.effects.heatWave.intensity === 0) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple wave distortion
    for (let y = 0; y < canvas.height; y++) {
      const wave = Math.sin(y * 0.1 + this.effects.heatWave.offset) * this.effects.heatWave.intensity;
      const offset = Math.floor(wave) * 4;

      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;
        const srcIdx = idx + offset;

        if (srcIdx >= 0 && srcIdx < data.length - 3) {
          data[idx] = data[srcIdx];
          data[idx + 1] = data[srcIdx + 1];
          data[idx + 2] = data[srcIdx + 2];
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
};

window.AdvancedVisualEffects = AdvancedVisualEffects;
console.log('✨ Advanced Visual Effects System initialized');