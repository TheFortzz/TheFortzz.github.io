// Advanced Combat System - Weak Spots, Critical Hits, Component Damage
// Inspired by World of Tanks and War Thunder

const AdvancedCombat = {
  // Component damage states
  componentDamage: new Map(), // playerId -> { turret, tracks, engine }

  // Critical hit effects
  criticalHits: [],

  // Damage multipliers
  DAMAGE_MULTIPLIERS: {
    REAR: 2.0, // Rear hits deal 2x damage
    SIDE: 1.5, // Side hits deal 1.5x damage
    FRONT: 1.0, // Front hits deal normal damage
    CRITICAL: 2.5 // Critical component hits
  },

  // Component damage thresholds
  COMPONENT_HEALTH: {
    TURRET: 100,
    TRACKS: 80,
    ENGINE: 120
  },

  // Initialize component damage for a player
  initializePlayer(playerId) {
    this.componentDamage.set(playerId, {
      turret: this.COMPONENT_HEALTH.TURRET,
      tracks: this.COMPONENT_HEALTH.TRACKS,
      engine: this.COMPONENT_HEALTH.ENGINE
    });
  },

  // Calculate damage based on hit angle
  calculateDamage(baseDamage, bulletAngle, tankAngle, hitX, hitY, tankX, tankY) {
    // Calculate which side was hit
    const hitSide = this.getHitSide(bulletAngle, tankAngle, hitX, hitY, tankX, tankY);

    // Apply multiplier
    let multiplier = this.DAMAGE_MULTIPLIERS[hitSide];

    // Random critical hit chance (10%)
    const isCritical = Math.random() < 0.1;
    if (isCritical) {
      multiplier *= 1.5;
    }

    const finalDamage = baseDamage * multiplier;

    return {
      damage: finalDamage,
      hitSide: hitSide,
      isCritical: isCritical,
      multiplier: multiplier
    };
  },

  // Determine which side of the tank was hit
  getHitSide(bulletAngle, tankAngle, hitX, hitY, tankX, tankY) {
    // Calculate angle from tank to hit point
    const dx = hitX - tankX;
    const dy = hitY - tankY;
    const hitAngle = Math.atan2(dy, dx);

    // Normalize angles
    const normalizedTankAngle = this.normalizeAngle(tankAngle);
    const normalizedHitAngle = this.normalizeAngle(hitAngle);

    // Calculate relative angle
    let relativeAngle = normalizedHitAngle - normalizedTankAngle;
    relativeAngle = this.normalizeAngle(relativeAngle);

    // Convert to degrees for easier comparison
    const degrees = relativeAngle * (180 / Math.PI);

    // Determine hit side based on angle
    // Front: -45 to 45 degrees
    // Right: 45 to 135 degrees
    // Rear: 135 to 225 degrees (or -135 to -225)
    // Left: -45 to -135 degrees

    if (degrees >= -45 && degrees <= 45) {
      return 'FRONT';
    } else if (degrees > 135 && degrees <= 180 || degrees >= -180 && degrees < -135) {
      return 'REAR';
    } else {
      return 'SIDE';
    }
  },

  // Normalize angle to -PI to PI range
  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  },

  // Apply component damage
  applyComponentDamage(playerId, damage, hitSide) {
    if (!this.componentDamage.has(playerId)) {
      this.initializePlayer(playerId);
    }

    const components = this.componentDamage.get(playerId);
    let componentHit = null;

    // Random chance to hit specific component based on hit side
    const rand = Math.random();

    if (hitSide === 'REAR') {
      // Rear hits more likely to damage engine
      if (rand < 0.6) {
        componentHit = 'engine';
      } else if (rand < 0.9) {
        componentHit = 'tracks';
      }
    } else if (hitSide === 'SIDE') {
      // Side hits more likely to damage tracks
      if (rand < 0.7) {
        componentHit = 'tracks';
      } else if (rand < 0.9) {
        componentHit = 'turret';
      }
    } else {
      // Front hits can damage turret
      if (rand < 0.5) {
        componentHit = 'turret';
      }
    }

    // Apply component damage
    if (componentHit && components[componentHit] > 0) {
      const componentDamage = damage * 0.3; // 30% of damage goes to component
      components[componentHit] = Math.max(0, components[componentHit] - componentDamage);

      // Check if component is destroyed
      if (components[componentHit] === 0) {
        return {
          component: componentHit,
          destroyed: true
        };
      }

      return {
        component: componentHit,
        destroyed: false,
        health: components[componentHit]
      };
    }

    return null;
  },

  // Get component effects for a player
  getComponentEffects(playerId) {
    if (!this.componentDamage.has(playerId)) {
      return {
        turretRotationSpeed: 1.0,
        movementSpeed: 1.0,
        acceleration: 1.0
      };
    }

    const components = this.componentDamage.get(playerId);
    const effects = {
      turretRotationSpeed: 1.0,
      movementSpeed: 1.0,
      acceleration: 1.0
    };

    // Turret damage reduces rotation speed
    const turretHealth = components.turret / this.COMPONENT_HEALTH.TURRET;
    effects.turretRotationSpeed = 0.3 + turretHealth * 0.7; // 30% to 100%

    // Track damage reduces movement speed
    const trackHealth = components.tracks / this.COMPONENT_HEALTH.TRACKS;
    effects.movementSpeed = 0.4 + trackHealth * 0.6; // 40% to 100%

    // Engine damage reduces acceleration
    const engineHealth = components.engine / this.COMPONENT_HEALTH.ENGINE;
    effects.acceleration = 0.3 + engineHealth * 0.7; // 30% to 100%

    return effects;
  },

  // Repair component over time
  repairComponent(playerId, component, amount) {
    if (!this.componentDamage.has(playerId)) return;

    const components = this.componentDamage.get(playerId);
    const maxHealth = this.COMPONENT_HEALTH[component.toUpperCase()];

    if (components[component] !== undefined) {
      components[component] = Math.min(maxHealth, components[component] + amount);
    }
  },

  // Create visual feedback for critical hit
  createCriticalHitEffect(x, y, hitSide, isCritical) {
    this.criticalHits.push({
      x, y,
      hitSide,
      isCritical,
      startTime: Date.now(),
      duration: 1000,
      particles: []
    });

    // Create particles for visual effect
    const particleCount = isCritical ? 20 : 10;
    const effect = this.criticalHits[this.criticalHits.length - 1];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.PI * 2 * i / particleCount;
      const speed = isCritical ? 5 + Math.random() * 3 : 3 + Math.random() * 2;

      effect.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isCritical ? 4 : 2,
        life: 1,
        decay: 0.02
      });
    }
  },

  // Update and render critical hit effects
  updateAndRenderCriticalHits(ctx) {
    const now = Date.now();

    this.criticalHits = this.criticalHits.filter((effect) => {
      const elapsed = now - effect.startTime;
      if (elapsed > effect.duration) return false;

      const alpha = 1 - elapsed / effect.duration;

      // Update and draw particles
      ctx.save();
      effect.particles = effect.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) return false;

        ctx.globalAlpha = p.life * alpha;
        ctx.fillStyle = effect.isCritical ? '#ff0000' : '#ffaa00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = effect.isCritical ? '#ff0000' : '#ffaa00';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });
      ctx.restore();

      // Draw hit side indicator
      if (effect.isCritical) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ff0000';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.strokeText('CRITICAL!', effect.x, effect.y - 30);
        ctx.fillText('CRITICAL!', effect.x, effect.y - 30);
        ctx.restore();
      }

      return true;
    });
  },

  // Reset component damage for a player
  resetPlayer(playerId) {
    this.initializePlayer(playerId);
  }
};

// Export for use in game
window.AdvancedCombat = AdvancedCombat;