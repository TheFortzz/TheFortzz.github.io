/**
 * Main Game Coordinator
 * This file orchestrates the game systems and handles initialization
 * All implementation details are delegated to specialized modules
 * 
 * Module Loading Order:
 * 1. Configuration (Config.js) - No dependencies
 * 2. Core modules (GameState, ImageLoader, GameLoop) - Depend on Config
 * 3. Systems (Input, Network, Particle, Weapon, Physics, Render) - Depend on Core
 * 4. Entities (Player, Tank, Bullet) - Depend on Config
 * 5. UI modules (Lobby, Shop, Locker) - Depend on Core and Systems
 */

// Import configuration (no dependencies)
import { STORAGE_KEYS } from './core/Config.js';

// Import core modules (depend on Config only)
import gameStateManager from './core/GameState.js';
import imageLoader from './assets/ImageLoader.js';
import GameLoop from './core/GameLoop.js';

// Import systems (depend on Core modules)
import InputSystem from './systems/InputSystem.js';
import NetworkSystem from './systems/NetworkSystem.js';
import ParticleSystem from './systems/ParticleSystem.js';
import WeaponSystem from './systems/WeaponSystem.js';
import PhysicsSystem from './systems/PhysicsSystem.js';
import RenderSystem from './systems/RenderSystem.js';

// Import entity modules (depend on Config)
import Player from './entities/Player.js';
import Tank from './entities/Tank.js';
import Bullet from './entities/Bullet.js';

// Import UI modules (depend on Core and Systems)
import lobbyUI from './ui/LobbyUI.js';
import lockerUI from './ui/LockerUI.js';

// Get centralized game state
const gameState = gameStateManager.getGameState();

// Initialize systems
const inputSystem = new InputSystem();
const networkSystem = new NetworkSystem(gameStateManager);
const physicsSystem = new PhysicsSystem(gameStateManager.getGameState());

// Systems that require canvas (initialized later)
let particleSystem = null;
let weaponSystem = null;
let renderSystem = null;

// Canvas references
let canvas, ctx, minimapCanvas, minimapCtx;

// Expose systems globally for backward compatibility
if (typeof window !== 'undefined') {
    window.gameState = gameState;
    window.inputSystem = inputSystem;
    window.networkSystem = networkSystem;
    window.physicsSystem = physicsSystem;
    
    // UI modules
    window.lobbyUI = lobbyUI;
    window.lockerUI = lockerUI;
    
    // Entity classes
    window.Player = Player;
    window.Tank = Tank;
    window.Bullet = Bullet;
    
    // Image loader functions
    window.renderTankOnCanvas = (canvasId, tankConfig, options) => {
        return imageLoader.renderTankOnCanvas(canvasId, tankConfig, options);
    };
    window.renderJetOnCanvas = (canvasId, jetConfig, options) => {
        return imageLoader.renderJetOnCanvas(canvasId, jetConfig, options);
    };
    window.renderRaceOnCanvas = (canvasId, raceConfig, options) => {
        return imageLoader.renderRaceOnCanvas(canvasId, raceConfig, options);
    };
    
    // Early function exports for HTML handlers
    window.joinGame = function() {
        console.log('🎮 joinGame called (early export)');
        if (typeof joinGame === 'function') {
            joinGame();
        } else {
            console.warn('⚠️ joinGame function not yet defined, will retry...');
            setTimeout(() => {
                if (typeof joinGame === 'function') {
                    joinGame();
                } else {
                    console.error('❌ joinGame function still not available');
                }
            }, 100);
        }
    };
}

/**
 * Initialize the game
 */
