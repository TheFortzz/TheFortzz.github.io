// Visual Polish System - Screen Shake, Enhanced Particles, Damage Numbers
// Making the game feel JUICY and responsive

const VisualPolish = {
  // Screen shake state
  screenShake: {
    intensity: 0,
    decay: 0.9,
    offsetX: 0,
    offsetY: 0
  },

  // Damage numbers
  damageNumbers: [],

  // Enhanced particles
  enhancedParticles: [],

  // Hit markers
  hitMarkers: [],

  // Muzzle flashes (enhanced)
  muzzleFlashes: new Map(),

  // Dust clouds
  dustClouds: [],

  // Apply screen shake
  applyScreenShake(intensity) {
    this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
  },

  // Update screen shake
  updateScreenShake() {
    if (this.screenShake.intensity > 0.1) {
      const angle = Math.random() * Math.PI * 2;
      this.screenShake.offsetX = Math.cos(angle) * this.screenShake.intensity;
      this.screenShake.offsetY = Math.sin(angle) * this.screenShake.intensity;
      this.screenShake.intensity *= this.screenShake.decay;
    } else {
      this.screenShake.intensity = 0;
      this.screenShake.offsetX = 0;
      this.screenShake.offsetY = 0;
    }
  },

  // Get screen shake offset
  getScreenShakeOffset() {
    return {
      x: this.screenShake.offsetX,
      y: this.screenShake.offsetY
    };
  },

  // Add damage number
  addDamageNumber(x, y, damage, isCritical = false, hitSide = 'FRONT') {
    let color = '#ffffff';
    let size = 24;

    if (isCritical) {
      color = '#ff0000';
      size = 36;
    } else if (hitSide === 'REAR') {
      color = '#ff6600';
      size = 30;
    } else if (hitSide === 'SIDE') {
      color = '#ffaa00';
      size = 27;
    }

    this.damageNumbers.push({
      x, y,
      damage: Math.round(damage),
      color: color,
      size: size,
      life: 1,
      decay: 0.015,
      vy: -2,
      vx: (Math.random() - 0.5) * 2,
      isCritical: isCritical,
      hitSide: hitSide
    });
  },

  // Update damage numbers
  updateDamageNumbers() {
    this.damageNumbers = this.damageNumbers.filter((dn) => {
      dn.x += dn.vx;
      dn.y += dn.vy;
      dn.vy *= 0.95; // Slow down vertical movement
      dn.life -= dn.decay;
      return dn.life > 0;
    });
  },

  // Render damage numbers
  renderDamageNumbers(ctx) {
    ctx.save();

    this.damageNumbers.forEach((dn) => {
      ctx.globalAlpha = dn.life;
      ctx.font = `bold ${dn.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText(dn.damage.toString(), dn.x, dn.y);
      ctx.fillStyle = dn.color;
      ctx.fillText(dn.damage.toString(), dn.x, dn.y);

      // Add hit side indicator for non-front hits
      if (dn.hitSide !== 'FRONT' && dn.life > 0.7) {
        ctx.font = `bold ${dn.size * 0.6}px Arial`;
        ctx.strokeText(dn.hitSide, dn.x, dn.y - dn.size);
        ctx.fillText(dn.hitSide, dn.x, dn.y - dn.size);
      }
    });

    ctx.restore();
  },

  // Add hit marker
  addHitMarker(isCritical = false) {
    this.hitMarkers.push({
      startTime: Date.now(),
      duration: isCritical ? 500 : 300,
      isCritical: isCritical
    });
  },

  // Render hit markers (center screen)
  renderHitMarkers(ctx, canvas) {
    const now = Date.now();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Screen space

    this.hitMarkers = this.hitMarkers.filter((hm) => {
      const elapsed = now - hm.startTime;
      if (elapsed > hm.duration) return false;

      const progress = elapsed / hm.duration;
      const alpha = 1 - progress;

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = hm.isCritical ? '#ff0000' : '#ffffff';
      ctx.lineWidth = hm.isCritical ? 4 : 2;

      const size = 20 + progress * 15;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw X marker
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY - size);
      ctx.lineTo(centerX + size, centerY + size);
      ctx.moveTo(centerX + size, centerY - size);
      ctx.lineTo(centerX - size, centerY + size);
      ctx.stroke();

      // Draw circle for critical
      if (hm.isCritical) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      return true;
    });

    ctx.restore();
  },

  // Create enhanced explosion
  createEnhancedExplosion(x, y, size = 1, color = null) {
    const particleCount = Math.floor(40 * size);
    const colors = color ? [color] : ['#ff6600', '#ffaa00', '#ff0000', '#ffdd00'];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.PI * 2 * i / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = (3 + Math.random() * 5) * size;

      this.enhancedParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (2 + Math.random() * 4) * size,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'explosion',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    // Screen shake based on size
    this.applyScreenShake(size * 8);
  },

  // Create muzzle flash
  createMuzzleFlash(playerId, x, y, angle) {
    this.muzzleFlashes.set(playerId, {
      x, y, angle,
      intensity: 1,
      startTime: Date.now(),
      duration: 100
    });
  },

  // Create dust cloud (from tank movement)
  createDustCloud(x, y, angle, speed) {
    if (Math.random() > 0.3) return; // Don't create every frame

    const particleCount = Math.floor(speed / 2);

    for (let i = 0; i < particleCount; i++) {
      const spreadAngle = angle + Math.PI + (Math.random() - 0.5) * Math.PI / 2;
      const particleSpeed = Math.random() * 2;

      this.dustClouds.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(spreadAngle) * particleSpeed,
        vy: Math.sin(spreadAngle) * particleSpeed,
        size: 3 + Math.random() * 5,
        life: 1,
        decay: 0.02,
        color: `rgba(139, 90, 43, ${0.3 + Math.random() * 0.3})`
      });
    }
  },

  // Update all particles
  updateParticles() {
    // Update enhanced particles
    this.enhancedParticles = this.enhancedParticles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // Gravity
      p.vx *= 0.98; // Air resistance
      p.vy *= 0.98;
      p.life -= p.decay;
      p.rotation += p.rotationSpeed;
      return p.life > 0;
    });

    // Update dust clouds
    this.dustClouds = this.dustClouds.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= p.decay;
      return p.life > 0;
    });

    // Update muzzle flashes
    const now = Date.now();
    this.muzzleFlashes.forEach((flash, playerId) => {
      const elapsed = now - flash.startTime;
      if (elapsed > flash.duration) {
        this.muzzleFlashes.delete(playerId);
      } else {
        flash.intensity = 1 - elapsed / flash.duration;
      }
    });
  },

  // Render all particles
  renderParticles(ctx) {
    ctx.save();

    // Render dust clouds first (background)
    this.dustClouds.forEach((p) => {
      ctx.globalAlpha = p.life * 0.5;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render enhanced particles
    this.enhancedParticles.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // Render muzzle flashes
  renderMuzzleFlashes(ctx, players) {
    ctx.save();

    this.muzzleFlashes.forEach((flash, playerId) => {
      const player = players[playerId];
      if (!player) return;

      ctx.globalAlpha = flash.intensity;
      ctx.translate(player.x, player.y);
      ctx.rotate(flash.angle);

      // Create gradient flash
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
      gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
      gradient.addColorStop(0.6, 'rgba(255, 100, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(60, 0, 50 * flash.intensity, 0, Math.PI * 2);
      ctx.fill();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    });

    ctx.restore();
  },

  // Create damage vignette (low health warning)
  renderDamageVignette(ctx, canvas, healthPercent) {
    if (healthPercent > 0.3) return; // Only show when health is low

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Screen space

    const intensity = 1 - healthPercent / 0.3; // 0 to 1
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
      canvas.width / 2, canvas.height / 2, canvas.height * 0.7
    );

    gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(255, 0, 0, ${intensity * 0.4})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pulse effect
    const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
    ctx.globalAlpha = pulse * intensity * 0.3;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, canvas.width, 10); // Top
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10); // Bottom
    ctx.fillRect(0, 0, 10, canvas.height); // Left
    ctx.fillRect(canvas.width - 10, 0, 10, canvas.height); // Right

    ctx.restore();
  },

  // Update all visual effects
  update() {
    this.updateScreenShake();
    this.updateDamageNumbers();
    this.updateParticles();
  },

  // Render all visual effects
  render(ctx, canvas, gameState) {
    this.renderParticles(ctx);
    this.renderDamageNumbers(ctx);
    this.renderHitMarkers(ctx, canvas);

    // Render damage vignette if player exists
    if (gameState && gameState.playerId && gameState.players[gameState.playerId]) {
      const player = gameState.players[gameState.playerId];
      const healthPercent = player.health / player.maxHealth;
      this.renderDamageVignette(ctx, canvas, healthPercent);
    }
  }
};

// Export for use in game
window.VisualPolish = VisualPolish;