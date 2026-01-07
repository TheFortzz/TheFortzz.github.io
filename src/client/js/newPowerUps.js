// New Power-Ups System - Tactical and Strategic
// Expanding beyond basic health/speed boosts

const NewPowerUps = {
  // Power-up definitions
  TYPES: {
    // Existing (enhanced)
    BLUEHEALTH: {
      id: 'bluehealth',
      name: 'Health Boost',
      image: '/assets/images/powerups/bluehealth100+.png',
      color: '#4169E1',
      icon: '💙',
      duration: 0,
      effect: 'bluehealth',
      description: '+100 Health instantly'
    },

    // NEW TACTICAL POWER-UPS
    SHIELD: {
      id: 'shield',
      name: 'Shield Generator',
      image: '/assets/images/powerups/shield.png',
      color: '#00BFFF',
      icon: '🛡️',
      duration: 15000, // 15 seconds
      effect: 'shield',
      description: 'Absorbs next 3 hits',
      charges: 3
    },

    STEALTH: {
      id: 'stealth',
      name: 'Stealth Mode',
      image: '/assets/images/powerups/stealth.png',
      color: '#9370DB',
      icon: '👻',
      duration: 15000,
      effect: 'stealth',
      description: 'Invisible on minimap for 15s'
    },

    EMP: {
      id: 'emp',
      name: 'EMP Blast',
      image: '/assets/images/powerups/emp.png',
      color: '#00FFFF',
      icon: '⚡',
      duration: 0,
      effect: 'emp',
      description: 'Disable enemies in 200px radius',
      radius: 200,
      disableDuration: 5000 // 5 seconds
    },

    REPAIR: {
      id: 'repair',
      name: 'Repair Kit',
      image: '/assets/images/powerups/repair.png',
      color: '#32CD32',
      icon: '🔧',
      duration: 0,
      effect: 'repair',
      description: 'Instant full health + repair all components'
    },

    MISSILE: {
      id: 'missile',
      name: 'Missile Strike',
      image: '/assets/images/powerups/missile.png',
      color: '#FF4500',
      icon: '🚀',
      duration: 0,
      effect: 'missile',
      description: 'Call airstrike on cursor location',
      damage: 150,
      radius: 150
    },

    RADAR: {
      id: 'radar',
      name: 'Radar Scan',
      image: '/assets/images/powerups/radar.png',
      color: '#FFD700',
      icon: '📡',
      duration: 5000,
      effect: 'radar',
      description: 'Reveal all enemies for 5s'
    },

    MINES: {
      id: 'mines',
      name: 'Mine Layer',
      image: '/assets/images/powerups/mines.png',
      color: '#8B4513',
      icon: '💣',
      duration: 0,
      effect: 'mines',
      description: 'Drop 3 proximity mines',
      mineCount: 3,
      mineDamage: 75,
      mineRadius: 50
    },

    FLAMETHROWER: {
      id: 'flamethrower',
      name: 'Flamethrower',
      image: '/assets/images/powerups/flamethrower.png',
      color: '#FF6600',
      icon: '🔥',
      duration: 10000,
      effect: 'flamethrower',
      description: 'Cone damage in front for 10s',
      damage: 5, // per frame
      range: 150,
      angle: Math.PI / 3 // 60 degrees
    },

    FREEZE: {
      id: 'freeze',
      name: 'Ice Blast',
      image: '/assets/images/powerups/freeze.png',
      color: '#00CED1',
      icon: '❄️',
      duration: 0,
      effect: 'freeze',
      description: 'Freeze enemies in 180px radius for 3s',
      radius: 180,
      freezeDuration: 3000
    }
  },

  // Active power-ups per player
  activePowerUps: new Map(), // playerId -> [powerups]

  // Mines on the map
  activeMines: [],

  // Missile strikes in progress
  activeStrikes: [],

  // Initialize power-ups for a player
  initializePlayer(playerId) {
    if (!this.activePowerUps.has(playerId)) {
      this.activePowerUps.set(playerId, []);
    }
  },

  // Activate a power-up
  activatePowerUp(playerId, powerUpType, playerX, playerY, gameState) {
    this.initializePlayer(playerId);

    const type = this.TYPES[powerUpType.toUpperCase()];
    if (!type) return null;

    const result = {
      type: powerUpType,
      success: true,
      message: type.description
    };

    switch (type.effect) {
      case 'shield':
        this.activePowerUps.get(playerId).push({
          type: 'shield',
          charges: type.charges,
          startTime: Date.now(),
          duration: type.duration
        });
        result.message = `SHIELD ACTIVE! ${type.charges} hits absorbed`;
        break;

      case 'stealth':
        this.activePowerUps.get(playerId).push({
          type: 'stealth',
          startTime: Date.now(),
          duration: type.duration
        });
        result.message = 'STEALTH MODE! Invisible on minimap';
        break;

      case 'emp':
        result.affectedPlayers = this.activateEMP(playerId, playerX, playerY, type, gameState);
        result.message = `EMP! ${result.affectedPlayers.length} enemies disabled`;
        break;

      case 'repair':
        result.message = 'FULLY REPAIRED! Health and components restored';
        break;

      case 'missile':
        result.message = 'MISSILE STRIKE READY! Click to target';
        result.requiresTarget = true;
        break;

      case 'radar':
        this.activePowerUps.get(playerId).push({
          type: 'radar',
          startTime: Date.now(),
          duration: type.duration
        });
        result.message = 'RADAR ACTIVE! All enemies revealed';
        break;

      case 'mines':
        result.mines = this.dropMines(playerId, playerX, playerY, type);
        result.message = `${result.mines.length} MINES DEPLOYED!`;
        break;

      case 'flamethrower':
        this.activePowerUps.get(playerId).push({
          type: 'flamethrower',
          startTime: Date.now(),
          duration: type.duration
        });
        result.message = 'FLAMETHROWER ACTIVE! Burn them all!';
        break;

      case 'freeze':
        result.affectedPlayers = this.activateFreeze(playerId, playerX, playerY, type, gameState);
        result.message = `ICE BLAST! ${result.affectedPlayers.length} enemies frozen`;
        break;
    }

    return result;
  },

  // Activate EMP
  activateEMP(playerId, x, y, type, gameState) {
    const affected = [];

    Object.values(gameState.players).forEach((player) => {
      if (player.id === playerId) return;

      const dx = player.x - x;
      const dy = player.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= type.radius) {
        affected.push({
          id: player.id,
          disabledUntil: Date.now() + type.disableDuration
        });
      }
    });

    return affected;
  },

  // Activate freeze
  activateFreeze(playerId, x, y, type, gameState) {
    const affected = [];

    Object.values(gameState.players).forEach((player) => {
      if (player.id === playerId) return;

      const dx = player.x - x;
      const dy = player.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= type.radius) {
        affected.push({
          id: player.id,
          frozenUntil: Date.now() + type.freezeDuration
        });
      }
    });

    return affected;
  },

  // Drop mines
  dropMines(playerId, x, y, type) {
    const mines = [];
    const angleStep = Math.PI * 2 / type.mineCount;
    const dropRadius = 60;

    for (let i = 0; i < type.mineCount; i++) {
      const angle = angleStep * i;
      const mineX = x + Math.cos(angle) * dropRadius;
      const mineY = y + Math.sin(angle) * dropRadius;

      const mine = {
        id: `mine_${Date.now()}_${i}`,
        playerId: playerId,
        x: mineX,
        y: mineY,
        damage: type.mineDamage,
        radius: type.mineRadius,
        armed: false, // Arms after 1 second
        armTime: Date.now() + 1000
      };

      this.activeMines.push(mine);
      mines.push(mine);
    }

    return mines;
  },

  // Call missile strike
  callMissileStrike(playerId, targetX, targetY, type) {
    const strike = {
      id: `strike_${Date.now()}`,
      playerId: playerId,
      x: targetX,
      y: targetY,
      damage: type.damage,
      radius: type.radius,
      startTime: Date.now(),
      impactTime: Date.now() + 2000, // 2 second delay
      warningRadius: type.radius * 1.5
    };

    this.activeStrikes.push(strike);
    return strike;
  },

  // Check if player has active power-up
  hasActivePowerUp(playerId, powerUpType) {
    if (!this.activePowerUps.has(playerId)) return false;

    const now = Date.now();
    const playerPowerUps = this.activePowerUps.get(playerId);

    return playerPowerUps.some((pu) => {
      if (pu.type !== powerUpType) return false;
      if (pu.duration && now - pu.startTime > pu.duration) return false;
      return true;
    });
  },

  // Update power-ups (remove expired)
  update(gameState) {
    const now = Date.now();

    // Update active power-ups
    this.activePowerUps.forEach((powerUps, playerId) => {
      this.activePowerUps.set(playerId, powerUps.filter((pu) => {
        if (!pu.duration) return true; // Permanent until used
        return now - pu.startTime < pu.duration;
      }));
    });

    // Arm mines
    this.activeMines.forEach((mine) => {
      if (!mine.armed && now >= mine.armTime) {
        mine.armed = true;
      }
    });

    // Update missile strikes
    this.activeStrikes = this.activeStrikes.filter((strike) => {
      return now < strike.impactTime + 1000; // Keep for 1s after impact for visuals
    });
  },

  // Render power-up effects
  render(ctx, gameState) {
    // Render mines
    this.renderMines(ctx);

    // Render missile strikes
    this.renderMissileStrikes(ctx);

    // Render flamethrower effects
    this.renderFlamethrowers(ctx, gameState);
  },

  // Render mines
  renderMines(ctx) {
    const now = Date.now();

    this.activeMines.forEach((mine) => {
      ctx.save();
      ctx.translate(mine.x, mine.y);

      if (!mine.armed) {
        // Blinking while arming
        const blink = Math.sin(now * 0.01) > 0;
        ctx.globalAlpha = blink ? 1 : 0.3;
      }

      // Draw mine
      ctx.fillStyle = '#8B4513';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw spikes
      for (let i = 0; i < 8; i++) {
        const angle = Math.PI * 2 * i / 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 10);
        ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
        ctx.stroke();
      }

      ctx.restore();
    });
  },

  // Render missile strikes
  renderMissileStrikes(ctx) {
    const now = Date.now();

    this.activeStrikes.forEach((strike) => {
      const elapsed = now - strike.startTime;
      const hasImpacted = now >= strike.impactTime;

      ctx.save();
      ctx.translate(strike.x, strike.y);

      if (!hasImpacted) {
        // Warning circle
        const pulse = Math.sin(elapsed * 0.01) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(255, 0, 0, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, strike.warningRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Countdown text
        const timeLeft = Math.ceil((strike.impactTime - now) / 1000);
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'center';
        ctx.fillText(timeLeft.toString(), 0, 15);
      } else {
        // Explosion
        const impactElapsed = now - strike.impactTime;
        const alpha = 1 - impactElapsed / 1000;

        if (alpha > 0) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#ff6600';
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#ff0000';
          ctx.beginPath();
          ctx.arc(0, 0, strike.radius * (1 + impactElapsed / 1000), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });
  },

  // Render flamethrower effects
  renderFlamethrowers(ctx, gameState) {
    const now = Date.now();

    Object.values(gameState.players).forEach((player) => {
      if (!this.hasActivePowerUp(player.id, 'flamethrower')) return;

      const type = this.TYPES.FLAMETHROWER;
      const angle = player.angle || 0;

      // Draw flame cone
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(angle);

      const gradient = ctx.createLinearGradient(0, 0, type.range, 0);
      gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, type.range, -type.angle / 2, type.angle / 2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }
};

// Export for use in game
window.NewPowerUps = NewPowerUps;