// Game Integration System - Connects all enhanced systems with the main game
class GameIntegration {
  constructor() {
    this.systems = {
      graphics: null,
      audio: null,
      ai: null,
      weather: null,
      powerUps: null,
      tournaments: null
    };

    this.gameState = {
      isInGame: false,
      gameMode: 'lobby',
      players: {},
      bullets: [],
      powerUps: [],
      aiTanks: [],
      camera: { x: 0, y: 0 },
      combatIntensity: 0,
      weatherEnabled: true,
      aiEnabled: true
    };

    this.settings = {
      enableAllSystems: true,
      graphicsQuality: 'high',
      audioEnabled: true,
      aiDifficulty: 'medium',
      maxAITanks: 6,
      weatherIntensity: 1.0,
      powerUpSpawnRate: 1.0
    };

    this.eventListeners = new Map();
    this.updateInterval = null;

    this.initialize();
  }

  initialize() {
    // Wait for all systems to be available
    this.waitForSystems().then(() => {
      this.initializeSystems();
      this.setupEventListeners();
      this.startUpdateLoop();

      console.log('🎮 Game Integration System initialized - All systems connected!');
    });
  }

  async waitForSystems() {
    const checkSystem = (name, globalVar) => {
      return new Promise((resolve) => {
        const check = () => {
          if (window[globalVar]) {
            this.systems[name] = window[globalVar];
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    };

    await Promise.all([
    checkSystem('graphics', 'AdvancedGraphics'),
    checkSystem('audio', 'EnhancedAudio'),
    checkSystem('ai', 'AIOpponents'),
    checkSystem('weather', 'DynamicWeather'),
    checkSystem('powerUps', 'PowerUpSystem'),
    checkSystem('tournaments', 'TournamentSystem'),
    checkSystem('mapRenderer', 'MapRenderer')]
    );
  }

  initializeSystems() {
    // Configure graphics system
    if (this.systems.graphics) {
      this.systems.graphics.setGraphicsQuality(this.settings.graphicsQuality);
    }

    // Configure audio system
    if (this.systems.audio) {
      this.systems.audio.setMasterVolume(this.settings.audioEnabled ? 1.0 : 0.0);
    }

    // Configure AI system
    if (this.systems.ai) {
      this.systems.ai.setDifficulty(this.settings.aiDifficulty);
    }

    // Configure weather system
    if (this.systems.weather) {
      this.systems.weather.setWeatherEnabled(this.settings.weatherEnabled);
    }

    // Configure power-up system
    if (this.systems.powerUps) {
      this.systems.powerUps.setSpawnInterval(8000 / this.settings.powerUpSpawnRate);
    }
  }

  setupEventListeners() {
    // Game state events
    this.addEventListener('gameStart', (data) => {
      this.onGameStart(data);
    });

    this.addEventListener('gameEnd', (data) => {
      this.onGameEnd(data);
    });

    this.addEventListener('mapSelected', (data) => {
      this.onMapSelected(data);
    });

    this.addEventListener('mapLoaded', (data) => {
      this.onMapLoaded(data);
    });

    this.addEventListener('playerJoin', (data) => {
      this.onPlayerJoin(data);
    });

    this.addEventListener('playerLeave', (data) => {
      this.onPlayerLeave(data);
    });

    this.addEventListener('playerDamage', (data) => {
      this.onPlayerDamage(data);
    });

    this.addEventListener('playerKill', (data) => {
      this.onPlayerKill(data);
    });

    this.addEventListener('weaponFire', (data) => {
      this.onWeaponFire(data);
    });

    this.addEventListener('explosion', (data) => {
      this.onExplosion(data);
    });

    // Window events
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });

    window.addEventListener('visibilitychange', () => {
      this.onVisibilityChange();
    });
  }

  startUpdateLoop() {
    const update = (currentTime) => {
      const deltaTime = this.calculateDeltaTime(currentTime);
      this.update(deltaTime);
      this.updateInterval = requestAnimationFrame(update);
    };

    this.lastUpdateTime = performance.now();
    this.updateInterval = requestAnimationFrame(update);
  }

  calculateDeltaTime(currentTime) {
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;
    return Math.min(deltaTime, 1 / 30); // Cap at 30 FPS minimum
  }

  update(deltaTime) {
    if (!this.settings.enableAllSystems) return;

    // Update all systems
    this.updateSystems(deltaTime);

    // Update game state
    this.updateGameState(deltaTime);

    // Handle system interactions
    this.handleSystemInteractions(deltaTime);
  }

  updateSystems(deltaTime) {
    // Update graphics system
    if (this.systems.graphics) {
      this.systems.graphics.update(deltaTime);
    }

    // Update AI system
    if (this.systems.ai && this.settings.aiEnabled && this.gameState.isInGame) {
      this.systems.ai.update(deltaTime, this.gameState);
    }

    // Update weather system
    if (this.systems.weather && this.settings.weatherEnabled) {
      this.systems.weather.update(deltaTime, this.gameState);
    }

    // Update power-up system
    if (this.systems.powerUps && this.gameState.isInGame) {
      this.systems.powerUps.update(deltaTime, this.gameState);
    }

    // Update tournaments
    if (this.systems.tournaments && typeof this.systems.tournaments.update === 'function') {
      this.systems.tournaments.update();
    }
  }

  updateGameState(deltaTime) {
    // Update combat intensity based on recent activity
    this.updateCombatIntensity(deltaTime);

    // Update dynamic music based on game state
    this.updateDynamicMusic();

    // Sync game state with main game
    this.syncWithMainGame();
  }

  updateCombatIntensity(deltaTime) {
    const recentDamage = this.getRecentDamageEvents();
    const recentKills = this.getRecentKillEvents();
    const nearbyEnemies = this.getNearbyEnemyCount();

    let targetIntensity = 0;

    // Base intensity from recent events
    targetIntensity += recentDamage * 0.1;
    targetIntensity += recentKills * 0.3;
    targetIntensity += nearbyEnemies * 0.2;

    // Weather effects on intensity
    if (this.systems.weather) {
      const weather = this.systems.weather.getCurrentWeather();
      if (weather.type === 'storm') {
        targetIntensity += 0.2;
      }
    }

    // Smooth transition
    const smoothing = 2.0 * deltaTime;
    this.gameState.combatIntensity += (targetIntensity - this.gameState.combatIntensity) * smoothing;
    this.gameState.combatIntensity = Math.max(0, Math.min(1, this.gameState.combatIntensity));
  }

  updateDynamicMusic() {
    return; // Music system disabled
  }

  syncWithMainGame() {
    // Sync with global game state if available
    if (typeof window.gameState !== 'undefined') {
      const mainGameState = window.gameState;

      this.gameState.isInGame = !mainGameState.isInLobby;
      this.gameState.gameMode = mainGameState.selectedGameMode || 'ffa';

      // Sync player data
      if (mainGameState.players) {
        this.gameState.players = mainGameState.players;
      }

      // Sync camera
      if (mainGameState.camera) {
        this.gameState.camera = mainGameState.camera;
      }
    }
  }

  handleSystemInteractions(deltaTime) {
    // Weather affects AI behavior
    if (this.systems.weather && this.systems.ai) {
      const weather = this.systems.weather.getCurrentWeather();
      const visibility = this.systems.weather.getVisibilityModifier();

      // Reduce AI accuracy in bad weather
      this.systems.ai.getAllAITanks().forEach((aiTank) => {
        if (aiTank.weatherEffects) {
          aiTank.weatherEffects.visibilityMod = visibility;
        }
      });
    }

    // Power-ups create visual effects
    if (this.systems.powerUps && this.systems.graphics) {
      this.systems.powerUps.getAllPowerUps().forEach((powerUp) => {
        // Add ambient lighting for power-ups
        this.systems.graphics.addLightSource(powerUp.x, powerUp.y, {
          radius: 80,
          intensity: 0.5,
          color: powerUp.data.color,
          flickerSpeed: 0.02,
          flickerAmount: 0.2
        });
      });
    }

    // AI tanks create muzzle flashes and trails
    if (this.systems.ai && this.systems.graphics) {
      this.systems.ai.getAllAITanks().forEach((aiTank) => {
        // Create engine trail for moving AI tanks
        if (Math.abs(aiTank.vx) > 1 || Math.abs(aiTank.vy) > 1) {
          if (Math.random() < 0.3 * deltaTime * 60) {
            this.systems.graphics.createParticle({
              x: aiTank.x - Math.cos(aiTank.angle) * 30,
              y: aiTank.y - Math.sin(aiTank.angle) * 30,
              vx: -Math.cos(aiTank.angle) * 50 + (Math.random() - 0.5) * 20,
              vy: -Math.sin(aiTank.angle) * 50 + (Math.random() - 0.5) * 20,
              life: 0.5,
              maxLife: 0.5,
              size: 3 + Math.random() * 2,
              color: '#666666',
              type: 'smoke'
            });
          }
        }
      });
    }
  }

  // Event system
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Event handlers
  onGameStart(data) {
    console.log('🎮 Game started:', data);

    this.gameState.isInGame = true;
    this.gameState.gameMode = data.mode || 'ffa';

    // Load selected map if available
    if (data.mapId && this.systems.mapRenderer) {
      this.systems.mapRenderer.loadMapById(data.mapId);
    } else if (window.gameState && window.gameState.selectedMap && this.systems.mapRenderer) {
      this.systems.mapRenderer.loadMapById(window.gameState.selectedMap);
    }

    // Spawn AI tanks if enabled (after map loads)
    if (this.settings.aiEnabled && this.systems.ai) {
      setTimeout(() => {
        this.spawnAITanks(data.mode);
      }, 500); // Wait for map to load
    }

    // Start dynamic weather
    if (this.systems.weather) {
      this.systems.weather.setWeatherEnabled(true);
    }

    // Play game start sound
    if (this.systems.audio) {
      this.systems.audio.playSound('game_start', { volume: 0.8 });
    }
  }

  onGameEnd(data) {
    console.log('🏁 Game ended:', data);

    this.gameState.isInGame = false;
    this.gameState.combatIntensity = 0;

    // Clean up AI tanks
    if (this.systems.ai) {
      this.systems.ai.cleanup();
    }

    // Play appropriate end sound
    if (this.systems.audio) {
      const sound = data.victory ? 'victory' : 'defeat';
      this.systems.audio.playSound(sound, { volume: 0.8 });
    }

    // Create victory/defeat effects
    if (this.systems.graphics) {
      if (data.victory) {
        this.createVictoryEffects();
      } else {
        this.createDefeatEffects();
      }
    }
  }

  onPlayerJoin(data) {
    console.log('👋 Player joined:', data);

    this.gameState.players[data.id] = data;

    // Play join sound
    if (this.systems.audio) {
      this.systems.audio.playSound('player_join', { volume: 0.5 });
    }
  }

  onPlayerLeave(data) {
    console.log('👋 Player left:', data);

    delete this.gameState.players[data.id];

    // Play leave sound
    if (this.systems.audio) {
      this.systems.audio.playSound('player_leave', { volume: 0.5 });
    }
  }

  onPlayerDamage(data) {
    // Create hit effects
    if (this.systems.graphics) {
      this.systems.graphics.createParticle({
        x: data.x,
        y: data.y,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        life: 0.5,
        maxLife: 0.5,
        size: 5 + Math.random() * 5,
        color: '#ff4444',
        type: 'spark'
      });
    }

    // Play hit sound
    if (this.systems.audio) {
      this.systems.audio.playSound('hit_metal', {
        position: { x: data.x, y: data.y },
        volume: 0.7
      });
    }

    // Screen shake for player
    if (data.isPlayer && window.GameplayEnhancements) {
      window.GameplayEnhancements.applyScreenShake(8, 200);
    }
  }

  onPlayerKill(data) {
    console.log('💀 Player kill:', data);

    // Create death explosion
    if (this.systems.graphics) {
      this.systems.graphics.createExplosion(data.x, data.y, 1.5, 'default');
    }

    // Play death sound
    if (this.systems.audio) {
      this.systems.audio.playSound('death', {
        position: { x: data.x, y: data.y },
        volume: 0.8
      });
    }

    // Update combat intensity
    this.gameState.combatIntensity = Math.min(1, this.gameState.combatIntensity + 0.3);
  }

  onWeaponFire(data) {
    // Create muzzle flash
    if (this.systems.graphics) {
      const angle = data.angle || 0;

      this.systems.graphics.createParticle({
        x: data.x + Math.cos(angle) * 40,
        y: data.y + Math.sin(angle) * 40,
        vx: Math.cos(angle) * 200,
        vy: Math.sin(angle) * 200,
        life: 0.1,
        maxLife: 0.1,
        size: 15,
        color: '#ffff00',
        type: 'spark'
      });

      // Add light source for muzzle flash
      this.systems.graphics.addLightSource(data.x, data.y, {
        radius: 100,
        intensity: 2,
        color: '#ffff00',
        flickerSpeed: 0,
        type: 'muzzle_flash'
      });
    }

    // Play weapon sound
    if (this.systems.audio) {
      const weaponType = data.weaponType || 'basic';
      this.systems.audio.playSound(`shoot_${weaponType}`, {
        position: { x: data.x, y: data.y },
        volume: 0.6
      });
    }
  }

  onExplosion(data) {
    // Create explosion effects
    if (this.systems.graphics) {
      this.systems.graphics.createExplosion(data.x, data.y, data.size || 1, data.type || 'default');
    }

    // Play explosion sound
    if (this.systems.audio) {
      const soundType = data.size > 1.5 ? 'explosion_large' : 'explosion_small';
      this.systems.audio.playSound(soundType, {
        position: { x: data.x, y: data.y },
        volume: 0.8
      });
    }

    // Screen shake
    if (window.GameplayEnhancements) {
      const distance = this.getDistanceToPlayer(data.x, data.y);
      const shakeIntensity = Math.max(0, 20 - distance / 50);
      if (shakeIntensity > 0) {
        window.GameplayEnhancements.applyScreenShake(shakeIntensity, 500);
      }
    }
  }

  onWindowResize() {
    // Update graphics system
    if (this.systems.graphics) {


      // Graphics system will handle resize automatically
    } // Update UI elements
    this.updateUILayout();
  }

  onVisibilityChange() {
    if (document.hidden) {
      // Pause audio when tab is hidden
      if (this.systems.audio) {
        this.systems.audio.suspendAudioContext();
      }
    } else {
      // Resume audio when tab is visible
      if (this.systems.audio) {
        this.systems.audio.resumeAudioContext();
      }
    }
  }

  // Helper functions
  spawnAITanks(gameMode) {
    if (!this.systems.ai) return;

    const aiCount = Math.min(this.settings.maxAITanks, this.getOptimalAICount(gameMode));
    const personalities = ['aggressive', 'defensive', 'sneaky', 'support'];

    // Get player position to spawn AI tanks near the player's screen
    let playerX = 0,playerY = 0;
    if (window.gameState && window.gameState.playerId && window.gameState.players[window.gameState.playerId]) {
      const player = window.gameState.players[window.gameState.playerId];
      playerX = player.x || 0;
      playerY = player.y || 0;
    }

    // Get spawn points from map renderer if available
    let spawnPoints = [];
    if (this.systems.mapRenderer && this.systems.mapRenderer.isMapLoaded()) {
      spawnPoints = this.systems.mapRenderer.getValidSpawnPoints(aiCount);
    } else {
      // Fallback to spawn points near the player's position
      for (let i = 0; i < aiCount; i++) {
        spawnPoints.push(this.getSpawnPointNearPlayer(playerX, playerY, i, aiCount));
      }
    }

    for (let i = 0; i < aiCount; i++) {
      const personality = personalities[i % personalities.length];
      const spawnPoint = spawnPoints[i] || this.getSpawnPointNearPlayer(playerX, playerY, i, aiCount);

      this.systems.ai.addAITank(spawnPoint.x, spawnPoint.y, personality, 'ai');
    }

    console.log(`🤖 Spawned ${aiCount} AI tanks near player position (${Math.round(playerX)}, ${Math.round(playerY)})`);
  }

  // Get a spawn point near the player's position
  getSpawnPointNearPlayer(playerX, playerY, index, total) {
    // Spawn in a circle around the player at varying distances
    const angle = Math.PI * 2 * index / total + Math.random() * 0.5;
    const distance = 300 + Math.random() * 500; // 300-800 units from player

    return {
      x: playerX + Math.cos(angle) * distance,
      y: playerY + Math.sin(angle) * distance
    };
  }

  getOptimalAICount(gameMode) {
    const playerCount = Object.keys(this.gameState.players).length;

    switch (gameMode) {
      case 'ffa':
        return Math.max(2, 8 - playerCount);
      case 'tdm':
        return Math.max(1, 6 - playerCount);
      case 'battle_royale':
        return Math.max(5, 20 - playerCount);
      default:
        return Math.max(2, 6 - playerCount);
    }
  }

  getRandomSpawnPoint() {
    // Get player position to spawn near the player's screen
    let playerX = 0,playerY = 0;
    if (window.gameState && window.gameState.playerId && window.gameState.players[window.gameState.playerId]) {
      const player = window.gameState.players[window.gameState.playerId];
      playerX = player.x || 0;
      playerY = player.y || 0;
    }

    const angle = Math.random() * Math.PI * 2;
    const distance = 400 + Math.random() * 600; // 400-1000 units from player

    return {
      x: playerX + Math.cos(angle) * distance,
      y: playerY + Math.sin(angle) * distance
    };
  }

  getRecentDamageEvents() {
    // This would track recent damage events
    return Math.random() * 5; // Placeholder
  }

  getRecentKillEvents() {
    // This would track recent kill events
    return Math.random() * 2; // Placeholder
  }

  getNearbyEnemyCount() {
    // This would count enemies near the player
    return Math.random() * 3; // Placeholder
  }

  getDistanceToPlayer(x, y) {
    // Get distance from point to main player
    const player = Object.values(this.gameState.players).find((p) => p.isMainPlayer);
    if (!player) return 1000;

    const dx = x - player.x;
    const dy = y - player.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  createVictoryEffects() {
    if (!this.systems.graphics) return;

    // Create victory fireworks
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.5;

        this.systems.graphics.createExplosion(x, y, 2, 'victory');
      }, i * 500);
    }
  }