function initializeGame() {
    console.log('🎮 Initializing game...');
    
    // Get canvas elements
    canvas = document.getElementById('gameCanvas');
    minimapCanvas = document.getElementById('minimapCanvas');
    
    if (!canvas) {
        console.error('❌ Game canvas not found!');
        return;
    }
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ Could not get canvas context!');
        return;
    }
    
    // Initialize canvas-dependent systems
    particleSystem = new ParticleSystem(gameState, canvas, ctx);
    weaponSystem = new WeaponSystem(gameState, networkSystem, particleSystem, imageLoader);
    
    // Expose to window for backward compatibility
    window.particleSystem = particleSystem;
    window.weaponSystem = weaponSystem;
    
    if (minimapCanvas) {
        minimapCtx = minimapCanvas.getContext('2d');
    }
    
    // Initialize render system
    renderSystem = new RenderSystem(gameState, canvas, ctx, minimapCanvas, minimapCtx);
    
    // Force image loading and set dependencies
    console.log('🖼️ ImageLoader status:', {
        exists: !!imageLoader,
        imagesLoaded: imageLoader?.imagesLoaded,
        tankImages: Object.keys(imageLoader?.tankImages || {}),
        weaponImages: Object.keys(imageLoader?.weaponImages || {})
    });
    
    // Try to initialize images if not loaded
    if (imageLoader && !imageLoader.imagesLoaded) {
        console.log('🔄 Forcing image initialization...');
        imageLoader.initializeTankImages();
    }
    
    // Set dependencies for render system
    renderSystem.setDependencies(
        particleSystem, 
        imageLoader, 
        imageLoader?.tankImages || {}, 
        imageLoader?.weaponImages || {}, 
        imageLoader?.imagesLoaded || false,
        { tanks: {}, weapons: {} }
    );
    
    window.renderSystem = renderSystem;
    
    // Resize canvas
    resizeCanvas();
    
    // Initialize camera
    if (!gameState.camera) {
        gameState.camera = { x: 0, y: 0, zoom: 1 };
    }
    
    // Initialize mouse state for weapon tracking
    if (!gameState.mouse) {
        gameState.mouse = { 
            x: canvas ? canvas.width / 2 : 0, 
            y: canvas ? canvas.height / 2 : 0, 
            angle: 0, 
            targetAngle: 0 
        };
    }
    
    // Initialize DIRECT weapon angle - calculate from current mouse position immediately
    if (window.WEAPON_ANGLE === undefined) {
        // Calculate initial weapon angle from current mouse position
        const initialMousePos = window.globalMousePos || {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };

        // Calculate angle from canvas center to mouse position
        const centerX = canvas ? canvas.width / 2 : window.innerWidth / 2;
        const centerY = canvas ? canvas.height / 2 : window.innerHeight / 2;
        const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0 };

        const mouseX = initialMousePos.x - rect.left;
        const mouseY = initialMousePos.y - rect.top;
        const initialAngle = Math.atan2(mouseY - centerY, mouseX - centerX);

        window.WEAPON_ANGLE = initialAngle;
        window.WEAPON_ANGLE_INITIALIZED = true; // Mark as properly initialized from mouse
        console.log(`🎯 DIRECT weapon angle initialized to ${(initialAngle * 180 / Math.PI).toFixed(1)}° (from mouse position)`);
    }

    // Weapon angle will be initialized on first mouse move
    
    // Create local player for testing if no server connection
    if (!gameState.playerId) {
        const playerId = 'local_player_' + Date.now();
        gameStateManager.updateGameState({ playerId: playerId });
        
        // Create local player with proper initialization
        const localPlayer = {
            id: playerId,
            x: gameState.gameWidth / 2,
            y: gameState.gameHeight / 2,
            vx: 0,
            vy: 0,
            angle: 0,
            turretAngle: 0,
            currentRotation: 0,
            smoothX: gameState.gameWidth / 2,
            smoothY: gameState.gameHeight / 2,
            smoothGunAngle: 0,
            health: 100,
            maxHealth: 100,
            score: 0,
            kills: 0,
            name: 'Player',
            selectedTank: gameState.selectedTank || {
                color: 'blue',
                body: 'body_halftrack',
                weapon: 'turret_01_mk1'
            }
        };
        
        // Initialize players object if it doesn't exist
        if (!gameState.players) {
            gameState.players = {};
        }
        
        gameState.players[playerId] = localPlayer;
        console.log('🎮 Local player created:', localPlayer);
    }

    // Connect to server
    if (!gameState.isConnected) {
        const gameMode = gameState.selectedGameMode || 'ffa';
        networkSystem.connectToServer(gameMode);
    }
    
    // Initialize input system
    inputSystem.initialize();

    // Initialize weapon angle immediately based on current mouse position
    if (inputSystem && typeof inputSystem.initializeWeaponAngle === 'function') {
        // Small delay to ensure canvas is fully ready
        setTimeout(() => {
            inputSystem.initializeWeaponAngle(canvas);
            console.log('🎯 Weapon angle initialized based on current mouse position during game init');
        }, 50);
    }

    // Start the classic game loop (like in backup)
    gameLoop();
    
    console.log('✅ Game initialized successfully');
    
    // Trigger CrazyGames gameplay start event
    if (window.CrazyGamesIntegration) {
        window.CrazyGamesIntegration.gameplayStart();
    }
}

/**
 * Resize canvas to window dimensions
 */
