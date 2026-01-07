// Advanced Power-Up System - Dynamic power-ups with visual effects and strategic gameplay
class PowerUpSystem {
  constructor() {
    this.powerUps = new Map();
    this.activePowerUps = new Map(); // Active power-ups on players
    this.spawnPoints = [];
    this.spawnTimer = 0;

    this.settings = {
      maxPowerUps: 15,
      spawnInterval: 8000, // 8 seconds
      powerUpDuration: 30000, // 30 seconds on ground
      enableRarePowerUps: true,
      spawnProbability: 0.7
    };

    this.powerUpTypes = {
      // Basic Power-ups
      health: {
        name: 'Health Pack',
        description: 'Restores 50 health',
        icon: '❤️',
        color: '#ff4444',
        rarity: 'common',
        spawnWeight: 25,
        effect: {
          type: 'instant',
          health: 50
        },
        sound: 'health_pickup'
      },

      shield: {
        name: 'Shield Boost',
        description: 'Restores 75 shield',
        icon: '🛡️',
        color: '#4444ff',
        rarity: 'common',
        spawnWeight: 20,
        effect: {
          type: 'instant',
          shield: 75
        },
        sound: 'shield_pickup'
      },

      ammo: {
        name: 'Ammo Crate',
        description: 'Refills ammunition',
        icon: '📦',
        color: '#ffaa44',
        rarity: 'common',
        spawnWeight: 20,
        effect: {
          type: 'instant',
          ammo: 'full'
        },
        sound: 'ammo_pickup'
      },

      // Temporary Boosts
      speed: {
        name: 'Speed Boost',
        description: 'Increases movement speed by 50%',
        icon: '💨',
        color: '#44ff44',
        rarity: 'uncommon',
        spawnWeight: 15,
        duration: 15000,
        effect: {
          type: 'temporary',
          speedMultiplier: 1.5,
          trailEffect: true
        },
        sound: 'powerup_activate'
      },

      damage: {
        name: 'Damage Boost',
        description: 'Increases weapon damage by 100%',
        icon: '💥',
        color: '#ff8844',
        rarity: 'uncommon',
        spawnWeight: 12,
        duration: 20000,
        effect: {
          type: 'temporary',
          damageMultiplier: 2.0,
          weaponGlow: true
        },
        sound: 'powerup_activate'
      },

      rapid_fire: {
        name: 'Rapid Fire',
        description: 'Increases fire rate by 200%',
        icon: '🔥',
        color: '#ff4444',
        rarity: 'uncommon',
        spawnWeight: 10,
        duration: 12000,
        effect: {
          type: 'temporary',
          fireRateMultiplier: 3.0,
          muzzleFlash: true
        },
        sound: 'powerup_activate'
      },

      invisibility: {
        name: 'Stealth Cloak',
        description: 'Become partially invisible',
        icon: '👻',
        color: '#8844ff',
        rarity: 'rare',
        spawnWeight: 8,
        duration: 10000,
        effect: {
          type: 'temporary',
          invisibility: 0.3,
          radarInvisible: true
        },
        sound: 'stealth_activate'
      },

      // Special Abilities
      teleport: {
        name: 'Teleporter',
        description: 'Instantly teleport to cursor location',
        icon: '⚡',
        color: '#44ffff',
        rarity: 'rare',
        spawnWeight: 6,
        effect: {
          type: 'ability',
          charges: 3,
          cooldown: 2000
        },
        sound: 'teleport'
      },

      shield_generator: {
        name: 'Shield Generator',
        description: 'Creates a protective energy shield',
        icon: '🔵',
        color: '#4488ff',
        rarity: 'rare',
        spawnWeight: 5,
        duration: 25000,
        effect: {
          type: 'temporary',
          energyShield: {
            health: 200,
            radius: 80,
            regeneration: 2
          }
        },
        sound: 'shield_activate'
      },

      time_slow: {
        name: 'Chronos Field',
        description: 'Slows down time around you',
        icon: '⏰',
        color: '#ffff44',
        rarity: 'epic',
        spawnWeight: 4,
        duration: 8000,
        effect: {
          type: 'temporary',
          timeSlowRadius: 300,
          timeSlowFactor: 0.5,
          chronoField: true
        },
        sound: 'time_slow'
      },

      // Legendary Power-ups
      berserker: {
        name: 'Berserker Mode',
        description: 'Massive damage and speed, but take more damage',
        icon: '😡',
        color: '#ff0000',
        rarity: 'legendary',
        spawnWeight: 2,
        duration: 15000,
        effect: {
          type: 'temporary',
          damageMultiplier: 3.0,
          speedMultiplier: 1.8,
          damageTakenMultiplier: 1.5,
          berserkerAura: true
        },
        sound: 'berserker_activate'
      },

      nuke: {
        name: 'Nuclear Strike',
        description: 'Call in a devastating nuclear strike',
        icon: '☢️',
        color: '#ffff00',
        rarity: 'legendary',
        spawnWeight: 1,
        effect: {
          type: 'ability',
          charges: 1,
          castTime: 3000,
          nukeRadius: 500,
          nukeDamage: 300
        },
        sound: 'nuke_activate'
      },

      phoenix: {
        name: 'Phoenix Rebirth',
        description: 'Revive with full health when killed',
        icon: '🔥',
        color: '#ff6600',
        rarity: 'legendary',
        spawnWeight: 1,
        effect: {
          type: 'passive',
          reviveOnDeath: true,
          reviveHealth: 100,
          reviveShield: 100,
          phoenixAura: true
        },
        sound: 'phoenix_activate'
      }
    };

    this.rarityColors = {
      common: '#ffffff',
      uncommon: '#44ff44',
      rare: '#4444ff',
      epic: '#ff44ff',
      legendary: '#ffaa00'
    };

    this.initialize();
  }

