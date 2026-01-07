// Game Manager - Handles scoring, damage, kills, and gameplay events
const GameManager = {
  playerStats: {},

  init() {
    window.damageNumbers = [];
    console.log('🎮 Game Manager initialized');
  },

  addDamage(targetId, x, y, damage, isCritical = false) {
    if (!window.damageNumbers) window.damageNumbers = [];

    const color = isCritical ? '#ffff00' : '#ff6666';
    const text = isCritical ? `${damage}!` : `${damage}`;

    window.damageNumbers.push({
      x: x,
      y: y,
      text: text,
      color: color,
      life: 1.0,
      velocity: { x: (Math.random() - 0.5) * 2, y: -3 }
    });

    // Create particles
    if (window.ParticleSystem) {
      window.ParticleSystem.create(x, y, isCritical ? 'hit' : 'explosion', 5);
    }
  },

  addKill(killerId, killedId, weapon = 'bullet') {
    const killer = GameState.players[killerId];
    const killed = GameState.players[killedId];

    if (!killer || !killed) return;

    // Update stats
    if (!this.playerStats[killerId]) {
      this.playerStats[killerId] = { kills: 0, deaths: 0, score: 0 };
    }
    if (!this.playerStats[killedId]) {
      this.playerStats[killedId] = { kills: 0, deaths: 0, score: 0 };
    }

    this.playerStats[killerId].kills++;
    this.playerStats[killedId].deaths++;

    // Score rewards
    const baseScore = 100;
    const bonusMultiplier = Math.min((killer.killStreak || 0) / 10, 5);
    const scoreReward = Math.ceil(baseScore * (1 + bonusMultiplier));

    killer.score = (killer.score || 0) + scoreReward;
    killer.kills = (killer.kills || 0) + 1;
    killer.killStreak = (killer.killStreak || 0) + 1;

    killed.deaths = (killed.deaths || 0) + 1;
    killed.killStreak = 0;

    // Announce kill
    if (killerId === GameState.playerId) {
      console.log(`🎯 Kill! +${scoreReward} points! (Streak: ${killer.killStreak})`);
      this.showKillNotification(weapon, killer.killStreak);
    }
  },

  showKillNotification(weapon, streak) {
    const notifications = {
      1: '👊 First Blood!',
      2: '🔥 Double Kill!',
      3: '💥 Triple Kill!',
      4: '⚡ Quad Kill!',
      5: '💫 Penta Kill!',
      10: '🏆 MEGA KILL!'
    };

    const message = notifications[streak] || `👊 Kill Streak: ${streak}!`;

    // Create notification
    const notif = document.createElement('div');
    notif.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 100, 0, 0.8);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 1s ease-out;
            pointer-events: none;
        `;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => notif.remove(), 1000);
  },

  addPowerUp(type, x, y) {
    if (!window.gameState.powerUps) window.gameState.powerUps = [];

    window.gameState.powerUps.push({
      id: Math.random(),
      type: type,
      x: x,
      y: y,
      collected: false
    });

    // Particle effect
    if (window.ParticleSystem) {
      window.ParticleSystem.create(x, y, 'powerup', 10);
    }
  },

  collectPowerUp(playerId, powerUpType) {
    const player = GameState.players[playerId];
    if (!player) return;

    const effects = {
      health: () => {player.health = Math.min(100, (player.health || 100) + 50);},
      shield: () => {player.shield = Math.min(100, (player.shield || 0) + 30);},
      ammo: () => {player.ammo = Math.min(999, (player.ammo || 50) + 100);},
      speed: () => {player.speedBoost = 2.0;setTimeout(() => player.speedBoost = 1.0, 8000);},
      damage: () => {player.damageBoost = 1.5;setTimeout(() => player.damageBoost = 1.0, 10000);}
    };

    if (effects[powerUpType]) {
      effects[powerUpType]();
      player.score = (player.score || 0) + 25;
      console.log(`⭐ ${powerUpType} collected!`);
    }
  },

  update() {
    // Update player streaks
    Object.values(GameState.players).forEach((player) => {
      if (!player.killStreak) player.killStreak = 0;
      if (!player.kills) player.kills = 0;
      if (!player.deaths) player.deaths = 0;
    });
  }
};

window.GameManager = GameManager;