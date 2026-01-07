// Tournament System - Competitive tournaments with brackets, rankings, and rewards
class TournamentSystem {
  constructor() {
    this.tournaments = new Map();
    this.playerStats = new Map();
    this.leaderboards = new Map();
    this.seasonData = null;

    this.settings = {
      enableTournaments: true,
      maxTournamentSize: 64,
      minTournamentSize: 4,
      registrationTime: 300000, // 5 minutes
      matchTimeout: 600000, // 10 minutes
      seasonDuration: 2592000000, // 30 days
      enableSeasons: true
    };

    this.tournamentTypes = {
      single_elimination: {
        name: 'Single Elimination',
        description: 'One loss and you\'re out',
        icon: '🏆',
        minPlayers: 4,
        maxPlayers: 64,
        rounds: (players) => Math.ceil(Math.log2(players)),
        advancement: 'winner_only'
      },

      double_elimination: {
        name: 'Double Elimination',
        description: 'Two chances to prove yourself',
        icon: '⚔️',
        minPlayers: 4,
        maxPlayers: 32,
        rounds: (players) => Math.ceil(Math.log2(players)) * 2 - 1,
        advancement: 'losers_bracket'
      },

      round_robin: {
        name: 'Round Robin',
        description: 'Everyone plays everyone',
        icon: '🔄',
        minPlayers: 3,
        maxPlayers: 16,
        rounds: (players) => players - 1,
        advancement: 'points_based'
      },

      swiss: {
        name: 'Swiss System',
        description: 'Skill-based matchmaking',
        icon: '⚖️',
        minPlayers: 8,
        maxPlayers: 64,
        rounds: (players) => Math.ceil(Math.log2(players)) + 1,
        advancement: 'points_based'
      },

      battle_royale: {
        name: 'Battle Royale',
        description: 'Last tank standing wins',
        icon: '💀',
        minPlayers: 8,
        maxPlayers: 100,
        rounds: 1,
        advancement: 'survival'
      }
    };

    this.rewardTiers = {
      champion: {
        name: 'Champion',
        position: 1,
        rewards: {
          fortz: 1000,
          xp: 500,
          title: 'Tournament Champion',
          badge: '👑',
          unlocks: ['golden_tank_skin', 'champion_trail']
        }
      },

      runner_up: {
        name: 'Runner-up',
        position: 2,
        rewards: {
          fortz: 500,
          xp: 300,
          title: 'Tournament Finalist',
          badge: '🥈',
          unlocks: ['silver_tank_skin']
        }
      },

      semi_finalist: {
        name: 'Semi-finalist',
        positions: [3, 4],
        rewards: {
          fortz: 250,
          xp: 200,
          title: 'Semi-finalist',
          badge: '🥉',
          unlocks: ['bronze_tank_skin']
        }
      },

      quarter_finalist: {
        name: 'Quarter-finalist',
        positions: [5, 6, 7, 8],
        rewards: {
          fortz: 100,
          xp: 100,
          badge: '🏅'
        }
      },

      participant: {
        name: 'Participant',
        rewards: {
          fortz: 25,
          xp: 50,
          badge: '🎖️'
        }
      }
    };

    this.initialize();
  }

  initialize() {
    this.loadPlayerStats();
    this.loadSeasonData();
    this.scheduleAutomaticTournaments();

    console.log('🏆 Tournament System initialized');
  }

