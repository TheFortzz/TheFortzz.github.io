/**
 * Mini-Game System for TheFortz
 * Fun mini-games for variety and rewards
 */

const MiniGameSystem = {
  // Available mini-games
  games: {
    TARGET_PRACTICE: {
      id: 'target_practice',
      name: 'Target Practice',
      description: 'Hit as many targets as possible in 60 seconds',
      icon: '🎯',
      rewards: {
        bronze: { fortz: 100, xp: 200 },
        silver: { fortz: 250, xp: 500 },
        gold: { fortz: 500, xp: 1000 }
      },
      thresholds: {
        bronze: 10,
        silver: 25,
        gold: 50
      }
    },

    OBSTACLE_COURSE: {
      id: 'obstacle_course',
      name: 'Obstacle Course',
      description: 'Complete the course as fast as possible',
      icon: '🏁',
      rewards: {
        bronze: { fortz: 150, xp: 300 },
        silver: { fortz: 300, xp: 600 },
        gold: { fortz: 600, xp: 1200 }
      },
      thresholds: {
        bronze: 120, // seconds
        silver: 90,
        gold: 60
      }
    },

    SURVIVAL_WAVE: {
      id: 'survival_wave',
      name: 'Survival Waves',
      description: 'Survive as many waves as possible',
      icon: '🌊',
      rewards: {
        bronze: { fortz: 200, xp: 400 },
        silver: { fortz: 400, xp: 800 },
        gold: { fortz: 800, xp: 1600 }
      },
      thresholds: {
        bronze: 5,
        silver: 10,
        gold: 20
      }
    },

    COIN_COLLECTOR: {
      id: 'coin_collector',
      name: 'Coin Collector',
      description: 'Collect coins before time runs out',
      icon: '💰',
      rewards: {
        bronze: { fortz: 100, xp: 200 },
        silver: { fortz: 200, xp: 400 },
        gold: { fortz: 400, xp: 800 }
      },
      thresholds: {
        bronze: 50,
        silver: 100,
        gold: 200
      }
    },

    ACCURACY_CHALLENGE: {
      id: 'accuracy_challenge',
      name: 'Accuracy Challenge',
      description: 'Achieve the highest accuracy possible',
      icon: '🎪',
      rewards: {
        bronze: { fortz: 150, xp: 300 },
        silver: { fortz: 300, xp: 600 },
        gold: { fortz: 600, xp: 1200 }
      },
      thresholds: {
        bronze: 0.6, // 60%
        silver: 0.8, // 80%
        gold: 0.95 // 95%
      }
    }
  },

  // Player scores
  playerScores: {},

  // Active mini-game sessions
  activeSessions: {},

  // Start mini-game
  startGame(playerId, gameId) {
    const game = this.games[gameId.toUpperCase()];
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.activeSessions[sessionId] = {
      sessionId: sessionId,
      playerId: playerId,
      gameId: game.id,
      startTime: Date.now(),
      score: 0,
      status: 'active',
      data: this.initializeGameData(game.id)
    };

    return {
      success: true,
      sessionId: sessionId,
      game: game
    };
  },

  // Initialize game-specific data
  initializeGameData(gameId) {
    switch (gameId) {
      case 'target_practice':
        return {
          targetsHit: 0,
          targetsMissed: 0,
          timeRemaining: 60
        };

      case 'obstacle_course':
        return {
          checkpoints: [],
          currentCheckpoint: 0,
          totalCheckpoints: 10
        };

      case 'survival_wave':
        return {
          currentWave: 1,
          enemiesKilled: 0,
          enemiesRemaining: 5
        };

      case 'coin_collector':
        return {
          coinsCollected: 0,
          timeRemaining: 60
        };

      case 'accuracy_challenge':
        return {
          shotsHit: 0,
          shotsFired: 0,
          shotsRemaining: 50
        };

      default:
        return {};
    }
  },

  // Update game session
  updateSession(sessionId, updates) {
    const session = this.activeSessions[sessionId];
    if (!session || session.status !== 'active') {
      return { success: false, error: 'Invalid session' };
    }

    // Update data
    Object.assign(session.data, updates);

    // Update score based on game type
    session.score = this.calculateScore(session);

    // Check if game is complete
    if (this.isGameComplete(session)) {
      this.endGame(sessionId);
    }

    return {
      success: true,
      session: session
    };
  },

  // Calculate score
  calculateScore(session) {
    const gameId = session.gameId;
    const data = session.data;

    switch (gameId) {
      case 'target_practice':
        return data.targetsHit;

      case 'obstacle_course':
        const elapsed = (Date.now() - session.startTime) / 1000;
        return elapsed;

      case 'survival_wave':
        return data.currentWave - 1;

      case 'coin_collector':
        return data.coinsCollected;

      case 'accuracy_challenge':
        return data.shotsFired > 0 ? data.shotsHit / data.shotsFired : 0;

      default:
        return 0;
    }
  },

  // Check if game is complete
  isGameComplete(session) {
    const data = session.data;

    switch (session.gameId) {
      case 'target_practice':
      case 'coin_collector':
        return data.timeRemaining <= 0;

      case 'obstacle_course':
        return data.currentCheckpoint >= data.totalCheckpoints;

      case 'survival_wave':
        return session.status === 'failed';

      case 'accuracy_challenge':
        return data.shotsRemaining <= 0;

      default:
        return false;
    }
  },

  // End game
  endGame(sessionId) {
    const session = this.activeSessions[sessionId];
    if (!session) return null;

    session.status = 'completed';
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    // Calculate medal
    const medal = this.calculateMedal(session);
    session.medal = medal;

    // Get rewards
    const game = this.games[session.gameId.toUpperCase()];
    session.rewards = medal ? game.rewards[medal] : null;

    // Save high score
    this.saveHighScore(session);

    return session;
  },

  // Calculate medal earned
  calculateMedal(session) {
    const game = this.games[session.gameId.toUpperCase()];
    const score = session.score;
    const thresholds = game.thresholds;

    // For time-based games (lower is better)
    if (session.gameId === 'obstacle_course') {
      if (score <= thresholds.gold) return 'gold';
      if (score <= thresholds.silver) return 'silver';
      if (score <= thresholds.bronze) return 'bronze';
    } else {
      // For score-based games (higher is better)
      if (score >= thresholds.gold) return 'gold';
      if (score >= thresholds.silver) return 'silver';
      if (score >= thresholds.bronze) return 'bronze';
    }

    return null;
  },

  // Save high score
  saveHighScore(session) {
    const playerId = session.playerId;
    const gameId = session.gameId;

    if (!this.playerScores[playerId]) {
      this.playerScores[playerId] = {};
    }

    if (!this.playerScores[playerId][gameId]) {
      this.playerScores[playerId][gameId] = {
        highScore: session.score,
        bestMedal: session.medal,
        attempts: 1,
        lastPlayed: Date.now()
      };
    } else {
      const current = this.playerScores[playerId][gameId];

      // Update high score (depends on game type)
      if (gameId === 'obstacle_course') {
        // Lower is better
        if (session.score < current.highScore) {
          current.highScore = session.score;
        }
      } else {
        // Higher is better
        if (session.score > current.highScore) {
          current.highScore = session.score;
        }
      }

      // Update best medal
      const medalRank = { gold: 3, silver: 2, bronze: 1 };
      if (medalRank[session.medal] > medalRank[current.bestMedal]) {
        current.bestMedal = session.medal;
      }

      current.attempts++;
      current.lastPlayed = Date.now();
    }
  },

  // Get player stats for game
  getPlayerStats(playerId, gameId) {
    if (!this.playerScores[playerId] || !this.playerScores[playerId][gameId]) {
      return null;
    }

    return this.playerScores[playerId][gameId];
  },

  // Get all player stats
  getAllPlayerStats(playerId) {
    return this.playerScores[playerId] || {};
  },

  // Get leaderboard
  getLeaderboard(gameId, limit = 10) {
    const scores = [];

    Object.entries(this.playerScores).forEach(([playerId, games]) => {
      if (games[gameId]) {
        scores.push({
          playerId: playerId,
          ...games[gameId]
        });
      }
    });

    // Sort based on game type
    if (gameId === 'obstacle_course') {
      scores.sort((a, b) => a.highScore - b.highScore); // Lower is better
    } else {
      scores.sort((a, b) => b.highScore - a.highScore); // Higher is better
    }

    return scores.slice(0, limit);
  },

  // Get daily challenge
  getDailyChallenge() {
    const gameIds = Object.keys(this.games);
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gameId = gameIds[seed % gameIds.length];

    return {
      gameId: gameId,
      game: this.games[gameId.toUpperCase()],
      bonusRewards: {
        fortz: 500,
        xp: 1000
      },
      date: today
    };
  }
};

// Export
if (typeof window !== 'undefined') {
  window.MiniGameSystem = MiniGameSystem;
}