function resizeCanvas() {
    if (renderSystem) {
        renderSystem.resizeCanvas();
    } else if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

/**
 * Classic game loop (like in backup)
 */
let animationId;

function gameLoop() {
    if (!gameState.isInLobby) {
        update();
        render();
        animationId = requestAnimationFrame(gameLoop);
    }
}

/**
 * Update game systems
 */
function update() {
    // Update input system
    inputSystem.update(16.67, gameState); // ~60 FPS delta time
    
    // Update particle system
    if (particleSystem) {
        particleSystem.update();
    }

    // Update physics system
    if (physicsSystem) {
        physicsSystem.update(16.67); // ~60 FPS delta time
    }

    // Update weapon system
    if (weaponSystem) {
        weaponSystem.update(0.0167, []); // ~60 FPS delta time
    }
    
    // Update tank animations (like backup)
    updateTankAnimations();
}

/**
 * Render the game
 */
function render() {
    if (renderSystem) {
        renderSystem.render();
    }
}

// Smooth rotation helper functions
function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

function lerpAngle(current, target, speed) {
    const diff = normalizeAngle(target - current);
    return current + diff * speed;
}

/**
 * Update tank animations - SMOOTH BODY ROTATION!
 */
function updateTankAnimations() {
    if (!gameState.players || !gameState.playerId) return;
    
    const player = gameState.players[gameState.playerId];
    if (!player) return;
    
    // BODY: Smooth rotation toward WASD movement direction
    const inputDirection = window.physicsSystem ? window.physicsSystem.getLastInputDirection() : { x: 0, y: 0 };
    
    // Initialize body angle if not set
    if (player.bodyAngle === undefined) {
        player.bodyAngle = -Math.PI / 2; // Start facing up
    }
    
    // Initialize last movement direction if not set
    if (player.lastMovementAngle === undefined) {
        player.lastMovementAngle = -Math.PI / 2; // Start facing up
    }
    
    if (Math.abs(inputDirection.x) > 0.01 || Math.abs(inputDirection.y) > 0.01) {
        // Moving - smoothly rotate toward movement direction
        const targetBodyAngle = Math.atan2(inputDirection.y, inputDirection.x);
        
        // Store the last movement direction
        player.lastMovementAngle = targetBodyAngle;
        
        // Smooth interpolation toward movement direction
        const rotationSpeed = 0.15; // Adjust for smoothness (0.1 = slower, 0.3 = faster)
        player.bodyAngle = lerpAngle(player.bodyAngle, targetBodyAngle, rotationSpeed);
        
        console.log('🚗 Body smoothly rotating to:', (targetBodyAngle * 180 / Math.PI).toFixed(1), '° (current:', (player.bodyAngle * 180 / Math.PI).toFixed(1), '°)');
    } else {
        // Not moving - KEEP the last movement direction instead of returning to up
        // This fixes the issue where the body would always return to facing up when stopping
        // Now the body stays in the direction it was facing when movement stopped
        console.log('🚗 Body staying in last direction:', (player.lastMovementAngle * 180 / Math.PI).toFixed(1), '° (current:', (player.bodyAngle * 180 / Math.PI).toFixed(1), '°)');
    }
    
    // WEAPON: Use DIRECT window variable - NO gameState interference!
    if (window.WEAPON_ANGLE !== undefined) {
        // Check if weapon angle has been properly initialized from mouse position
        if (!window.WEAPON_ANGLE_INITIALIZED && window.globalMousePos) {
            // Force initialization if not done yet
            const canvas = document.getElementById('gameCanvas');
            if (canvas && inputSystem && typeof inputSystem.initializeWeaponAngle === 'function') {
                console.log('🔄 Force initializing weapon angle from current mouse position');
                inputSystem.initializeWeaponAngle(canvas);
            }
        }

        // Normal case: weapon angle has been set by mouse movement
        const oldWeaponAngle = player.weaponAngle;
        player.weaponAngle = window.WEAPON_ANGLE; // DIRECT from mouse, no processing

        // Debug: Track weapon angle changes (only in development)
        if (oldWeaponAngle !== undefined && Math.abs(oldWeaponAngle - player.weaponAngle) > 0.1) {
            console.debug('Weapon angle updated:', (player.weaponAngle * 180 / Math.PI).toFixed(1), '°');
        }

        // Optional debug display (can be removed in production)
        if (window.DEBUG_WEAPON_ANGLE) {
            if (!window.weaponAngleDebug) {
                window.weaponAngleDebug = document.createElement('div');
                Object.assign(window.weaponAngleDebug.style, {
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#00f7ff',
                    padding: '5px 10px',
                    borderRadius: '2px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    zIndex: '10000'
                });
                document.body.appendChild(window.weaponAngleDebug);
            }
            const initStatus = window.WEAPON_ANGLE_INITIALIZED ? '✓' : '✗';
            window.weaponAngleDebug.textContent = `🎯 Weapon: ${(player.weaponAngle * 180 / Math.PI).toFixed(1)}° ${initStatus}`;
        }
    } else {
        // FALLBACK: If weapon angle not set, calculate it from current mouse position
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Use global mouse position if available, otherwise assume center of canvas
            const globalMousePos = window.globalMousePos || {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            };

            const mouseX = globalMousePos.x - rect.left;
            const mouseY = globalMousePos.y - rect.top;
            const fallbackAngle = Math.atan2(mouseY - centerY, mouseX - centerX);

            player.weaponAngle = fallbackAngle;
            window.WEAPON_ANGLE = fallbackAngle; // Also set the global variable

            console.log('🔄 FALLBACK weapon angle calculation:', (fallbackAngle * 180 / Math.PI).toFixed(1), '° (mouse:', mouseX.toFixed(0), ',', mouseY.toFixed(0), ')');

            // Weapon angle will be updated on next mouse move
        } else {
            // Emergency fallback: point weapon to the right if no canvas available
            console.warn('🚨 Weapon angle emergency fallback - pointing right (no canvas)');
            player.weaponAngle = 0; // Default: point right
            window.WEAPON_ANGLE = 0;
        }
    }
}

/**
 * Join game - transition from lobby to game
 */
