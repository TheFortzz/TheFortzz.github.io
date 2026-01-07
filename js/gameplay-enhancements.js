// Gameplay Enhancements

const GameplayEnhancements = {
  // Hit feedback
  hitMarkers: [],

  // Damage numbers
  damageNumbers: [],

  // Kill feed
  killFeed: [],
  maxKillFeedItems: 5,

  // Combo system
  comboTimer: 0,
  comboCount: 0,
  comboTimeout: 3000,

  // Screen effects
  screenShake: { intensity: 0, duration: 0 },

  init() {
    console.log('✓ Gameplay enhancements initialized');
  },

  // Add hit marker
  addHitMarker(x, y, damage, isCritical = false) {
    this.hitMarkers.push({
      x, y,
      startTime: Date.now(),
      duration: 500,
      isCritical
    });

    // Add damage number
    this.addDamageNumber(x, y, damage, isCritical);
  },

  // Add damage number
  addDamageNumber(x, y, damage, isCritical = false) {
    this.damageNumbers.push({
      x, y,
      damage: Math.round(damage),
      life: 1,
      decay: 0.02,
      vy: -2,
      color: isCritical ? '#ff0000' : '#ffffff',
      size: isCritical ? 32 : 24
    });
  },

  // Update damage numbers
  updateDamageNumbers() {
    this.damageNumbers = this.damageNumbers.filter((dn) => {
      dn.y += dn.vy;
      dn.vy *= 0.95;
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
    });

    ctx.restore();
  },

  // Update hit markers
  updateHitMarkers() {
    const now = Date.now();
    this.hitMarkers = this.hitMarkers.filter((hm) =>
    now - hm.startTime < hm.duration
    );
  },

  // Render hit markers
  renderHitMarkers(ctx, canvas) {
    const now = Date.now();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Screen space

    this.hitMarkers.forEach((hm) => {
      const elapsed = now - hm.startTime;
      const progress = elapsed / hm.duration;
      const alpha = 1 - progress;

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = hm.isCritical ? '#ff0000' : '#ffffff';
      ctx.lineWidth = hm.isCritical ? 4 : 2;

      const size = 20 + progress * 10;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw X marker
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY - size);
      ctx.lineTo(centerX + size, centerY + size);
      ctx.moveTo(centerX + size, centerY - size);
      ctx.lineTo(centerX - size, centerY + size);
      ctx.stroke();
    });

    ctx.restore();
  },

  // Add to kill feed
  addKillFeed(killerName, victimName, weapon = 'tank') {
    this.killFeed.unshift({
      killer: killerName,
      victim: victimName,
      weapon: weapon,
      timestamp: Date.now()
    });

    // Keep only recent kills
    if (this.killFeed.length > this.maxKillFeedItems) {
      this.killFeed.pop();
    }
  },

  // Render kill feed
  renderKillFeed(ctx, canvas) {
    const now = Date.now();
    const fadeTime = 5000; // 5 seconds

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Screen space

    let y = 100;

    this.killFeed.forEach((kill, index) => {
      const age = now - kill.timestamp;
      if (age > fadeTime) return;

      const alpha = 1 - age / fadeTime;
      ctx.globalAlpha = alpha;

      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'right';

      const x = canvas.width - 20;

      // Killer name
      ctx.fillStyle = '#00ff00';
      ctx.fillText(kill.killer, x - 100, y);

      // Weapon icon
      ctx.fillStyle = '#ffffff';
      ctx.fillText('💥', x - 50, y);

      // Victim name
      ctx.fillStyle = '#ff0000';
      ctx.fillText(kill.victim, x, y);

      y += 25;
    });

    ctx.restore();
  },

  // Update combo system
  updateCombo() {
    if (this.comboTimer > 0) {
      this.comboTimer -= 16; // Assuming 60 FPS

      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }
  },

  // Add combo kill
  addComboKill() {
    this.comboCount++;
    this.comboTimer = this.comboTimeout;

    // Show combo notification
    if (this.comboCount >= 3) {
      this.showComboNotification();
    }
  },

  // Show combo notification
  showComboNotification() {
    const messages = {
      3: 'TRIPLE KILL!',
      5: 'KILLING SPREE!',
      7: 'RAMPAGE!',
      10: 'UNSTOPPABLE!',
      15: 'LEGENDARY!'
    };

    const message = messages[this.comboCount];
    if (message && window.showNotification) {
      window.showNotification(message, '#FFD700', 48);
    }
  },

  // Render combo counter
  renderCombo(ctx, canvas) {
    if (this.comboCount < 2) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const progress = this.comboTimer / this.comboTimeout;
    ctx.globalAlpha = progress;

    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText(`${this.comboCount}x COMBO`, canvas.width / 2, 150);
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`${this.comboCount}x COMBO`, canvas.width / 2, 150);

    ctx.restore();
  },

  // Screen shake
  applyScreenShake(intensity, duration) {
    this.screenShake.intensity = intensity;
    this.screenShake.duration = duration;
  },

  // Update screen shake
  updateScreenShake() {
    if (this.screenShake.duration > 0) {
      this.screenShake.duration -= 16;
      this.screenShake.intensity *= 0.9;
    } else {
      this.screenShake.intensity = 0;
    }
  },

  // Get screen shake offset
  getScreenShakeOffset() {
    if (this.screenShake.intensity <= 0) {
      return { x: 0, y: 0 };
    }

    return {
      x: (Math.random() - 0.5) * this.screenShake.intensity,
      y: (Math.random() - 0.5) * this.screenShake.intensity
    };
  },

  // Apply screen shake to context
  applyScreenShakeToContext(ctx) {
    const offset = this.getScreenShakeOffset();
    ctx.translate(offset.x, offset.y);
  },

  // Update all enhancements
  update() {
    this.updateDamageNumbers();
    this.updateHitMarkers();
    this.updateCombo();
    this.updateScreenShake();
  },

  // Render all enhancements
  render(ctx, canvas) {
    this.renderDamageNumbers(ctx);
    this.renderHitMarkers(ctx, canvas);
    this.renderKillFeed(ctx, canvas);
    this.renderCombo(ctx, canvas);
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GameplayEnhancements.init());
} else {
  GameplayEnhancements.init();
}

// Export
window.GameplayEnhancements = GameplayEnhancements;