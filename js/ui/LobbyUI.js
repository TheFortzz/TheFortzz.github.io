/**
 * LobbyUI.js - Lobby interface management
 * Handles lobby background rendering, vehicle selection, and lobby state management
 */

import gameStateManager from '../core/GameState.js';
import imageLoader from '../assets/ImageLoader.js';
import { NETWORK_CONFIG } from '../core/Config.js';

// Lobby state variables
let lobbySocket = null;
let lobbyWalls = [];
let lobbyPlayers = {};
let gameModePlayers = {}; // Track player counts for each game mode
let lobbyMapData = {
  walls: [],
  shapes: [],
  players: [],
  bullets: [],
  gameWidth: 7500,
  gameHeight: 7500
};

// Ensure dimensions are exactly 7500x7500 (never changes)
Object.defineProperty(lobbyMapData, 'gameWidth', {
  value: 7500,
  writable: false,
  configurable: false
});
Object.defineProperty(lobbyMapData, 'gameHeight', {
  value: 7500,
  writable: false,
  configurable: false
});

/**
 * LobbyUI class - manages all lobby interface functionality
 */
class LobbyUI {
  constructor() {
    this.animationId = null;
    this.vehicleHexagonInterval = null;
    this.friendVehicleInterval = null;
  }

  /**
   * Show vehicle selection notification
   */
  showVehicleNotification(message) {
    const notification = document.getElementById('vehicleNotification');
    const notificationText = document.getElementById('vehicleNotificationText');
    
    if (notification && notificationText) {
      notificationText.textContent = message;
      notification.classList.remove('hidden');
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 5000);
    }
  }

  /**
   * Get the correct lobby canvas based on vehicle type
   */
  getCurrentLobbyCanvas() {
    const vehicleType = window.currentLobbyVehicleType || gameStateManager.getGameState().selectedVehicleType || 'tank';

    if (vehicleType === 'jet') {
      return document.getElementById('jetLobbyBackground');
    } else if (vehicleType === 'race') {
      return document.getElementById('raceLobbyBackground');
    } else {
      return document.getElementById('tankLobbyBackground');
    }
  }

  /**
   * Render lobby background
   */
  renderLobbyBackground() {
    const canvas = this.getCurrentLobbyCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Render the full map background
    if (window.MapRenderer && window.MapRenderer.currentMap) {
      ctx.save();
      const lobbyCamera = { x: 0, y: 0 };
      window.MapRenderer.render(ctx, lobbyCamera, canvas);
      ctx.restore();
    }
  }

  /**
   * Initialize lobby background
   */
  initializeLobbyBackground() {
    // Stop any existing animation before starting new
    this.stopTankBackgroundAnimation();

    // Ensure correct canvas visibility
    const tankCanvas = document.getElementById('tankLobbyBackground');
    const jetCanvas = document.getElementById('jetLobbyBackground');
    const raceCanvas = document.getElementById('raceLobbyBackground');

    const vehicleType = window.currentLobbyVehicleType || 'tank';

    // Hide all canvases first
    if (tankCanvas) tankCanvas.style.display = 'none';
    if (jetCanvas) jetCanvas.style.display = 'none';
    if (raceCanvas) raceCanvas.style.display = 'none';

    // Show appropriate canvas based on vehicle type
    let canvas = null;
    if (vehicleType === 'jet' && jetCanvas) {
      jetCanvas.style.display = 'block';
      canvas = jetCanvas;
    } else if (vehicleType === 'race' && raceCanvas) {
      raceCanvas.style.display = 'block';
      canvas = raceCanvas;
    } else if (vehicleType === 'tank' && tankCanvas) {
      // Tank mode fallback to canvas
      tankCanvas.style.display = 'block';
      canvas = tankCanvas;
    }

    if (!canvas) {
      console.warn(`${vehicleType} lobby background canvas not found`);
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Load a default map if none is loaded
    if (window.MapRenderer && !window.MapRenderer.currentMap) {
      const STORAGE_KEY = 'thefortz.customMaps';
      const maps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      // Load any available map, not just user-created ones
      const availableMaps = maps.filter((m) => m && m.name && (m.objects || m.groundTiles));
      if (availableMaps.length > 0) {
        // Load the first available map
        window.MapRenderer.loadMap(availableMaps[0]);
      }
    }

    // Connect to server to get live map data
    this.connectLobbyToServer();

    let time = 0;
    let cameraX = 0;
    let cameraY = 0;
    let targetCameraX = 0; // Start centered, then move
    let targetCameraY = 0;
    let lastCameraUpdate = 0;
    const CAMERA_UPDATE_INTERVAL = 5000; // 5 seconds between camera movements

    let lastFrameTime = performance.now();

    const drawBackground = (currentTime) => {
      // Stop if not in lobby
      const gameState = gameStateManager.getGameState();
      if (!gameState.isInLobby) return;

      // Update last frame time for smooth animation
      lastFrameTime = currentTime;

      // Clear with darker background
      ctx.fillStyle = '#05080a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Static camera for stable background
      cameraX = 0;
      cameraY = 0;

      // Render created map or tank-themed fallback
      if (window.MapRenderer && window.MapRenderer.currentMap) {
        window.MapRenderer.renderLobbyPreview(ctx, canvas);
      } else {
        // Tank-themed animated background
        const vehicleType = window.currentLobbyVehicleType || 'tank';

        if (vehicleType === 'tank') {
          // Tank-specific background: armored theme with moving tanks
          ctx.fillStyle = '#030507';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw armored grid background
          ctx.strokeStyle = 'rgba(0, 247, 255, 0.1)';
          ctx.lineWidth = 1;
          const gridSize = 100;
          for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          // Draw animated tank silhouettes
          for (let i = 0; i < 8; i++) {
            const x = (i * 300 + time * 0.02) % (canvas.width + 300) - 150;
            const y = canvas.height * 0.7 + Math.sin(time * 0.003 + i) * 50;

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(0.8, 0.8);

            // Tank body
            ctx.fillStyle = 'rgba(0, 247, 255, 0.3)';
            ctx.fillRect(-40, -15, 80, 30);

            // Tank turret
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Tank tracks
            ctx.fillStyle = 'rgba(0, 247, 255, 0.5)';
            ctx.fillRect(-45, -20, 5, 40);
            ctx.fillRect(40, -20, 5, 40);

            ctx.restore();
          }

          // Draw floating lootbox icons
          for (let i = 0; i < 5; i++) {
            const x = canvas.width * 0.2 + i * 150 + Math.sin(time * 0.001 + i) * 30;
            const y = canvas.height * 0.3 + Math.cos(time * 0.002 + i) * 40;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(time * 0.0005 + i);

            // Lootbox icon (gift box)
            ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.fillRect(-20, -15, 40, 30);

            // Box ribbon
            ctx.fillStyle = 'rgba(255, 0, 128, 0.9)';
            ctx.fillRect(-25, -5, 50, 10);

            // Vertical ribbon
            ctx.fillRect(-5, -20, 10, 40);

            // Glow effect
            ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = 'rgba(255, 215, 0, 1)';
            ctx.lineWidth = 2;
            ctx.strokeRect(-20, -15, 40, 30);

            ctx.restore();
          }

          // Draw "OPEN LOOTBOX" text
          ctx.save();
          ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('OPEN LOOTBOXES', canvas.width / 2, canvas.height / 2);
          ctx.font = '24px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText('Discover rare tanks, weapons, and epic rewards', canvas.width / 2, canvas.height / 2 + 60);
          ctx.restore();

        } else {
          // Default animated background for jet/race
          ctx.fillStyle = '#0d0f1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw some animated shapes
          for (let i = 0; i < 10; i++) {
            const x = (i * 200 + time * 0.01) % (canvas.width + 200) - 100;
            const y = canvas.height / 2 + Math.sin(time * 0.002 + i) * 100;
            const size = 50 + Math.sin(time * 0.003 + i * 0.5) * 20;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(time * 0.001 + i);
            ctx.fillStyle = `hsl(${(i * 36 + time * 0.1) % 360}, 70%, 60%)`;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // Draw shapes and other elements on top
      ctx.save();

      // Draw shapes (only visible ones)
      lobbyMapData.shapes.forEach((shape, index) => {
        const screenX = shape.x - cameraX;
        const screenY = shape.y - cameraY;

        // Skip shapes outside viewport
        if (screenX < -100 || screenX > canvas.width + 100 ||
        screenY < -100 || screenY > canvas.height + 100) {
          return;
        }

        const pulse = Math.sin(time * 0.0015 + index * 0.5) * 0.15 + 1;
        const rotation = time * 0.001 + index;

        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(rotation);
        ctx.scale(pulse, pulse);

        // Glow effect
        ctx.shadowColor = shape.color;
        ctx.shadowBlur = 15 + Math.sin(time * 0.003 + index) * 5;

        ctx.fillStyle = shape.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        if (shape.type === 'CIRCLE') {
          ctx.beginPath();
          ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (shape.type === 'TRIANGLE') {
          ctx.beginPath();
          ctx.moveTo(0, -shape.size / 2);
          ctx.lineTo(-shape.size / 2, shape.size / 2);
          ctx.lineTo(shape.size / 2, shape.size / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      });

      // Draw live players (tanks) - only visible ones
      const imagesLoaded = imageLoader.imagesLoaded;
      if (imagesLoaded && lobbyMapData.players && Array.isArray(lobbyMapData.players)) {
        lobbyMapData.players.forEach((player) => {
          if (!player || !player.selectedTank || typeof player.x !== 'number' || typeof player.y !== 'number') return;

          const screenX = player.x - cameraX;
          const screenY = player.y - cameraY;

          // Skip tanks outside viewport
          if (screenX < -100 || screenX > canvas.width + 100 ||
          screenY < -100 || screenY > canvas.height + 100) {
            return;
          }

          ctx.save();
          ctx.translate(player.x, player.y);

          // Smooth rotation animation
          const targetRotation = typeof player.rotation === 'number' ? player.rotation : 0;
          if (!player.smoothRotation) player.smoothRotation = targetRotation;
          player.smoothRotation += (targetRotation - player.smoothRotation) * 0.05;

          const weaponRotation = typeof player.weaponRotation === 'number' ? player.weaponRotation : 0;
          ctx.rotate(player.smoothRotation);

          // Get player's tank images
          const { tankImg, weaponImg } = imageLoader.getCurrentTankImages(player.selectedTank);

          // Draw tank body
          const tankSize = 40;
          if (tankImg && tankImg.complete) {
            ctx.drawImage(tankImg, -tankSize / 2, -tankSize / 2, tankSize, tankSize);
          }

          // Draw weapon
          if (weaponImg && weaponImg.complete) {
            ctx.rotate(weaponRotation - player.smoothRotation);
            ctx.drawImage(weaponImg, -tankSize / 2, -tankSize / 2, tankSize, tankSize);
          }

          ctx.restore();

          // Draw player name above tank
          if (player.name) {
            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.strokeText(player.name, player.x, player.y - 25);
            ctx.fillText(player.name, player.x, player.y - 25);
            ctx.restore();
          }
        });
      }

      // Draw live bullets
      if (lobbyMapData.bullets && Array.isArray(lobbyMapData.bullets)) {
        ctx.fillStyle = '#ff0';
        ctx.shadowColor = '#ff0';
        ctx.shadowBlur = 10;
        lobbyMapData.bullets.forEach((bullet) => {
          if (!bullet) return;
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Add subtle overlay
      ctx.fillStyle = 'rgba(26, 42, 65, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time++;
      window.tankBackgroundAnimationId = requestAnimationFrame(drawBackground);
    };

    window.tankBackgroundAnimationId = requestAnimationFrame(drawBackground);
  }

  /**
   * Connect to lobby server for live map data
   */
  connectLobbyToServer() {
    if (lobbySocket) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const configuredPort = NETWORK_CONFIG.port;

    // Candidate websocket URLs to try (best-effort). Order matters.
    const host = (window.location.hostname === '0.0.0.0') ? 'localhost' : window.location.hostname;
    const candidates = [];

    // 1) explicit host:port from current hostname and configured port
    candidates.push(`${protocol}//${host}:${configuredPort}/ws?lobby=true`);
    // 2) try localhost with configured port (common in devcontainers)
    candidates.push(`${protocol}//localhost:${configuredPort}/ws?lobby=true`);
    // 3) try relative to current origin (no explicit port) - works when server is proxied
    candidates.push(`${protocol}//${window.location.host.replace(/:\d+$/, '')}/ws?lobby=true`);

    let attemptIndex = 0;

    const tryNext = () => {
      if (attemptIndex >= candidates.length) {
        console.warn('All lobby WebSocket connection attempts failed');
        return;
      }

      const url = candidates[attemptIndex++];
      console.log('Attempting lobby WebSocket:', url);

      try {
        const socket = new WebSocket(url);

        let opened = false;

        const cleanup = () => {
          socket.onopen = null;
          socket.onmessage = null;
          socket.onerror = null;
          socket.onclose = null;
        };

        // Success
        socket.onopen = () => {
          opened = true;
          lobbySocket = socket;
          console.log('Connected to lobby server via', url);
          lobbySocket.send(JSON.stringify({ type: 'lobby_join' }));

          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'lobby_update') {
                lobbyMapData = data.mapData || lobbyMapData;
              }
            } catch (e) {
              console.error('Error parsing lobby message:', e);
            }
          };

          socket.onerror = (err) => console.error('Lobby WebSocket error:', err);
          socket.onclose = () => {
            console.log('Lobby socket closed');
            lobbySocket = null;
            // Try to reconnect after delay
            setTimeout(() => tryNext(), 1000);
          };
        };

        socket.onerror = () => {
          cleanup();
          if (!opened) {
            console.warn('WebSocket connect failed for', url);
            // try next candidate after short delay
            setTimeout(tryNext, 250);
          }
        };

        socket.onclose = () => {
          cleanup();
          if (!opened) {
            console.warn('WebSocket closed before open for', url);
            setTimeout(tryNext, 250);
          }
        };
      } catch (err) {
        console.error('Failed to create WebSocket for', url, err);
        setTimeout(tryNext, 250);
      }
    };

    // Start trying candidate URLs
    tryNext();
  }

  /**
   * Stop tank background animation
   */
  stopTankBackgroundAnimation() {
    if (window.tankBackgroundAnimationId) {
      cancelAnimationFrame(window.tankBackgroundAnimationId);
      window.tankBackgroundAnimationId = null;
    }
  }

  /**
   * Close all panels and restore lobby state
   */
  closeAllPanels() {
    const gameState = gameStateManager.getGameState();

    // Close all features
    gameStateManager.updateGameState({
      showShop: false,
      showLocker: false,
      showParty: false,
      showFriends: false,
      showSettings: false,
      showLeaderboard: false,
      showCreateMap: false,
      showPass: false,
      showChampions: false,
      showGameModes: false
    });

    // Hide all feature screens
    const featureScreens = [
    'shopScreen',
    'lockerScreen',
    'partyScreen',
    'friendsScreen',
    'settingsScreen',
    'leaderboardScreen',
    'createMapScreen',
    'passScreen',
    'championsScreen',
    'gameModesScreen'];

    featureScreens.forEach((screenId) => {
      const screen = document.getElementById(screenId);
      if (screen) {
        screen.classList.add('hidden');
        screen.style.display = 'none';
      }
    });

    // Stop any rendering animations (canvas shop removed)
    if (typeof window.stopLockerRendering === 'function') {
      window.stopLockerRendering();
    }
    if (typeof window.stopCreateMapRendering === 'function') {
      window.stopCreateMapRendering();
    }
    this.stopTankBackgroundAnimation();

    // Initialize canvas background for all vehicle types
    this.initializeLobbyBackground();

    // Show lobby screen
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen) {
      lobbyScreen.classList.remove('hidden');
      lobbyScreen.style.display = 'block';
    }

    console.log('✅ All panels closed, returned to lobby');
  }

  /**
   * Animate lobby tank previews
   */
  animateLobbyTanks() {
    const gameState = gameStateManager.getGameState();
    if (gameState.isInLobby && imageLoader.imagesLoaded) {
      const canvas = document.getElementById('playerTankCanvas');
      if (canvas) {
        // Ensure tank config has valid values before rendering
        const tankConfig = window.GameStateValidator ? 
          window.GameStateValidator.ensureValidTankConfig(gameState.selectedTank) :
          {
            color: gameState.selectedTank?.color || 'blue',
            body: gameState.selectedTank?.body || 'body_halftrack',
            weapon: gameState.selectedTank?.weapon || 'turret_01_mk1'
          };
        
        imageLoader.renderTankOnCanvas('playerTankCanvas', tankConfig, { 
          isLobby: true, 
          scale: 1.8 
        });
      }

      // Continue animation
      setTimeout(() => this.animateLobbyTanks(), 100);
    }
  }

  /**
   * Update lobby background with a specific map
   */
  updateLobbyBackgroundWithMap(mapData, vehicleType) {
    console.log(`🗺️ Updating lobby background with map: ${mapData.name} (${vehicleType})`);

    // Use canvas renderer for all vehicle types
    if (window.MapRenderer) {
      window.MapRenderer.loadMap(mapData);
      this.renderLobbyBackground();
    }
  }

  /**
   * Render vehicle on hexagon preview canvas
   */
  renderVehicleHexagon() {
    const canvas = document.getElementById('vehiclePreviewCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gameState = gameStateManager.getGameState();
    const vehicleType = gameState.selectedVehicleType || 'tank';
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Rotate 110 degrees to the left (counter-clockwise)
    const rotation = -110 * (Math.PI / 180);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    if (vehicleType === 'tank') {
      const selectedTank = gameState.selectedTank;
      if (selectedTank) {
        const tankImg = imageLoader.lobbyTankImages[selectedTank.color]?.[selectedTank.body];
        const weaponImg = imageLoader.lobbyWeaponImages[selectedTank.color]?.[selectedTank.weapon];

        if (tankImg && tankImg.complete) {
          const scale = 0.35;
          const w = tankImg.width * scale;
          const h = tankImg.height * scale;
          ctx.drawImage(tankImg, -w / 2, -h / 2, w, h);
        }

        if (weaponImg && weaponImg.complete) {
          const scale = 0.3;
          const w = weaponImg.width * scale;
          const h = weaponImg.height * scale;
          ctx.drawImage(weaponImg, -w / 2, -h / 2, w, h);
        }
      }
    }

    ctx.restore();
  }

  /**
   * Start continuous rendering for vehicle hexagon
   */
  startVehicleHexagonRendering() {
    if (this.vehicleHexagonInterval) return;
    this.vehicleHexagonInterval = setInterval(() => this.renderVehicleHexagon(), 50);
  }

  /**
   * Stop vehicle hexagon rendering
   */
  stopVehicleHexagonRendering() {
    if (this.vehicleHexagonInterval) {
      clearInterval(this.vehicleHexagonInterval);
      this.vehicleHexagonInterval = null;
    }
  }

  /**
   * Return to lobby from game
   */
  returnToLobby() {
    // Trigger CrazyGames gameplay stop event
    if (window.CrazyGamesIntegration) {
      window.CrazyGamesIntegration.gameplayStop();
    }

    // Set lobby state first to prevent reconnection attempts
    gameStateManager.updateGameState({
      isInLobby: true,
      isConnected: false
    });

    // Reset vehicle type to tank (default) when returning to lobby
    window.currentLobbyVehicleType = 'tank';
    gameStateManager.updateGameState({ selectedVehicleType: 'tank' });

    // Disconnect from current game
    if (window.networkSystem) {
      window.networkSystem.disconnect();
    }

    // Close lobby socket too if it exists
    if (lobbySocket) {
      lobbySocket.close();
      lobbySocket = null;
    }

    // Reset game state
    gameStateManager.updateGameState({
      playerId: null,
      players: {},
      shapes: [],
      walls: [],
      bullets: [],
      shapeSpawnTimers: {}
    });

    // Show lobby and restore all UI elements
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen) {
      lobbyScreen.classList.remove('hidden');
      const children = lobbyScreen.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id !== 'tankLobbyBackground') {
          child.style.display = '';
        }
      }
      const tankCanvas = document.getElementById('tankLobbyBackground');
      if (tankCanvas) {
        tankCanvas.style.zIndex = '10';
      }
    }

    document.getElementById('gameMapArea').classList.add('hidden');

    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
      gameCanvas.style.display = 'none';
    }

    document.getElementById('ui').classList.add('hidden');
    document.getElementById('scoreProgressContainer').classList.add('hidden');
    document.getElementById('centerBottomBoxes').classList.add('hidden');
    document.getElementById('respawnScreen').classList.add('hidden');

    // Render DOM map to lobby
    if (window.DOMMapRenderer && window.DOMMapRenderer.initialized) {
      // Ensure we have a map loaded before rendering
      if (!window.DOMMapRenderer.currentMap) {
        window.DOMMapRenderer.loadDefaultMap();
      }
      if (window.DOMMapRenderer.currentMap) {
        window.DOMMapRenderer.renderToLobby();
      }
    }

    // Initialize canvas background for all vehicle types
    this.initializeLobbyBackground();

    console.log('Returned to lobby');
  }

  /**
   * Update lobby background showing "No maps created"
   */
  updateLobbyBackgroundNoMaps(vehicleType) {
    console.log(`🎨 Showing no maps message for ${vehicleType}`);

    const canvas = this.getCurrentLobbyCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark background
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Message
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`No ${vehicleType} maps created yet`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '18px Arial';
    ctx.fillText('Create a map to start playing!', canvas.width / 2, canvas.height / 2 + 20);
  }

  /**
   * Update lobby vehicle preview based on selected type
   */
  updateLobbyVehiclePreview() {
    const canvas = document.getElementById('playerTankCanvas');
    if (!canvas) return;

    const gameState = gameStateManager.getGameState();
    const vehicleType = gameState.selectedVehicleType || 'tank';

    if (vehicleType === 'tank') {
      imageLoader.renderTankOnCanvas('playerTankCanvas', gameState.selectedTank, { 
        isLobby: true, 
        scale: 1.8 
      });
    } else if (vehicleType === 'jet') {
      imageLoader.renderJetOnCanvas('playerTankCanvas', gameState.selectedJet);
    } else if (vehicleType === 'race') {
      imageLoader.renderRaceOnCanvas('playerTankCanvas', gameState.selectedRace);
    }
  }

  /**
   * Render tank in lobby
   */
  renderLobbyTank(ctx, centerX, centerY, tank) {
    // Create a temporary canvas for the tank rendering
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 200;
    tempCanvas.height = 200;

    // Render tank on temp canvas
    imageLoader.renderTankOnCanvas(tempCanvas, tank, {
      scale: 0.5,
      rotation: -Math.PI / 2
    });

    // Draw temp canvas to main context
    ctx.drawImage(tempCanvas, centerX - 100, centerY - 100);
  }

  /**
   * Render jet in lobby
   */
  renderLobbyJet(ctx, centerX, centerY, jet) {
    if (!jet) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 200;
    tempCanvas.height = 200;

    imageLoader.renderJetOnCanvas(tempCanvas, jet, {
      scale: 0.5,
      rotation: -Math.PI / 2
    });

    ctx.drawImage(tempCanvas, centerX - 100, centerY - 100);
  }

  /**
   * Render race car in lobby
   */
  renderLobbyRace(ctx, centerX, centerY, race) {
    if (!race) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 200;
    tempCanvas.height = 200;

    imageLoader.renderRaceOnCanvas(tempCanvas, race, {
      scale: 0.5,
      rotation: -Math.PI / 2
    });

    ctx.drawImage(tempCanvas, centerX - 100, centerY - 100);
  }
}

// Create singleton instance
const lobbyUI = new LobbyUI();

// Export for module usage
export default lobbyUI;

// Expose globally for backward compatibility
if (typeof window !== 'undefined') {
  window.lobbyUI = lobbyUI;
  window.renderLobbyBackground = () => lobbyUI.renderLobbyBackground();
  window.initializeLobbyBackground = () => lobbyUI.initializeLobbyBackground();
  window.closeAllPanels = () => lobbyUI.closeAllPanels();
  window.animateLobbyTanks = () => lobbyUI.animateLobbyTanks();
  window.updateLobbyBackgroundWithMap = (mapData, vehicleType) => lobbyUI.updateLobbyBackgroundWithMap(mapData, vehicleType);
  window.returnToLobby = () => lobbyUI.returnToLobby();
  window.getCurrentLobbyCanvas = () => lobbyUI.getCurrentLobbyCanvas();
  window.updateLobbyBackgroundNoMaps = (vehicleType) => lobbyUI.updateLobbyBackgroundNoMaps(vehicleType);
  window.updateLobbyVehiclePreview = () => lobbyUI.updateLobbyVehiclePreview();
  window.renderLobbyTank = (ctx, centerX, centerY, tank) => lobbyUI.renderLobbyTank(ctx, centerX, centerY, tank);
  window.renderLobbyJet = (ctx, centerX, centerY, jet) => lobbyUI.renderLobbyJet(ctx, centerX, centerY, jet);
  window.renderLobbyRace = (ctx, centerX, centerY, race) => lobbyUI.renderLobbyRace(ctx, centerX, centerY, race);

  // Vehicle selection function
  window.selectVehicleType = (type) => {
    console.log('Selecting vehicle type:', type);
    const gameState = gameStateManager.getGameState();
    gameStateManager.updateGameState({ selectedVehicleType: type });

    // Update global vehicle type for background rendering
    window.currentLobbyVehicleType = type;

    // Update button states
    document.querySelectorAll('.vehicle-btn').forEach((btn) => btn.classList.remove('active'));
    document.getElementById(`${type}Btn`)?.classList.add('active');

    // Clear existing background rendering
    lobbyUI.stopTankBackgroundAnimation();
    if (window.DOMMapRenderer?.clearLobbyMap) {
      window.DOMMapRenderer.clearLobbyMap();
    }

    // Initialize canvas background for all vehicle types
    lobbyUI.initializeLobbyBackground();

    // Show notification messages for jet and race vehicles
    if (type === 'jet') {
      lobbyUI.showVehicleNotification('🚁 JET MODE - Coming Soon! High-speed aerial combat awaits!');
    } else if (type === 'race') {
      lobbyUI.showVehicleNotification('🏎️ RACE MODE - Coming Soon! Fast-paced racing action!');
    }

    // Update lobby vehicle preview
    lobbyUI.updateLobbyVehiclePreview();
  };

  // Feature panel functions
  window.openFeature = (feature) => {
    console.log('🔧 Opening feature:', feature);

    // Special handling for create-map: don't restart lobby background
    if (feature === 'create-map' || feature === 'createMap') {
      // Close all panels but don't restart lobby background
      const gameState = gameStateManager.getGameState();

      // Close all features
      gameStateManager.updateGameState({
        showShop: false,
        showLocker: false,
        showParty: false,
        showFriends: false,
        showSettings: false,
        showLeaderboard: false,
        showCreateMap: false,
        showPass: false,
        showChampions: false,
        showGameModes: false
      });

      // Hide all feature screens
      const featureScreens = [
      'shopScreen',
      'lockerScreen',
      'partyScreen',
      'friendsScreen',
      'settingsScreen',
      'leaderboardScreen',
      'createMapScreen',
      'passScreen',
      'championsScreen',
      'gameModesScreen'];

      featureScreens.forEach((screenId) => {
        const screen = document.getElementById(screenId);
        if (screen) {
          screen.classList.add('hidden');
          screen.style.display = 'none';
        }
      });

      // Stop any rendering animations (canvas shop removed)
      if (typeof window.stopLockerRendering === 'function') {
        window.stopLockerRendering();
      }
      if (typeof window.stopCreateMapRendering === 'function') {
        window.stopCreateMapRendering();
      }
      // Note: We don't call stopTankBackgroundAnimation() here to avoid restarting it
      // The map creator will handle its own rendering

      console.log('✅ All panels closed for create-map (lobby background preserved)');
    } else {
      // Normal behavior for other features
      lobbyUI.closeAllPanels();
    }

    // Convert kebab-case to camelCase for feature names
    const featureCamel = feature.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    const featureMap = {
      'shop': 'shopScreen',
      'locker': 'lockerScreen',
      'createMap': 'createMapScreen',
      'create-map': 'createMapScreen',
      'pass': 'passScreen',
      'friends': 'friendsScreen',
      'settings': 'settingsScreen',
      'gameModes': 'gameModesScreen',
      'champions': 'championsScreen',
      'tanks': 'tanksScreen',
      'weapons': 'weaponsScreen'
    };

    const screenId = featureMap[feature] || featureMap[featureCamel];
    console.log(`📝 Feature: ${feature} -> Screen ID: ${screenId}`);

    if (screenId) {
      const screen = document.getElementById(screenId);
      if (screen) {
        console.log(`✅ Found screen element: ${screenId}`);

        // Force show the screen
        screen.classList.remove('hidden');
        screen.style.display = 'block';
        screen.style.visibility = 'visible';

        console.log(`📝 Screen classes after show: ${screen.className}`);
        console.log(`📝 Screen display style: ${screen.style.display}`);

        // Update game state
        const stateKey = `show${featureCamel.charAt(0).toUpperCase() + featureCamel.slice(1)}`;
        gameStateManager.updateGameState({ [stateKey]: true });
        console.log(`📝 Updated game state: ${stateKey} = true`);

        // Initialize specific features
        if (feature === 'create-map' || feature === 'createMap') {
          console.log('🗺️ Initializing map creator...');

          // Stop lobby background animation before starting map creator
          lobbyUI.stopTankBackgroundAnimation();

          // Function to initialize map creator when ready
          const initMapCreator = () => {
            // Initialize map creator
            if (typeof window.startCreateMapRendering === 'function') {
              console.log('✅ Calling startCreateMapRendering()');
              window.startCreateMapRendering();
            } else {
              console.warn('⚠️ startCreateMapRendering function not found');
            }

            // Load saved maps
            if (typeof window.loadSavedMaps === 'function') {
              console.log('✅ Calling loadSavedMaps()');
              window.loadSavedMaps();
            } else {
              console.warn('⚠️ loadSavedMaps function not found');
            }
          };

          // Check if map creator is ready
          if (typeof window.startCreateMapRendering === 'function' &&
              typeof window.loadSavedMaps === 'function') {
            // Functions are available, initialize immediately
            initMapCreator();
          } else {
            // Wait for map creator to be ready
            console.log('⏳ Waiting for map creator to be ready...');

            const waitForMapCreator = () => {
              if (typeof window.startCreateMapRendering === 'function' &&
                  typeof window.loadSavedMaps === 'function') {
                console.log('✅ Map creator is now ready!');
                initMapCreator();
              } else {
                // Try again after a short delay
                setTimeout(waitForMapCreator, 100);
              }
            };

            // Listen for map creator ready event
            window.addEventListener('mapCreatorReady', (event) => {
              console.log('📡 Map creator ready event received:', event.detail);
              initMapCreator();
            }, { once: true });

            // Also try with timeout as fallback
            setTimeout(waitForMapCreator, 50);
          }
        }

        if (feature === 'shop') {
          // Initialize shop with items
          console.log('🛒 Initializing shop items...');
          if (typeof window.setupSimpleShop === 'function') {
            window.setupSimpleShop();
          } else if (typeof window.switchShopCategory === 'function') {
            window.switchShopCategory('tanks');
          }
        }

        if (feature === 'locker') {
          // Initialize locker
          if (typeof window.startLockerRendering === 'function') {
            window.startLockerRendering();
          }
        }

        if (feature === 'champions') {
          // Initialize champions screen
          console.log('🏆 Initializing champions screen...');
          if (typeof window.championsManager === 'undefined' && typeof window.ChampionsManager !== 'undefined') {
            window.championsManager = new window.ChampionsManager();
          }
          // Ensure the screen stays visible
          setTimeout(() => {
            if (screen) {
              screen.classList.remove('hidden');
              screen.style.display = 'block';
              screen.style.visibility = 'visible';
            }
          }, 100);
        }

        console.log(`✅ Successfully opened ${feature} screen`);
      } else {
        console.error(`❌ Screen element not found: ${screenId}`);
      }
    } else {
      console.error(`❌ Unknown feature: ${feature}`);
    }
  };

  // Team mode dropdown
  window.toggleTeamModeDropdown = () => {
    console.log('Toggle team mode dropdown');
    const dropdown = document.getElementById('teamModeDropdown');
    if (dropdown) {
      const isHidden = dropdown.classList.contains('hidden');
      console.log('Dropdown currently hidden:', isHidden);

      if (isHidden) {
        dropdown.classList.remove('hidden');
        dropdown.style.display = 'block';
        console.log('Dropdown shown');
      } else {
        dropdown.classList.add('hidden');
        dropdown.style.display = 'none';
        console.log('Dropdown hidden');
      }
    } else {
      console.error('Team mode dropdown not found');
    }
  };

  // Debug function for create map issues
  window.debugCreateMap = () => {
    console.log('🔍 Debugging Create Map functionality...');
    
    // Check if createMapScreen exists
    const screen = document.getElementById('createMapScreen');
    console.log('📝 createMapScreen element:', screen);
    
    if (screen) {
      console.log('📝 Screen classes:', screen.className);
      console.log('📝 Screen display style:', screen.style.display);
      console.log('📝 Screen visibility:', screen.style.visibility);
      console.log('📝 Has hidden class:', screen.classList.contains('hidden'));
      
      // Check computed styles
      const computedStyle = window.getComputedStyle(screen);
      console.log('📝 Computed display:', computedStyle.display);
      console.log('📝 Computed visibility:', computedStyle.visibility);
      console.log('📝 Computed z-index:', computedStyle.zIndex);
    }
    
    // Check functions
    const functions = ['openFeature', 'startCreateMapRendering', 'loadSavedMaps', 'openBlankMapCreator'];
    functions.forEach(funcName => {
      const func = window[funcName];
      console.log(`📝 ${funcName}:`, typeof func === 'function' ? '✅ exists' : '❌ missing');
    });
    
    // Check game state
    const gameState = gameStateManager.getGameState();
    console.log('📝 Game state showCreateMap:', gameState.showCreateMap);
    
    return {
      screenExists: !!screen,
      screenVisible: screen && !screen.classList.contains('hidden') && screen.style.display !== 'none',
      functionsExist: {
        openFeature: typeof window.openFeature === 'function',
        startCreateMapRendering: typeof window.startCreateMapRendering === 'function',
        loadSavedMaps: typeof window.loadSavedMaps === 'function'
      }
    };
  };

  // Open map selection modal (Battle Royal / Game Mode Modal)
  window.openBattleRoyal = () => {
    console.log('Opening map selection modal');
    if (window.openMapBrowserModal) {
      window.openMapBrowserModal();
      return;
    }
    const modal = document.getElementById('mapBrowserModal');
    const overlay = document.getElementById('mapBrowserModalOverlay');
    
    if (modal && overlay) {
      overlay.classList.remove('hidden');
      overlay.style.display = 'flex';

      // Load available maps
      if (typeof window.loadAvailableMaps === 'function') {
        window.loadAvailableMaps();
      } else if (typeof window.loadGameModeMaps === 'function') {
        window.loadGameModeMaps();
      } else {
        // Load created maps from localStorage
        const STORAGE_KEYS = {
          TANK_MAPS: 'thefortz.customMaps',
          JET_MAPS: 'thefortz.jetMaps',
          RACE_MAPS: 'thefortz.raceMaps'
        };

        const vehicleType = gameStateManager.getGameState().selectedVehicleType || 'tank';
        const storageKey = vehicleType === 'jet' ? STORAGE_KEYS.JET_MAPS :
        vehicleType === 'race' ? STORAGE_KEYS.RACE_MAPS :
        STORAGE_KEYS.TANK_MAPS;

        const maps = JSON.parse(localStorage.getItem(storageKey) || '[]');
        console.log(`📍 Loaded ${maps.length} ${vehicleType} maps`);

        // Display maps in the modal
        const mapList = document.getElementById('gameModeList');
        if (mapList) {
          mapList.innerHTML = '';
          if (maps.length === 0) {
            mapList.innerHTML = '<div style="color: white; padding: 20px; text-align: center;">No maps available. Create one first!</div>';
          } else {
            maps.forEach((map, index) => {
              const mapCard = document.createElement('div');
              mapCard.className = 'map-card';
              mapCard.innerHTML = `
                                <div class="map-thumbnail" style="background: linear-gradient(135deg, #1a1a2e, #16213e);">
                                    ${map.thumbnail ? `<img src="${map.thumbnail}" alt="${map.name}">` : '🗺️'}
                                </div>
                                <div class="map-info">
                                    <h3>${map.name || 'Untitled Map'}</h3>
                                    <p>Plays: ${map.plays || 0} | Rating: ${map.rating || 0}⭐</p>
                                </div>
                            `;
              mapCard.onclick = () => {
                window.selectedCreatedMapId = map.id;
                console.log('Selected map:', map.name);
                closeGameModeModal();
              };
              mapList.appendChild(mapCard);
            });
          }
        }
      }
    } else {
      console.warn('⚠️ Game mode modal not found');
    }
  };

  // Party functions
  window.showPartyInviteMenu = () => {
    console.log('Show party invite menu');
    // TODO: Implement party invite menu
  };

  window.kickPartyMember = (slot) => {
    console.log('Kick party member from slot:', slot);
    // TODO: Implement kick party member
  };

  window.leaveParty = () => {
    console.log('Leave party');
    // TODO: Implement leave party
  };

  // Friend functions
  window.acceptFriendRequest = (username) => {
    console.log('Accept friend request from:', username);
    // TODO: Implement accept friend request
  };

  window.declineFriendRequest = (username) => {
    console.log('Decline friend request from:', username);
    // TODO: Implement decline friend request
  };

  window.inviteFriend = (username) => {
    console.log('Invite friend:', username);
    // TODO: Implement invite friend
  };

  window.messageFriend = (username) => {
    console.log('Message friend:', username);
    // TODO: Implement message friend
  };

  window.spectateFriend = (username) => {
    console.log('Spectate friend:', username);
    // TODO: Implement spectate friend
  };

  // Shop functions
  window.switchShopCategory = (category) => {
    console.log('Switch shop category:', category);
    document.querySelectorAll('.shop-category-tab').forEach((tab) => {
      tab.classList.remove('active');
      if (tab.dataset.category === category) {
        tab.classList.add('active');
      }
    });
    // TODO: Load shop items for category
  };

  // Locker functions
  window.scrollLockerItems = (direction) => {
    console.log('Scroll locker items:', direction);
    // TODO: Implement locker scroll
  };

  window.selectLockerItem = () => {
    console.log('Select locker item');
    // TODO: Implement select locker item
  };

  window.openCustomizationPanel = (type) => {
    console.log('Open customization panel:', type);
    // TODO: Implement customization panel
  };

  // Game mode functions
  window.selectTeamMode = (mode) => {
    console.log('Select team mode:', mode);

    // Update button text
    const teamModeText = document.getElementById('teamModeText');
    if (teamModeText) {
      teamModeText.textContent = mode.toUpperCase();
    }

    // Close dropdown
    const dropdown = document.getElementById('teamModeDropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
      dropdown.style.display = 'none';
    }

    // Update active state of options
    document.querySelectorAll('.team-mode-option').forEach((option) => {
      option.classList.remove('selected');
    });
    document.querySelector(`[onclick*="selectTeamMode('${mode}')"]`)?.classList.add('selected');

    // TODO: Update game mode logic
  };

  // Close dropdown when clicking outside
  document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('teamModeDropdown');
    const soloBtn = document.getElementById('soloBtn');

    if (dropdown && soloBtn && !dropdown.classList.contains('hidden')) {
      if (!dropdown.contains(event.target) && !soloBtn.contains(event.target)) {
        dropdown.classList.add('hidden');
        dropdown.style.display = 'none';
        console.log('Dropdown closed by clicking outside');
      }
    }
  });

  window.scrollGameModeList = (direction) => {
    console.log('Scroll game mode list:', direction);
    // TODO: Implement game mode scroll
  };

  window.closeGameModeModal = () => {
    console.log('Close map browser modal');
    if (window.closeMapBrowserModal) {
      window.closeMapBrowserModal();
      return;
    }
    const overlay = document.getElementById('mapBrowserModalOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
  };

  window.closeStatsBox = () => {
    console.log('Close stats box');
    // TODO: Implement close stats box
  };

  // Champions/tabs functions
  window.switchChampionsTab = (tab) => {
    console.log('Switch champions tab:', tab);
    document.querySelectorAll('.champions-tab').forEach((t) => t.classList.remove('active'));
    document.querySelector(`[onclick*="${tab}"]`)?.classList.add('active');
    // TODO: Load champions tab content
  };

  // Game functions
  window.respawnPlayer = () => {
    console.log('Respawn player');
    // TODO: Implement respawn
  };

  // Map search functionality
  let allMaps = [];

  window.initializeMapSearch = () => {
    const searchInput = document.getElementById('gameModeSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterMaps(searchTerm);
      });
    }
  };

  function filterMaps(searchTerm) {
    const mapList = document.getElementById('gameModeList');
    if (!mapList) return;

    const filteredMaps = allMaps.filter((map) =>
    (map.name || '').toLowerCase().includes(searchTerm) ||
    (map.description || '').toLowerCase().includes(searchTerm)
    );

    displayMaps(filteredMaps);
  }

  function showMapInfoBox(map) {
    // Create map info box overlay
    const infoBox = document.createElement('div');
    infoBox.id = 'mapInfoBox';
    infoBox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    infoBox.innerHTML = `
      <div style="
        background: linear-gradient(135deg, rgba(26, 42, 65, 0.95), rgba(40, 40, 60, 0.95));
        border: 3px solid rgba(0, 247, 255, 0.6);
        border-radius: 20px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
        text-align: center;
      ">
        <div style="
          width: 200px;
          height: 150px;
          margin: 0 auto 20px;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, #0a0e27, #1a1a2e);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        ">
          ${map.thumbnail ? `<img src="${map.thumbnail}" alt="${map.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '🗺️'}
        </div>

        <h2 style="color: #00f7ff; margin: 0 0 15px 0; font-size: 28px;">${map.name || 'Untitled Map'}</h2>

        <div style="color: rgba(255,255,255,0.8); margin-bottom: 20px; line-height: 1.6;">
          <p style="margin: 5px 0;"><strong>👥 Max Players:</strong> ${map.maxPlayers || 10}</p>
          <p style="margin: 5px 0;"><strong>🎮 Plays:</strong> ${map.plays || 0}</p>
          <p style="margin: 5px 0;"><strong>⭐ Rating:</strong> ${map.rating || 0}/5</p>
          ${map.description ? `<p style="margin: 10px 0; font-style: italic;">${map.description}</p>` : ''}
        </div>

        <div style="display: flex; gap: 15px; justify-content: center;">
          <button id="selectMapBtn" style="
            background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
            border: 2px solid rgba(0, 212, 255, 0.8);
            color: white;
            padding: 12px 30px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
          ">SELECT MAP</button>

          <button id="cancelMapBtn" style="
            background: rgba(120, 120, 120, 0.3);
            border: 2px solid rgba(120, 120, 120, 0.6);
            color: white;
            padding: 12px 30px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
          ">CANCEL</button>
        </div>
      </div>
    `;

    document.body.appendChild(infoBox);

    // Add button event listeners
    document.getElementById('selectMapBtn').onclick = () => {
      window.selectedCreatedMapId = map.id;
      console.log('✅ Selected map:', map.name);

      // Highlight selected map
      document.querySelectorAll('.map-card').forEach((card) => {
        card.style.borderColor = 'rgba(0, 247, 255, 0.3)';
      });

      // Close both info box and modal
      document.body.removeChild(infoBox);
      closeGameModeModal();
    };

    document.getElementById('cancelMapBtn').onclick = () => {
      document.body.removeChild(infoBox);
    };

    // Close on background click
    infoBox.onclick = (e) => {
      if (e.target === infoBox) {
        document.body.removeChild(infoBox);
      }
    };
  }

  function displayMaps(maps) {
    const mapList = document.getElementById('gameModeList');
    if (!mapList) return;

    mapList.innerHTML = '';

    if (maps.length === 0) {
      mapList.innerHTML = '<div style="color: white; padding: 20px; text-align: center;">No maps found</div>';
      return;
    }

    maps.forEach((map, index) => {
      const mapCard = document.createElement('div');
      mapCard.className = 'map-card';
      mapCard.style.cssText = `
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid rgba(0, 247, 255, 0.3);
                border-radius: 12px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
                margin: 10px;
                min-width: 200px;
            `;

      mapCard.innerHTML = `
                <div class="map-thumbnail" style="
                    width: 100%;
                    height: 120px;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #0a0e27, #1a1a2e);
                ">
                    ${map.thumbnail ?
      `<img src="${map.thumbnail}" alt="${map.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
      '<span style="font-size: 48px;">🗺️</span>'}
                </div>
                <div class="map-info" style="color: white;">
                    <h3 style="margin: 5px 0; font-size: 16px; color: #00f7ff;">${
      map.name || 'Untitled Map'}</h3>
                    <p style="margin: 5px 0; font-size: 12px; color: rgba(255,255,255,0.7);">
                        👥 ${map.maxPlayers || 10} players | 
                        🎮 ${map.plays || 0} plays
                    </p>
                    <p style="margin: 5px 0; font-size: 12px; color: #FFD700;">
                        ⭐ ${map.rating || 0}/5
                    </p>
                </div>
            `;

      // Hover effect
      mapCard.addEventListener('mouseenter', () => {
        mapCard.style.borderColor = '#00f7ff';
        mapCard.style.transform = 'scale(1.05)';
        mapCard.style.boxShadow = '0 0 20px rgba(0, 247, 255, 0.5)';
      });

      mapCard.addEventListener('mouseleave', () => {
        mapCard.style.borderColor = 'rgba(0, 247, 255, 0.3)';
        mapCard.style.transform = 'scale(1)';
        mapCard.style.boxShadow = 'none';
      });

      // Click to show map info box
      mapCard.onclick = () => {
        showMapInfoBox(map);
      };

      mapList.appendChild(mapCard);
    });
  }

  // Update openBattleRoyal to use the new display function
  const originalOpenBattleRoyal = window.openBattleRoyal;
  window.openBattleRoyal = () => {
    console.log('Opening map selection modal');
    const modal = document.getElementById('mapBrowserModal');
    const overlay = document.getElementById('mapBrowserModalOverlay');
    
    if (modal && overlay) {
      overlay.classList.remove('hidden');
      overlay.style.display = 'flex';

      // Load maps
      const STORAGE_KEYS = {
        TANK_MAPS: 'thefortz.customMaps',
        JET_MAPS: 'thefortz.jetMaps',
        RACE_MAPS: 'thefortz.raceMaps'
      };

      const vehicleType = gameStateManager.getGameState().selectedVehicleType || 'tank';
      const storageKey = vehicleType === 'jet' ? STORAGE_KEYS.JET_MAPS :
      vehicleType === 'race' ? STORAGE_KEYS.RACE_MAPS :
      STORAGE_KEYS.TANK_MAPS;

      allMaps = JSON.parse(localStorage.getItem(storageKey) || '[]');
      console.log(`📍 Loaded ${allMaps.length} ${vehicleType} maps`);

      displayMaps(allMaps);

      // Initialize search
      window.initializeMapSearch();
    } else {
      console.warn('⚠️ Game mode modal not found');
    }
  };
}