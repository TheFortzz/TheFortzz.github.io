// Daily Challenges & Progression System
// Engaging players with goals and rewards

const DailyChallenges = {
  // Challenge definitions
  CHALLENGE_TYPES: {
    DESTROY_TANKS: {
      id: 'destroy_tanks',
      name: 'Tank Destroyer',
      description: 'Destroy {target} enemy tanks',
      icon: '💥',
      rewardFortz: 100,
      rewardXP: 50
    },
    DEAL_DAMAGE: {
      id: 'deal_damage',
      name: 'Heavy Hitter',
      description: 'Deal {target} total damage',
      icon: '⚔️',
      rewardFortz: 150,
      rewardXP: 75
    },
    WIN_MATCHES: {
      id: 'win_matches',
      name: 'Victory Streak',
      description: 'Win {target} matches',
      icon: '🏆',
      rewardFortz: 200,
      rewardXP: 100
    },
    COLLECT_POWERUPS: {
      id: 'collect_powerups',
      name: 'Power Collector',
      description: 'Collect {target} power-ups',
      icon: '⭐',
      rewardFortz: 80,
      rewardXP: 40
    },
    SURVIVE_TIME: {
      id: 'survive_time',
      name: 'Survivor',
      description: 'Survive for {target} seconds in a match',
      icon: '⏱️',
      rewardFortz: 120,
      rewardXP: 60
    },
    HEADSHOTS: {
      id: 'headshots',
      name: 'Sharpshooter',
      description: 'Get {target} rear hits',
      icon: '🎯',
      rewardFortz: 180,
      rewardXP: 90
    },
    DESTROY_TERRAIN: {
      id: 'destroy_terrain',
      name: 'Demolition Expert',
      description: 'Destroy {target} terrain objects',
      icon: '🌳',
      rewardFortz: 100,
      rewardXP: 50
    }
  },

  // Active challenges
  dailyChallenges: [],
  weeklyChallenges: [],

  // Player progress
  progress: new Map(),

  // Initialize challenges for the day
  initDailyChallenges() {
    this.dailyChallenges = [];

    // Generate 3 random daily challenges
    const types = Object.values(this.CHALLENGE_TYPES);
    const selected = [];

    while (selected.length < 3) {
      const type = types[Math.floor(Math.random() * types.length)];
      if (!selected.find((c) => c.id === type.id)) {
        selected.push(type);
      }
    }

    // Create challenges with random targets
    selected.forEach((type, index) => {
      const target = this.getRandomTarget(type.id);

      this.dailyChallenges.push({
        id: `daily_${index}`,
        type: type.id,
        name: type.name,
        description: type.description.replace('{target}', target),
        icon: type.icon,
        target: target,
        progress: 0,
        completed: false,
        rewardFortz: type.rewardFortz,
        rewardXP: type.rewardXP
      });
    });

    console.log('📅 Daily challenges initialized:', this.dailyChallenges);
  },

  // Get random target based on challenge type
  getRandomTarget(challengeType) {
    const targets = {
      destroy_tanks: [5, 10, 15, 20],
      deal_damage: [1000, 2000, 3000, 5000],
      win_matches: [1, 2, 3, 5],
      collect_powerups: [3, 5, 8, 10],
      survive_time: [300, 600, 900, 1200], // seconds
      headshots: [3, 5, 8, 10],
      destroy_terrain: [10, 15, 20, 25]
    };

    const options = targets[challengeType] || [10];
    return options[Math.floor(Math.random() * options.length)];
  },

  // Update challenge progress
  updateProgress(challengeType, amount = 1) {
    let updated = false;

    this.dailyChallenges.forEach((challenge) => {
      if (challenge.type === challengeType && !challenge.completed) {
        challenge.progress = Math.min(challenge.target, challenge.progress + amount);

        if (challenge.progress >= challenge.target) {
          this.completeChallenge(challenge);
        }

        updated = true;
      }
    });

    return updated;
  },

  // Complete a challenge
  completeChallenge(challenge) {
    challenge.completed = true;

    // Award rewards
    if (window.gameState) {
      window.gameState.fortzCurrency = (window.gameState.fortzCurrency || 0) + challenge.rewardFortz;

      // Show notification
      if (window.showNotification) {
        window.showNotification(
          `Challenge Complete! +${challenge.rewardFortz} Fortz, +${challenge.rewardXP} XP`,
          '#FFD700',
          36
        );
      }
    }

    console.log(`✅ Challenge completed: ${challenge.name}`);

    // Play sound
    if (window.EnhancedSoundSystem) {
      window.EnhancedSoundSystem.play(window.EnhancedSoundSystem.effects.UI_SUCCESS, 0.7);
    }

    // Visual effect
    if (window.VisualPolish) {
      window.VisualPolish.applyScreenShake(3);
    }
  },

  // Get challenge progress
  getChallengeProgress(challengeId) {
    const challenge = this.dailyChallenges.find((c) => c.id === challengeId);
    return challenge ? {
      progress: challenge.progress,
      target: challenge.target,
      percent: challenge.progress / challenge.target * 100,
      completed: challenge.completed
    } : null;
  },

  // Render challenges UI
  renderChallengesUI(ctx, canvas) {
    if (this.dailyChallenges.length === 0) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Screen space

    const startX = 20;
    const startY = 150;
    const width = 300;
    const height = 80;
    const spacing = 10;

    this.dailyChallenges.forEach((challenge, index) => {
      const y = startY + (height + spacing) * index;

      // Background
      ctx.fillStyle = challenge.completed ?
      'rgba(0, 255, 100, 0.2)' :
      'rgba(0, 0, 0, 0.6)';
      ctx.strokeStyle = challenge.completed ?
      'rgba(0, 255, 100, 0.8)' :
      'rgba(0, 247, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.fillRect(startX, y, width, height);
      ctx.strokeRect(startX, y, width, height);

      // Icon
      ctx.font = '32px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(challenge.icon, startX + 10, y + 45);

      // Name
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = challenge.completed ? '#00ff00' : '#00f7ff';
      ctx.fillText(challenge.name, startX + 55, y + 25);

      // Description
      ctx.font = '12px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(challenge.description, startX + 55, y + 45);

      // Progress bar
      const barX = startX + 55;
      const barY = y + 55;
      const barWidth = width - 65;
      const barHeight = 15;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      const progressWidth = challenge.progress / challenge.target * barWidth;
      ctx.fillStyle = challenge.completed ? '#00ff00' : '#00f7ff';
      ctx.fillRect(barX, barY, progressWidth, barHeight);

      // Progress text
      ctx.font = 'bold 11px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${challenge.progress}/${challenge.target}`,
        barX + barWidth / 2,
        barY + 11
      );
      ctx.textAlign = 'left';
    });

    ctx.restore();
  }
};

// Export for use in game
window.DailyChallenges = DailyChallenges;

// Auto-initialize challenges
if (typeof window !== 'undefined') {
  setTimeout(() => {
    DailyChallenges.initDailyChallenges();
  }, 1000);
}