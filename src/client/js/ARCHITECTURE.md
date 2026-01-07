# Game Architecture Documentation

## Overview

This document describes the modular architecture of the game after the refactoring from a monolithic 10,000+ line `game.js` file into a well-organized, maintainable codebase.

## Architecture Principles

The refactored architecture follows these key principles:

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Modularity**: Code is organized into logical, reusable modules
3. **Dependency Management**: Clear import/export patterns with no circular dependencies
4. **State Centralization**: All game state is managed through a centralized GameState module
5. **Backward Compatibility**: Global references maintained where needed for legacy code

## Directory Structure

```
src/client/js/
├── game.js                    # Main coordinator (<500 lines)
├── core/                      # Core game systems
│   ├── Config.js             # All game constants and configuration
│   ├── GameState.js          # Centralized state management
│   ├── GameLoop.js           # Main game loop coordination
│   └── ModuleManager.js      # Module initialization and management
├── systems/                   # Game systems
│   ├── InputSystem.js        # Input handling (keyboard, mouse, touch)
│   ├── NetworkSystem.js      # WebSocket communication
│   ├── ParticleSystem.js     # Visual effects and particles
│   ├── PhysicsSystem.js      # Movement, collision, physics
│   ├── RenderSystem.js       # All rendering logic
│   └── WeaponSystem.js       # Shooting, recoil, weapon animations
├── entities/                  # Game entities
│   ├── Player.js             # Player-specific logic
│   ├── Tank.js               # Tank behavior and rendering
│   └── Bullet.js             # Bullet physics and rendering
├── assets/                    # Asset management
│   └── ImageLoader.js        # Image loading and caching
├── ui/                        # UI components
│   ├── LobbyUI.js            # Lobby interface
│   ├── ShopUI.js             # Shop system
│   ├── LockerUI.js           # Locker/customization
│   └── Auth.js               # Authentication UI
├── utils/                     # Utility functions
│   ├── MathUtils.js          # Mathematical utilities
│   ├── CollisionUtils.js     # Collision detection
│   └── StorageUtils.js       # localStorage management
└── tests/                     # Property-based tests
    ├── module-organization.test.js
    ├── code-duplication-elimination.test.js
    ├── dependency-graph-acyclicity.test.js
    └── ... (other property tests)
```

## Core Modules

### Config.js

**Purpose**: Single source of truth for all game constants and configuration values.

**Exports**:
- `TANK_CONFIG`: Tank colors, bodies, weapons, prices
- `PHYSICS_CONFIG`: Movement, collision, bullet physics
- `NETWORK_CONFIG`: WebSocket settings
- `UI_CONFIG`: UI timing and animation settings
- `STORAGE_KEYS`: localStorage key constants
- `DEFAULT_GAME_STATE`: Initial game state structure

**Usage**:
```javascript
import { TANK_CONFIG, PHYSICS_CONFIG } from './core/Config.js';
```

### GameState.js

**Purpose**: Centralized state management with listener pattern for state changes.

**Key Features**:
- Singleton pattern for global state access
- State change listeners for reactive updates
- Player management (add, remove, update)
- Backward compatibility with global `window.gameState`

**API**:
```javascript
import gameStateManager from './core/GameState.js';

// Get state
const state = gameStateManager.getGameState();

// Update state
gameStateManager.updateGameState({ isInLobby: false });

// Listen to changes
gameStateManager.addListener('gameState', 'myListener', (oldState, newState) => {
  console.log('State changed:', newState);
});
```

### GameLoop.js

**Purpose**: Coordinates the main game loop and system updates.

**Responsibilities**:
- Start/stop game loop
- Update all systems in correct order
- Manage frame timing and delta time
- Coordinate rendering

**Update Order**:
1. InputSystem
2. PhysicsSystem
3. ParticleSystem
4. WeaponSystem
5. AnimationManager
6. RenderSystem

## System Modules

### InputSystem.js

**Purpose**: Handles all user input (keyboard, mouse, touch).

**Features**:
- Keyboard event handling
- Mouse tracking and shooting
- Touch input support
- Sprint and special ability keys
- Canvas event handlers

**Key Methods**:
- `setupInputHandlers()`: Initialize event listeners
- `getMovementInput()`: Get WASD/arrow key input
- `isKeyPressed(key)`: Check if key is pressed
- `update(deltaTime, gameState)`: Update input state

### NetworkSystem.js

**Purpose**: Manages WebSocket communication with game server.

**Features**:
- Connection management
- Message handling and routing
- Automatic reconnection
- Movement update broadcasting
- Server message handlers