function joinGame() {
    console.log('🎮 Joining game...');
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    // Close shop if open
    if (gameState.showShop) {
        gameStateManager.updateGameState({ showShop: false });
    }
    
    // Animate lobby screen out
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen) {
        lobbyScreen.style.animation = 'fadeOut 0.5s ease-out';
    }
    
    setTimeout(() => {
        // Hide lobby elements
        if (lobbyScreen) {
            lobbyScreen.classList.add('hidden');
            lobbyScreen.style.display = 'none';
        }
        
        // Hide all lobby background canvases
        const tankCanvas = document.getElementById('tankLobbyBackground');
        const jetCanvas = document.getElementById('jetLobbyBackground');
        const raceCanvas = document.getElementById('raceLobbyBackground');
        if (tankCanvas) tankCanvas.style.display = 'none';
        if (jetCanvas) jetCanvas.style.display = 'none';
        if (raceCanvas) raceCanvas.style.display = 'none';
        
        // Show game elements
        const gameMapArea = document.getElementById('gameMapArea');
        const ui = document.getElementById('ui');
        const scoreContainer = document.getElementById('scoreProgressContainer');
        const centerBoxes = document.getElementById('centerBottomBoxes');
        
        if (gameMapArea) gameMapArea.classList.remove('hidden');
        if (ui) ui.classList.remove('hidden');
        if (scoreContainer) scoreContainer.classList.remove('hidden');
        if (centerBoxes) centerBoxes.classList.remove('hidden');
        
        gameStateManager.updateGameState({ isInLobby: false });
        
        // Clear DOM map renderer's game container to prevent duplicate rendering
        if (window.DOMMapRenderer && typeof window.DOMMapRenderer.clearGameMap === 'function') {
            window.DOMMapRenderer.clearGameMap();
        }
        
        // Load selected map (like in backup)
        if (window.selectedCreatedMapId && window.MapRenderer) {
            console.log('🗺️ Loading selected map into game:', window.selectedCreatedMapId);
            window.MapRenderer.loadById(window.selectedCreatedMapId);
        } else if (window.DOMMapRenderer?.currentMap && window.MapRenderer) {
            console.log('🗺️ Loading current map from DOM renderer into game');
            window.MapRenderer.loadMap(window.DOMMapRenderer.currentMap);
        } else {
            // Try to load the first available player-created map
            try {
                const maps = JSON.parse(localStorage.getItem(STORAGE_KEYS.TANK_MAPS) || '[]');
                const createdMaps = maps.filter(m => m.isUserCreated !== false);
                if (createdMaps.length > 0 && window.MapRenderer) {
                    console.log('🗺️ Loading first available created map:', createdMaps[0].name);
                    window.MapRenderer.loadMap(createdMaps[0]);
                } else {
                    console.warn('⚠️ No created maps available - create a map first!');
                }
            } catch (e) {
                console.warn('⚠️ Error loading maps:', e);
            }
        }
        
        // Show game canvas and initialize weapon tracking
        setTimeout(() => {
            const gameCanvas = document.getElementById('gameCanvas');
            if (gameCanvas) {
                gameCanvas.style.display = 'block';

                // Ensure input system canvas handlers are set up now that canvas is visible
                if (inputSystem && typeof inputSystem.setupInputHandlers === 'function') {
                    inputSystem.setupInputHandlers();
                    console.log('🎮 Input handlers re-setup after canvas visibility');
                }

                // Initialize weapon angle immediately based on current mouse position
                if (inputSystem && typeof inputSystem.initializeWeaponAngle === 'function') {
                    inputSystem.initializeWeaponAngle(gameCanvas);
                    console.log('🎯 Weapon angle initialized based on current mouse position');
                }
            }
        }, 100);

        initializeGame();
        
        console.log('✅ Game joined successfully');
    }, 500);
}

// Expose joinGame globally (early exposure for HTML handlers)
window.joinGame = joinGame;

// Initialize image loading
imageLoader.initializeTankImages();

// Set up image loading completion callback
if (typeof window !== 'undefined') {
    window.onImageLoadingComplete = () => {
        console.log('🎮 Images loaded - rendering lobby');
        
        // Render tank in lobby
        if (typeof renderTankOnCanvas === 'function' && gameState.selectedTank) {
            renderTankOnCanvas('playerTankCanvas', gameState.selectedTank, { 
              isLobby: true, 
              scale: 1.8 
            });
        }
        
        // Start lobby animations
        if (typeof animateLobbyTanks === 'function') {
            animateLobbyTanks();
        }

        // Start GIF lobby animation
        if (window.imageLoader && typeof window.imageLoader.startLobbyAnimation === 'function') {
            window.imageLoader.startLobbyAnimation();
        }
        
        // Initialize lobby background
        if (typeof initializeLobbyBackground === 'function') {
            const allMaps = JSON.parse(localStorage.getItem(STORAGE_KEYS.TANK_MAPS) || '[]');
            const tankMaps = allMaps.filter(map => !map.vehicleType || map.vehicleType === 'tank');
            
            if (tankMaps.length > 0) {
                initializeLobbyBackground();
            }
        }
    };
}

// Handle window resize
window.addEventListener('resize', () => {
    if (renderSystem) {
        renderSystem.resizeCanvas();
    }
    
    if (gameState.isInLobby && lobbyUI) {
        lobbyUI.renderLobbyBackground();
    }
});

