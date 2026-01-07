/**
 * Configuration constants for the game
 * Centralized location for all game constants and configuration values
 */

// Tank configuration
export const TANK_CONFIG = {
    colors: ['blue', 'camo', 'desert', 'purple', 'red'],
    bodies: ['body_halftrack', 'body_tracks'], // Moved halftrack first as requested
    weapons: ['turret_01_mk1', 'turret_01_mk2', 'turret_01_mk3', 'turret_01_mk4', 'turret_02_mk1', 'turret_02_mk2', 'turret_02_mk3', 'turret_02_mk4'],
    prices: {
        colors: { blue: 0, camo: 0, desert: 0, purple: 0, red: 0 }, // Colors are free, price is per item
        bodies: {
            body_halftrack: 100, // First body item
            body_tracks: 200     // Second body item
        },
        weapons: {
            turret_01_mk1: 300, turret_01_mk2: 400, turret_01_mk3: 500, turret_01_mk4: 600,
            turret_02_mk1: 700, turret_02_mk2: 800, turret_02_mk3: 900, turret_02_mk4: 1000
        }
    },
    // Price multipliers per color tier
    colorMultipliers: {
        blue: 1,      // 100-900
        camo: 10,     // 1000-1900 (100*10 to 900*10)
        desert: 30,   // 3000-3900
        purple: 50,   // 5000-5900
        red: 70       // 7000-7900
    }
};

// Jet configuration
export const JET_CONFIG = {
    types: ['ship1', 'ship2', 'ship3'],
    colors: ['purple', 'red', 'gold'], // Available jet colors based on actual assets
    prices: {
        types: {
            ship1: 0,    // Fighter - free starter
            ship2: 1500, // Bomber
            ship3: 3000  // Interceptor
        },
        colors: {
            purple: 0,   // Base tier - free
            red: 2000,   // Mid tier
            gold: 5000   // Premium tier
        }
    }
};

// Shop layout constants
export const SHOP_CONFIG = {
    SQUARE_SIZE: 270, // 2x smaller for Netflix-style browsing (was 540)
    GRID_SPACING: 20, // Compact spacing for Netflix-style layout
    PREVIEW_SIZE: 200 // Adjusted preview size for smaller boxes
};

// Asteroid configuration
export const ASTEROID_CONFIG = {
    sizes: ['Large 1', 'Large 2', 'Medium 1', 'Medium 2', 'Small 1', 'Small 2'],
    types: ['Rock', 'Ice', 'Gold'],
    count: 0, // Disabled random asteroids - only show asteroids placed in map editor
    minSize: 0.8,
    maxSize: 1.5,
    rotationSpeed: { min: -0.01, max: 0.01 }
};

// Physics constants
export const PHYSICS_CONFIG = {
    TANK_ACCELERATION: 0.25, // Slower initial acceleration for realistic feel
    TANK_DECELERATION: 0.92, // Less friction for more momentum/sliding (0.92 = 8% speed loss per frame)
    TANK_MAX_SPEED: 8, // Higher top speed for racing feel
    TANK_SPRINT_MAX_SPEED: 14, // Much higher sprint speed for racing (1.75x normal)
    TANK_TURN_SPEED: 0.08, // How fast the tank turns while moving
    TANK_DRIFT_FACTOR: 0.95, // How much the tank maintains momentum when turning (closer to 1 = more drift)
    TANK_GRIP: 0.85, // Traction/grip when turning (lower = more drift)
    BULLET_SPEED: 8,
    BULLET_LIFETIME: 3000, // milliseconds
    COLLISION_RADIUS: 20,
    FRICTION: 0.95
};

// Network configuration
export const NETWORK_CONFIG = {
    port: 5000, // WebSocket server port
    SOCKET_INTERVAL_TIME: 33, // Time in ms between movement updates (30 updates per second)
    RECONNECT_DELAY: 1000,
    MAX_RECONNECT_ATTEMPTS: 5
};

// UI configuration
export const UI_CONFIG = {
    LOADING_MIN_TIME: 5000, // 5 seconds minimum loading time
    ANIMATION_DURATION: 300,
    FADE_DURATION: 200
};

// Weather system configuration
export const WEATHER_CONFIG = {
    MAX_PARTICLES: 500,
    PARTICLE_INTENSITY_MULTIPLIER: 3,
    WIND_EFFECT: 0.01
};

// Storage keys
export const STORAGE_KEYS = {
    RACE_MAPS: 'thefortz.raceMaps',
    TANK_MAPS: 'thefortz.customMaps',
    USER_SETTINGS: 'thefortz.settings',
    PLAYER_PROGRESS: 'thefortz.progress'
};

// Default game state structure
export const DEFAULT_GAME_STATE = {
    isInLobby: true,
    isConnected: false,
    playerId: null,
    clientId: null, // Will be set when we receive it from server
    players: {},
    shapes: [],
    walls: [],
    bullets: [],
    gameWidth: 7500,
    gameHeight: 7500,
    camera: { x: 0, y: 0, zoom: 1 }, // Camera starts at center (0,0)
    keys: {},
    mouse: { x: 0, y: 0, angle: 0 },
    shapeSpawnTimers: {}, // Track respawn timers for shapes
    fortzCurrency: 10000, // Track earned Fortz currency - start with 10,000
    selectedVehicleType: 'tank', // Default to tank
    selectedTank: {
        color: 'blue',
        body: 'body_halftrack',
        weapon: 'turret_01_mk1'
    },
    selectedJet: {
        type: 'ship1',
        color: 'purple'  // Start with purple (base tier), then red, then gold (best)
    },
    selectedRace: {
        type: 'endurance',
        color: 'blue'
    },
    showShop: false,
    showLocker: false,
    showSettings: false,
    showCreateMap: false,
    showPass: false,
    showFriends: false,
    showGameModes: false,
    selectedGameMode: 'ffa',
    selectedMap: null,
    ownedItems: {
        colors: ['blue'],
        bodies: ['body_halftrack'],
        weapons: ['turret_01_mk1']
    },
    settings: {
        sound: { master: 75, effects: 75, music: 50 },
        graphics: { quality: 'high', particles: true, shadows: true },
        controls: { moveUp: 'w', moveDown: 's', moveLeft: 'a', moveRight: 'd', shoot: 'mouse', sprint: 'shift' }
    },
    wallColor: '#FF6B6B' // Unique wall color per mode
};

// Default locker state
export const DEFAULT_LOCKER_STATE = {
    selectedVehicle: 'tank',
    isAnimating: false,
    upgradeLevel: 1
};

// Sound system configuration
export const SOUND_CONFIG = {
    enabled: true,
    volume: 0.5,
    effects: {
        shoot: 'shoot.wav',
        explosion: 'explosion.wav',
        engine: 'engine.wav'
    }
};

// Power-up system configuration
export const POWERUP_CONFIG = {
    TYPES: {
        BLUEHEALTH: { image: '/assets/images/powerups/bluehealth100+.png', color: '#4169E1', duration: 0, effect: 'bluehealth' }
    },
    COMBO_DURATION: 3000
};