**Key Methods**:
- `connectToServer(gameMode)`: Connect to server
- `sendToServer(type, data)`: Send message to server
- `handleServerMessage(data)`: Process server messages
- `startMovementUpdates()`: Begin sending position updates

### ParticleSystem.js

**Purpose**: Manages all visual effects and particle systems.

**Particle Types**:
- Bullet trails
- Explosions
- Impact particles
- Exhaust smoke
- Muzzle flashes
- Weather effects (rain, snow)
- Screen shake

**Key Methods**:
- `createExplosion(x, y, size)`: Create explosion effect
- `createBulletTrail(bullet)`: Create bullet trail
- `createExhaustSmoke(x, y, rotation, velocity)`: Tank exhaust
- `toggleWeather(type)`: Enable/disable weather
- `update()`: Update all particles
- `render()`: Render all effects

### PhysicsSystem.js

**Purpose**: Handles tank movement, collision detection, and physics calculations.

**Features**:
- Tank movement with sliding physics
- Sprint system with stamina
- Collision detection (walls, hexagons)
- Camera following
- Recoil physics
- Position interpolation

**Key Methods**:
- `updateTankPhysics(inputX, inputY)`: Update tank movement
- `isNearWall(x, y)`: Check wall collision
- `updateCamera(player)`: Follow player with camera
- `applyRecoil(vx, vy, duration)`: Apply recoil force
- `updateSprintSystem()`: Manage sprint stamina

### RenderSystem.js

**Purpose**: Centralized rendering for all game visuals.

**Responsibilities**:
- Canvas management
- Map rendering
- Player/tank rendering
- AI tank rendering
- Particle rendering
- UI notifications

**Key Methods**:
- `render()`: Main render function
- `renderLobbyBackground()`: Render lobby map
- `drawPlayers()`: Render player tanks
- `drawAITanks()`: Render AI opponents
- `resizeCanvas()`: Handle window resize

### WeaponSystem.js

**Purpose**: Manages shooting, recoil, and weapon animations.

**Features**:
- Shooting cooldown management
- Gun recoil animations
- Muzzle flash effects
- Weapon sprite animations
- Cooldown cursor
- Tank stats calculation

**Key Methods**:
- `handleShooting(currentTime, activePowerUps)`: Process shooting
- `triggerWeaponAnimation(playerTank, playerId)`: Start weapon animation
- `getTankStats(weapon, color)`: Get weapon/tank stats
- `updateGunRecoil()`: Update recoil animations

## Entity Modules

### Player.js

**Purpose**: Manages player-specific logic and state.

**Properties**:
- Position (x, y)
- Rotation and velocity
- Health and max health
- Selected tank configuration
- Score, kills, deaths

**Key Methods**:
- `update(deltaTime, inputState)`: Update player state
- `shoot()`: Attempt to fire weapon
- `takeDamage(damage)`: Apply damage
- `respawn(x, y)`: Respawn player
- `serialize()`: Export player data

### Tank.js

**Purpose**: Tank rendering and configuration management.

**Features**:
- Tank configuration (color, body, weapon)
- Sprite animation support
- Rendering with proper scaling
- Asset key generation

**Key Methods**:
- `render(ctx, images, options)`: Render complete tank
- `renderBody(ctx, tankImg, options)`: Render tank body
- `renderWeapon(ctx, weaponImg, options)`: Render weapon
- `getTankAssetKey()`: Get asset key for animations
- `getStats()`: Get tank statistics

### Bullet.js

**Purpose**: Bullet physics and rendering.

**Features**:
- Position and velocity tracking
- Lifetime management
- Collision detection
- Visual effects (trails, glow)

**Key Methods**:
- `update(deltaTime)`: Update bullet position
- `render(ctx, bulletColors)`: Render bullet with effects
- `checkCollision(x, y, radius)`: Check collision
- `isExpired()`: Check if bullet lifetime exceeded

## Asset Management

### ImageLoader.js

**Purpose**: Centralized image loading and caching.

**Features**:
- Tank image loading (PNG/GIF)
- Weapon image loading
- Shop image preloading
- Loading progress tracking
- Fallback image creation

**Key Methods**:
- `initializeTankImages()`: Load all tank images
- `getCurrentTankImages(playerTank, forLobby)`: Get tank images
- `preloadShopTankImages()`: Preload shop images
- `renderTankOnCanvas(canvasId, tankConfig)`: Render tank preview
- `getLoadingProgress()`: Get loading status

## Utility Modules

### MathUtils.js

**Purpose**: Common mathematical operations.