// Clean up old maps with broken paths (runs once on load)
(function cleanupOldMaps() {
    try {
        // Clean race maps with old paths
        const raceMapsKey = STORAGE_KEYS.RACE_MAPS;
        const raceMaps = JSON.parse(localStorage.getItem(raceMapsKey) || '[]');
        if (raceMaps.length > 0) {
            const hasOldPaths = raceMaps.some(m => 
                JSON.stringify(m).includes('spr_car_') || 
                JSON.stringify(m).includes('spr_Track') ||
                JSON.stringify(m).includes('spr_tile_') ||
                JSON.stringify(m).includes('spr_house') ||
                JSON.stringify(m).includes('-4')
            );
            if (hasOldPaths) {
                localStorage.removeItem(raceMapsKey);
                console.log('🧹 Cleared old race maps with broken paths');
            }
        }
        
        // Clean tank maps with old broken paths
        const tankMapsKey = STORAGE_KEYS.TANK_MAPS;
        const tankMaps = JSON.parse(localStorage.getItem(tankMapsKey) || '[]');
        if (tankMaps.length > 0) {
            const mapStr = JSON.stringify(tankMaps);
            const hasOldGroundPaths = mapStr.includes('_Group_') || 
                                       /ground_\d+\.png/.test(mapStr) ||
                                       (mapStr.includes('Grounds/') && !mapStr.includes('/assets/tank/Grounds/'));
            if (hasOldGroundPaths) {
                localStorage.removeItem(tankMapsKey);
                console.log('🧹 Cleared old tank maps with broken ground paths');
            }
        }
    } catch (e) {
        console.warn('Failed to cleanup old maps:', e);
    }
})();

console.log('🚀 Game coordinator initialized');

/**
 * Force start game for testing (bypasses lobby)
 * Call this function in console to test tank rendering and movement
 */
function forceStartGame() {
    console.log('🚀 Force starting game for testing...');
    
    // Set game state to not in lobby FIRST
    gameStateManager.updateGameState({ isInLobby: false });
    
    // Show game elements
    const gameMapArea = document.getElementById('gameMapArea');
    if (gameMapArea) {
        gameMapArea.classList.remove('hidden');
        gameMapArea.style.display = 'block';
        console.log('✅ Game map area shown');
    } else {
        console.error('❌ Game map area not found');
    }
    
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
        gameCanvas.style.display = 'block';
        gameCanvas.style.position = 'absolute';
        gameCanvas.style.top = '0';
        gameCanvas.style.left = '0';
        gameCanvas.style.width = '100%';
        gameCanvas.style.height = '100%';
        gameCanvas.style.zIndex = '1';
        console.log('✅ Game canvas shown and styled');
    } else {
        console.error('❌ Game canvas not found');
    }
    
    // Hide lobby
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen) {
        lobbyScreen.style.display = 'none';
        console.log('✅ Lobby screen hidden');
    }
    
    // Check and create test map if needed, then load it
    const loadedMap = checkAndCreateTestMap();
    if (!loadedMap) {
        console.warn('⚠️ No maps available - will show fallback rendering');
    }
    
    // Initialize game if not already done
    if (!animationId) {
        console.log('🎮 Initializing game for the first time...');
        initializeGame();
    } else {
        console.log('🎮 Restarting existing game loop...');
        // Cancel existing animation frame and restart
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        gameLoop();
    }
    
    // Force a render immediately
    setTimeout(() => {
        if (renderSystem) {
            console.log('🎨 Forcing immediate render...');
            renderSystem.render();
        }
    }, 100);
    
    console.log('✅ Game force started - you should see tank and be able to move with WASD');
    console.log('📊 Current game state:', {
        isInLobby: gameState.isInLobby,
        playerId: gameState.playerId,
        hasPlayer: !!gameState.players?.[gameState.playerId],
        canvasVisible: !!document.getElementById('gameCanvas'),
        animationId: !!animationId,
        renderSystemExists: !!renderSystem,
        mapRendererExists: !!window.MapRenderer,
        hasMap: !!(window.MapRenderer?.currentMap)
    });
}

/**
 * Debug function to check game state
 */
function debugGameState() {
    console.log('🔍 Game State Debug:');
    console.log('- isInLobby:', gameState.isInLobby);
    console.log('- playerId:', gameState.playerId);
    console.log('- players:', gameState.players);
    console.log('- keys:', gameState.keys);
    console.log('- camera:', gameState.camera);
    console.log('- canvas:', document.getElementById('gameCanvas'));
    console.log('- animationId:', animationId);
    console.log('- renderSystem:', renderSystem);
    console.log('- physicsSystem:', physicsSystem);
    console.log('- inputSystem:', inputSystem);
    
    const player = gameState.players ? gameState.players[gameState.playerId] : null;
    if (player) {
        console.log('- player position:', { x: player.x, y: player.y });
        console.log('- player velocity:', { vx: player.vx, vy: player.vy });
    }
    
    // Check maps
    console.log('🗺️ Map Debug:');
    console.log('- MapRenderer exists:', !!window.MapRenderer);
    console.log('- MapRenderer currentMap:', window.MapRenderer?.currentMap?.name);
    console.log('- selectedCreatedMapId:', window.selectedCreatedMapId);
    
    // Check available maps
    try {
        const maps = JSON.parse(localStorage.getItem(STORAGE_KEYS.TANK_MAPS) || '[]');
        console.log('- Available maps:', maps.length);
        maps.forEach((map, i) => {
            console.log(`  ${i + 1}. ${map.name} (ID: ${map.id}) - ${map.objects?.length || 0} objects`);
        });
    } catch (e) {
        console.log('- Error reading maps:', e);
    }
}