  initialize() {
    this.generateSpawnPoints();
    console.log('⚡ Advanced Power-Up System initialized');
  }

  generateSpawnPoints() {
    // Generate strategic spawn points across the map
    const mapSize = 7500; // Assuming map is 7500x7500
    const spawnCount = 25;

    for (let i = 0; i < spawnCount; i++) {
      // Avoid center and edges
      const angle = Math.PI * 2 * i / spawnCount;
      const distance = 1000 + Math.random() * 2000;

      this.spawnPoints.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        lastSpawn: 0,
        spawnCooldown: 10000 + Math.random() * 20000
      });
    }

    // Add some random points
    for (let i = 0; i < 15; i++) {
      this.spawnPoints.push({
        x: (Math.random() - 0.5) * mapSize * 0.8,
        y: (Math.random() - 0.5) * mapSize * 0.8,
        lastSpawn: 0,
        spawnCooldown: 15000 + Math.random() * 25000
      });
    }
  }

  update(deltaTime, gameState) {
    this.spawnTimer += deltaTime * 1000;

    // Spawn new power-ups
    if (this.spawnTimer >= this.settings.spawnInterval) {
      this.attemptSpawn(gameState);
      this.spawnTimer = 0;
    }

    // Update existing power-ups
    this.updatePowerUps(deltaTime, gameState);

    // Update active power-ups on players
    this.updateActivePowerUps(deltaTime, gameState);

    // Clean up expired power-ups
    this.cleanupExpiredPowerUps();
  }

  attemptSpawn(gameState) {
    if (this.powerUps.size >= this.settings.maxPowerUps) return;
    if (Math.random() > this.settings.spawnProbability) return;

    // Find available spawn points
    const now = Date.now();
    const availablePoints = this.spawnPoints.filter((point) =>
    now - point.lastSpawn > point.spawnCooldown &&
    !this.isSpawnPointOccupied(point)
    );

    if (availablePoints.length === 0) return;

    // Choose random spawn point
    const spawnPoint = availablePoints[Math.floor(Math.random() * availablePoints.length)];

    // Choose power-up type based on rarity weights
    const powerUpType = this.choosePowerUpType();

    // Create power-up
    this.createPowerUp(spawnPoint.x, spawnPoint.y, powerUpType);
    spawnPoint.lastSpawn = now;
  }

  choosePowerUpType() {
    const types = Object.keys(this.powerUpTypes);
    const weights = [];
    let totalWeight = 0;

    types.forEach((type) => {
      const powerUp = this.powerUpTypes[type];
      let weight = powerUp.spawnWeight;

      // Reduce rare power-up spawn rate if disabled
      if (!this.settings.enableRarePowerUps && (
      powerUp.rarity === 'epic' || powerUp.rarity === 'legendary')) {
        weight *= 0.1;
      }

      weights.push(weight);
      totalWeight += weight;
    });

    // Weighted random selection
    let random = Math.random() * totalWeight;
    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return types[i];
      }
    }

    return types[0]; // Fallback
  }

  createPowerUp(x, y, type) {
    const powerUpData = this.powerUpTypes[type];
    if (!powerUpData) return null;

    const powerUp = {
      id: `powerup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x, y,
      data: { ...powerUpData },
      spawnTime: Date.now(),
      bobOffset: Math.random() * Math.PI * 2,
      rotationSpeed: 0.02 + Math.random() * 0.03,
      rotation: 0,
      glowIntensity: 0,
      collected: false,

      // Visual effects
      particles: [],
      aura: {
        radius: 50,
        pulseSpeed: 0.05,
        pulseOffset: Math.random() * Math.PI * 2
      }
    };

    this.powerUps.set(powerUp.id, powerUp);

    // Create spawn effect
    this.createSpawnEffect(x, y, powerUpData.color);

    // Play spawn sound
    if (window.EnhancedAudio) {
      window.EnhancedAudio.playSound('powerup_spawn', {
        position: { x, y },
        volume: 0.5
      });
    }

    return powerUp;
  }

  createSpawnEffect(x, y, color) {
    if (!window.AdvancedGraphics) return;

    // Create spawn particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.PI * 2 * i / 20;
      const speed = 50 + Math.random() * 100;

      window.AdvancedGraphics.createParticle({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        size: 3 + Math.random() * 5,
        color: color,
        type: 'spark',
        gravity: -20,
        friction: 0.95
      });
    }

    // Create energy ring
    window.AdvancedGraphics.createParticle({
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      life: 2,
      maxLife: 2,
      size: 100,
      color: color,
      type: 'energy_ring'
    });
  }

  updatePowerUps(deltaTime, gameState) {
    this.powerUps.forEach((powerUp) => {
      // Update visual effects
      powerUp.rotation += powerUp.rotationSpeed * deltaTime * 60;
      powerUp.bobOffset += deltaTime * 2;
      powerUp.glowIntensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;

      // Update aura
      powerUp.aura.pulseOffset += powerUp.aura.pulseSpeed * deltaTime * 60;

      // Create ambient particles
      if (Math.random() < 0.1 * deltaTime * 60) {
        this.createAmbientParticle(powerUp);
      }

      // Check for collection
      this.checkCollection(powerUp, gameState);
    });
  }

  createAmbientParticle(powerUp) {
    if (!window.AdvancedGraphics) return;

    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30;

    window.AdvancedGraphics.createParticle({
      x: powerUp.x + Math.cos(angle) * distance,
      y: powerUp.y + Math.sin(angle) * distance,
      vx: (Math.random() - 0.5) * 20,
      vy: -10 - Math.random() * 20,
      life: 1 + Math.random(),
      maxLife: 1 + Math.random(),
      size: 2 + Math.random() * 3,
      color: powerUp.data.color,
      type: 'spark',
      gravity: -5,
      friction: 0.98
    });
  }

  checkCollection(powerUp, gameState) {
    const collectionRadius = 40;

    // Check players
    Object.values(gameState.players || {}).forEach((player) => {
      if (this.getDistance(powerUp, player) <= collectionRadius) {
        this.collectPowerUp(powerUp, player);
      }
    });

    // Check AI tanks
    if (window.AIOpponents) {
      window.AIOpponents.getAllAITanks().forEach((aiTank) => {
        if (this.getDistance(powerUp, aiTank) <= collectionRadius) {
          this.collectPowerUp(powerUp, aiTank);
        }
      });
    }
  }

  collectPowerUp(powerUp, collector) {
    if (powerUp.collected) return;

    powerUp.collected = true;

    // Apply power-up effect
    this.applyPowerUpEffect(powerUp, collector);

    // Create collection effect
    this.createCollectionEffect(powerUp, collector);

    // Play collection sound
    if (window.EnhancedAudio) {
      window.EnhancedAudio.playSound(powerUp.data.sound || 'powerup_collect', {
        position: { x: powerUp.x, y: powerUp.y },
        volume: 0.8
      });
    }

    // Remove power-up
    this.powerUps.delete(powerUp.id);

    // Show notification
    if (typeof showNotification === 'function' && collector.isPlayer) {
      showNotification(
        `Collected ${powerUp.data.name}!`,
        powerUp.data.color,
        2000
      );
    }

    console.log(`💊 ${collector.id || 'AI'} collected ${powerUp.data.name}`);
  }

  applyPowerUpEffect(powerUp, target) {
    const effect = powerUp.data.effect;

    switch (effect.type) {
      case 'instant':
        this.applyInstantEffect(effect, target);
        break;
      case 'temporary':
        this.applyTemporaryEffect(powerUp, effect, target);
        break;
      case 'ability':
        this.grantAbility(powerUp, effect, target);
        break;
      case 'passive':
        this.applyPassiveEffect(powerUp, effect, target);
        break;
    }
  }

  applyInstantEffect(effect, target) {
    if (effect.health) {
      target.health = Math.min(target.maxHealth || 100, target.health + effect.health);
    }

    if (effect.shield) {
      target.shield = Math.min(target.maxShield || 100, target.shield + effect.shield);
    }

    if (effect.ammo === 'full') {
      target.ammo = target.maxAmmo || 100;
    }
  }

  applyTemporaryEffect(powerUp, effect, target) {
    const activeId = `${target.id}_${powerUp.type}`;

    const activePowerUp = {
      id: activeId,
      type: powerUp.type,
      target: target,
      effect: effect,
      startTime: Date.now(),
      duration: powerUp.data.duration,
      data: powerUp.data
    };

    // Remove existing same type
    this.activePowerUps.delete(activeId);
    this.activePowerUps.set(activeId, activePowerUp);

    // Apply immediate effects
    this.applyEffectModifiers(target, effect, true);

    // Visual effects
    this.createPowerUpAura(target, powerUp.data);
  }

  grantAbility(powerUp, effect, target) {
    if (!target.abilities) target.abilities = new Map();

    target.abilities.set(powerUp.type, {
      type: powerUp.type,
      charges: effect.charges || 1,
      cooldown: effect.cooldown || 0,
      lastUsed: 0,
      data: effect
    });
  }

  applyPassiveEffect(powerUp, effect, target) {
    if (!target.passiveEffects) target.passiveEffects = new Map();

    target.passiveEffects.set(powerUp.type, {
      type: powerUp.type,
      effect: effect,
      data: powerUp.data
    });
  }

  applyEffectModifiers(target, effect, apply) {
    const multiplier = apply ? 1 : -1;

    if (effect.speedMultiplier) {
      target.speedModifier = (target.speedModifier || 1) * (
      apply ? effect.speedMultiplier : 1 / effect.speedMultiplier);
    }

    if (effect.damageMultiplier) {
      target.damageModifier = (target.damageModifier || 1) * (
      apply ? effect.damageMultiplier : 1 / effect.damageMultiplier);
    }

    if (effect.fireRateMultiplier) {
      target.fireRateModifier = (target.fireRateModifier || 1) * (
      apply ? effect.fireRateMultiplier : 1 / effect.fireRateMultiplier);
    }

    if (effect.invisibility) {
      target.invisibilityLevel = apply ? effect.invisibility : 0;
    }

    if (effect.damageTakenMultiplier) {
      target.damageTakenModifier = (target.damageTakenModifier || 1) * (
      apply ? effect.damageTakenMultiplier : 1 / effect.damageTakenMultiplier);
    }
  }

  updateActivePowerUps(deltaTime, gameState) {
    const now = Date.now();

    this.activePowerUps.forEach((activePowerUp, id) => {
      const elapsed = now - activePowerUp.startTime;

      // Check if expired
      if (elapsed >= activePowerUp.duration) {
        this.removePowerUpEffect(activePowerUp);
        this.activePowerUps.delete(id);
        return;
      }

      // Update special effects
      this.updateSpecialEffects(activePowerUp, deltaTime);
    });
  }

  updateSpecialEffects(activePowerUp, deltaTime) {
    const target = activePowerUp.target;
    const effect = activePowerUp.effect;

    // Time slow field
    if (effect.timeSlowRadius) {
      this.updateTimeSlowField(target, effect, deltaTime);
    }

    // Energy shield
    if (effect.energyShield) {
      this.updateEnergyShield(target, effect, deltaTime);
    }

    // Berserker aura
    if (effect.berserkerAura) {
      this.updateBerserkerAura(target, deltaTime);
    }

    // Phoenix aura
    if (effect.phoenixAura) {
      this.updatePhoenixAura(target, deltaTime);
    }
  }

  updateTimeSlowField(target, effect, deltaTime) {
    // Create time distortion particles
    if (Math.random() < 0.3 * deltaTime * 60 && window.AdvancedGraphics) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * effect.timeSlowRadius;

      window.AdvancedGraphics.createParticle({
        x: target.x + Math.cos(angle) * distance,
        y: target.y + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        life: 2,
        maxLife: 2,
        size: 5 + Math.random() * 10,
        color: '#ffff44',
        type: 'time_distortion'
      });
    }
  }

  updateEnergyShield(target, effect, deltaTime) {
    const shield = effect.energyShield;

    // Regenerate shield
    if (shield.health < 200) {
      shield.health = Math.min(200, shield.health + shield.regeneration * deltaTime * 60);
    }

    // Create shield particles
    if (Math.random() < 0.2 * deltaTime * 60 && window.AdvancedGraphics) {
      const angle = Math.random() * Math.PI * 2;

      window.AdvancedGraphics.createParticle({
        x: target.x + Math.cos(angle) * shield.radius,
        y: target.y + Math.sin(angle) * shield.radius,
        vx: Math.cos(angle) * 20,
        vy: Math.sin(angle) * 20,
        life: 1,
        maxLife: 1,
        size: 3,
        color: '#4488ff',
        type: 'energy'
      });
    }
  }

  updateBerserkerAura(target, deltaTime) {
    // Create rage particles
    if (Math.random() < 0.5 * deltaTime * 60 && window.AdvancedGraphics) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 40;

      window.AdvancedGraphics.createParticle({
        x: target.x + Math.cos(angle) * distance,
        y: target.y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 50,
        vy: -20 - Math.random() * 30,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        size: 4 + Math.random() * 6,
        color: '#ff0000',
        type: 'fire'
      });
    }
  }

  updatePhoenixAura(target, deltaTime) {
    // Create phoenix fire particles
    if (Math.random() < 0.4 * deltaTime * 60 && window.AdvancedGraphics) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;

      window.AdvancedGraphics.createParticle({
        x: target.x + Math.cos(angle) * distance,
        y: target.y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 30,
        vy: -10 - Math.random() * 20,
        life: 1 + Math.random(),
        maxLife: 1 + Math.random(),
        size: 3 + Math.random() * 5,
        color: '#ff6600',
        type: 'fire'
      });
    }
  }

  removePowerUpEffect(activePowerUp) {
    const target = activePowerUp.target;
    const effect = activePowerUp.effect;

    // Remove modifiers
    this.applyEffectModifiers(target, effect, false);

    // Show expiration notification
    if (typeof showNotification === 'function' && target.isPlayer) {
      showNotification(
        `${activePowerUp.data.name} expired`,
        '#888888',
        1500
      );
    }

    console.log(`⏰ ${activePowerUp.data.name} expired for ${target.id || 'AI'}`);
  }

  createCollectionEffect(powerUp, collector) {
    if (!window.AdvancedGraphics) return;

    // Create collection burst
    for (let i = 0; i < 15; i++) {
      const angle = Math.PI * 2 * i / 15;
      const speed = 100 + Math.random() * 100;

      window.AdvancedGraphics.createParticle({
        x: powerUp.x,
        y: powerUp.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8,
        maxLife: 0.8,
        size: 4 + Math.random() * 6,
        color: powerUp.data.color,
        type: 'spark',
        gravity: 0,
        friction: 0.9
      });
    }

    // Create text effect
    this.createFloatingText(powerUp.x, powerUp.y, powerUp.data.name, powerUp.data.color);
  }

  createFloatingText(x, y, text, color) {
    if (!window.AdvancedGraphics) return;

    window.AdvancedGraphics.createParticle({
      x: x,
      y: y - 20,
      vx: 0,
      vy: -50,
      life: 2,
      maxLife: 2,
      size: 16,
      color: color,
      text: text,
      type: 'floating_text'
    });
  }

  createPowerUpAura(target, powerUpData) {
    if (!window.AdvancedGraphics) return;

    // Create aura effect around player
    const auraRadius = 60;
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.PI * 2 * i / particleCount;

      window.AdvancedGraphics.createParticle({
        x: target.x + Math.cos(angle) * auraRadius,
        y: target.y + Math.sin(angle) * auraRadius,
        vx: Math.cos(angle) * 30,
        vy: Math.sin(angle) * 30,
        life: 1,
        maxLife: 1,
        size: 3 + Math.random() * 4,
        color: powerUpData.color,
        type: 'aura'
      });
    }
  }

  cleanupExpiredPowerUps() {
    const now = Date.now();
    const expireTime = this.settings.powerUpDuration;

    this.powerUps.forEach((powerUp, id) => {
      if (now - powerUp.spawnTime > expireTime) {
        this.powerUps.delete(id);

        // Create despawn effect
        if (window.AdvancedGraphics) {
          window.AdvancedGraphics.createParticle({
            x: powerUp.x,
            y: powerUp.y,
            vx: 0,
            vy: 0,
            life: 1,
            maxLife: 1,
            size: 50,
            color: powerUp.data.color,
            type: 'despawn_ring'
          });
        }
      }
    });
  }

  isSpawnPointOccupied(point) {
    const checkRadius = 100;

    // Check existing power-ups
    for (const powerUp of this.powerUps.values()) {
      if (this.getDistance(point, powerUp) < checkRadius) {
        return true;
      }
    }

    return false;
  }

  render(ctx, canvas, camera) {
    this.powerUps.forEach((powerUp) => {
      if (this.isVisible(powerUp, camera)) {
        this.renderPowerUp(ctx, powerUp, camera);
      }
    });

    // Render active power-up UI
    this.renderActivePowerUpsUI(ctx, canvas);
  }

  renderPowerUp(ctx, powerUp, camera) {
    const screenX = powerUp.x - camera.x;
    const screenY = powerUp.y - camera.y + Math.sin(powerUp.bobOffset) * 10;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(powerUp.rotation);

    // Render aura
    this.renderPowerUpAura(ctx, powerUp);

    // Render main icon
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow effect
    ctx.shadowBlur = 20 * powerUp.glowIntensity;
    ctx.shadowColor = powerUp.data.color;
    ctx.fillStyle = powerUp.data.color;
    ctx.fillText(powerUp.data.icon, 0, 0);

    // Rarity border
    const rarityColor = this.rarityColors[powerUp.data.rarity];
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // Render name and description (when close)
    const distance = this.getDistance(powerUp, { x: camera.x + canvas.width / 2, y: camera.y + canvas.height / 2 });
    if (distance < 200) {
      this.renderPowerUpInfo(ctx, powerUp, screenX, screenY);
    }
  }

  renderPowerUpAura(ctx, powerUp) {
    const aura = powerUp.aura;
    const pulseRadius = aura.radius + Math.sin(aura.pulseOffset) * 10;

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseRadius);
    gradient.addColorStop(0, `${powerUp.data.color}00`);
    gradient.addColorStop(0.7, `${powerUp.data.color}20`);
    gradient.addColorStop(1, `${powerUp.data.color}00`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  renderPowerUpInfo(ctx, powerUp, x, y) {
    ctx.save();

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x - 100, y - 60, 200, 40);

    // Name
    ctx.font = '14px Arial';
    ctx.fillStyle = powerUp.data.color;
    ctx.textAlign = 'center';
    ctx.fillText(powerUp.data.name, x, y - 45);

    // Description
    ctx.font = '10px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(powerUp.data.description, x, y - 30);

    ctx.restore();
  }

  renderActivePowerUpsUI(ctx, canvas) {
    const activePowerUps = Array.from(this.activePowerUps.values()).
    filter((ap) => ap.target.isPlayer); // Only show player power-ups

    if (activePowerUps.length === 0) return;

    const startX = canvas.width - 220;
    const startY = 100;
    const itemHeight = 50;

    activePowerUps.forEach((activePowerUp, index) => {
      const y = startY + index * itemHeight;
      this.renderActivePowerUpItem(ctx, activePowerUp, startX, y);
    });
  }

  renderActivePowerUpItem(ctx, activePowerUp, x, y) {
    const now = Date.now();
    const elapsed = now - activePowerUp.startTime;
    const remaining = activePowerUp.duration - elapsed;
    const progress = remaining / activePowerUp.duration;

    ctx.save();

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 200, 40);

    // Progress bar
    ctx.fillStyle = activePowerUp.data.color;
    ctx.fillRect(x + 2, y + 2, (200 - 4) * progress, 4);

    // Icon
    ctx.font = '24px Arial';
    ctx.fillStyle = activePowerUp.data.color;
    ctx.textAlign = 'left';
    ctx.fillText(activePowerUp.data.icon, x + 10, y + 25);

    // Name
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(activePowerUp.data.name, x + 45, y + 18);

    // Time remaining
    ctx.font = '10px Arial';
    ctx.fillStyle = '#aaaaaa';
    const timeText = `${Math.ceil(remaining / 1000)}s`;
    ctx.fillText(timeText, x + 45, y + 32);

    ctx.restore();
  }

  // Utility functions
  getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isVisible(obj, camera) {
    const margin = 100;
    return obj.x > camera.x - margin &&
    obj.x < camera.x + window.innerWidth + margin &&
    obj.y > camera.y - margin &&
    obj.y < camera.y + window.innerHeight + margin;
  }

  // Public API
  getAllPowerUps() {
    return Array.from(this.powerUps.values());
  }

  getActivePowerUps(targetId) {
    return Array.from(this.activePowerUps.values()).
    filter((ap) => ap.target.id === targetId);
  }

  forcePowerUpSpawn(x, y, type) {
    return this.createPowerUp(x, y, type);
  }

  removePowerUp(id) {
    return this.powerUps.delete(id);
  }

  clearAllPowerUps() {
    this.powerUps.clear();
    this.activePowerUps.clear();
  }

  // Settings
  setMaxPowerUps(max) {
    this.settings.maxPowerUps = max;
  }

  setSpawnInterval(interval) {
    this.settings.spawnInterval = interval;
  }

  setRarePowerUpsEnabled(enabled) {
    this.settings.enableRarePowerUps = enabled;
  }

  // Cleanup
  cleanup() {
    this.powerUps.clear();
    this.activePowerUps.clear();
  }
}

// Global instance
window.PowerUpSystem = new PowerUpSystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PowerUpSystem;
}