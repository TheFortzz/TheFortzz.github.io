/**
 * Advanced Power-Up System for TheFortz
 * Diverse power-ups with unique effects and visual feedback
 */

const AdvancedPowerUps = {
  powerUpTypes: {
    // Health & Defense
    HEALTH_SMALL: {
      id: 'health_small',
      name: 'Health Pack',
      icon: '❤️',
      color: '#FF0000',
      rarity: 'common',
      duration: 0,
      effect: (player) => {
        player.health = Math.min(100, player.health + 25);
        return { message: '+25 Health', color: '#00FF00' };
      }
    },

    HEALTH_LARGE: {
      id: 'health_large',
      name: 'Large Health Pack',
      icon: '💊',
      color: '#FF69B4',
      rarity: 'uncommon',
      duration: 0,
      effect: (player) => {
        player.health = Math.min(100, player.health + 50);
        return { message: '+50 Health', color: '#00FF00' };
      }
    },

    SHIELD: {
      id: 'shield',
      name: 'Shield Boost',
      icon: '🛡️',
      color: '#00D4FF',
      rarity: 'common',
      duration: 0,
      effect: (player) => {
        player.shield = Math.min(100, player.shield + 50);
        return { message: '+50 Shield', color: '#00D4FF' };
      }
    },

    INVINCIBILITY: {
      id: 'invincibility',
      name: 'Invincibility',
      icon: '⭐',
      color: '#FFD700',
      rarity: 'legendary',
      duration: 10000,
      effect: (player) => {
        player.invincible = true;
        return { message: 'INVINCIBLE!', color: '#FFD700' };
      },
      onExpire: (player) => {
        player.invincible = false;
      }
    },

    // Speed & Movement
    SPEED_BOOST: {
      id: 'speed_boost',
      name: 'Speed Boost',
      icon: '⚡',
      color: '#FFFF00',
      rarity: 'common',
      duration: 15000,
      effect: (player) => {
        player.speedMultiplier = 2.0;
        return { message: 'SPEED x2!', color: '#FFFF00' };
      },
      onExpire: (player) => {
        player.speedMultiplier = 1.0;
      }
    },

    DASH: {
      id: 'dash',
      name: 'Dash Ability',
      icon: '💨',
      color: '#FFFFFF',
      rarity: 'uncommon',
      duration: 30000,
      charges: 3,
      effect: (player) => {
        player.dashCharges = 3;
        player.canDash = true;
        return { message: 'Dash x3!', color: '#FFFFFF' };
      },
      onExpire: (player) => {
        player.canDash = false;
        player.dashCharges = 0;
      }
    },

    TELEPORT: {
      id: 'teleport',
      name: 'Teleport',
      icon: '🌀',
      color: '#9370DB',
      rarity: 'rare',
      duration: 0,
      effect: (player, gameState) => {
        // Teleport to random safe location
        player.x = 100 + Math.random() * (gameState.gameWidth - 200);
        player.y = 100 + Math.random() * (gameState.gameHeight - 200);
        return { message: 'TELEPORTED!', color: '#9370DB' };
      }
    },

    // Weapon Enhancements
    DOUBLE_DAMAGE: {
      id: 'double_damage',
      name: 'Double Damage',
      icon: '💥',
      color: '#FF0000',
      rarity: 'rare',
      duration: 20000,
      effect: (player) => {
        player.damageMultiplier = 2.0;
        return { message: 'DAMAGE x2!', color: '#FF0000' };
      },
      onExpire: (player) => {
        player.damageMultiplier = 1.0;
      }
    },

    RAPID_FIRE: {
      id: 'rapid_fire',
      name: 'Rapid Fire',
      icon: '🔫',
      color: '#FFA500',
      rarity: 'uncommon',
      duration: 15000,
      effect: (player) => {
        player.fireRateMultiplier = 0.5; // Shoot twice as fast
        return { message: 'RAPID FIRE!', color: '#FFA500' };
      },
      onExpire: (player) => {
        player.fireRateMultiplier = 1.0;
      }
    },

    MULTI_SHOT: {
      id: 'multi_shot',
      name: 'Multi-Shot',
      icon: '🎯',
      color: '#00FF00',
      rarity: 'rare',
      duration: 20000,
      effect: (player) => {
        player.multiShot = 3; // Shoot 3 bullets
        return { message: 'MULTI-SHOT x3!', color: '#00FF00' };
      },
      onExpire: (player) => {
        player.multiShot = 1;
      }
    },

    PIERCING_SHOTS: {
      id: 'piercing_shots',
      name: 'Piercing Shots',
      icon: '🎪',
      color: '#00FFFF',
      rarity: 'uncommon',
      duration: 25000,
      effect: (player) => {
        player.piercingShots = true;
        return { message: 'PIERCING SHOTS!', color: '#00FFFF' };
      },
      onExpire: (player) => {
        player.piercingShots = false;
      }
    },

    // Special Abilities
    GHOST_MODE: {
      id: 'ghost_mode',
      name: 'Ghost Mode',
      icon: '👻',
      color: '#E0E0E0',
      rarity: 'legendary',
      duration: 8000,
      effect: (player) => {
        player.ghostMode = true;
        player.alpha = 0.3;
        return { message: 'GHOST MODE!', color: '#E0E0E0' };
      },
      onExpire: (player) => {
        player.ghostMode = false;
        player.alpha = 1.0;
      }
    },

    MAGNET: {
      id: 'magnet',
      name: 'Magnet',
      icon: '🧲',
      color: '#C0C0C0',
      rarity: 'uncommon',
      duration: 30000,
      effect: (player) => {
        player.magnetRange = 200;
        return { message: 'MAGNET ACTIVE!', color: '#C0C0C0' };
      },
      onExpire: (player) => {
        player.magnetRange = 0;
      }
    },

    REGENERATION: {
      id: 'regeneration',
      name: 'Regeneration',
      icon: '💚',
      color: '#32CD32',
      rarity: 'rare',
      duration: 20000,
      effect: (player) => {
        player.regeneration = 2; // 2 HP per second
        return { message: 'REGENERATING!', color: '#32CD32' };
      },
      onExpire: (player) => {
        player.regeneration = 0;
      }
    },

    FREEZE_TIME: {
      id: 'freeze_time',
      name: 'Freeze Time',
      icon: '❄️',
      color: '#87CEEB',
      rarity: 'legendary',
      duration: 5000,
      effect: (player, gameState) => {
        gameState.timeFrozen = true;
        return { message: 'TIME FROZEN!', color: '#87CEEB' };
      },
      onExpire: (player, gameState) => {
        gameState.timeFrozen = false;
      }
    },

    // Score & Currency
    SCORE_MULTIPLIER: {
      id: 'score_multiplier',
      name: 'Score Multiplier',
      icon: '🌟',
      color: '#FFD700',
      rarity: 'rare',
      duration: 30000,
      effect: (player) => {
        player.scoreMultiplier = 2.0;
        return { message: 'SCORE x2!', color: '#FFD700' };
      },
      onExpire: (player) => {
        player.scoreMultiplier = 1.0;
      }
    },

    COIN_MAGNET: {
      id: 'coin_magnet',
      name: 'Coin Magnet',
      icon: '💰',
      color: '#FFD700',
      rarity: 'common',
      duration: 25000,
      effect: (player) => {
        player.coinMagnet = true;
        return { message: 'COIN MAGNET!', color: '#FFD700' };
      },
      onExpire: (player) => {
        player.coinMagnet = false;
      }
    },

    // Utility
    RADAR: {
      id: 'radar',
      name: 'Radar',
      icon: '📡',
      color: '#00FF00',
      rarity: 'uncommon',
      duration: 40000,
      effect: (player) => {
        player.radar = true;
        return { message: 'RADAR ACTIVE!', color: '#00FF00' };
      },
      onExpire: (player) => {
        player.radar = false;
      }
    },

    LUCKY_CLOVER: {
      id: 'lucky_clover',
      name: 'Lucky Clover',
      icon: '🍀',
      color: '#00FF00',
      rarity: 'rare',
      duration: 60000,
      effect: (player) => {
        player.luckMultiplier = 2.0; // Better drops
        return { message: 'LUCKY!', color: '#00FF00' };
      },
      onExpire: (player) => {
        player.luckMultiplier = 1.0;
      }
    }
  },

  // Active power-ups per player
  activePowerUps: {},

  // Spawn power-up in world
  spawnPowerUp(x, y, type = null) {
    if (!type) {
      type = this.getRandomPowerUpType();
    }

    const powerUpData = this.powerUpTypes[type.toUpperCase()];
    if (!powerUpData) return null;

    return {
      id: `powerup_${Date.now()}_${Math.random()}`,
      type: type,
      x: x,
      y: y,
      icon: powerUpData.icon,
      color: powerUpData.color,
      rarity: powerUpData.rarity,
      pulse: 0,
      rotation: 0,
      createdAt: Date.now()
    };
  },

  // Get random power-up type based on rarity
  getRandomPowerUpType() {
    const rarityWeights = {
      common: 50,
      uncommon: 30,
      rare: 15,
      legendary: 5
    };

    const rand = Math.random() * 100;
    let threshold = 0;
    let selectedRarity = 'common';

    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      threshold += weight;
      if (rand < threshold) {
        selectedRarity = rarity;
        break;
      }
    }

    const powerUpsOfRarity = Object.entries(this.powerUpTypes).
    filter(([_, data]) => data.rarity === selectedRarity).
    map(([id, _]) => id);

    return powerUpsOfRarity[Math.floor(Math.random() * powerUpsOfRarity.length)];
  },

  // Apply power-up to player
  applyPowerUp(playerId, powerUpType, gameState) {
    const powerUpData = this.powerUpTypes[powerUpType.toUpperCase()];
    if (!powerUpData) return null;

    // Initialize player power-ups if needed
    if (!this.activePowerUps[playerId]) {
      this.activePowerUps[playerId] = [];
    }

    // Apply effect
    const result = powerUpData.effect(gameState.players[playerId], gameState);

    // Add to active power-ups if it has duration
    if (powerUpData.duration > 0) {
      this.activePowerUps[playerId].push({
        type: powerUpType,
        startTime: Date.now(),
        duration: powerUpData.duration,
        onExpire: powerUpData.onExpire
      });
    }

    return result;
  },

  // Update active power-ups
  update(gameState) {
    const now = Date.now();

    Object.keys(this.activePowerUps).forEach((playerId) => {
      this.activePowerUps[playerId] = this.activePowerUps[playerId].filter((powerUp) => {
        const elapsed = now - powerUp.startTime;

        if (elapsed >= powerUp.duration) {
          // Power-up expired
          if (powerUp.onExpire && gameState.players[playerId]) {
            powerUp.onExpire(gameState.players[playerId], gameState);
          }
          return false;
        }

        return true;
      });
    });
  },

  // Get active power-ups for player
  getActivePowerUps(playerId) {
    return this.activePowerUps[playerId] || [];
  },

  // Clear player power-ups
  clearPlayerPowerUps(playerId) {
    delete this.activePowerUps[playerId];
  },

  // Get power-up data
  getPowerUpData(type) {
    return this.powerUpTypes[type.toUpperCase()];
  }
};

// Export for use in game
if (typeof window !== 'undefined') {
  window.AdvancedPowerUps = AdvancedPowerUps;
}