/**
 * Debug function to check and create a test map if none exist
 */
function checkAndCreateTestMap() {
    console.log('🗺️ Checking for created maps...');
    
    try {
        const maps = JSON.parse(localStorage.getItem(STORAGE_KEYS.TANK_MAPS) || '[]');
        console.log('Found', maps.length, 'maps');
        
        if (maps.length === 0) {
            console.log('🆕 No maps found, creating a test map...');
            
            // Create a simple test map
            const testMap = {
                id: Date.now().toString(),
                name: 'Test Battle Arena',
                created: new Date().toISOString(),
                isUserCreated: true,
                vehicleType: 'tank',
                groundTiles: [
                    { key: '0,0', type: 'LightSand', image: '/assets/tank/Grounds/LightSand.png' },
                    { key: '1,0', type: 'LightSand', image: '/assets/tank/Grounds/LightSand.png' },
                    { key: '0,1', type: 'LightSand', image: '/assets/tank/Grounds/LightSand.png' },
                    { key: '1,1', type: 'LightSand', image: '/assets/tank/Grounds/LightSand.png' }
                ],
                objects: [
                    {
                        name: 'house_01',
                        x: 200,
                        y: 200,
                        image: '/assets/tank/Buildings/House_01/spr_top_down_view_house_01_front.png'
                    }
                ]
            };
            
            const updatedMaps = [testMap];
            localStorage.setItem(STORAGE_KEYS.TANK_MAPS, JSON.stringify(updatedMaps));
            
            console.log('✅ Test map created:', testMap.name);
            
            // Load the test map into MapRenderer
            if (window.MapRenderer) {
                window.MapRenderer.loadMap(testMap);
                window.selectedCreatedMapId = testMap.id;
                console.log('✅ Test map loaded into MapRenderer');
            }
            
            return testMap;
        } else {
            console.log('✅ Maps already exist');
            
            // Load the first available map
            const firstMap = maps[0];
            if (window.MapRenderer && firstMap) {
                window.MapRenderer.loadMap(firstMap);
                window.selectedCreatedMapId = firstMap.id;
                console.log('✅ Loaded first available map:', firstMap.name);
            }
            
            return firstMap;
        }
    } catch (e) {
        console.error('❌ Error checking/creating maps:', e);
        return null;
    }
}

/**
 * Simple test to draw a tank immediately on canvas
 */
function testTankRender() {
    console.log('🎨 Testing immediate tank render...');
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('❌ Canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ Context not found');
        return;
    }
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Clear with blue background
    ctx.fillStyle = '#4a9ad8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simple tank in the center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Draw tank shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(5, 5, 35, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw tank body
    ctx.fillStyle = '#2196F3'; // Blue tank
    ctx.fillRect(-30, -40, 60, 80);
    
    // Draw tank tracks
    ctx.fillStyle = '#333';
    ctx.fillRect(-35, -35, 10, 70);
    ctx.fillRect(25, -35, 10, 70);
    
    // Draw turret
    ctx.fillStyle = '#1976D2'; // Darker blue
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw gun barrel
    ctx.fillStyle = '#444';
    ctx.fillRect(-5, -50, 10, 35);
    
    // Draw player name
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-40, -70, 80, 20);
    ctx.fillStyle = '#00ff00';
    ctx.fillText('Test Player', 0, -55);
    
    ctx.restore();
    
    // Draw debug grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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
    
    console.log('✅ Tank rendered at center:', centerX, centerY);
}

// Expose globally for console testing
window.forceStartGame = forceStartGame;
window.debugGameState = debugGameState;
window.testTankRender = testTankRender;
window.checkAndCreateTestMap = checkAndCreateTestMap;

// Initialize weapon recoil animation system
if (typeof window !== 'undefined') {
    window.gunRecoilAnimation = {
        left: 0,
        shake: 0
    };
}

// Expose classic game loop functions
window.gameLoop = gameLoop;
window.update = update;
window.render = render;
window.resizeCanvas = resizeCanvas;

// ===== MISSING FUNCTION IMPLEMENTATIONS =====
// These functions are called by HTML event handlers but were missing

/**
 * Show party invite menu
 * Called by party invite buttons in the lobby
 */
function showPartyInviteMenu() {
    console.log('🎉 Party invite menu requested');
    
    // TODO: Implement party invite functionality
    // For now, show a placeholder alert
    alert('Party invite feature coming soon! This will allow you to invite friends to join your party.');
    
    // Future implementation should:
    // 1. Show a modal with friend list
    // 2. Allow selecting friends to invite
    // 3. Send party invitations
    // 4. Handle invite responses
}

/**
 * Select vehicle type (jet, tank, race)
 * Called by vehicle selection buttons in the lobby
 */
