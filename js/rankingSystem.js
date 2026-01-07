/**
 * Ranking & Leaderboard System for TheFortz
 * Competitive ranking with ELO system and global leaderboards
 */

const RankingSystem = {
  // Rank tiers
  ranks: {
    BRONZE: { name: 'Bronze', minElo: 0, maxElo: 999, color: '#CD7F32', icon: '🥉' },
    SILVER: { name: 'Silver', minElo: 1000, maxElo: 1499, color: '#C0C0C0', icon: '🥈' },
    GOLD: { name: 'Gold', minElo: 1500, maxElo: 1999, color: '#FFD700', icon: '🥇' },
    PLATINUM: { name: 'Platinum', minElo: 2000, maxElo: 2499, color: '#E5E4E2', icon: '💎' },
    DIAMOND: { name: 'Diamond', minElo: 2500, maxElo: 2999, color: '#B9F2FF', icon: '💠' },
    MASTER: { name: 'Master', minElo: 3000, maxElo: 3499, color: '#FF00FF', icon: '👑' },
    GRANDMASTER: { name: 'Grandmaster', minElo: 3500, maxElo: 3999, color: '#FF0000', icon: '⭐' },
    LEGEND: { name: 'Legend', minElo: 4000, maxElo: Infinity, color: '#FFD700', icon: '🌟' }
  },

  // Player rankings
  playerRankings: {},

  // Leaderboards
  leaderboards: {
    global: [],
    weekly: [],
    monthly: [],
    seasonal: []
  },

  // Initialize player ranking
  initPlayer(playerId, username) {
    if (!this.playerRankings[playerId]) {
      this.playerRankings[playerId] = {
        username: username,
        elo: 1000,
        rank: 'SILVER',
        division: 1,
        wins: 0,
        losses: 0,
        winStreak: 0,
        bestWinStreak: 0,
        seasonWins: 0,
        seasonLosses: 0,
        peakElo: 1000,
        matchHistory: []
      };
    }
  },

  // Calculate ELO change
  calculateEloChange(playerElo, opponentElo, won, kFactor = 32) {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const actualScore = won ? 1 : 0;
    return Math.round(kFactor * (actualScore - expectedScore));
  },

  // Update player after match
  updateAfterMatch(playerId, result) {
    this.initPlayer(playerId, result.username);
    const player = this.playerRankings[playerId];

    // Calculate ELO change
    const eloChange = this.calculateEloChange(
      player.elo,
      result.opponentElo || 1000,
      result.won
    );

    // Update ELO
    player.elo = Math.max(0, player.elo + eloChange);
    player.peakElo = Math.max(player.peakElo, player.elo);

    // Update wins/losses
    if (result.won) {
      player.wins++;
      player.seasonWins++;
      player.winStreak++;
      player.bestWinStreak = Math.max(player.bestWinStreak, player.winStreak);
    } else {
      player.losses++;
      player.seasonLosses++;
      player.winStreak = 0;
    }

    // Update rank
    this.updateRank(playerId);

    // Add to match history
    player.matchHistory.unshift({
      timestamp: Date.now(),
      won: result.won,
      eloChange: eloChange,
      finalElo: player.elo,
      kills: result.kills || 0,
      deaths: result.deaths || 0,
      score: result.score || 0
    });

    // Keep only last 50 matches
    if (player.matchHistory.length > 50) {
      player.matchHistory = player.matchHistory.slice(0, 50);
    }

    return {
      eloChange: eloChange,
      newElo: player.elo,
      newRank: player.rank,
      division: player.division
    };
  },

  // Update player rank based on ELO
  updateRank(playerId) {
    const player = this.playerRankings[playerId];

    for (const [rankName, rankData] of Object.entries(this.ranks)) {
      if (player.elo >= rankData.minElo && player.elo <= rankData.maxElo) {
        player.rank = rankName;

        // Calculate division (1-5 within rank)
        const rankRange = rankData.maxElo - rankData.minElo;
        const eloInRank = player.elo - rankData.minElo;
        player.division = Math.min(5, Math.floor(eloInRank / rankRange * 5) + 1);

        break;
      }
    }
  },

  // Get rank info
  getRankInfo(playerId) {
    const player = this.playerRankings[playerId];
    if (!player) return null;

    const rankData = this.ranks[player.rank];
    const nextRank = this.getNextRank(player.rank);

    return {
      rank: player.rank,
      rankName: rankData.name,
      division: player.division,
      elo: player.elo,
      color: rankData.color,
      icon: rankData.icon,
      nextRank: nextRank,
      eloToNextRank: nextRank ? nextRank.minElo - player.elo : 0,
      progressToNextRank: nextRank ?
      (player.elo - rankData.minElo) / (nextRank.minElo - rankData.minElo) * 100 :
      100
    };
  },

  getNextRank(currentRank) {
    const rankOrder = Object.keys(this.ranks);
    const currentIndex = rankOrder.indexOf(currentRank);

    if (currentIndex < rankOrder.length - 1) {
      const nextRankName = rankOrder[currentIndex + 1];
      return this.ranks[nextRankName];
    }

    return null;
  },

  // Update leaderboards
  updateLeaderboards() {
    const players = Object.entries(this.playerRankings).map(([id, data]) => ({
      playerId: id,
      ...data
    }));

    // Global leaderboard (by ELO)
    this.leaderboards.global = players.
    sort((a, b) => b.elo - a.elo).
    slice(0, 100);

    // Weekly leaderboard (by wins this week)
    this.leaderboards.weekly = players.
    sort((a, b) => b.seasonWins - a.seasonWins).
    slice(0, 100);

    // Monthly leaderboard
    this.leaderboards.monthly = players.
    sort((a, b) => {
      const aWinRate = a.wins / Math.max(1, a.wins + a.losses);
      const bWinRate = b.wins / Math.max(1, b.wins + b.losses);
      return bWinRate - aWinRate;
    }).
    slice(0, 100);
  },

  // Get leaderboard
  getLeaderboard(type = 'global', limit = 100) {
    return (this.leaderboards[type] || []).slice(0, limit);
  },

  // Get player rank on leaderboard
  getPlayerRank(playerId, type = 'global') {
    const leaderboard = this.leaderboards[type] || [];
    const index = leaderboard.findIndex((p) => p.playerId === playerId);
    return index >= 0 ? index + 1 : -1;
  },

  // Get player stats
  getPlayerStats(playerId) {
    const player = this.playerRankings[playerId];
    if (!player) return null;

    const totalGames = player.wins + player.losses;
    const winRate = totalGames > 0 ? player.wins / totalGames * 100 : 0;

    return {
      username: player.username,
      elo: player.elo,
      rank: player.rank,
      division: player.division,
      wins: player.wins,
      losses: player.losses,
      winRate: winRate.toFixed(1),
      winStreak: player.winStreak,
      bestWinStreak: player.bestWinStreak,
      peakElo: player.peakElo,
      globalRank: this.getPlayerRank(playerId, 'global'),
      matchHistory: player.matchHistory
    };
  },

  // Season reset
  resetSeason() {
    Object.values(this.playerRankings).forEach((player) => {
      // Soft reset: move ELO closer to 1500
      player.elo = Math.floor((player.elo + 1500) / 2);
      player.seasonWins = 0;
      player.seasonLosses = 0;
      this.updateRank(player.playerId);
    });

    this.updateLeaderboards();
  }
};

// Export
if (typeof window !== 'undefined') {
  window.RankingSystem = RankingSystem;
}