  onMapSelected(data) {
    console.log('🗺️ Map selected:', data);

    if (this.systems.mapRenderer && data.mapId) {
      this.systems.mapRenderer.loadMapById(data.mapId);
    }
  }

  onMapLoaded(data) {
    console.log('✅ Map loaded:', data);

    // Render map to game area if we're in game
    if (!this.gameState.isInLobby && window.MapRenderer && window.MapRenderer.isMapLoaded()) {
      // The map will be rendered automatically by the game loop's render() function
      // which calls GameIntegration.render() -> MapRenderer.render()
      console.log('🗺️ Map ready for game area rendering');
    }

    // Update spawn points for AI based on loaded map
    if (this.systems.ai && this.systems.mapRenderer) {
      const spawnPoints = this.systems.mapRenderer.getValidSpawnPoints(8);
      this.gameState.spawnPoints = spawnPoints;
    }

    // Show notification
    if (typeof showNotification === 'function') {
      showNotification(`Map "${data.mapName}" loaded!`, '#00ff00', 3000);
    }
  }

  createDefeatEffects() {
    if (!this.systems.graphics) return;

    // Create defeat smoke
    for (let i = 0; i < 20; i++) {
      this.systems.graphics.createParticle({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 50,
        vx: (Math.random() - 0.5) * 50,
        vy: -50 - Math.random() * 100,
        life: 3 + Math.random() * 2,
        maxLife: 3 + Math.random() * 2,
        size: 20 + Math.random() * 30,
        color: '#333333',
        type: 'smoke'
      });
    }
  }