function selectVehicleType(vehicleType) {
    console.log(`🚗 Vehicle type selected: ${vehicleType}`);
    
    // Update game state
    if (gameState) {
        gameState.selectedVehicleType = vehicleType;
    }
    
    // Update UI to show selected vehicle
    const buttons = document.querySelectorAll('.vehicle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const selectedBtn = document.getElementById(`${vehicleType}Btn`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Update any vehicle-specific UI elements
    updateVehicleUI(vehicleType);
    
    console.log(`✅ Vehicle type set to: ${vehicleType}`);
}

/**
 * Update UI based on selected vehicle type
 */
function updateVehicleUI(vehicleType) {
    // Update vehicle indicator if it exists
    const indicator = document.getElementById('vehicleTypeIndicator');
    if (indicator) {
        indicator.textContent = vehicleType.toUpperCase();
    }
    
    // Update any vehicle-specific elements
    const vehicleElements = document.querySelectorAll('[data-vehicle]');
    vehicleElements.forEach(element => {
        const elementVehicle = element.getAttribute('data-vehicle');
        if (elementVehicle === vehicleType) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}



/**
 * Switch champions tab
 * Called by champions leaderboard tab buttons
 */
function switchChampionsTab(tabName) {
    console.log(`🏆 Champions tab switched to: ${tabName}`);
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('[id^="tab"]');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeTab = document.getElementById(`tab${tabName}`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update tab content
    const tabContents = document.querySelectorAll('.champions-tab-content');
    tabContents.forEach(content => {
        const contentTab = content.getAttribute('data-tab');
        if (contentTab === tabName) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
    
    // Load tab-specific data
    loadChampionsData(tabName);
}

/**
 * Load champions data for specific tab
 */
function loadChampionsData(tabName) {
    console.log(`📊 Loading champions data for: ${tabName}`);

    // Use the champions manager if available
    if (window.championsManager) {
        // Show loading message
        const leaderboard = document.getElementById('championsLeaderboard');
        if (leaderboard) {
            leaderboard.innerHTML = `<p>Loading ${tabName} data...</p>`;

            // Simulate loading delay
            setTimeout(() => {
                leaderboard.innerHTML = `<p>${tabName} data loaded successfully!</p>`;

                // After showing success message, render the actual leaderboard
                setTimeout(() => {
                    window.championsManager.switchTab(tabName);
                }, 1000);
            }, 1000);
        }
    } else {
        console.warn('Champions manager not available');
    }
}

/**
 * Switch friends tab
 * Called by friends system tab buttons
 */
function switchFriendsTab(tabName) {
    console.log(`👥 Friends tab switched to: ${tabName}`);
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.friends-tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the clicked button
    const activeBtn = document.querySelector(`[onclick*="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Update tab content
    const tabContents = document.querySelectorAll('.friends-tab-content');
    tabContents.forEach(content => {
        const contentTab = content.getAttribute('data-tab');
        if (contentTab === tabName) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
}

/**
 * Scroll locker items
 * Called by locker scroll buttons
 */
function scrollLockerItems(direction) {
    console.log(`📦 Scrolling locker items: ${direction}`);
    
    // Use locker UI if available
    if (window.lockerUI && typeof window.lockerUI.scroll === 'function') {
        window.lockerUI.scroll(direction);
    } else {
        // Fallback implementation
        const container = document.querySelector('.locker-items-container');
        if (container) {
            const scrollAmount = 200;
            const currentScroll = container.scrollLeft;
            
            if (direction === 'left') {
                container.scrollLeft = currentScroll - scrollAmount;
            } else if (direction === 'right') {
                container.scrollLeft = currentScroll + scrollAmount;
            }
        }
    }
}

/**
 * Select locker item
 * Called by locker item selection button
 */
function selectLockerItem(itemId) {
    console.log(`📦 Locker item selected: ${itemId || 'current'}`);
    
    // Use locker UI if available
    if (window.lockerUI && typeof window.lockerUI.selectItem === 'function') {
        window.lockerUI.selectItem(itemId);
    } else {
        // Fallback implementation
        console.log('Locker UI not available, using fallback');
        alert('Item selected! This will be implemented with the full locker system.');
    }
}

/**
 * Respawn player
 * Called by respawn button in game
 */
function respawnPlayer() {
    console.log('💀 Player respawn requested');
    
    // Check if player can respawn
    if (gameState && gameState.gameMode === 'playing') {
        // Reset player state
        if (gameState.player) {
            gameState.player.health = 100;
            gameState.player.isDead = false;
            
            // Reset position to spawn point
            const spawnPoint = getRandomSpawnPoint();
            if (spawnPoint) {
                gameState.player.x = spawnPoint.x;
                gameState.player.y = spawnPoint.y;
            }
            
            console.log('✅ Player respawned successfully');
        }
        
        // Hide respawn UI
        const respawnBtn = document.getElementById('respawnBtn');
        if (respawnBtn) {
            respawnBtn.style.display = 'none';
        }
    } else {
        console.log('❌ Cannot respawn - not in game mode');
    }
}

/**
 * Get random spawn point
 * Helper function for respawning
 */
function getRandomSpawnPoint() {
    // Default spawn points - should be loaded from map data
    const defaultSpawns = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
        { x: 300, y: 300 }
    ];
    
    return defaultSpawns[Math.floor(Math.random() * defaultSpawns.length)];
}

/**
 * Filter friends list
 * Called by friend search input
 */
function filterFriends(searchTerm) {
    console.log(`🔍 Filtering friends: ${searchTerm || 'all'}`);
    
    const searchInput = document.getElementById('friendSearchInput');
    const actualSearchTerm = searchTerm || (searchInput ? searchInput.value : '');
    
    // Get all friend items
    const friendItems = document.querySelectorAll('.friend-item');
    
    friendItems.forEach(item => {
        const friendName = item.querySelector('.friend-name');
        if (friendName) {
            const name = friendName.textContent.toLowerCase();
            const matches = name.includes(actualSearchTerm.toLowerCase());
            
            item.style.display = matches ? 'block' : 'none';
        }
    });
    
    console.log(`📋 Filtered friends list for: "${actualSearchTerm}"`);
}

/**
 * Friend interaction functions
 */
function inviteFriend(friendId) {
    console.log(`📧 Inviting friend: ${friendId || 'unknown'}`);
    alert('Friend invite sent! This feature will be fully implemented with the social system.');
}

function messageFriend(friendId) {
    console.log(`💬 Messaging friend: ${friendId || 'unknown'}`);
    alert('Opening message with friend! This feature will be fully implemented with the chat system.');
}

function spectateFriend(friendId) {
    console.log(`👀 Spectating friend: ${friendId || 'unknown'}`);
    alert('Spectating friend! This feature will be fully implemented with the spectator system.');
}

function declineFriendRequest(requestId) {
    console.log(`❌ Declining friend request: ${requestId || 'unknown'}`);
    alert('Friend request declined! This feature will be fully implemented with the social system.');
}

/**
 * Game mode functions
 */
function closeGameModeModal() {
    console.log('❌ Closing map browser modal');
    if (window.closeMapBrowserModal) {
        window.closeMapBrowserModal();
        return;
    }
    
    const overlay = document.getElementById('mapBrowserModalOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        console.log('✅ Map browser modal closed');
    } else {
        console.warn('⚠️ Map browser modal overlay not found');
    }
}

function scrollGameModeList(direction) {
    console.log(`📜 Scrolling game mode list: ${direction}`);
    
    const container = document.querySelector('.game-mode-list');
    if (container) {
        const scrollAmount = 150;
        const currentScroll = container.scrollTop;
        
        if (direction === 'up') {
            container.scrollTop = currentScroll - scrollAmount;
        } else if (direction === 'down') {
            container.scrollTop = currentScroll + scrollAmount;
        }
    }
}

function toggleTeamModeDropdown() {
    console.log('🔽 Toggling team mode dropdown');

    const dropdown = document.querySelector('.team-mode-dropdown');
    if (dropdown) {
        const isVisible = !dropdown.classList.contains('hidden');
        if (isVisible) {
            dropdown.classList.add('hidden');
        } else {
            dropdown.classList.remove('hidden');
            // Initialize selected option if not already done
            if (!dropdown.querySelector('.team-mode-option.selected')) {
                const soloOption = dropdown.querySelector('.team-mode-option');
                if (soloOption && soloOption.textContent.toLowerCase() === 'solo') {
                    soloOption.classList.add('selected');
                }
            }
        }
    }
}

function selectTeamMode(mode) {
    console.log(`👥 Team mode selected: ${mode}`);

    // Update game state
    if (gameState) {
        gameState.teamMode = mode;
    }

    // Update UI
    const modeDisplay = document.getElementById('teamModeText');
    if (modeDisplay) {
        modeDisplay.textContent = mode.toUpperCase();
    }

    // Update selected option in dropdown
    const options = document.querySelectorAll('.team-mode-option');
    options.forEach(option => {
        option.classList.remove('selected');
        if (option.textContent.toLowerCase() === mode.toLowerCase()) {
            option.classList.add('selected');
        }
    });

    // Hide dropdown
    toggleTeamModeDropdown();
}

function openBattleRoyal() {
    console.log('👑 Opening Battle Royal mode - showing map selection modal');
    if (window.openMapBrowserModal) {
        window.openMapBrowserModal();
        return;
    }

    // Show the map browser modal for map selection
    const modal = document.getElementById('mapBrowserModal');
    const overlay = document.getElementById('mapBrowserModalOverlay');
    
    if (modal && overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex'; // Ensure it's visible
        console.log('✅ Map browser modal shown');

        // Populate the modal with available maps
        if (typeof window.populateGameModeList === 'function') {
            window.populateGameModeList();
            console.log('✅ Map list populated');
        } else {
            console.warn('⚠️ populateGameModeList function not available');
        }
    } else {
        console.error('❌ Map browser modal not found');
    }
}

// Make functions globally available for HTML event handlers
window.showPartyInviteMenu = showPartyInviteMenu;
window.selectVehicleType = selectVehicleType;
window.switchChampionsTab = switchChampionsTab;
window.switchFriendsTab = switchFriendsTab;
window.scrollLockerItems = scrollLockerItems;
window.selectLockerItem = selectLockerItem;
window.respawnPlayer = respawnPlayer;
window.filterFriends = filterFriends;
window.inviteFriend = inviteFriend;
window.messageFriend = messageFriend;
window.spectateFriend = spectateFriend;
window.declineFriendRequest = declineFriendRequest;
window.closeGameModeModal = closeGameModeModal;
window.scrollGameModeList = scrollGameModeList;
window.toggleTeamModeDropdown = toggleTeamModeDropdown;
window.selectTeamMode = selectTeamMode;
window.openBattleRoyal = openBattleRoyal;
