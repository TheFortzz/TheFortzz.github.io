// Game Integration Layer - Connects all enhancement systems
// This bridges new features with existing game.js

window.GameIntegration = window.GameIntegration || {
  // Initialization flag
  initialized: false,

  // System references
  systems: {
    combat: null,
    powerups: null,
    visual: null,
    sound: null,
    weather: null,
    terrain: null,
    challenges: null,
    mapRenderer: null
  },

  // Initialize all enhancement systems
  init(gameState) {
    if (this.initialized) return;

    console.log('🎮 Initializing Game Enhancement Systems...');

    // Reference all systems
    this.systems.combat = window.AdvancedCombat;
    this.systems.powerups = window.NewPowerUps;
    this.systems.visual = window.VisualPolish;
    this.systems.sound = window.EnhancedSoundSystem;
    this.systems.weather = window.EnhancedWeather;
    this.systems.terrain = window.DestructibleTerrain;
    this.systems.challenges = window.DailyChallenges;
    this.systems.mapRenderer = window.MapRenderer;

    // Initialize sound system
    if (this.systems.sound) {
      this.systems.sound.init();
    }

    // Initialize terrain
    if (this.systems.terrain && gameState) {
      this.systems.terrain.init(
        gameState.gameWidth || 7500,
        gameState.gameHeight || 7500,
        50 // number of objects
      );
    }

    // Initialize Map Renderer (loads last created map from localStorage)
    if (this.systems.mapRenderer) {
      this.systems.mapRenderer.init();
    }

    // Initialize challenges
    if (this.systems.challenges) {
      this.systems.challenges.initDailyChallenges();
    }

    // Initialize players in combat system
    if (this.systems.combat && gameState && gameState.players) {
      Object.keys(gameState.players).forEach((playerId) => {
        this.systems.combat.initializePlayer(playerId);
      });
    }

    // Initialize players in powerups system
    if (this.systems.powerups && gameState && gameState.players) {
      Object.keys(gameState.players).forEach((playerId) => {
        this.systems.powerups.initializePlayer(playerId);
      });
    }

    this.initialized = true;
    console.log('✅ All enhancement systems initialized!');
  },

  // Handle bullet hit with advanced combat
  handleBulletHit(bullet, target, gameState) {
    if (!this.systems.combat) return { damage: 10 };

    const player = gameState.players[bullet.playerId];
    if (!player) return { damage: 10 };

    // Calculate advanced damage
    const result = this.systems.combat.calculateDamage(
      10, // base damage
      bullet.angle || 0,
      target.angle || 0,
      bullet.x,
      bullet.y,
      target.x,
      target.y
    );

    // Apply component damage
    if (target.id) {
      const componentResult = this.systems.combat.applyComponentDamage(
        target.id,
        result.damage,
        result.hitSide
      );

      if (componentResult && componentResult.destroyed) {
        this.showNotification(`${componentResult.component.toUpperCase()} DESTROYED!`, '#ff0000');
      }
    }

    // Visual feedback
    if (this.systems.visual) {
      this.systems.visual.addDamageNumber(
        bullet.x,
        bullet.y,
        result.damage,
        result.isCritical,
        result.hitSide
      );

      this.systems.visual.addHitMarker(result.isCritical);

      this.systems.combat.createCriticalHitEffect(
        bullet.x,
        bullet.y,
        result.hitSide,
        result.isCritical
      );
    }

    // Sound feedback
    if (this.systems.sound) {
      this.systems.sound.playImpactSound('metal');
    }

    // Update challenges
    if (this.systems.challenges) {
      if (result.hitSide === 'REAR') {
        this.systems.challenges.updateProgress('headshots', 1);
      }
      this.systems.challenges.updateProgress('deal_damage', Math.round(result.damage));
    }

    return result;
  },

  // Handle tank destruction
  handleTankDestruction(tankId, killerId, gameState) {
    // Visual explosion
    if (this.systems.visual && gameState.players[tankId]) {
      const tank = gameState.players[tankId];
      this.systems.visual.createEnhancedExplosion(tank.x, tank.y, 2.0);
    }

    // Sound
    if (this.systems.sound) {
      this.systems.sound.playExplosion(2.0);
    }

    // Update challenges
    if (this.systems.challenges && killerId) {
      this.systems.challenges.updateProgress('destroy_tanks', 1);
    }

    // Reset component damage
    if (this.systems.combat) {
      this.systems.combat.resetPlayer(tankId);
    }
  },

  // Handle power-up collection
  handlePowerUpCollection(powerUp, playerId, gameState) {
    if (!this.systems.powerups) return;

    const player = gameState.players[playerId];
    if (!player) return;

    // Activate power-up
    const result = this.systems.powerups.activatePowerUp(
      playerId,
      powerUp.effect.toUpperCase(),
      player.x,
      player.y,
      gameState
    );

    if (result) {
      this.showNotification(result.message, '#FFD700');

      // Sound
      if (this.systems.sound) {
        this.systems.sound.play(this.systems.sound.effects.POWERUP_COLLECT, 0.8);
      }

      // Visual
      if (this.systems.visual) {
        this.systems.visual.applyScreenShake(3);
      }

      // Update challenges
      if (this.systems.challenges) {
        this.systems.challenges.updateProgress('collect_powerups', 1);
      }
    }
  },

  // Handle terrain destruction
  handleTerrainHit(bullet, gameState) {
    if (!this.systems.terrain) return;

    const obj = this.systems.terrain.checkCollision(bullet.x, bullet.y, 5);
    if (obj) {
      const result = this.systems.terrain.damageObject(obj.id, 10);

      if (result && result.destroyed) {
        // Update challenges
        if (this.systems.challenges) {
          this.systems.challenges.updateProgress('destroy_terrain', 1);
        }
      }
    }
  },

  // Update all systems
  update(deltaTime, gameState, canvas) {
    if (!this.initialized) return;

    // Update visual effects
    if (this.systems.visual) {
      this.systems.visual.update();
    }

    // Update weather
    if (this.systems.weather) {
      const camera = gameState.camera || { x: 0, y: 0 };
      this.systems.weather.update(deltaTime, camera, canvas);
    }

    // Update terrain
    if (this.systems.terrain) {
      this.systems.terrain.update();
    }

    // Update power-ups
    if (this.systems.powerups) {
      this.systems.powerups.update(gameState);
    }

    // Update combat effects
    if (this.systems.combat) {
      // Component effects are applied per-player
      Object.keys(gameState.players || {}).forEach((playerId) => {
        const effects = this.systems.combat.getComponentEffects(playerId);
        const player = gameState.players[playerId];

        if (player && effects) {
          // Apply effects to player (these would be used in movement/rotation code)
          player._componentEffects = effects;
        }
      });
    }
  },

  // Render all systems
  render(ctx, gameState, canvas) {
    if (!this.initialized) return;

    const camera = gameState.camera || { x: 0, y: 0 };

    // Render weather (background)
    if (this.systems.weather) {
      this.systems.weather.render(ctx, camera, canvas);
    }

    // Render terrain
    if (this.systems.terrain) {
      this.systems.terrain.render(ctx);
    }

    // Render created map (ground tiles and buildings) behind gameplay
    if (this.systems.mapRenderer) {
      this.systems.mapRenderer.render(ctx, gameState, canvas);
    }

    // Render power-up effects
    if (this.systems.powerups) {
      this.systems.powerups.render(ctx, gameState);
    }

    // Render combat effects
    if (this.systems.combat) {
      this.systems.combat.updateAndRenderCriticalHits(ctx);
    }

    // Render visual effects
    if (this.systems.visual) {
      this.systems.visual.render(ctx, canvas, gameState);
    }

    // Render challenges UI
    if (this.systems.challenges) {
      this.systems.challenges.renderChallengesUI(ctx, canvas);
    }
  },

  // Apply screen shake to camera
  applyCameraShake(camera) {
    if (!this.systems.visual) return camera;

    const shake = this.systems.visual.getScreenShakeOffset();
    return {
      x: camera.x + shake.x,
      y: camera.y + shake.y,
      zoom: camera.zoom
    };
  },

  // Get weather gameplay effects
  getWeatherEffects() {
    if (!this.systems.weather || !this.systems.weather.active) {
      return {
        visibilityReduction: 0,
        movementPenalty: 0,
        accuracyPenalty: 0
      };
    }

    return this.systems.weather.getGameplayEffects();
  },

  // Show notification helper
  showNotification(message, color) {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, color, 32);
    } else {
      console.log(`📢 ${message}`);
    }
  },

  // Handle player shooting
  handlePlayerShoot(playerId, gameState) {
    const player = gameState.players[playerId];
    if (!player) return;

    // Muzzle flash
    if (this.systems.visual) {
      this.systems.visual.createMuzzleFlash(
        playerId,
        player.x,
        player.y,
        player.angle || 0
      );
    }

    // Weapon sound
    if (this.systems.sound) {
      const weaponTier = this.getWeaponTier(player.selectedTank?.weapon);
      this.systems.sound.playWeaponSound(weaponTier);
    }

    // Screen shake
    if (this.systems.visual) {
      this.systems.visual.applyScreenShake(2);
    }
  },

  // Handle player movement
  handlePlayerMovement(playerId, speed, angle, gameState) {
    const player = gameState.players[playerId];
    if (!player) return;

    // Dust clouds
    if (this.systems.visual && speed > 2) {
      this.systems.visual.createDustCloud(
        player.x,
        player.y,
        angle,
        speed
      );
    }

    // Engine sound (simplified - would need proper management)
    // This would be better handled with continuous sound management
  },

  // Get weapon tier from weapon ID
  getWeaponTier(weaponId) {
    if (!weaponId) return 1;

    if (weaponId.includes('mk1')) return 1;
    if (weaponId.includes('mk2')) return 2;
    if (weaponId.includes('mk3')) return 3;
    if (weaponId.includes('mk4')) return 3;

    return 1;
  }
};

// Export for use in game
window.GameIntegration = GameIntegration;

// Auto-initialize when game state is available (disabled - not using GameIntegration.init)