  updateUILayout() {




    // Update UI elements based on screen size
    // This would be implemented based on specific UI needs
  } // Rendering integration
  render(ctx, canvas, camera) {if (!this.settings.enableAllSystems) return;
    // Render map first (terrain and buildings) - this includes ground tiles, water, and buildings
    if (this.systems.mapRenderer && typeof this.systems.mapRenderer.isMapLoaded === 'function' && this.systems.mapRenderer.isMapLoaded()) {
      // MapRenderer.render() draws the ground tiles and buildings
      this.systems.mapRenderer.render(ctx, camera);
    } else if (window.MapRenderer && typeof window.MapRenderer.isMapLoaded === 'function' && window.MapRenderer.isMapLoaded()) {
      // Fallback to global MapRenderer
      window.MapRenderer.render(ctx, camera);
    }

    // Render weather effects
    if (this.systems.weather) {
      this.systems.weather.render(ctx, canvas, camera);
    }

    // Render power-ups
    if (this.systems.powerUps) {
      this.systems.powerUps.render(ctx, canvas, camera);
    }

    // Render graphics effects (particles, explosions)
    if (this.systems.graphics) {
      this.systems.graphics.render(ctx, canvas, camera);
    }

    // Render AI tanks (if not handled by main game)
    if (this.systems.ai && this.shouldRenderAI()) {
      this.renderAITanks(ctx, camera);
    }
  }

