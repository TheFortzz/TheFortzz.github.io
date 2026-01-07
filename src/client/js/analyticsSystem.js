/**
 * Analytics System for TheFortz
 * Track player behavior, game events, and statistics
 */

const AnalyticsSystem = {
  // Event queue
  eventQueue: [],

  // Session data
  sessionData: {
    sessionId: null,
    startTime: null,
    playerId: null,
    events: [],
    stats: {
      kills: 0,
      deaths: 0,
      damageDealt: 0,
      damageTaken: 0,
      powerUpsCollected: 0,
      distanceTraveled: 0,
      shotsHit: 0,
      shotsFired: 0,
      matchesPlayed: 0,
      matchesWon: 0,
      timeInGame: 0
    }
  },

  // Event types
  eventTypes: {
    SESSION_START: 'session_start',
    SESSION_END: 'session_end',
    MATCH_START: 'match_start',
    MATCH_END: 'match_end',
    KILL: 'kill',
    DEATH: 'death',
    POWERUP_COLLECTED: 'powerup_collected',
    WEAPON_FIRED: 'weapon_fired',
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    LEVEL_UP: 'level_up',
    PURCHASE: 'purchase',
    QUEST_COMPLETED: 'quest_completed'
  },

  // Initialize session
  startSession(playerId) {
    this.sessionData = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      playerId: playerId,
      events: [],
      stats: {
        kills: 0,
        deaths: 0,
        damageDealt: 0,
        damageTaken: 0,
        powerUpsCollected: 0,
        distanceTraveled: 0,
        shotsHit: 0,
        shotsFired: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        timeInGame: 0
      }
    };

    this.trackEvent(this.eventTypes.SESSION_START, {
      playerId: playerId,
      timestamp: Date.now()
    });
  },

  // End session
  endSession() {
    this.sessionData.endTime = Date.now();
    this.sessionData.duration = this.sessionData.endTime - this.sessionData.startTime;

    this.trackEvent(this.eventTypes.SESSION_END, {
      duration: this.sessionData.duration,
      stats: this.sessionData.stats
    });

    // Save session data
    this.saveSession();
  },

  // Track event
  trackEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId,
      ...data
    };

    this.sessionData.events.push(event);
    this.eventQueue.push(event);

    // Process event for stats
    this.processEventForStats(event);
  },

  // Process event for stats
  processEventForStats(event) {
    const stats = this.sessionData.stats;

    switch (event.type) {
      case this.eventTypes.KILL:
        stats.kills++;
        break;
      case this.eventTypes.DEATH:
        stats.deaths++;
        break;
      case this.eventTypes.POWERUP_COLLECTED:
        stats.powerUpsCollected++;
        break;
      case this.eventTypes.WEAPON_FIRED:
        stats.shotsFired++;
        if (event.hit) stats.shotsHit++;
        break;
      case this.eventTypes.MATCH_START:
        stats.matchesPlayed++;
        break;
      case this.eventTypes.MATCH_END:
        if (event.won) stats.matchesWon++;
        break;
    }
  },

  // Track kill
  trackKill(killerId, victimId, weaponUsed) {
    this.trackEvent(this.eventTypes.KILL, {
      killerId: killerId,
      victimId: victimId,
      weapon: weaponUsed
    });
  },

  // Track death
  trackDeath(playerId, killerId) {
    this.trackEvent(this.eventTypes.DEATH, {
      playerId: playerId,
      killerId: killerId
    });
  },

  // Track power-up collection
  trackPowerUpCollected(playerId, powerUpType) {
    this.trackEvent(this.eventTypes.POWERUP_COLLECTED, {
      playerId: playerId,
      powerUpType: powerUpType
    });
  },

  // Track weapon fired
  trackWeaponFired(playerId, weaponType, hit = false) {
    this.trackEvent(this.eventTypes.WEAPON_FIRED, {
      playerId: playerId,
      weapon: weaponType,
      hit: hit
    });
  },

  // Track achievement
  trackAchievement(playerId, achievementId) {
    this.trackEvent(this.eventTypes.ACHIEVEMENT_UNLOCKED, {
      playerId: playerId,
      achievementId: achievementId
    });
  },

  // Track purchase
  trackPurchase(playerId, itemType, itemId, cost) {
    this.trackEvent(this.eventTypes.PURCHASE, {
      playerId: playerId,
      itemType: itemType,
      itemId: itemId,
      cost: cost
    });
  },

  // Get session stats
  getSessionStats() {
    return {
      ...this.sessionData.stats,
      accuracy: this.sessionData.stats.shotsFired > 0 ?
      this.sessionData.stats.shotsHit / this.sessionData.stats.shotsFired * 100 :
      0,
      kd: this.sessionData.stats.deaths > 0 ?
      this.sessionData.stats.kills / this.sessionData.stats.deaths :
      this.sessionData.stats.kills,
      winRate: this.sessionData.stats.matchesPlayed > 0 ?
      this.sessionData.stats.matchesWon / this.sessionData.stats.matchesPlayed * 100 :
      0
    };
  },

  // Get event summary
  getEventSummary() {
    const summary = {};

    this.sessionData.events.forEach((event) => {
      if (!summary[event.type]) {
        summary[event.type] = 0;
      }
      summary[event.type]++;
    });

    return summary;
  },

  // Get heatmap data (for popular locations)
  getHeatmapData() {
    const heatmap = [];

    this.sessionData.events.forEach((event) => {
      if (event.x !== undefined && event.y !== undefined) {
        heatmap.push({
          x: event.x,
          y: event.y,
          type: event.type,
          timestamp: event.timestamp
        });
      }
    });

    return heatmap;
  },

  // Save session to localStorage
  saveSession() {
    const sessions = JSON.parse(localStorage.getItem('gameSessions') || '[]');
    sessions.push(this.sessionData);

    // Keep only last 50 sessions
    if (sessions.length > 50) {
      sessions.shift();
    }

    localStorage.setItem('gameSessions', JSON.stringify(sessions));
  },

  // Load sessions
  loadSessions() {
    return JSON.parse(localStorage.getItem('gameSessions') || '[]');
  },

  // Get aggregate stats across all sessions
  getAggregateStats() {
    const sessions = this.loadSessions();
    const aggregate = {
      totalKills: 0,
      totalDeaths: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalPowerUps: 0,
      totalDistance: 0,
      totalShotsHit: 0,
      totalShotsFired: 0,
      totalMatches: 0,
      totalWins: 0,
      totalPlayTime: 0
    };

    sessions.forEach((session) => {
      aggregate.totalKills += session.stats.kills || 0;
      aggregate.totalDeaths += session.stats.deaths || 0;
      aggregate.totalDamageDealt += session.stats.damageDealt || 0;
      aggregate.totalDamageTaken += session.stats.damageTaken || 0;
      aggregate.totalPowerUps += session.stats.powerUpsCollected || 0;
      aggregate.totalDistance += session.stats.distanceTraveled || 0;
      aggregate.totalShotsHit += session.stats.shotsHit || 0;
      aggregate.totalShotsFired += session.stats.shotsFired || 0;
      aggregate.totalMatches += session.stats.matchesPlayed || 0;
      aggregate.totalWins += session.stats.matchesWon || 0;
      aggregate.totalPlayTime += session.duration || 0;
    });

    // Calculate derived stats
    aggregate.overallKD = aggregate.totalDeaths > 0 ?
    aggregate.totalKills / aggregate.totalDeaths :
    aggregate.totalKills;
    aggregate.overallAccuracy = aggregate.totalShotsFired > 0 ?
    aggregate.totalShotsHit / aggregate.totalShotsFired * 100 :
    0;
    aggregate.overallWinRate = aggregate.totalMatches > 0 ?
    aggregate.totalWins / aggregate.totalMatches * 100 :
    0;

    return aggregate;
  },

  // Clear all data
  clearAllData() {
    localStorage.removeItem('gameSessions');
    this.sessionData.events = [];
    this.eventQueue = [];
  }
};

// Export
if (typeof window !== 'undefined') {
  window.AnalyticsSystem = AnalyticsSystem;
}