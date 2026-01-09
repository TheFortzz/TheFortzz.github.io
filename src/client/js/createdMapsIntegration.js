// Created Maps Integration: populate game mode list, selection, and play routing

// Helper function to get the correct lobby canvas based on vehicle type
function getCurrentLobbyCanvas() {
  const vehicleType = window.currentLobbyVehicleType || window.gameState && window.gameState.selectedVehicleType || 'tank';

  if (vehicleType === 'jet') {
    return document.getElementById('jetLobbyBackground');
  } else if (vehicleType === 'race') {
    return document.getElementById('raceLobbyBackground');
  } else {
    return document.getElementById('tankLobbyBackground');
  }
}

(function () {
  function getSavedMaps() {
    try {
      const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
      // Filter out default Battle Arena - only return player-created maps
      return maps.filter((m) => m.isUserCreated !== false && m.name !== 'Battle Arena');
    } catch {return [];}
  }
  function getPlayCounts() {
    try {return JSON.parse(localStorage.getItem('thefortz.mapPlays') || '{}');} catch {return {};}
  }
  function setPlayCounts(obj) {localStorage.setItem('thefortz.mapPlays', JSON.stringify(obj || {}));}
  function mostPlayedMapId() {
    const maps = getSavedMaps();
    const plays = getPlayCounts();
    let best = null;let bestPlays = -1;
    maps.forEach((m) => {const id = String(m.id || '');const p = plays[id] || 0;if (p > bestPlays) {bestPlays = p;best = id;}});
    if (best) return best;
    // fallback newest
    if (maps.length > 0) {
      const newest = maps.slice().sort((a, b) => new Date(b.created) - new Date(a.created))[0];
      return String(newest.id);
    }
    return null;
  }
  function fmtDate(iso) {try {const d = new Date(iso);return d.toLocaleDateString();} catch {return iso || '';}}

  function buildMapItem(map) {
    const div = document.createElement('div');
    div.className = 'game-mode-item';
    div.dataset.mapId = String(map.id);

    // Render thumbnail on canvas (no base64 images)
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'game-mode-image';
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    imgWrapper.appendChild(canvas);
    if (typeof window.renderMapThumbnail === 'function') {
      window.renderMapThumbnail(canvas, map);
    } else {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(5,10,25,1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    const info = document.createElement('div');
    info.className = 'game-mode-info';
    const abbr = document.createElement('span');abbr.className = 'game-mode-abbr';abbr.textContent = map.name || 'Map';
    const count = document.createElement('span');count.className = 'game-mode-count';count.textContent = `${(map.objects || []).length} Objects`;
    const creator = document.createElement('span');creator.className = 'game-mode-creator';creator.textContent = fmtDate(map.created);

    info.appendChild(abbr);info.appendChild(document.createTextNode(' - '));info.appendChild(count);
    info.appendChild(document.createTextNode(' - '));info.appendChild(creator);

    div.appendChild(imgWrapper);div.appendChild(info);

    div.addEventListener('click', () => selectCreatedMap(String(map.id)));
    return div;
  }

  function clearList(el) {while (el.firstChild) el.removeChild(el.firstChild);}

  function populateGameModeList() {
    const list = document.getElementById('gameModeList');
    if (!list) return;
    const maps = getSavedMaps();
    clearList(list);

    if (!maps || maps.length === 0) {
      // Show message when no maps exist
      const emptyMsg = document.createElement('div');
      emptyMsg.style.cssText = 'padding: 40px; text-align: center; color: rgba(255,255,255,0.6); font-size: 16px;';
      emptyMsg.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">🗺️</div>
        <div style="font-weight: 600; margin-bottom: 10px;">No Custom Maps Yet</div>
        <div>Create your first map in the "Create Map" section!</div>
      `;
      list.appendChild(emptyMsg);
      return;
    }

    // sort by plays desc, then newest
    const plays = getPlayCounts();
    maps.sort((a, b) => (plays[String(b.id)] || 0) - (plays[String(a.id)] || 0) || new Date(b.created) - new Date(a.created));

    maps.forEach((m) => list.appendChild(buildMapItem(m)));

    // select default (most played)
    const defaultId = mostPlayedMapId();
    if (defaultId) selectCreatedMap(defaultId);
  }

  function selectCreatedMap(mapId) {
    // Skip if already selected
    if (window.selectedCreatedMapId === String(mapId) && window.DOMMapRenderer?.currentMap?.id === String(mapId)) {
      console.log('🗺️ Map already selected:', mapId);
      return;
    }

    window.selectedCreatedMapId = String(mapId);

    // Get the full map data
    const maps = getSavedMaps();
    const selectedMap = maps.find((m) => String(m.id) === String(mapId));

    if (!selectedMap) {
      console.error('❌ Map not found:', mapId);
      return;
    }

    console.log('🗺️ Selected map:', selectedMap.name);
    console.log('   - Ground tiles:', selectedMap.groundTiles?.length || 0);
    console.log('   - Buildings:', selectedMap.objects?.length || 0);

    // Store the full map data globally for immediate access
    window.currentSelectedMapData = selectedMap;

    // Also update gameState.selectedMap so quickPlayFFA uses it
    if (window.gameState) {
      window.gameState.selectedMap = String(mapId);
    }

    // highlight selection
    const list = document.getElementById('gameModeList');
    if (!list) return;
    const items = list.querySelectorAll('.game-mode-item');
    items.forEach((it) => {
      if (it.dataset.mapId === String(mapId)) it.classList.add('selected');else it.classList.remove('selected');
    });

    // Clear previous map before loading new one
    if (window.DOMMapRenderer?.clearLobbyMap) {
      window.DOMMapRenderer.clearLobbyMap();
    }

    // Update DOM map renderer (most efficient for lobby)
    if (window.DOMMapRenderer) {
      window.DOMMapRenderer.currentMap = selectedMap;
      window.DOMMapRenderer.renderToLobby();
      console.log('✅ DOM renderer loaded map:', selectedMap.name);
    }

    // CRITICAL: Immediately load into MapRenderer for game use
    if (window.MapRenderer) {
      window.MapRenderer.loadMap(selectedMap, () => {
        console.log('✅ MapRenderer PRE-LOADED for gameplay:', selectedMap.name);
        // Animation continues automatically after loading completes
      });
      // Start animation immediately (will show loading screen first)
      startLobbyAnimation();
    }
  }

  // Show loading screen overlay
  function showMapLoadingScreen() {
    let loadingScreen = document.getElementById('mapLoadingScreen');
    if (!loadingScreen) {
      loadingScreen = document.createElement('div');
      loadingScreen.id = 'mapLoadingScreen';
      loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(10px);
      `;
      loadingScreen.innerHTML = `
        <div style="text-align: center;">
          <div style="
            width: 80px;
            height: 80px;
            border: 5px solid rgba(0, 247, 255, 0.2);
            border-top-color: #00f7ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          "></div>
          <div style="
            color: #00f7ff;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(0, 247, 255, 0.5);
          ">Loading Map...</div>
          <div style="
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            margin-top: 10px;
          ">Preparing terrain and buildings</div>
        </div>
      `;

      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(loadingScreen);
    }
    loadingScreen.style.display = 'flex';
  }

  // Hide loading screen
  function hideMapLoadingScreen() {
    // No loading screen to hide - instant loading
    return;
  }

  function applyLobbyBackground() {
    try {
      const lobbyCanvas = getCurrentLobbyCanvas() || document.getElementById('tankLobbyBackground');
      if (!lobbyCanvas) return;
      const ctx = lobbyCanvas.getContext('2d');
      
      // If we have a custom map loaded, render it
      if (window.MapRenderer && window.MapRenderer.currentMap) {
        window.MapRenderer.renderLobbyPreview(ctx, lobbyCanvas);
        return;
      }
      
      // Simple static background when no maps
      ctx.fillStyle = 'rgba(20, 30, 25, 1)';
      ctx.fillRect(0, 0, lobbyCanvas.width, lobbyCanvas.height);
      
    } catch (e) {console.warn('applyLobbyBackground failed', e);}
  }

  // Start animated lobby background loop
  function startLobbyAnimation() {
    if (window.lobbyAnimationRunning) return;
    window.lobbyAnimationRunning = true;

    function animateLoop() {
      if (!window.lobbyAnimationRunning) return;
      
      // Only animate if we're in the lobby and have a map loaded
      if (window.gameState?.isInLobby !== false && window.MapRenderer?.currentMap) {
        applyLobbyBackground();
      }
      
      requestAnimationFrame(animateLoop);
    }
    
    animateLoop();
    console.log('🎬 Started animated lobby background');
  }

  // Stop lobby animation (when entering game)
  function stopLobbyAnimation() {
    window.lobbyAnimationRunning = false;
    console.log('⏹️ Stopped lobby animation');
  }

  // Restart lobby animation (when returning from game)
  function restartLobbyAnimation() {
    if (window.MapRenderer?.currentMap) {
      startLobbyAnimation();
      console.log('🎬 Restarted lobby animation');
    }
  }

  // Helper function to load selected map when game starts
  // This will be called from game.js after quickPlayFFA is defined
  function setupMapForGameStart() {
    // Stop lobby animation when game starts
    stopLobbyAnimation();
    
    // Use gameState.selectedMap if available, otherwise fall back to most played
    let selectedMapId = window.gameState?.selectedMap;
    if (!selectedMapId) {
      selectedMapId = mostPlayedMapId();
      if (selectedMapId && window.gameState) {
        window.gameState.selectedMap = selectedMapId;
      }
    }

    // Only proceed if we have a valid map ID (not null or undefined)
    if (!selectedMapId || selectedMapId === 'null' || selectedMapId === 'undefined') {
      console.log('ℹ️ No player-created maps available, using default terrain');
      return;
    }

    // Show loading screen while map loads
    showMapLoadingScreen();

    // Load the selected map into MapRenderer (DON'T increment play count yet)
    if (window.MapRenderer) {
      const maps = getSavedMaps();
      const selectedMap = maps.find((m) => String(m.id) === String(selectedMapId));

      if (selectedMap) {
        window.MapRenderer.loadMap(selectedMap, () => {
          console.log(`🗺️ Map ${selectedMapId} fully loaded for gameplay`);
          // Map is ready, loading screen will be hidden by game start sequence

          // Spawn AI bots from the map data
          spawnAIBotsFromMap(selectedMap);
        });
      } else {
        window.MapRenderer.loadById(selectedMapId);
      }
    }

    // Store the map ID for play count increment after successful connection
    window.pendingMapPlayCount = selectedMapId;
  }

  // Spawn AI bots from map data when game starts
  function spawnAIBotsFromMap(mapData) {
    if (!mapData || !mapData.aiBots || mapData.aiBots.length === 0) {
      console.log('ℹ️ No AI bots in this map');
      return;
    }

    console.log(`🤖 Spawning ${mapData.aiBots.length} AI bots from map: ${mapData.name}`);

    // Initialize game AI tanks array if not exists
    if (!window.gameState) window.gameState = {};
    if (!window.gameState.aiTanks) window.gameState.aiTanks = [];

    // Clear existing AI tanks
    window.gameState.aiTanks = [];

    // Get player position for spawning AI near player
    const player = window.gameState.players?.[window.gameState.playerId];
    const playerX = player?.x || 0;
    const playerY = player?.y || 0;

    // Spawn each AI bot from the map
    mapData.aiBots.forEach((botData, index) => {
      // Calculate spawn position - spread around player or map center
      const spawnAngle = index / mapData.aiBots.length * Math.PI * 2;
      const spawnDistance = 400 + Math.random() * 300; // 400-700 units from center

      const spawnX = playerX + Math.cos(spawnAngle) * spawnDistance;
      const spawnY = playerY + Math.sin(spawnAngle) * spawnDistance;

      const aiTank = {
        id: `ai_${botData.id || Date.now()}_${index}`,
        name: botData.name || `AI ${index + 1}`,
        x: spawnX,
        y: spawnY,
        angle: Math.random() * Math.PI * 2,
        turretAngle: Math.random() * Math.PI * 2,
        vx: 0,
        vy: 0,
        health: botData.health || 100,
        maxHealth: botData.health || 100,
        team: botData.team || 'ai',

        // AI behavior settings from map
        behavior: botData.behavior || 'aggressive',
        difficulty: botData.difficulty || 'medium',
        target: botData.target || 'nearest',
        fireRate: (botData.fireRate || 100) / 100,
        damage: (botData.damage || 100) / 100,
        speed: (botData.speed || 100) / 100 * 3, // Base speed 3
        accuracy: (botData.accuracy || 70) / 100,

        // AI state
        state: 'patrol',
        targetPlayer: null,
        lastShot: 0,
        lastDecision: 0,
        patrolTarget: { x: spawnX, y: spawnY },

        // Visual properties
        color: getAITankColor(botData.team),
        body: 'body_halftrack',
        weapon: 'turret_01_mk1',
        vehicleType: botData.vehicleType || 'tank',

        // Animation
        trackOffset: 0,
        enginePulse: 0
      };

      window.gameState.aiTanks.push(aiTank);
      console.log(`  ✅ Spawned AI: ${aiTank.name} at (${Math.round(spawnX)}, ${Math.round(spawnY)})`);
    });

    console.log(`🤖 Total AI tanks spawned: ${window.gameState.aiTanks.length}`);

    // Start AI update loop if not already running
    if (!window.aiUpdateLoopRunning) {
      startAIUpdateLoop();
    }
  }

  // Get tank color based on team
  function getAITankColor(team) {
    const colors = {
      'none': 'red',
      'red': 'red',
      'blue': 'blue',
      'green': 'camo',
      'yellow': 'desert'
    };
    return colors[team] || 'red';
  }

  // AI Update Loop - runs during gameplay
  function startAIUpdateLoop() {
    if (window.aiUpdateLoopRunning) return;
    window.aiUpdateLoopRunning = true;

    function updateAI() {
      if (!window.gameState?.aiTanks || window.gameState.isInLobby) {
        window.aiUpdateLoopRunning = false;
        return;
      }

      const player = window.gameState.players?.[window.gameState.playerId];
      if (!player) {
        requestAnimationFrame(updateAI);
        return;
      }

      const now = Date.now();

      window.gameState.aiTanks.forEach((ai) => {
        if (ai.health <= 0) return;

        // Calculate distance to player
        const dx = player.x - ai.x;
        const dy = player.y - ai.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);

        // AI decision making (every 500ms)
        if (now - ai.lastDecision > 500) {
          ai.lastDecision = now;

          // Decide state based on distance and behavior
          if (distToPlayer < 600) {
            ai.state = 'engage';
            ai.targetPlayer = player;
          } else if (distToPlayer < 1000 && ai.behavior === 'aggressive') {
            ai.state = 'chase';
            ai.targetPlayer = player;
          } else {
            ai.state = 'patrol';
            // Pick new patrol target if close to current one
            const patrolDist = Math.sqrt(
              Math.pow(ai.patrolTarget.x - ai.x, 2) +
              Math.pow(ai.patrolTarget.y - ai.y, 2)
            );
            if (patrolDist < 100) {
              const angle = Math.random() * Math.PI * 2;
              const dist = 200 + Math.random() * 300;
              ai.patrolTarget = {
                x: ai.x + Math.cos(angle) * dist,
                y: ai.y + Math.sin(angle) * dist
              };
            }
          }
        }

        // Execute AI behavior
        let targetX, targetY;

        if (ai.state === 'engage' || ai.state === 'chase') {
          targetX = player.x;
          targetY = player.y;

          // Aim turret at player
          ai.turretAngle = Math.atan2(dy, dx);

          // Shoot at player if in range and facing them
          if (ai.state === 'engage' && distToPlayer < 500) {
            const shootCooldown = 1000 / ai.fireRate;
            if (now - ai.lastShot > shootCooldown) {
              // Fire bullet at player
              fireAIBullet(ai);
              ai.lastShot = now;
            }
          }
        } else {
          targetX = ai.patrolTarget.x;
          targetY = ai.patrolTarget.y;
          // Slowly rotate turret while patrolling
          ai.turretAngle += 0.01;
        }

        // Move towards target
        const moveX = targetX - ai.x;
        const moveY = targetY - ai.y;
        const moveDist = Math.sqrt(moveX * moveX + moveY * moveY);

        if (moveDist > 50) {
          const moveAngle = Math.atan2(moveY, moveX);

          // Smooth body rotation
          let angleDiff = moveAngle - ai.angle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          ai.angle += angleDiff * 0.05;

          // Move forward if facing target
          if (Math.abs(angleDiff) < Math.PI / 2) {
            const speed = ai.speed * (ai.state === 'engage' ? 0.5 : 1);
            ai.vx = Math.cos(ai.angle) * speed;
            ai.vy = Math.sin(ai.angle) * speed;
            ai.x += ai.vx;
            ai.y += ai.vy;
            ai.trackOffset = (ai.trackOffset + speed * 0.1) % 10;
          }
        }

        // Keep within map bounds
        const mapRadius = 2000;
        const distFromCenter = Math.sqrt(ai.x * ai.x + ai.y * ai.y);
        if (distFromCenter > mapRadius) {
          const clampAngle = Math.atan2(ai.y, ai.x);
          ai.x = Math.cos(clampAngle) * mapRadius;
          ai.y = Math.sin(clampAngle) * mapRadius;
        }

        // Engine pulse animation
        ai.enginePulse = Math.sin(now * 0.005) * 0.02;
      });

      requestAnimationFrame(updateAI);
    }

    updateAI();
  }

  // Fire a bullet from AI tank
  function fireAIBullet(ai) {
    if (!window.gameState.bullets) window.gameState.bullets = [];

    const bulletSpeed = 15;
    const bullet = {
      id: `ai_bullet_${ai.id}_${Date.now()}`,
      x: ai.x + Math.cos(ai.turretAngle) * 50,
      y: ai.y + Math.sin(ai.turretAngle) * 50,
      vx: Math.cos(ai.turretAngle) * bulletSpeed,
      vy: Math.sin(ai.turretAngle) * bulletSpeed,
      owner: ai.id,
      isAI: true,
      damage: 10 * ai.damage,
      color: ai.color,
      life: 3000
    };

    window.gameState.bullets.push(bullet);
  }

  // Helper to increment play count - called after game successfully connects
  function confirmMapPlay() {
    if (window.pendingMapPlayCount) {
      const mapId = window.pendingMapPlayCount;
      const plays = getPlayCounts();
      plays[String(mapId)] = (plays[String(mapId)] || 0) + 1;
      setPlayCounts(plays);
      console.log(`🎮 Incremented play count for map ${mapId}`);
      window.pendingMapPlayCount = null; // Clear pending count
    }
  }

  // Expose globals
  window.populateGameModeList = populateGameModeList;
  window.selectCreatedMap = selectCreatedMap;
  window.getMostPlayedCreatedMapId = mostPlayedMapId;
  window.applyLobbyBackground = applyLobbyBackground;
  window.setupMapForGameStart = setupMapForGameStart;
  window.confirmMapPlay = confirmMapPlay;
  window.showMapLoadingScreen = showMapLoadingScreen;
  window.hideMapLoadingScreen = hideMapLoadingScreen;
  window.spawnAIBotsFromMap = spawnAIBotsFromMap;
  window.startAIUpdateLoop = startAIUpdateLoop;

  // Simple lobby animation - runs during loading and after
  let lobbyAnimationId = null;
  function startLobbyAnimation() {
    if (lobbyAnimationId) return;
    
    function animate() {
      // Always animate if we have a map (even while loading)
      if (window.MapRenderer?.currentMap && window.gameState?.isInLobby !== false) {
        applyLobbyBackground();
        lobbyAnimationId = requestAnimationFrame(animate);
      } else {
        lobbyAnimationId = null;
      }
    }
    
    lobbyAnimationId = requestAnimationFrame(animate);
  }
  
  function stopLobbyAnimation() {
    if (lobbyAnimationId) {
      cancelAnimationFrame(lobbyAnimationId);
      lobbyAnimationId = null;
    }
  }
  
  window.startLobbyAnimation = startLobbyAnimation;
  window.stopLobbyAnimation = stopLobbyAnimation;

  // Init after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    try {
      if (window.MapRenderer && !window.MapRenderer.initialized) window.MapRenderer.init();
      populateGameModeList();
      
      // Preload most played map during main loading
      const defaultMapId = mostPlayedMapId();
      if (defaultMapId) {
        const maps = getSavedMaps();
        const defaultMap = maps.find((m) => String(m.id) === String(defaultMapId));
        if (defaultMap && window.MapRenderer) {
          window.MapRenderer.loadMap(defaultMap);
          console.log('🚀 Preloaded map during main loading:', defaultMap.name);
        }
      }
      
      // Apply lobby background once
      applyLobbyBackground();
    } catch (e) {console.warn('createdMapsIntegration init failed', e);}
  });
})();