  shouldRenderAI() {
    // Check if AI rendering should be handled here or by main game
    return !window.gameState || !window.gameState.renderingAI;
  }

  renderAITanks(ctx, camera) {
    this.systems.ai.getAllAITanks().forEach((aiTank) => {
      if (this.isVisible(aiTank, camera)) {
        this.renderAITank(ctx, aiTank, camera);
      }
    });
  }

  renderAITank(ctx, aiTank, camera) {
    const screenX = aiTank.x - camera.x;
    const screenY = aiTank.y - camera.y;

    ctx.save();
    ctx.translate(screenX, screenY);

    // Tank body
    ctx.rotate(aiTank.angle);
    ctx.fillStyle = aiTank.color;
    ctx.fillRect(-25, -15, 50, 30);

    // Tank turret
    ctx.rotate(aiTank.turretAngle - aiTank.angle);
    ctx.fillStyle = aiTank.color;
    ctx.fillRect(-5, -3, 40, 6);

    ctx.restore();

    // Health bar
    if (aiTank.health < aiTank.maxHealth) {
      this.renderHealthBar(ctx, screenX, screenY - 40, aiTank.health, aiTank.maxHealth);
    }

    // AI indicator
    ctx.fillStyle = '#ffff00';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AI', screenX, screenY - 50);
  }

