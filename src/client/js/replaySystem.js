/**
 * Replay System for TheFortz
 * Record and playback game matches
 */

const ReplaySystem = {
  // Active recordings
  activeRecordings: {},

  // Saved replays
  savedReplays: {},

  // Playback state
  playbackState: null,

  // Recording settings
  settings: {
    recordInterval: 50, // ms between snapshots
    maxDuration: 600000, // 10 minutes max
    compressionEnabled: true
  },

  // Start recording
  startRecording(matchId, gameState) {
    const recordingId = `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.activeRecordings[recordingId] = {
      id: recordingId,
      matchId: matchId,
      startTime: Date.now(),
      frames: [],
      metadata: {
        mapName: gameState.mapName || 'Unknown',
        gameMode: gameState.gameMode || 'FFA',
        players: Object.keys(gameState.players).length,
        duration: 0
      },
      lastSnapshot: 0
    };

    // Take initial snapshot
    this.recordFrame(recordingId, gameState);

    return recordingId;
  },

  // Record frame
  recordFrame(recordingId, gameState) {
    const recording = this.activeRecordings[recordingId];
    if (!recording) return;

    const now = Date.now();

    // Check if enough time has passed
    if (now - recording.lastSnapshot < this.settings.recordInterval) {
      return;
    }

    // Check max duration
    if (now - recording.startTime > this.settings.maxDuration) {
      this.stopRecording(recordingId);
      return;
    }

    // Create frame snapshot
    const frame = {
      timestamp: now - recording.startTime,
      players: {},
      bullets: [],
      powerUps: [],
      events: []
    };

    // Record player states
    Object.entries(gameState.players).forEach(([id, player]) => {
      frame.players[id] = {
        x: player.x,
        y: player.y,
        angle: player.angle,
        tankDirection: player.tankDirection,
        health: player.health,
        shield: player.shield,
        score: player.score,
        name: player.name
      };
    });

    // Record bullets
    gameState.bullets.forEach((bullet) => {
      frame.bullets.push({
        id: bullet.id,
        x: bullet.x,
        y: bullet.y,
        vx: bullet.vx,
        vy: bullet.vy,
        color: bullet.color
      });
    });

    // Record power-ups
    if (gameState.powerUps) {
      gameState.powerUps.forEach((powerUp) => {
        frame.powerUps.push({
          id: powerUp.id,
          x: powerUp.x,
          y: powerUp.y,
          type: powerUp.type
        });
      });
    }

    recording.frames.push(frame);
    recording.lastSnapshot = now;
  },

  // Record event (kills, deaths, etc.)
  recordEvent(recordingId, event) {
    const recording = this.activeRecordings[recordingId];
    if (!recording || recording.frames.length === 0) return;

    const currentFrame = recording.frames[recording.frames.length - 1];
    currentFrame.events.push({
      ...event,
      timestamp: Date.now() - recording.startTime
    });
  },

  // Stop recording
  stopRecording(recordingId) {
    const recording = this.activeRecordings[recordingId];
    if (!recording) return null;

    recording.endTime = Date.now();
    recording.metadata.duration = recording.endTime - recording.startTime;

    // Compress if enabled
    if (this.settings.compressionEnabled) {
      this.compressRecording(recording);
    }

    // Save replay
    this.savedReplays[recordingId] = recording;
    delete this.activeRecordings[recordingId];

    // Save to localStorage
    this.saveToStorage(recordingId);

    return recording;
  },

  // Compress recording (delta compression)
  compressRecording(recording) {
    if (recording.frames.length < 2) return;

    for (let i = recording.frames.length - 1; i > 0; i--) {
      const current = recording.frames[i];
      const previous = recording.frames[i - 1];

      // Only store changes
      Object.keys(current.players).forEach((playerId) => {
        if (previous.players[playerId]) {
          const curr = current.players[playerId];
          const prev = previous.players[playerId];

          // Only store if changed significantly
          if (Math.abs(curr.x - prev.x) < 1) delete curr.x;
          if (Math.abs(curr.y - prev.y) < 1) delete curr.y;
          if (Math.abs(curr.angle - prev.angle) < 0.01) delete curr.angle;
          if (curr.health === prev.health) delete curr.health;
          if (curr.shield === prev.shield) delete curr.shield;
        }
      });
    }
  },

  // Start playback
  startPlayback(replayId, options = {}) {
    const replay = this.savedReplays[replayId];
    if (!replay) {
      return { success: false, error: 'Replay not found' };
    }

    this.playbackState = {
      replayId: replayId,
      replay: replay,
      currentFrame: 0,
      playing: true,
      speed: options.speed || 1.0,
      startTime: Date.now(),
      pausedAt: null
    };

    return {
      success: true,
      metadata: replay.metadata
    };
  },

  // Update playback
  updatePlayback() {
    if (!this.playbackState || !this.playbackState.playing) return null;

    const state = this.playbackState;
    const replay = state.replay;

    // Calculate current time
    const elapsed = (Date.now() - state.startTime) * state.speed;

    // Find current frame
    while (state.currentFrame < replay.frames.length - 1) {
      const nextFrame = replay.frames[state.currentFrame + 1];
      if (nextFrame.timestamp > elapsed) {
        break;
      }
      state.currentFrame++;
    }

    // Check if replay finished
    if (state.currentFrame >= replay.frames.length - 1) {
      this.stopPlayback();
      return null;
    }

    // Interpolate between frames
    const currentFrame = replay.frames[state.currentFrame];
    const nextFrame = replay.frames[state.currentFrame + 1];

    if (!nextFrame) return currentFrame;

    const alpha = (elapsed - currentFrame.timestamp) / (
    nextFrame.timestamp - currentFrame.timestamp);

    return this.interpolateFrames(currentFrame, nextFrame, alpha);
  },

  // Interpolate between frames
  interpolateFrames(frame1, frame2, alpha) {
    const interpolated = {
      timestamp: frame1.timestamp,
      players: {},
      bullets: frame2.bullets, // Don't interpolate bullets
      powerUps: frame2.powerUps,
      events: frame1.events
    };

    // Interpolate player positions
    Object.keys(frame1.players).forEach((playerId) => {
      const p1 = frame1.players[playerId];
      const p2 = frame2.players[playerId];

      if (p2) {
        interpolated.players[playerId] = {
          x: p1.x + (p2.x - p1.x) * alpha,
          y: p1.y + (p2.y - p1.y) * alpha,
          angle: p1.angle + (p2.angle - p1.angle) * alpha,
          tankDirection: p2.tankDirection,
          health: p2.health,
          shield: p2.shield,
          score: p2.score,
          name: p1.name
        };
      } else {
        interpolated.players[playerId] = p1;
      }
    });

    return interpolated;
  },

  // Pause playback
  pausePlayback() {
    if (!this.playbackState) return;

    this.playbackState.playing = false;
    this.playbackState.pausedAt = Date.now();
  },

  // Resume playback
  resumePlayback() {
    if (!this.playbackState || this.playbackState.playing) return;

    const pauseDuration = Date.now() - this.playbackState.pausedAt;
    this.playbackState.startTime += pauseDuration;
    this.playbackState.playing = true;
  },

  // Seek to time
  seekTo(timestamp) {
    if (!this.playbackState) return;

    // Find frame at timestamp
    for (let i = 0; i < this.playbackState.replay.frames.length; i++) {
      if (this.playbackState.replay.frames[i].timestamp >= timestamp) {
        this.playbackState.currentFrame = i;
        this.playbackState.startTime = Date.now() - timestamp / this.playbackState.speed;
        break;
      }
    }
  },

  // Set playback speed
  setSpeed(speed) {
    if (!this.playbackState) return;

    const currentTime = (Date.now() - this.playbackState.startTime) * this.playbackState.speed;
    this.playbackState.speed = speed;
    this.playbackState.startTime = Date.now() - currentTime / speed;
  },

  // Stop playback
  stopPlayback() {
    this.playbackState = null;
  },

  // Get replay list
  getReplayList() {
    return Object.values(this.savedReplays).map((replay) => ({
      id: replay.id,
      matchId: replay.matchId,
      metadata: replay.metadata,
      startTime: replay.startTime,
      frameCount: replay.frames.length
    }));
  },

  // Delete replay
  deleteReplay(replayId) {
    delete this.savedReplays[replayId];
    localStorage.removeItem(`replay_${replayId}`);
  },

  // Save to localStorage
  saveToStorage(replayId) {
    const replay = this.savedReplays[replayId];
    if (!replay) return;

    try {
      localStorage.setItem(`replay_${replayId}`, JSON.stringify(replay));
    } catch (e) {
      console.error('Failed to save replay:', e);
    }
  },

  // Load from localStorage
  loadFromStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('replay_')) {
        try {
          const replay = JSON.parse(localStorage.getItem(key));
          this.savedReplays[replay.id] = replay;
        } catch (e) {
          console.error('Failed to load replay:', e);
        }
      }
    });
  },

  // Export replay
  exportReplay(replayId) {
    const replay = this.savedReplays[replayId];
    if (!replay) return null;

    const dataStr = JSON.stringify(replay);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    return url;
  },

  // Import replay
  importReplay(replayData) {
    try {
      const replay = JSON.parse(replayData);
      this.savedReplays[replay.id] = replay;
      this.saveToStorage(replay.id);
      return { success: true, replayId: replay.id };
    } catch (e) {
      return { success: false, error: 'Invalid replay data' };
    }
  }
};

// Export
if (typeof window !== 'undefined') {
  window.ReplaySystem = ReplaySystem;
}