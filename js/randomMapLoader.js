/**
 * Player-Created Map Loader for TheFortz
 * Loads player-created maps from Create Map section into actual gameplay
 */

// Function to get all player-created maps
function getPlayerCreatedMaps() {
  try {
    const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    console.log(`📦 Found ${maps.length} player-created maps`);
    return maps;
  } catch (error) {
    console.error('Error loading player maps:', error);
    return [];
  }
}

// Function to get a random player-created map














































// Function to apply player-created map to game state
function applyPlayerMapToGame(gameState) {
  if (!window.currentPlayerMap) {
    console.log('No player map to apply');
    return;
  }

  const map = window.currentPlayerMap;
  console.log('🎮 Applying player map to game state...');

  // Convert map objects to game walls/obstacles
  if (map.objects && map.objects.length > 0) {
    gameState.walls = gameState.walls || [];

    map.objects.forEach((obj) => {
      // Convert placed objects to walls
      gameState.walls.push({
        x: obj.x,
        y: obj.y,
        width: obj.width || 50,
        height: obj.height || 50,
        type: obj.type || 'wall',
        asset: obj.asset
      });
    });

    console.log(`✅ Added ${map.objects.length} obstacles to game`);
  }

  // Generate spawn points if not already set
  if (!gameState.spawnPoints || gameState.spawnPoints.length === 0) {
    gameState.spawnPoints = generateSpawnPoints(gameState);
    console.log(`✅ Generated ${gameState.spawnPoints.length} spawn points`);
  }

  // Store map info
  gameState.currentMap = {
    name: map.name,
    isPlayerCreated: true,
    created: map.created
  };

  console.log(`✅ Player map "${map.name}" applied to game!`);
}

// Helper function to generate spawn points
function generateSpawnPoints(gameState) {
  const spawnPoints = [];
  const mapWidth = gameState.gameWidth || 7500;
  const mapHeight = gameState.gameHeight || 7500;
  const numSpawns = 12;
  const minDistance = 500; // Minimum distance between spawns

  for (let i = 0; i < numSpawns; i++) {
    let attempts = 0;
    let validSpawn = false;
    let x, y;

    while (!validSpawn && attempts < 50) {
      x = Math.random() * (mapWidth - 200) + 100;
      y = Math.random() * (mapHeight - 200) + 100;

      // Check distance from other spawns
      validSpawn = true;
      for (const spawn of spawnPoints) {
        const dx = x - spawn.x;
        const dy = y - spawn.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          validSpawn = false;
          break;
        }
      }

      // Check if not inside a wall
      if (validSpawn && gameState.walls) {
        for (const wall of gameState.walls) {
          if (x >= wall.x && x <= wall.x + wall.width &&
          y >= wall.y && y <= wall.y + wall.height) {
            validSpawn = false;
            break;
          }
        }
      }

      attempts++;
    }

    if (validSpawn) {
      spawnPoints.push({ x, y });
    }
  }

  return spawnPoints;
}

// Helper function to get saved maps
function getSavedMaps() {
  try {
    return JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
  } catch {
    return [];
  }
}





































// Override the quickPlayFFA function
// Enhanced quick play function that uses player maps
function quickPlayFFAWithPlayerMap() {
  console.log('🎮 Starting quick play with player map support...');
  
  try {
    // Get available player maps
    const playerMaps = getPlayerCreatedMaps();
    
    if (playerMaps.length > 0) {
      // Select a random player map
      const randomMap = playerMaps[Math.floor(Math.random() * playerMaps.length)];
      console.log(`🗺️ Selected player map: ${randomMap.name}`);
      
      // Set the current player map
      window.currentPlayerMap = randomMap;
      
      // Apply the map to game state if available
      if (window.gameState) {
        applyPlayerMapToGame(window.gameState);
      }
      
      // Show notification
      if (typeof window.showNotification === 'function') {
        window.showNotification(`Playing on map: ${randomMap.name}`, 'info');
      }
    } else {
      console.log('📋 No player maps available, using default map');
      
      // Show notification
      if (typeof window.showNotification === 'function') {
        window.showNotification('No custom maps found, using default map', 'info');
      }
    }
    
    // Call original quick play function if it exists
    if (typeof window.originalQuickPlayFFA === 'function') {
      return window.originalQuickPlayFFA();
    } else {
      console.log('⚠️ Original quickPlayFFA function not found');
      
      // Basic fallback - just start the game
      if (window.gameState) {
        window.gameState.gameMode = 'ffa';
        window.gameState.gameStarted = true;
        
        if (typeof window.startGame === 'function') {
          window.startGame();
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error in quickPlayFFAWithPlayerMap:', error);
    
    // Fallback to original function
    if (typeof window.originalQuickPlayFFA === 'function') {
      return window.originalQuickPlayFFA();
    }
  }
}

if (typeof window !== 'undefined') {
  // Store original if it exists
  if (typeof window.quickPlayFFA === 'function') {
    window.originalQuickPlayFFA = window.quickPlayFFA;
  }

  // Replace with our enhanced version
  window.quickPlayFFA = quickPlayFFAWithPlayerMap;
}

// Hook into game initialization
const originalInitGame = window.initGame;
if (typeof originalInitGame === 'function') {
  window.initGame = function (...args) {
    const result = originalInitGame.apply(this, args);

    // Apply player map if available
    if (window.gameState && window.currentPlayerMap) {
      applyPlayerMapToGame(window.gameState);
    }

    return result;
  };
}

// Get a random player map
function getRandomPlayerMap() {
  console.log('🎲 Getting random player map...');
  
  try {
    const playerMaps = getPlayerCreatedMaps();
    
    if (playerMaps.length === 0) {
      console.log('📋 No player maps available');
      return null;
    }
    
    // Select a random map
    const randomIndex = Math.floor(Math.random() * playerMaps.length);
    const selectedMap = playerMaps[randomIndex];
    
    console.log(`🗺️ Selected random map: ${selectedMap.name} (${selectedMap.vehicleType})`);
    
    return selectedMap;
    
  } catch (error) {
    console.error('❌ Error getting random player map:', error);
    return null;
  }
}

// Load a specific player map into the game
function loadPlayerMapIntoGame(mapData) {
  console.log('🗺️ Loading player map into game:', mapData.name);
  
  try {
    if (!mapData || !mapData.name) {
      console.error('❌ Invalid map data provided');
      return false;
    }
    
    // Set the current player map
    window.currentPlayerMap = mapData;
    
    // Apply the map to game state
    if (window.gameState) {
      applyPlayerMapToGame(window.gameState);
      
      // Update game state with map info
      window.gameState.currentMap = {
        name: mapData.name,
        type: 'player-created',
        vehicleType: mapData.vehicleType || 'tank',
        objects: mapData.objects || []
      };
      
      console.log('✅ Player map loaded successfully:', mapData.name);
      
      // Show notification
      if (typeof window.showNotification === 'function') {
        window.showNotification(`Map loaded: ${mapData.name}`, 'success');
      }
      
      return true;
    } else {
      console.warn('⚠️ Game state not available');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error loading player map:', error);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Error loading map', 'error');
    }
    
    return false;
  }
}

// Export functions
if (typeof window !== 'undefined') {
  window.getPlayerCreatedMaps = getPlayerCreatedMaps;
  window.getRandomPlayerMap = getRandomPlayerMap;
  window.loadPlayerMapIntoGame = loadPlayerMapIntoGame;
  window.applyPlayerMapToGame = applyPlayerMapToGame;
}

console.log('🎲 Player-Created Map Loader initialized!');
console.log('💡 Create maps in "Create Map" section, then click Play to use them!');