  renderHealthBar(ctx, x, y, health, maxHealth) {
    const width = 40;
    const height = 4;
    const healthPercent = health / maxHealth;

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - width / 2, y, width, height);

    // Health
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(x - width / 2, y, width * healthPercent, height);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width / 2, y, width, height);
  }

  isVisible(obj, camera) {
    const margin = 100;
    return obj.x > camera.x - margin &&
    obj.x < camera.x + window.innerWidth + margin &&
    obj.y > camera.y - margin &&
    obj.y < camera.y + window.innerHeight + margin;
  }

  // Public API
  getSystem(name) {
    return this.systems[name];
  }

  getAllSystems() {
    return { ...this.systems };
  }

  getGameState() {
    return { ...this.gameState };
  }

  setSettings(newSettings) {
    Object.assign(this.settings, newSettings);
    this.initializeSystems(); // Re-initialize with new settings
  }

  getSettings() {
    return { ...this.settings };
  }

  // System control
  enableSystem(systemName, enabled = true) {
    switch (systemName) {
      case 'graphics':
        if (this.systems.graphics) {
          // Graphics system doesn't have enable/disable, but we can control quality
          this.systems.graphics.setGraphicsQuality(enabled ? this.settings.graphicsQuality : 'low');
        }
        break;
      case 'audio':
        this.settings.audioEnabled = enabled;
        if (this.systems.audio) {
          this.systems.audio.setMasterVolume(enabled ? 1.0 : 0.0);
        }
        break;
      case 'ai':
        this.settings.aiEnabled = enabled;
        if (!enabled && this.systems.ai) {
          this.systems.ai.cleanup();
        }
        break;
      case 'weather':
        this.settings.weatherEnabled = enabled;
        if (this.systems.weather) {
          this.systems.weather.setWeatherEnabled(enabled);
        }
        break;
      case 'powerUps':
        if (this.systems.powerUps) {
          if (enabled) {
            this.systems.powerUps.setSpawnInterval(8000 / this.settings.powerUpSpawnRate);
          } else {
            this.systems.powerUps.clearAllPowerUps();
          }
        }
        break;
    }
  }

  // Cleanup
  cleanup() {
    if (this.updateInterval) {
      cancelAnimationFrame(this.updateInterval);
      this.updateInterval = null;
    }

    // Cleanup all systems
    Object.values(this.systems).forEach((system) => {
      if (system && typeof system.cleanup === 'function') {
        system.cleanup();
      }
    });

    this.eventListeners.clear();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameIntegration;
}

