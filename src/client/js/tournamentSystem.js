/**
 * Tournament System for TheFortz
 * Competitive tournaments with brackets, prizes, and rankings
 */

const TournamentSystem = {
  // Active tournaments
  tournaments: {},

  // Tournament templates
  templates: {
    DAILY: {
      name: 'Daily Showdown',
      duration: 24 * 60 * 60 * 1000, // 24 hours
      maxPlayers: 32,
      entryFee: 100,
      prizePool: {
        1: { fortz: 1500, xp: 1000 },
        2: { fortz: 800, xp: 500 },
        3: { fortz: 400, xp: 250 },
        '4-8': { fortz: 200, xp: 100 }
      },
      format: 'single_elimination'
    },
    WEEKLY: {
      name: 'Weekly Championship',
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxPlayers: 64,
      entryFee: 500,
      prizePool: {
        1: { fortz: 10000, xp: 5000, item: 'tournament_winner_skin' },
        2: { fortz: 5000, xp: 2500 },
        3: { fortz: 2500, xp: 1000 },
        '4-8': { fortz: 1000, xp: 500 },
        '9-16': { fortz: 500, xp: 250 }
      },
      format: 'double_elimination'
    },
    SPECIAL: {
      name: 'Special Event',
      duration: 3 * 24 * 60 * 60 * 1000, // 3 days
      maxPlayers: 128,
      entryFee: 0, // Free entry
      prizePool: {
        1: { fortz: 20000, xp: 10000, item: 'special_event_legendary' },
        2: { fortz: 10000, xp: 5000, item: 'special_event_epic' },
        3: { fortz: 5000, xp: 2500, item: 'special_event_rare' },
        '4-8': { fortz: 2000, xp: 1000 },
        '9-16': { fortz: 1000, xp: 500 },
        '17-32': { fortz: 500, xp: 250 }
      },
      format: 'swiss'
    }
  },

  // Create tournament
  createTournament(templateName, customConfig = {}) {
    const template = this.templates[templateName];
    if (!template) return null;

    const tournament = {
      id: `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: customConfig.name || template.name,
      startTime: customConfig.startTime || Date.now(),
      endTime: customConfig.endTime || Date.now() + template.duration,
      maxPlayers: template.maxPlayers,
      entryFee: template.entryFee,
      prizePool: template.prizePool,
      format: template.format,
      status: 'registration', // registration, in_progress, completed
      participants: [],
      brackets: [],
      matches: [],
      results: {}
    };

    this.tournaments[tournament.id] = tournament;
    return tournament;
  },

  // Register player for tournament
  registerPlayer(tournamentId, playerId, playerName, playerElo) {
    const tournament = this.tournaments[tournamentId];
    if (!tournament) return { success: false, error: 'Tournament not found' };

    if (tournament.status !== 'registration') {
      return { success: false, error: 'Registration closed' };
    }

    if (tournament.participants.length >= tournament.maxPlayers) {
      return { success: false, error: 'Tournament full' };
    }

    if (tournament.participants.some((p) => p.playerId === playerId)) {
      return { success: false, error: 'Already registered' };
    }

    tournament.participants.push({
      playerId: playerId,
      playerName: playerName,
      elo: playerElo,
      seed: tournament.participants.length + 1,
      wins: 0,
      losses: 0,
      eliminated: false
    });

    return { success: true, tournament: tournament };
  },

  // Start tournament
  startTournament(tournamentId) {
    const tournament = this.tournaments[tournamentId];
    if (!tournament) return { success: false, error: 'Tournament not found' };

    if (tournament.status !== 'registration') {
      return { success: false, error: 'Tournament already started' };
    }

    if (tournament.participants.length < 4) {
      return { success: false, error: 'Not enough participants' };
    }

    tournament.status = 'in_progress';

    // Seed players by ELO
    tournament.participants.sort((a, b) => b.elo - a.elo);
    tournament.participants.forEach((p, i) => p.seed = i + 1);

    // Generate brackets
    switch (tournament.format) {
      case 'single_elimination':
        this.generateSingleEliminationBracket(tournament);
        break;
      case 'double_elimination':
        this.generateDoubleEliminationBracket(tournament);
        break;
      case 'swiss':
        this.generateSwissRounds(tournament);
        break;
    }

    return { success: true, tournament: tournament };
  },

  // Generate single elimination bracket
  generateSingleEliminationBracket(tournament) {
    const participants = tournament.participants;
    const rounds = Math.ceil(Math.log2(participants.length));

    tournament.brackets = [];

    // First round matchups
    for (let i = 0; i < participants.length; i += 2) {
      if (i + 1 < participants.length) {
        tournament.matches.push({
          id: `match_${tournament.matches.length}`,
          round: 1,
          player1: participants[i].playerId,
          player2: participants[i + 1].playerId,
          winner: null,
          status: 'pending'
        });
      }
    }
  },

  // Generate double elimination bracket
  generateDoubleEliminationBracket(tournament) {
    // Winners bracket
    this.generateSingleEliminationBracket(tournament);

    // Losers bracket will be populated as matches complete
    tournament.losersBracket = [];
  },

  // Generate Swiss rounds
  generateSwissRounds(tournament) {
    const rounds = Math.ceil(Math.log2(tournament.participants.length));
    tournament.swissRounds = rounds;
    tournament.currentRound = 1;

    // Generate first round pairings
    this.generateSwissPairings(tournament);
  },

  generateSwissPairings(tournament) {
    const participants = tournament.participants.
    filter((p) => !p.eliminated).
    sort((a, b) => {
      // Sort by wins, then by ELO
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.elo - a.elo;
    });

    // Pair players with similar records
    for (let i = 0; i < participants.length; i += 2) {
      if (i + 1 < participants.length) {
        tournament.matches.push({
          id: `match_${tournament.matches.length}`,
          round: tournament.currentRound,
          player1: participants[i].playerId,
          player2: participants[i + 1].playerId,
          winner: null,
          status: 'pending'
        });
      }
    }
  },

  // Report match result
  reportMatchResult(tournamentId, matchId, winnerId) {
    const tournament = this.tournaments[tournamentId];
    if (!tournament) return { success: false, error: 'Tournament not found' };

    const match = tournament.matches.find((m) => m.id === matchId);
    if (!match) return { success: false, error: 'Match not found' };

    if (match.status !== 'pending') {
      return { success: false, error: 'Match already completed' };
    }

    match.winner = winnerId;
    match.status = 'completed';

    const loserId = match.player1 === winnerId ? match.player2 : match.player1;

    // Update participant records
    const winner = tournament.participants.find((p) => p.playerId === winnerId);
    const loser = tournament.participants.find((p) => p.playerId === loserId);

    if (winner) winner.wins++;
    if (loser) loser.losses++;

    // Handle elimination based on format
    if (tournament.format === 'single_elimination') {
      if (loser) loser.eliminated = true;
    } else if (tournament.format === 'double_elimination') {
      if (loser && loser.losses >= 2) {
        loser.eliminated = true;
      }
    }

    // Check if tournament is complete
    this.checkTournamentComplete(tournament);

    return { success: true, match: match };
  },

  // Check if tournament is complete
  checkTournamentComplete(tournament) {
    const activePlayers = tournament.participants.filter((p) => !p.eliminated);

    if (activePlayers.length === 1) {
      tournament.status = 'completed';
      this.distributePrizes(tournament);
    } else if (tournament.format === 'swiss') {
      // Check if all rounds complete
      const currentRoundMatches = tournament.matches.filter((m) => m.round === tournament.currentRound);
      const allComplete = currentRoundMatches.every((m) => m.status === 'completed');

      if (allComplete && tournament.currentRound < tournament.swissRounds) {
        tournament.currentRound++;
        this.generateSwissPairings(tournament);
      } else if (allComplete) {
        tournament.status = 'completed';
        this.distributePrizes(tournament);
      }
    }
  },

  // Distribute prizes
  distributePrizes(tournament) {
    // Sort by wins, then ELO
    const rankings = tournament.participants.
    sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.elo - a.elo;
    });

    rankings.forEach((player, index) => {
      const placement = index + 1;
      const prize = this.getPrizeForPlacement(tournament.prizePool, placement);

      tournament.results[player.playerId] = {
        placement: placement,
        prize: prize,
        wins: player.wins,
        losses: player.losses
      };
    });
  },

  getPrizeForPlacement(prizePool, placement) {
    // Check exact placement
    if (prizePool[placement]) {
      return prizePool[placement];
    }

    // Check range placements
    for (const [range, prize] of Object.entries(prizePool)) {
      if (range.includes('-')) {
        const [min, max] = range.split('-').map(Number);
        if (placement >= min && placement <= max) {
          return prize;
        }
      }
    }

    return null;
  },

  // Get tournament leaderboard
  getLeaderboard(tournamentId) {
    const tournament = this.tournaments[tournamentId];
    if (!tournament) return null;

    return tournament.participants.
    sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.elo - a.elo;
    }).
    map((p, index) => ({
      placement: index + 1,
      ...p
    }));
  },

  // Get active tournaments
  getActiveTournaments() {
    return Object.values(this.tournaments).filter((t) =>
    t.status === 'registration' || t.status === 'in_progress'
    );
  },

  // Get player's tournaments
  getPlayerTournaments(playerId) {
    return Object.values(this.tournaments).filter((t) =>
    t.participants.some((p) => p.playerId === playerId)
    );
  }
};

// Export
if (typeof window !== 'undefined') {
  window.TournamentSystem = TournamentSystem;
}