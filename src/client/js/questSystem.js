/**
 * Quest System for TheFortz
 * Daily, weekly, and special quests with rewards
 */

const QuestSystem = {
  quests: {
    // Daily Quests
    DAILY_KILLS: {
      id: 'daily_kills',
      name: 'Daily Eliminations',
      description: 'Get 10 kills today',
      type: 'daily',
      icon: '🎯',
      requirement: { kills: 10 },
      reward: { fortz: 100, xp: 250 },
      resetTime: 'daily'
    },
    DAILY_WINS: {
      id: 'daily_wins',
      name: 'Daily Victories',
      description: 'Win 3 matches today',
      type: 'daily',
      icon: '🏆',
      requirement: { wins: 3 },
      reward: { fortz: 150, xp: 400 },
      resetTime: 'daily'
    },
    DAILY_POWERUPS: {
      id: 'daily_powerups',
      name: 'Power Collector',
      description: 'Collect 20 power-ups today',
      type: 'daily',
      icon: '⚡',
      requirement: { powerUps: 20 },
      reward: { fortz: 80, xp: 200 },
      resetTime: 'daily'
    },
    DAILY_DISTANCE: {
      id: 'daily_distance',
      name: 'Road Warrior',
      description: 'Travel 5km today',
      type: 'daily',
      icon: '🚗',
      requirement: { distance: 5000 },
      reward: { fortz: 120, xp: 300 },
      resetTime: 'daily'
    },

    // Weekly Quests
    WEEKLY_DOMINATION: {
      id: 'weekly_domination',
      name: 'Weekly Domination',
      description: 'Get 100 kills this week',
      type: 'weekly',
      icon: '💀',
      requirement: { kills: 100 },
      reward: { fortz: 500, xp: 1500 },
      resetTime: 'weekly'
    },
    WEEKLY_CHAMPION: {
      id: 'weekly_champion',
      name: 'Weekly Champion',
      description: 'Win 15 matches this week',
      type: 'weekly',
      icon: '👑',
      requirement: { wins: 15 },
      reward: { fortz: 750, xp: 2000 },
      resetTime: 'weekly'
    },
    WEEKLY_SURVIVOR: {
      id: 'weekly_survivor',
      name: 'Weekly Survivor',
      description: 'Play 20 matches this week',
      type: 'weekly',
      icon: '🛡️',
      requirement: { matches: 20 },
      reward: { fortz: 400, xp: 1000 },
      resetTime: 'weekly'
    },

    // Special Quests
    SPECIAL_SNIPER: {
      id: 'special_sniper',
      name: 'Sniper Master',
      description: 'Get 50 kills with sniper rifle',
      type: 'special',
      icon: '🎯',
      requirement: { sniperKills: 50 },
      reward: { fortz: 1000, xp: 3000, item: 'sniper_skin_gold' }
    },
    SPECIAL_EXPLOSIVE: {
      id: 'special_explosive',
      name: 'Demolition Expert',
      description: 'Get 30 kills with explosive weapons',
      type: 'special',
      icon: '💥',
      requirement: { explosiveKills: 30 },
      reward: { fortz: 800, xp: 2500, item: 'rocket_skin_chrome' }
    },
    SPECIAL_STREAK: {
      id: 'special_streak',
      name: 'Unstoppable Force',
      description: 'Achieve a 15 kill streak',
      type: 'special',
      icon: '🔥',
      requirement: { killStreak: 15 },
      reward: { fortz: 1500, xp: 4000, item: 'tank_skin_legendary' }
    }
  },

  // Player quest progress
  playerQuests: {},

  // Initialize player quests
  initPlayer(playerId) {
    if (!this.playerQuests[playerId]) {
      this.playerQuests[playerId] = {
        active: [],
        completed: [],
        progress: {},
        lastReset: {
          daily: Date.now(),
          weekly: Date.now()
        }
      };
      this.assignDailyQuests(playerId);
      this.assignWeeklyQuests(playerId);
    }
  },

  // Assign daily quests
  assignDailyQuests(playerId) {
    const dailyQuests = Object.values(this.quests).filter((q) => q.type === 'daily');
    const player = this.playerQuests[playerId];

    // Select 3 random daily quests
    const selected = this.shuffleArray(dailyQuests).slice(0, 3);

    selected.forEach((quest) => {
      if (!player.active.includes(quest.id)) {
        player.active.push(quest.id);
        player.progress[quest.id] = this.createProgress(quest);
      }
    });
  },

  // Assign weekly quests
  assignWeeklyQuests(playerId) {
    const weeklyQuests = Object.values(this.quests).filter((q) => q.type === 'weekly');
    const player = this.playerQuests[playerId];

    weeklyQuests.forEach((quest) => {
      if (!player.active.includes(quest.id)) {
        player.active.push(quest.id);
        player.progress[quest.id] = this.createProgress(quest);
      }
    });
  },

  createProgress(quest) {
    const progress = {};
    Object.keys(quest.requirement).forEach((key) => {
      progress[key] = 0;
    });
    return {
      ...progress,
      completed: false,
      claimed: false,
      startedAt: Date.now()
    };
  },

  // Update quest progress
  updateProgress(playerId, stats) {
    this.initPlayer(playerId);
    const player = this.playerQuests[playerId];

    // Check for resets
    this.checkResets(playerId);

    const completedQuests = [];

    player.active.forEach((questId) => {
      const quest = this.quests[questId.toUpperCase()];
      if (!quest) return;

      const progress = player.progress[questId];
      if (progress.completed) return;

      // Update progress
      Object.keys(quest.requirement).forEach((key) => {
        if (stats[key] !== undefined) {
          progress[key] = (progress[key] || 0) + stats[key];
        }
      });

      // Check if completed
      if (this.isQuestComplete(quest, progress)) {
        progress.completed = true;
        completedQuests.push(quest);
      }
    });

    return completedQuests;
  },

  isQuestComplete(quest, progress) {
    return Object.entries(quest.requirement).every(([key, value]) => {
      return progress[key] >= value;
    });
  },

  // Claim quest reward
  claimReward(playerId, questId) {
    const player = this.playerQuests[playerId];
    if (!player) return null;

    const progress = player.progress[questId];
    if (!progress || !progress.completed || progress.claimed) {
      return null;
    }

    const quest = this.quests[questId.toUpperCase()];
    if (!quest) return null;

    progress.claimed = true;
    player.completed.push(questId);
    player.active = player.active.filter((id) => id !== questId);

    return quest.reward;
  },

  // Check for quest resets
  checkResets(playerId) {
    const player = this.playerQuests[playerId];
    const now = Date.now();

    // Daily reset (24 hours)
    if (now - player.lastReset.daily > 24 * 60 * 60 * 1000) {
      this.resetDailyQuests(playerId);
      player.lastReset.daily = now;
    }

    // Weekly reset (7 days)
    if (now - player.lastReset.weekly > 7 * 24 * 60 * 60 * 1000) {
      this.resetWeeklyQuests(playerId);
      player.lastReset.weekly = now;
    }
  },

  resetDailyQuests(playerId) {
    const player = this.playerQuests[playerId];

    // Remove daily quests
    const dailyQuestIds = Object.values(this.quests).
    filter((q) => q.type === 'daily').
    map((q) => q.id);

    player.active = player.active.filter((id) => !dailyQuestIds.includes(id));
    dailyQuestIds.forEach((id) => delete player.progress[id]);

    // Assign new daily quests
    this.assignDailyQuests(playerId);
  },

  resetWeeklyQuests(playerId) {
    const player = this.playerQuests[playerId];

    // Remove weekly quests
    const weeklyQuestIds = Object.values(this.quests).
    filter((q) => q.type === 'weekly').
    map((q) => q.id);

    player.active = player.active.filter((id) => !weeklyQuestIds.includes(id));
    weeklyQuestIds.forEach((id) => delete player.progress[id]);

    // Assign new weekly quests
    this.assignWeeklyQuests(playerId);
  },

  // Get active quests for player
  getActiveQuests(playerId) {
    this.initPlayer(playerId);
    const player = this.playerQuests[playerId];

    return player.active.map((questId) => {
      const quest = this.quests[questId.toUpperCase()];
      const progress = player.progress[questId];

      return {
        ...quest,
        progress: this.getQuestProgress(quest, progress)
      };
    });
  },

  getQuestProgress(quest, progress) {
    const result = {};

    Object.entries(quest.requirement).forEach(([key, required]) => {
      const current = progress[key] || 0;
      result[key] = {
        current: current,
        required: required,
        percentage: Math.min(100, current / required * 100)
      };
    });

    return result;
  },

  // Utility
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
};

// Export
if (typeof window !== 'undefined') {
  window.QuestSystem = QuestSystem;
}