**Functions**:
- `clamp(value, min, max)`: Clamp value to range
- `lerp(a, b, t)`: Linear interpolation
- `distance(x1, y1, x2, y2)`: Calculate distance
- `normalizeAngle(angle)`: Normalize angle to -π to π
- `degToRad(degrees)`: Convert degrees to radians
- `random(min, max)`: Generate random number
- `pointInCircle(px, py, cx, cy, radius)`: Point-circle test
- `circlesIntersect(...)`: Circle-circle collision
- `angleBetween(x1, y1, x2, y2)`: Calculate angle
- `rotatePoint(px, py, cx, cy, angle)`: Rotate point

### CollisionUtils.js

**Purpose**: Collision detection utilities.

**Functions**:
- `circlesIntersect(...)`: Circle-circle collision
- `pointInCircle(...)`: Point-circle test
- `pointInRect(...)`: Point-rectangle test
- `rectsIntersect(...)`: Rectangle-rectangle collision
- `circleRectIntersect(...)`: Circle-rectangle collision
- `distanceToSegment(...)`: Point-to-line distance
- `pointInPolygon(...)`: Point-polygon test
- `pointInHexagon(...)`: Point-hexagon test
- `circleHexagonCollision(...)`: Circle-hexagon collision
- `segmentsIntersect(...)`: Line-line intersection
- `polygonsIntersect(...)`: Polygon-polygon collision (SAT)

### StorageUtils.js

**Purpose**: Safe localStorage operations with error handling.

**Features**:
- Availability checking
- JSON serialization/deserialization
- Error handling
- Game data backup/restore
- Predefined storage keys

**Key Methods**:
- `getItem(key, defaultValue)`: Get item
- `getJSON(key, defaultValue)`: Get JSON item
- `setItem(key, value)`: Set item
- `setJSON(key, value)`: Set JSON item
- `getRaceMaps()`: Get race maps
- `getTankMaps()`: Get tank maps
- `backupGameData()`: Create backup
- `restoreGameData(backupString)`: Restore from backup

## Data Flow

### Game Initialization

```
1. Load Config constants
2. Initialize GameStateManager
3. Initialize ImageLoader
4. Load all tank/weapon images
5. Initialize Systems:
   - InputSystem
   - NetworkSystem
   - PhysicsSystem
   - ParticleSystem
   - RenderSystem
   - WeaponSystem
6. Setup GameLoop
7. Start rendering lobby
```

### Game Loop Flow

```
Every Frame:
1. InputSystem.update()
   - Process keyboard/mouse input
   - Update input state

2. PhysicsSystem.update()
   - Update tank physics
   - Check collisions
   - Update camera
   - Interpolate positions

3. ParticleSystem.update()
   - Update all particle effects
   - Remove expired particles

4. WeaponSystem.update()
   - Update recoil animations
   - Update weapon animations

5. RenderSystem.render()
   - Clear canvas
   - Apply camera transform
   - Render map
   - Render entities
   - Render particles
   - Render UI
```

### Network Communication

```
Client → Server:
- Movement updates (every 33ms)
- Shooting events
- Power-up collection
- Game mode changes

Server → Client:
- Game state updates
- Player updates
- Bullet events
- Collision events
- Score updates
- Power-up spawns
```

## State Management

### GameState Structure

```javascript
{
  // Connection
  isInLobby: boolean,
  isConnected: boolean,
  playerId: string,
  clientId: string,
  
  // Players
  players: Object<playerId, PlayerData>,
  
  // World
  shapes: Array<Shape>,
  walls: Array<Wall>,
  bullets: Array<Bullet>,
  gameWidth: number,
  gameHeight: number,
  
  // Camera
  camera: { x, y, zoom },
  
  // Input
  keys: Object<key, boolean>,
  mouse: { x, y, angle },
  
  // Player Config
  selectedTank: { color, body, weapon },
  selectedJet: { type, color },
  selectedRace: { type, color },
  
  // UI State
  showShop: boolean,
  showLocker: boolean,
  showSettings: boolean,
  showCreateMap: boolean,
  
  // Currency
  fortzCurrency: number,
  ownedItems: { colors, bodies, weapons },
  
  // Settings
  settings: { sound, graphics, controls }
}
```

## Module Dependencies

### Dependency Graph

