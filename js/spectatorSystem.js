/**
 * Spectator Mode System for TheFortz
 * Watch live matches with advanced camera controls
 */

const SpectatorSystem = {
  // Spectator state
  spectatorMode: false,
  targetPlayer: null,
  cameraMode: 'follow', // follow, free, overview, auto

  // Auto-director settings
  autoDirector: {
    enabled: false,
    focusOnAction: true,
    switchDelay: 5000,
    lastSwitch: 0,
    priorityPlayers: []
  },

  // Camera modes
  cameraModes: {
    FOLLOW: {
      name: 'Follow Player',
      description: 'Follow a specific player',
      smoothing: 0.1,
      zoom: 1.0
    },
    FREE: {
      name: 'Free Camera',
      description: 'Freely move the camera',
      smoothing: 0.05,
      zoom: 1.0
    },
    OVERVIEW: {
      name: 'Overview',
      description: 'View the entire map',
      smoothing: 0.05,
      zoom: 0.3
    },
    AUTO: {
      name: 'Auto Director',
      description: 'Automatically follow the action',
      smoothing: 0.08,
      zoom: 1.0
    }
  },

  // UI overlays
  overlays: {
    playerInfo: true,
    scoreboard: true,
    minimap: true,
    killFeed: true,
    stats: true
  },

  // Enable spectator mode
  enableSpectatorMode(gameState) {
    this.spectatorMode = true;

    // Select first player to follow
    const players = Object.keys(gameState.players);
    if (players.length > 0) {
      this.targetPlayer = players[0];
    }

    return {
      success: true,
      mode: this.cameraMode,
      targetPlayer: this.targetPlayer
    };
  },

  // Disable spectator mode
  disableSpectatorMode() {
    this.spectatorMode = false;
    this.targetPlayer = null;
    this.autoDirector.enabled = false;
  },

  // Switch camera mode
  setCameraMode(mode) {
    if (!this.cameraModes[mode.toUpperCase()]) {
      return { success: false, error: 'Invalid camera mode' };
    }

    this.cameraMode = mode.toLowerCase();

    // Enable auto-director if AUTO mode
    if (this.cameraMode === 'auto') {
      this.autoDirector.enabled = true;
    } else {
      this.autoDirector.enabled = false;
    }

    return {
      success: true,
      mode: this.cameraMode
    };
  },

  // Switch to next player
  nextPlayer(gameState) {
    const players = Object.keys(gameState.players);
    if (players.length === 0) return;

    const currentIndex = players.indexOf(this.targetPlayer);
    const nextIndex = (currentIndex + 1) % players.length;
    this.targetPlayer = players[nextIndex];

    return this.targetPlayer;
  },

  // Switch to previous player
  previousPlayer(gameState) {
    const players = Object.keys(gameState.players);
    if (players.length === 0) return;

    const currentIndex = players.indexOf(this.targetPlayer);
    const prevIndex = (currentIndex - 1 + players.length) % players.length;
    this.targetPlayer = players[prevIndex];

    return this.targetPlayer;
  },

  // Select specific player
  selectPlayer(playerId, gameState) {
    if (!gameState.players[playerId]) {
      return { success: false, error: 'Player not found' };
    }

    this.targetPlayer = playerId;
    return { success: true, playerId: playerId };
  },

  // Update auto-director
  updateAutoDirector(gameState, deltaTime) {
    if (!this.autoDirector.enabled) return;

    const now = Date.now();

    // Check if it's time to switch
    if (now - this.autoDirector.lastSwitch < this.autoDirector.switchDelay) {
      return;
    }

    // Find most interesting player
    const interestingPlayer = this.findMostInterestingPlayer(gameState);

    if (interestingPlayer && interestingPlayer !== this.targetPlayer) {
      this.targetPlayer = interestingPlayer;
      this.autoDirector.lastSwitch = now;
    }
  },

  // Find most interesting player
  findMostInterestingPlayer(gameState) {
    let maxScore = -1;
    let bestPlayer = null;

    Object.entries(gameState.players).forEach(([playerId, player]) => {
      let interestScore = 0;

      // Recent kills
      if (player.lastKillTime && Date.now() - player.lastKillTime < 3000) {
        interestScore += 100;
      }

      // Low health (intense moments)
      if (player.health < 30) {
        interestScore += 50;
      }

      // Kill streak
      if (player.killStreak > 0) {
        interestScore += player.killStreak * 20;
      }

      // Near enemies
      const nearbyEnemies = this.countNearbyEnemies(player, gameState);
      interestScore += nearbyEnemies * 30;

      // High score
      interestScore += player.score * 0.1;

      if (interestScore > maxScore) {
        maxScore = interestScore;
        bestPlayer = playerId;
      }
    });

    return bestPlayer;
  },

  // Count nearby enemies
  countNearbyEnemies(player, gameState) {
    let count = 0;
    const range = 500;

    Object.values(gameState.players).forEach((other) => {
      if (other.id === player.id) return;

      const dx = player.x - other.x;
      const dy = player.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < range) {
        count++;
      }
    });

    return count;
  },

  // Get camera target
  getCameraTarget(gameState) {
    if (this.cameraMode === 'overview') {
      // Center of map
      return {
        x: gameState.gameWidth / 2,
        y: gameState.gameHeight / 2
      };
    }

    if (this.cameraMode === 'free') {
      // Don't change target (user controls)
      return null;
    }

    // Follow target player
    const player = gameState.players[this.targetPlayer];
    if (player) {
      return {
        x: player.x,
        y: player.y
      };
    }

    return null;
  },

  // Get camera settings
  getCameraSettings() {
    const mode = this.cameraModes[this.cameraMode.toUpperCase()];
    return {
      smoothing: mode.smoothing,
      zoom: mode.zoom
    };
  },

  // Toggle overlay
  toggleOverlay(overlayName) {
    if (this.overlays[overlayName] !== undefined) {
      this.overlays[overlayName] = !this.overlays[overlayName];
      return this.overlays[overlayName];
    }
    return null;
  },

  // Get player stats for overlay
  getPlayerStats(playerId, gameState) {
    const player = gameState.players[playerId];
    if (!player) return null;

    return {
      name: player.name,
      health: player.health,
      shield: player.shield,
      score: player.score,
      kills: player.kills || 0,
      deaths: player.deaths || 0,
      killStreak: player.killStreak || 0,
      level: player.level || 1
    };
  },

  // Get scoreboard data
  getScoreboard(gameState) {
    return Object.values(gameState.players).
    map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      kills: player.kills || 0,
      deaths: player.deaths || 0,
      kd: player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills
    })).
    sort((a, b) => b.score - a.score);
  },

  // Render spectator UI
  renderSpectatorUI(ctx, canvas, gameState) {
    if (!this.spectatorMode) return;

    ctx.save();

    // Render player info
    if (this.overlays.playerInfo && this.targetPlayer) {
      this.renderPlayerInfo(ctx, canvas, gameState);
    }

    // Render scoreboard
    if (this.overlays.scoreboard) {
      this.renderScoreboard(ctx, canvas, gameState);
    }

    // Render camera mode indicator
    this.renderCameraModeIndicator(ctx, canvas);

    // Render controls help
    this.renderControlsHelp(ctx, canvas);

    ctx.restore();
  },

  renderPlayerInfo(ctx, canvas, gameState) {
    const stats = this.getPlayerStats(this.targetPlayer, gameState);
    if (!stats) return;

    const x = 20;
    const y = canvas.height - 100;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 300, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(stats.name, x + 10, y + 25);

    ctx.font = '14px Arial';
    ctx.fillText(`Health: ${stats.health} | Shield: ${stats.shield}`, x + 10, y + 45);
    ctx.fillText(`K/D: ${stats.kills}/${stats.deaths} | Streak: ${stats.killStreak}`, x + 10, y + 65);
  },

  renderScoreboard(ctx, canvas, gameState) {
    const scoreboard = this.getScoreboard(gameState).slice(0, 5);

    const x = canvas.width - 220;
    const y = 20;
    const height = 30 + scoreboard.length * 25;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 200, height);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Scoreboard', x + 10, y + 20);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#FFFFFF';

    scoreboard.forEach((player, index) => {
      const yPos = y + 40 + index * 25;
      ctx.fillText(`${index + 1}. ${player.name}`, x + 10, yPos);
      ctx.fillText(`${player.score}`, x + 150, yPos);
    });
  },

  renderCameraModeIndicator(ctx, canvas) {
    const mode = this.cameraModes[this.cameraMode.toUpperCase()];

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 2 - 100, 20, 200, 30);

    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(mode.name, canvas.width / 2, 40);
    ctx.textAlign = 'left';
  },

  renderControlsHelp(ctx, canvas) {
    const controls = [
    'TAB: Next Player',
    'C: Camera Mode',
    'H: Toggle UI'];


    const x = 20;
    const y = 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, 150, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';

    controls.forEach((control, index) => {
      ctx.fillText(control, x + 10, y + 20 + index * 20);
    });
  }
};

// Export
if (typeof window !== 'undefined') {
  window.SpectatorSystem = SpectatorSystem;
}