  loadPlayerStats() {
    try {
      const saved = localStorage.getItem('thefortz.tournamentStats');
      if (saved) {
        const data = JSON.parse(saved);
        this.playerStats = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load tournament stats:', error);
    }
  }

  savePlayerStats() {
    try {
      const data = Object.fromEntries(this.playerStats);
      localStorage.setItem('thefortz.tournamentStats', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save tournament stats:', error);
    }
  }

  loadSeasonData() {
    try {
      const saved = localStorage.getItem('thefortz.seasonData');
      if (saved) {
        this.seasonData = JSON.parse(saved);

        // Check if season expired
        if (Date.now() - this.seasonData.startTime > this.settings.seasonDuration) {
          this.endSeason();
          this.startNewSeason();
        }
      } else {
        this.startNewSeason();
      }
    } catch (error) {
      console.warn('Failed to load season data:', error);
      this.startNewSeason();
    }
  }

  saveSeasonData() {
    try {
      localStorage.setItem('thefortz.seasonData', JSON.stringify(this.seasonData));
    } catch (error) {
      console.warn('Failed to save season data:', error);
    }
  }

  startNewSeason() {
    this.seasonData = {
      id: `season_${Date.now()}`,
      name: `Season ${this.getSeasonNumber()}`,
      startTime: Date.now(),
      endTime: Date.now() + this.settings.seasonDuration,
      tournaments: [],
      leaderboard: new Map(),
      rewards: this.generateSeasonRewards()
    };

    this.saveSeasonData();

    if (typeof showNotification === 'function') {
      showNotification(`🎉 ${this.seasonData.name} has begun!`, '#FFD700', 5000);
    }

    console.log(`🎊 Started ${this.seasonData.name}`);
  }

  endSeason() {
    if (!this.seasonData) return;

    // Calculate final rankings
    const finalRankings = this.calculateSeasonRankings();

    // Distribute season rewards
    this.distributeSeasonRewards(finalRankings);

    // Archive season data
    this.archiveSeasonData();

    if (typeof showNotification === 'function') {
      showNotification(`🏁 ${this.seasonData.name} has ended!`, '#FFD700', 5000);
    }

    console.log(`🏁 Ended ${this.seasonData.name}`);
  }

  getSeasonNumber() {
    try {
      const archived = localStorage.getItem('thefortz.archivedSeasons');
      if (archived) {
        const seasons = JSON.parse(archived);
        return seasons.length + 1;
      }
    } catch (error) {
      console.warn('Failed to get season number:', error);
    }
    return 1;
  }

  generateSeasonRewards() {
    return {
      rank_1: {
        fortz: 5000,
        xp: 2000,
        title: 'Season Champion',
        badge: '👑',
        unlocks: ['legendary_tank_skin', 'season_trail']
      },
      rank_2_5: {
        fortz: 2500,
        xp: 1000,
        title: 'Season Elite',
        badge: '💎',
        unlocks: ['elite_tank_skin']
      },
      rank_6_20: {
        fortz: 1000,
        xp: 500,
        title: 'Season Veteran',
        badge: '⭐',
        unlocks: ['veteran_tank_skin']
      },
      top_100: {
        fortz: 500,
        xp: 250,
        badge: '🏅'
      }
    };
  }

  scheduleAutomaticTournaments() {
    // Schedule daily tournaments
    const scheduleDaily = () => {
      setTimeout(() => {
        this.createAutomaticTournament('daily');
        scheduleDaily(); // Schedule next day
      }, 86400000); // 24 hours
    };

    // Schedule weekly tournaments
    const scheduleWeekly = () => {
      setTimeout(() => {
        this.createAutomaticTournament('weekly');
        scheduleWeekly(); // Schedule next week
      }, 604800000); // 7 days
    };

    scheduleDaily();
    scheduleWeekly();
  }

  createAutomaticTournament(type) {
    const config = {
      daily: {
        name: 'Daily Championship',
        type: 'single_elimination',
        maxPlayers: 32,
        entryFee: 50,
        prizePool: 2000
      },
      weekly: {
        name: 'Weekly Grand Tournament',
        type: 'double_elimination',
        maxPlayers: 64,
        entryFee: 100,
        prizePool: 10000
      }
    };

    const tournamentConfig = config[type];
    if (tournamentConfig) {
      this.createTournament(tournamentConfig);
    }
  }

  createTournament(config) {
    const tournament = {
      id: `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name || 'Tournament',
      type: config.type || 'single_elimination',
      status: 'registration', // registration, in_progress, completed, cancelled

      // Configuration
      maxPlayers: config.maxPlayers || 16,
      minPlayers: config.minPlayers || 4,
      entryFee: config.entryFee || 0,
      prizePool: config.prizePool || 0,

      // Timing
      createdTime: Date.now(),
      registrationEndTime: Date.now() + this.settings.registrationTime,
      startTime: null,
      endTime: null,

      // Participants
      players: new Map(),
      bracket: null,
      currentRound: 0,
      matches: new Map(),

      // Results
      rankings: [],
      rewards: new Map(),

      // Settings
      settings: {
        allowSpectators: true,
        broadcastMatches: true,
        recordReplays: true
      }
    };

    this.tournaments.set(tournament.id, tournament);

    // Announce tournament
    this.announceTournament(tournament);

    // Schedule tournament start
    setTimeout(() => {
      this.startTournament(tournament.id);
    }, this.settings.registrationTime);

    return tournament;
  }

  registerPlayer(tournamentId, playerId, playerData) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return { success: false, error: 'Tournament not found' };

    if (tournament.status !== 'registration') {
      return { success: false, error: 'Registration is closed' };
    }

    if (tournament.players.size >= tournament.maxPlayers) {
      return { success: false, error: 'Tournament is full' };
    }

    if (tournament.players.has(playerId)) {
      return { success: false, error: 'Already registered' };
    }

    // Check entry fee
    if (tournament.entryFee > 0) {
      const playerStats = this.getPlayerStats(playerId);
      if (playerStats.fortz < tournament.entryFee) {
        return { success: false, error: 'Insufficient Fortz' };
      }

      // Deduct entry fee
      playerStats.fortz -= tournament.entryFee;
      tournament.prizePool += tournament.entryFee;
    }

    // Register player
    tournament.players.set(playerId, {
      id: playerId,
      name: playerData.name || playerId,
      rating: playerData.rating || 1000,
      registrationTime: Date.now(),
      status: 'registered', // registered, active, eliminated, winner
      matches: [],
      wins: 0,
      losses: 0,
      points: 0
    });

    this.savePlayerStats();

    if (typeof showNotification === 'function') {
      showNotification(
        `Registered for ${tournament.name}!`,
        '#00ff00',
        3000
      );
    }

    console.log(`🎯 ${playerId} registered for ${tournament.name}`);

    return { success: true };
  }

  unregisterPlayer(tournamentId, playerId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return { success: false, error: 'Tournament not found' };

    if (tournament.status !== 'registration') {
      return { success: false, error: 'Cannot unregister after registration closes' };
    }

    const player = tournament.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Not registered' };
    }

    // Refund entry fee
    if (tournament.entryFee > 0) {
      const playerStats = this.getPlayerStats(playerId);
      playerStats.fortz += tournament.entryFee;
      tournament.prizePool -= tournament.entryFee;
      this.savePlayerStats();
    }

    tournament.players.delete(playerId);

    console.log(`❌ ${playerId} unregistered from ${tournament.name}`);

    return { success: true };
  }

  startTournament(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    if (tournament.players.size < tournament.minPlayers) {
      this.cancelTournament(tournamentId, 'Not enough players');
      return;
    }

    tournament.status = 'in_progress';
    tournament.startTime = Date.now();

    // Generate bracket
    tournament.bracket = this.generateBracket(tournament);

    // Start first round
    this.startRound(tournament);

    this.announceTournamentStart(tournament);

    console.log(`🚀 Started ${tournament.name} with ${tournament.players.size} players`);
  }

  generateBracket(tournament) {
    const players = Array.from(tournament.players.values());
    const tournamentType = this.tournamentTypes[tournament.type];

    switch (tournament.type) {
      case 'single_elimination':
        return this.generateSingleEliminationBracket(players);
      case 'double_elimination':
        return this.generateDoubleEliminationBracket(players);
      case 'round_robin':
        return this.generateRoundRobinBracket(players);
      case 'swiss':
        return this.generateSwissBracket(players);
      case 'battle_royale':
        return this.generateBattleRoyaleBracket(players);
      default:
        return this.generateSingleEliminationBracket(players);
    }
  }

  generateSingleEliminationBracket(players) {
    // Shuffle and seed players
    const seededPlayers = this.seedPlayers(players);
    const bracket = {
      type: 'single_elimination',
      rounds: [],
      totalRounds: Math.ceil(Math.log2(seededPlayers.length))
    };

    // Create first round matches
    const firstRound = [];
    for (let i = 0; i < seededPlayers.length; i += 2) {
      const player1 = seededPlayers[i];
      const player2 = seededPlayers[i + 1] || null; // Bye if odd number

      firstRound.push({
        id: `match_${i / 2}_round_0`,
        round: 0,
        player1: player1,
        player2: player2,
        winner: player2 ? null : player1, // Auto-win if bye
        status: player2 ? 'pending' : 'completed'
      });
    }

    bracket.rounds.push(firstRound);

    // Generate subsequent rounds
    for (let round = 1; round < bracket.totalRounds; round++) {
      const roundMatches = [];
      const prevRoundSize = bracket.rounds[round - 1].length;

      for (let i = 0; i < prevRoundSize; i += 2) {
        roundMatches.push({
          id: `match_${i / 2}_round_${round}`,
          round: round,
          player1: null, // Will be filled by previous round winners
          player2: null,
          winner: null,
          status: 'waiting'
        });
      }

      bracket.rounds.push(roundMatches);
    }

    return bracket;
  }

  generateDoubleEliminationBracket(players) {
    // More complex bracket with winners and losers brackets
    const seededPlayers = this.seedPlayers(players);

    return {
      type: 'double_elimination',
      winnersBracket: this.generateSingleEliminationBracket(seededPlayers),
      losersBracket: {
        rounds: [],
        totalRounds: Math.ceil(Math.log2(seededPlayers.length)) * 2 - 1
      },
      grandFinal: null
    };
  }

  generateRoundRobinBracket(players) {
    const matches = [];

    // Generate all possible matches
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          id: `match_${i}_${j}`,
          round: 0, // All matches are in the same "round"
          player1: players[i],
          player2: players[j],
          winner: null,
          status: 'pending'
        });
      }
    }

    return {
      type: 'round_robin',
      matches: matches,
      standings: players.map((p) => ({ ...p, points: 0, wins: 0, losses: 0 }))
    };
  }

  generateSwissBracket(players) {
    return {
      type: 'swiss',
      rounds: [],
      totalRounds: Math.ceil(Math.log2(players.length)) + 1,
      standings: players.map((p) => ({ ...p, points: 0, wins: 0, losses: 0, opponents: [] }))
    };
  }

  generateBattleRoyaleBracket(players) {
    return {
      type: 'battle_royale',
      match: {
        id: 'battle_royale_final',
        players: players,
        status: 'pending',
        eliminations: [],
        winner: null
      }
    };
  }

  seedPlayers(players) {
    // Sort by rating (highest first) and add some randomization
    return players.
    sort((a, b) => b.rating - a.rating).
    map((player, index) => ({ ...player, seed: index + 1 }));
  }

  startRound(tournament) {
    const bracket = tournament.bracket;

    switch (tournament.type) {
      case 'single_elimination':
        this.startSingleEliminationRound(tournament);
        break;
      case 'double_elimination':
        this.startDoubleEliminationRound(tournament);
        break;
      case 'round_robin':
        this.startRoundRobinMatches(tournament);
        break;
      case 'swiss':
        this.startSwissRound(tournament);
        break;
      case 'battle_royale':
        this.startBattleRoyaleMatch(tournament);
        break;
    }
  }

  startSingleEliminationRound(tournament) {
    const currentRound = tournament.bracket.rounds[tournament.currentRound];

    currentRound.forEach((match) => {
      if (match.status === 'pending') {
        this.startMatch(tournament.id, match.id);
      }
    });
  }

  startMatch(tournamentId, matchId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const match = this.findMatch(tournament, matchId);
    if (!match || !match.player1 || !match.player2) return;

    match.status = 'in_progress';
    match.startTime = Date.now();

    // Create game instance for this match
    const gameConfig = {
      mode: 'tournament',
      tournamentId: tournamentId,
      matchId: matchId,
      players: [match.player1.id, match.player2.id],
      spectators: tournament.settings.allowSpectators,
      broadcast: tournament.settings.broadcastMatches,
      record: tournament.settings.recordReplays
    };

    // Start the actual game
    this.startTournamentGame(gameConfig);

    console.log(`⚔️ Started match: ${match.player1.name} vs ${match.player2.name}`);
  }

  startTournamentGame(config) {
    // This would integrate with the main game system
    // For now, we'll simulate the match
    setTimeout(() => {
      this.simulateMatchResult(config.tournamentId, config.matchId);
    }, 30000 + Math.random() * 60000); // 30-90 seconds
  }

  simulateMatchResult(tournamentId, matchId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const match = this.findMatch(tournament, matchId);
    if (!match) return;

    // Simulate result based on player ratings
    const player1Rating = match.player1.rating;
    const player2Rating = match.player2.rating;

    const ratingDiff = player1Rating - player2Rating;
    const player1WinChance = 1 / (1 + Math.pow(10, -ratingDiff / 400));

    const winner = Math.random() < player1WinChance ? match.player1 : match.player2;
    const loser = winner === match.player1 ? match.player2 : match.player1;

    this.recordMatchResult(tournamentId, matchId, winner, loser);
  }

  recordMatchResult(tournamentId, matchId, winner, loser) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const match = this.findMatch(tournament, matchId);
    if (!match) return;

    match.winner = winner;
    match.loser = loser;
    match.status = 'completed';
    match.endTime = Date.now();

    // Update player stats
    const winnerData = tournament.players.get(winner.id);
    const loserData = tournament.players.get(loser.id);

    if (winnerData) {
      winnerData.wins++;
      winnerData.matches.push(matchId);
    }

    if (loserData) {
      loserData.losses++;
      loserData.matches.push(matchId);

      // Eliminate in single elimination
      if (tournament.type === 'single_elimination') {
        loserData.status = 'eliminated';
      }
    }

    // Update ratings
    this.updatePlayerRatings(winner, loser);

    // Advance bracket
    this.advanceBracket(tournament, match);

    // Check if round/tournament is complete
    this.checkRoundCompletion(tournament);

    console.log(`🏆 Match result: ${winner.name} defeated ${loser.name}`);
  }

  updatePlayerRatings(winner, loser) {
    const K = 32; // K-factor for rating calculation

    const winnerRating = winner.rating;
    const loserRating = loser.rating;

    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

    winner.rating = Math.round(winnerRating + K * (1 - expectedWinner));
    loser.rating = Math.round(loserRating + K * (0 - expectedLoser));

    // Update persistent stats
    const winnerStats = this.getPlayerStats(winner.id);
    const loserStats = this.getPlayerStats(loser.id);

    winnerStats.rating = winner.rating;
    winnerStats.wins++;
    winnerStats.totalMatches++;

    loserStats.rating = loser.rating;
    loserStats.losses++;
    loserStats.totalMatches++;

    this.savePlayerStats();
  }

  advanceBracket(tournament, completedMatch) {
    switch (tournament.type) {
      case 'single_elimination':
        this.advanceSingleElimination(tournament, completedMatch);
        break;
      case 'double_elimination':
        this.advanceDoubleElimination(tournament, completedMatch);
        break;
      case 'round_robin':
        this.updateRoundRobinStandings(tournament, completedMatch);
        break;
      case 'swiss':
        this.updateSwissStandings(tournament, completedMatch);
        break;
    }
  }

  advanceSingleElimination(tournament, completedMatch) {
    const nextRound = tournament.currentRound + 1;
    if (nextRound >= tournament.bracket.rounds.length) return;

    const nextRoundMatches = tournament.bracket.rounds[nextRound];
    const matchIndex = Math.floor(completedMatch.round === tournament.currentRound ?
    tournament.bracket.rounds[tournament.currentRound].indexOf(completedMatch) / 2 : 0);

    const nextMatch = nextRoundMatches[matchIndex];
    if (nextMatch) {
      if (!nextMatch.player1) {
        nextMatch.player1 = completedMatch.winner;
      } else if (!nextMatch.player2) {
        nextMatch.player2 = completedMatch.winner;
        nextMatch.status = 'pending';
      }
    }
  }

  checkRoundCompletion(tournament) {
    switch (tournament.type) {
      case 'single_elimination':
        this.checkSingleEliminationRound(tournament);
        break;
      case 'round_robin':
        this.checkRoundRobinCompletion(tournament);
        break;
      case 'swiss':
        this.checkSwissRoundCompletion(tournament);
        break;
      case 'battle_royale':
        this.checkBattleRoyaleCompletion(tournament);
        break;
    }
  }

  checkSingleEliminationRound(tournament) {
    const currentRound = tournament.bracket.rounds[tournament.currentRound];
    const allCompleted = currentRound.every((match) => match.status === 'completed');

    if (allCompleted) {
      tournament.currentRound++;

      if (tournament.currentRound >= tournament.bracket.rounds.length) {
        // Tournament complete
        this.completeTournament(tournament.id);
      } else {
        // Start next round
        this.startRound(tournament);
      }
    }
  }

  completeTournament(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    tournament.status = 'completed';
    tournament.endTime = Date.now();

    // Calculate final rankings
    tournament.rankings = this.calculateTournamentRankings(tournament);

    // Distribute rewards
    this.distributeTournamentRewards(tournament);

    // Update season standings
    this.updateSeasonStandings(tournament);

    // Announce results
    this.announceTournamentResults(tournament);

    console.log(`🎉 Tournament ${tournament.name} completed!`);
  }

  calculateTournamentRankings(tournament) {
    const players = Array.from(tournament.players.values());

    switch (tournament.type) {
      case 'single_elimination':
        return this.calculateSingleEliminationRankings(tournament, players);
      case 'round_robin':
        return this.calculateRoundRobinRankings(tournament, players);
      case 'swiss':
        return this.calculateSwissRankings(tournament, players);
      default:
        return players.sort((a, b) => b.wins - a.wins);
    }
  }

  calculateSingleEliminationRankings(tournament, players) {
    const rankings = [];

    // Find winner (player who won the final)
    const finalRound = tournament.bracket.rounds[tournament.bracket.rounds.length - 1];
    const finalMatch = finalRound[0];

    if (finalMatch && finalMatch.winner) {
      rankings.push({ ...finalMatch.winner, position: 1 });
      rankings.push({ ...finalMatch.loser, position: 2 });
    }

    // Add other players based on elimination round
    const otherPlayers = players.filter((p) =>
    !rankings.some((r) => r.id === p.id)
    );

    otherPlayers.sort((a, b) => {
      // Sort by round eliminated (later = better), then by wins
      const aElimRound = this.getEliminationRound(tournament, a);
      const bElimRound = this.getEliminationRound(tournament, b);

      if (aElimRound !== bElimRound) {
        return bElimRound - aElimRound;
      }

      return b.wins - a.wins;
    });

    otherPlayers.forEach((player, index) => {
      rankings.push({ ...player, position: rankings.length + 1 });
    });

    return rankings;
  }

  getEliminationRound(tournament, player) {
    // Find the round where this player was eliminated
    for (let round = 0; round < tournament.bracket.rounds.length; round++) {
      const roundMatches = tournament.bracket.rounds[round];
      for (const match of roundMatches) {
        if (match.loser && match.loser.id === player.id) {
          return round;
        }
      }
    }
    return -1; // Not eliminated (winner)
  }

  distributeTournamentRewards(tournament) {
    const rankings = tournament.rankings;
    const totalPrize = tournament.prizePool;

    rankings.forEach((player, index) => {
      const position = player.position;
      let reward = this.calculateReward(position, totalPrize, rankings.length);

      // Apply reward multipliers based on tier
      const tier = this.getRewardTier(position);
      if (tier) {
        reward = { ...reward, ...tier.rewards };
      }

      // Give rewards to player
      this.giveRewardsToPlayer(player.id, reward);

      tournament.rewards.set(player.id, reward);
    });
  }

  calculateReward(position, totalPrize, totalPlayers) {
    const baseReward = { fortz: 0, xp: 0 };

    if (totalPrize > 0) {
      // Prize distribution: 50% to winner, 30% to 2nd, 20% split among rest
      switch (position) {
        case 1:
          baseReward.fortz = Math.floor(totalPrize * 0.5);
          break;
        case 2:
          baseReward.fortz = Math.floor(totalPrize * 0.3);
          break;
        default:
          const remainingPrize = totalPrize * 0.2;
          const remainingPlayers = Math.max(1, totalPlayers - 2);
          baseReward.fortz = Math.floor(remainingPrize / remainingPlayers);
      }
    }

    // XP based on performance
    baseReward.xp = Math.max(50, 200 - (position - 1) * 10);

    return baseReward;
  }

  getRewardTier(position) {
    for (const [tierName, tier] of Object.entries(this.rewardTiers)) {
      if (tier.position === position ||
      tier.positions && tier.positions.includes(position)) {
        return tier;
      }
    }
    return this.rewardTiers.participant;
  }

  giveRewardsToPlayer(playerId, reward) {
    const playerStats = this.getPlayerStats(playerId);

    playerStats.fortz += reward.fortz || 0;
    playerStats.xp += reward.xp || 0;

    if (reward.title) {
      if (!playerStats.titles) playerStats.titles = [];
      if (!playerStats.titles.includes(reward.title)) {
        playerStats.titles.push(reward.title);
      }
    }

    if (reward.badge) {
      if (!playerStats.badges) playerStats.badges = [];
      if (!playerStats.badges.includes(reward.badge)) {
        playerStats.badges.push(reward.badge);
      }
    }

    if (reward.unlocks) {
      if (!playerStats.unlocks) playerStats.unlocks = [];
      reward.unlocks.forEach((unlock) => {
        if (!playerStats.unlocks.includes(unlock)) {
          playerStats.unlocks.push(unlock);
        }
      });
    }

    this.savePlayerStats();
  }

  updateSeasonStandings(tournament) {
    if (!this.settings.enableSeasons || !this.seasonData) return;

    tournament.rankings.forEach((player) => {
      const seasonPoints = this.calculateSeasonPoints(player.position, tournament.players.size);

      if (!this.seasonData.leaderboard.has(player.id)) {
        this.seasonData.leaderboard.set(player.id, {
          id: player.id,
          name: player.name,
          points: 0,
          tournaments: 0,
          wins: 0,
          bestFinish: 999
        });
      }

      const seasonPlayer = this.seasonData.leaderboard.get(player.id);
      seasonPlayer.points += seasonPoints;
      seasonPlayer.tournaments++;

      if (player.position === 1) {
        seasonPlayer.wins++;
      }

      if (player.position < seasonPlayer.bestFinish) {
        seasonPlayer.bestFinish = player.position;
      }
    });

    this.seasonData.tournaments.push(tournament.id);
    this.saveSeasonData();
  }

  calculateSeasonPoints(position, totalPlayers) {
    // Points based on placement and tournament size
    const basePoints = Math.max(1, totalPlayers - position + 1);
    const sizeMultiplier = Math.log2(totalPlayers);

    return Math.floor(basePoints * sizeMultiplier);
  }

  getPlayerStats(playerId) {
    if (!this.playerStats.has(playerId)) {
      this.playerStats.set(playerId, {
        id: playerId,
        rating: 1000,
        fortz: 1000,
        xp: 0,
        level: 1,
        wins: 0,
        losses: 0,
        totalMatches: 0,
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        titles: [],
        badges: [],
        unlocks: [],
        seasonPoints: 0
      });
    }

    return this.playerStats.get(playerId);
  }

  findMatch(tournament, matchId) {
    // Search through all bracket structures
    switch (tournament.type) {
      case 'single_elimination':
        for (const round of tournament.bracket.rounds) {
          const match = round.find((m) => m.id === matchId);
          if (match) return match;
        }
        break;
      case 'round_robin':
        return tournament.bracket.matches.find((m) => m.id === matchId);
      case 'battle_royale':
        if (tournament.bracket.match.id === matchId) {
          return tournament.bracket.match;
        }
        break;
    }

    return null;
  }

  // Announcement functions
  announceTournament(tournament) {
    if (typeof showNotification === 'function') {
      showNotification(
        `🏆 ${tournament.name} registration is open!`,
        '#FFD700',
        5000
      );
    }

    console.log(`📢 Announced tournament: ${tournament.name}`);
  }

  announceTournamentStart(tournament) {
    if (typeof showNotification === 'function') {
      showNotification(
        `🚀 ${tournament.name} has started!`,
        '#00ff00',
        3000
      );
    }
  }

  announceTournamentResults(tournament) {
    if (tournament.rankings.length > 0) {
      const winner = tournament.rankings[0];

      if (typeof showNotification === 'function') {
        showNotification(
          `🎉 ${winner.name} won ${tournament.name}!`,
          '#FFD700',
          5000
        );
      }
    }
  }

  cancelTournament(tournamentId, reason) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    tournament.status = 'cancelled';
    tournament.endTime = Date.now();

    // Refund entry fees
    tournament.players.forEach((player) => {
      if (tournament.entryFee > 0) {
        const playerStats = this.getPlayerStats(player.id);
        playerStats.fortz += tournament.entryFee;
      }
    });

    this.savePlayerStats();

    if (typeof showNotification === 'function') {
      showNotification(
        `❌ ${tournament.name} cancelled: ${reason}`,
        '#ff4444',
        5000
      );
    }

    console.log(`❌ Cancelled tournament: ${tournament.name} - ${reason}`);
  }

  // Public API
  getTournament(id) {
    return this.tournaments.get(id);
  }

  getAllTournaments() {
    return Array.from(this.tournaments.values());
  }

  getActiveTournaments() {
    return Array.from(this.tournaments.values()).
    filter((t) => t.status === 'registration' || t.status === 'in_progress');
  }

  getPlayerTournaments(playerId) {
    return Array.from(this.tournaments.values()).
    filter((t) => t.players.has(playerId));
  }

  getLeaderboard(type = 'rating', limit = 100) {
    const players = Array.from(this.playerStats.values());

    switch (type) {
      case 'rating':
        players.sort((a, b) => b.rating - a.rating);
        break;
      case 'wins':
        players.sort((a, b) => b.wins - a.wins);
        break;
      case 'tournaments':
        players.sort((a, b) => b.tournamentsWon - a.tournamentsWon);
        break;
      case 'season':
        if (this.seasonData) {
          return Array.from(this.seasonData.leaderboard.values()).
          sort((a, b) => b.points - a.points).
          slice(0, limit);
        }
        break;
    }

    return players.slice(0, limit);
  }

  getSeasonData() {
    return this.seasonData;
  }

  // Cleanup
  cleanup() {
    this.tournaments.clear();
    this.savePlayerStats();
    this.saveSeasonData();
  }
}

// Global instance
window.TournamentSystem = new TournamentSystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TournamentSystem;
}