```
game.js
├── core/Config.js (no dependencies)
├── core/GameState.js
│   └── core/Config.js
├── core/GameLoop.js
│   ├── core/GameState.js
│   └── systems/*
├── assets/ImageLoader.js
│   └── core/Config.js
├── systems/InputSystem.js
│   └── core/GameState.js
├── systems/NetworkSystem.js
│   ├── core/Config.js
│   └── core/GameState.js
├── systems/ParticleSystem.js
│   └── core/Config.js
├── systems/PhysicsSystem.js
│   └── core/Config.js
├── systems/RenderSystem.js
│   └── (runtime dependencies)
├── systems/WeaponSystem.js
│   └── (runtime dependencies)
├── entities/Player.js
│   └── core/Config.js
├── entities/Tank.js
│   └── core/Config.js
├── entities/Bullet.js
│   └── core/Config.js
├── utils/MathUtils.js (no dependencies)
├── utils/CollisionUtils.js (no dependencies)
└── utils/StorageUtils.js
    └── core/Config.js
```

**Note**: No circular dependencies exist in the module graph.

## Testing Strategy

### Property-Based Testing

The codebase uses property-based testing with the `fast-check` library to verify correctness properties:

1. **Module Organization Completeness**: All functionality is in appropriate modules
2. **Code Duplication Elimination**: No duplicate function implementations
3. **Dependency Graph Acyclicity**: No circular dependencies
4. **Import/Export Consistency**: Explicit imports, no globals
5. **Main File Size Constraint**: game.js < 500 lines
6. **Constant Consolidation**: Constants defined once in Config
7. **Naming Convention Consistency**: Consistent naming patterns
8. **Functional Preservation**: All features work after refactoring
9. **Export Pattern Uniformity**: Consistent export patterns
10. **State Centralization**: State accessed through GameState

### Running Tests

```bash
npm test                    # Run all tests
npm test -- module-organization  # Run specific test
```

## Performance Considerations

### Optimization Strategies

1. **Object Pooling**: Reuse particle objects instead of creating new ones
2. **Spatial Partitioning**: Use quadtree for collision detection (future)
3. **Render Culling**: Only render entities in viewport
4. **Image Caching**: Preload and cache all images
5. **Delta Time**: Frame-rate independent physics
6. **Request Animation Frame**: Smooth 60fps rendering

### Memory Management

- Particle systems automatically clean up expired particles
- Bullet cleanup after lifetime expires
- Player cleanup on disconnect
- Image caching prevents redundant loads

## Backward Compatibility

### Global References

For backward compatibility with legacy code, certain objects are exposed globally:

```javascript
window.gameState = gameStateManager.getGameState();
window.tankImages = imageLoader.tankImages;
window.weaponImages = imageLoader.weaponImages;
window.tankVelocity = physicsSystem.tankVelocity;
window.isSprinting = inputSystem.isSprinting;
```

These will be gradually removed as the codebase is fully modernized.

## Future Improvements

### Planned Enhancements

1. **TypeScript Migration**: Add type safety
2. **ECS Architecture**: Entity-Component-System pattern
3. **Web Workers**: Offload physics calculations
4. **WebGL Rendering**: Hardware-accelerated graphics
5. **Sound System**: Modular audio management
6. **AI System**: Separate AI behavior module
7. **Map System**: Dedicated map loading/rendering
8. **Power-up System**: Modular power-up management

### Technical Debt

1. Remove remaining global references
2. Implement proper event bus for system communication
3. Add comprehensive unit tests
4. Improve error handling and logging
5. Add performance profiling tools

## Contributing

### Adding New Modules

When adding new modules, follow these guidelines:

1. **Single Responsibility**: Each module should have one clear purpose
2. **Explicit Dependencies**: Use ES6 imports, avoid globals
3. **JSDoc Comments**: Document all public methods
4. **Error Handling**: Handle errors gracefully
5. **Testing**: Add property-based tests for correctness
6. **Naming**: Follow existing naming conventions

### Module Template

```javascript
/**
 * ModuleName - Brief description
 * Detailed description of module purpose
 */

import { REQUIRED_CONFIG } from '../core/Config.js';

class ModuleName {
    constructor(dependencies) {
        this.dependency = dependencies;
        // Initialize state
    }

    /**
     * Method description
     * @param {type} param - Parameter description
     * @returns {type} Return value description
     */
    methodName(param) {
        // Implementation
    }

    /**
     * Update method called each frame
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Update logic
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Cleanup logic
    }
}

export default ModuleName;
```

## Conclusion

This modular architecture provides a solid foundation for continued development. The separation of concerns, clear dependencies, and comprehensive testing ensure the codebase remains maintainable and extensible as the game evolves.

For questions or clarifications, refer to the individual module documentation or the property-based tests which serve as executable specifications.