// Global instance
window.GameIntegration = new GameIntegration();

// Expose event system globally for easy integration
window.gameEvents = {
  dispatch: (event, data) => {
    // Try to dispatch through GameIntegration if available
    if (window.GameIntegration && typeof window.GameIntegration.dispatchEvent === 'function') {
      try {
        window.GameIntegration.dispatchEvent(event, data);
      } catch (e) {


        // Silently ignore dispatch errors
      }} // Also dispatch as a custom DOM event for broader compatibility
    try {
      window.dispatchEvent(new CustomEvent(`game:${event}`, { detail: data }));
    } catch (e) {


      // Silently ignore
    }}, listen: (event, callback) => {
    if (window.GameIntegration && typeof window.GameIntegration.addEventListener === 'function') {
      window.GameIntegration.addEventListener(event, callback);
    }
    // Also listen to DOM custom events
    window.addEventListener(`game:${event}`, (e) => callback(e.detail));
  },
  unlisten: (event, callback) => {
    if (window.GameIntegration && typeof window.GameIntegration.removeEventListener === 'function') {
      window.GameIntegration.removeEventListener(event, callback);
    }
  }
};

// Auto-integrate with existing game functions if they exist
document.addEventListener('DOMContentLoaded', () => {
  // Hook into existing game functions
  if (typeof window.quickPlayFFA === 'function') {
    const originalQuickPlay = window.quickPlayFFA;
    window.quickPlayFFA = function (...args) {
      window.gameEvents.dispatch('gameStart', { mode: 'ffa' });
      return originalQuickPlay.apply(this, args);
    };
  }

  // Hook into other game functions as needed
  console.log('🔗 Game Integration hooks installed');
});