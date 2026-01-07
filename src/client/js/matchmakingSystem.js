/**
 * Matchmaking System for TheFortz
 * Skill-based matchmaking with queue system
 */

const MatchmakingSystem = {
  // Active queues
  queues: {
    casual: [],
    ranked: [],
    custom: []
  },

  // Active matches
  activeMatches: {},

  // Queue settings
  settings: {
    casual: {
      minPlayers: 4,
      maxPlayers: 16,
      eloRange: 500,
      maxWaitTime: 60000
    },
    ranked: {
      minPlayers: 8,
      maxPlayers: 16,
      eloRange: 200,
      maxWaitTime: 120000
    },
    custom: {
      minPlayers: 2,
      maxPlayers: 32,
      eloRange: Infinity,
      maxWaitTime: Infinity
    }
  },

  // Join queue
  joinQueue(playerId, playerData, queueType = 'casual') {
    const queue = this.queues[queueType];
    if (!queue) {
      return { success: false, error: 'Invalid queue type' };
    }

    // Check if already in queue
    if (queue.some((p) => p.playerId === playerId)) {
      return { success: false, error: 'Already in queue' };
    }

    // Add to queue
    queue.push({
      playerId: playerId,
      playerName: playerData.name,
      elo: playerData.elo || 1000,
      level: playerData.level || 1,
      joinedAt: Date.now(),
      preferences: playerData.preferences || {}
    });

    // Try to create match
    this.tryCreateMatch(queueType);

    return {
      success: true,
      queueType: queueType,
      position: queue.length
    };
  },

  // Leave queue
  leaveQueue(playerId, queueType = 'casual') {
    const queue = this.queues[queueType];
    if (!queue) return { success: false };

    const index = queue.findIndex((p) => p.playerId === playerId);
    if (index !== -1) {
      queue.splice(index, 1);
      return { success: true };
    }

    return { success: false, error: 'Not in queue' };
  },

  // Try to create match
  tryCreateMatch(queueType) {
    const queue = this.queues[queueType];
    const settings = this.settings[queueType];

    if (queue.length < settings.minPlayers) return;

    // Sort by ELO
    queue.sort((a, b) => a.elo - b.elo);

    // Find compatible players
    const matches = [];
    let currentGroup = [];

    for (let i = 0; i < queue.length; i++) {
      const player = queue[i];

      if (currentGroup.length === 0) {
        currentGroup.push(player);
        continue;
      }

      // Check ELO range
      const groupAvgElo = currentGroup.reduce((sum, p) => sum + p.elo, 0) / currentGroup.length;
      const eloDiff = Math.abs(player.elo - groupAvgElo);

      if (eloDiff <= settings.eloRange && currentGroup.length < settings.maxPlayers) {
        currentGroup.push(player);
      }

      // Create match if we have enough players
      if (currentGroup.length >= settings.minPlayers) {
        matches.push([...currentGroup]);
        currentGroup = [];
      }
    }

    // Create matches
    matches.forEach((group) => {
      this.createMatch(group, queueType);
    });
  },

  // Create match
  createMatch(players, queueType) {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const match = {
      id: matchId,
      type: queueType,
      players: players.map((p) => p.playerId),
      avgElo: players.reduce((sum, p) => sum + p.elo, 0) / players.length,
      createdAt: Date.now(),
      status: 'waiting',
      server: this.assignServer()
    };

    this.activeMatches[matchId] = match;

    // Remove players from queue
    players.forEach((player) => {
      const queue = this.queues[queueType];
      const index = queue.findIndex((p) => p.playerId === player.playerId);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    });

    // Notify players
    return {
      matchId: matchId,
      match: match
    };
  },

  // Assign server (simplified)
  assignServer() {
    const servers = ['us-east', 'us-west', 'eu-west', 'asia'];
    return servers[Math.floor(Math.random() * servers.length)];
  },

  // Get queue status
  getQueueStatus(playerId) {
    const status = {};

    Object.entries(this.queues).forEach(([queueType, queue]) => {
      const playerIndex = queue.findIndex((p) => p.playerId === playerId);

      status[queueType] = {
        inQueue: playerIndex !== -1,
        position: playerIndex + 1,
        queueSize: queue.length,
        estimatedWait: this.estimateWaitTime(queueType, queue.length)
      };
    });

    return status;
  },

  // Estimate wait time
  estimateWaitTime(queueType, queueSize) {
    const settings = this.settings[queueType];
    const playersNeeded = settings.minPlayers - queueSize;

    if (playersNeeded <= 0) return 0;

    // Rough estimate: 10 seconds per player needed
    return Math.min(playersNeeded * 10000, settings.maxWaitTime);
  },

  // Get match info
  getMatch(matchId) {
    return this.activeMatches[matchId];
  },

  // End match
  endMatch(matchId, results) {
    const match = this.activeMatches[matchId];
    if (!match) return;

    match.status = 'completed';
    match.endTime = Date.now();
    match.duration = match.endTime - match.createdAt;
    match.results = results;

    // Clean up after 5 minutes
    setTimeout(() => {
      delete this.activeMatches[matchId];
    }, 300000);

    return match;
  }
};

// Export
if (typeof window !== 'undefined') {
  window.MatchmakingSystem = MatchmakingSystem;
}