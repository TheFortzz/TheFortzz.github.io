# Modular Game Architecture

This directory contains the refactored modular game architecture, organized into focused modules with clear separation of concerns.

## Directory Structure

```
src/client/js/
├── core/                   # Core game systems
│   ├── Config.js          # All game constants and configuration
│   ├── GameState.js       # Centralized state management
│   ├── GameLoop.js        # Main game loop coordination
│   └── ModuleManager.js   # Module initialization and coordination
├── systems/               # Game systems
│   ├── RenderSystem.js    # Rendering and canvas management
│   ├── InputSystem.js     # Input handling (keyboard, mouse, touch)
│   └── NetworkSystem.js   # Socket communication and networking
├── entities/              # Game entities
│   └── Player.js          # Player-specific logic and state
├── utils/                 # Utility functions
│   └── MathUtils.js       # Mathematical utility functions
├── templates/             # Module templates
│   └── BaseSystem.js      # Base system interface
├── examples/              # Usage examples
│   └── modular-game-example.js  # Example integration
└── tests/                 # Property-based tests
    └── module-organization.test.js  # Module organization tests
```

## Key Features

### 1. Centralized Configuration
All game constants are consolidated in `core/Config.js`:
- Tank configurations
- Physics constants
- UI settings
- Network settings
- Storage keys

### 2. State Management
`core/GameState.js` provides centralized state management with:
- Single source of truth for game state
- State change listeners
- Player management
- Backward compatibility with global `gameState`

### 3. Modular Systems
Each system handles a specific concern:
- **RenderSystem**: All rendering operations
- **InputSystem**: Keyboard, mouse, and touch input
- **NetworkSystem**: WebSocket communication

### 4. Game Loop Coordination
`core/GameLoop.js` orchestrates system updates:
- Priority-based system execution
- Consistent frame timing
- Error handling and recovery

## Usage Example

```javascript
import moduleManager from './core/ModuleManager.js';
import { TANK_CONFIG } from './core/Config.js';

// Initialize the game
const canvas = document.getElementById('gameCanvas');
await moduleManager.initialize(canvas);

// Start the game loop
moduleManager.start();

// Access systems
const renderSystem = moduleManager.getSystem('render');
const inputSystem = moduleManager.getSystem('input');
const gameStateManager = moduleManager.getGameStateManager();
```

## Module Interface Pattern

All systems follow a consistent interface:

```javascript
class SystemName extends BaseSystem {
    constructor() {
        super();
    }

    initialize() {
        // Setup system
        super.initialize();
    }

    update(deltaTime, gameState) {
        // Update logic
    }

    render(deltaTime, gameState) {
        // Rendering (for render systems)
    }

    cleanup() {
        // Cleanup resources
        super.cleanup();
    }
}
```

## Testing

Property-based tests ensure:
- Module organization completeness
- Consistent export patterns
- Centralized configuration
- No circular dependencies

Run tests with:
```bash
npm test -- src/client/js/tests/module-organization.test.js
```

## Migration from Monolithic Structure

The modular architecture maintains backward compatibility while providing:
- Clear separation of concerns
- Reduced code duplication
- Easier maintenance and testing
- Better code organization
- Consistent naming conventions

## Next Steps

This foundation supports the continued refactoring of the monolithic `game.js` file into focused modules, following the implementation plan in the game-refactoring spec.