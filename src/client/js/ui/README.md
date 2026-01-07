# UI Modules

This directory contains the extracted UI modules from the main game.js file. These modules handle all user interface functionality for the lobby, shop, and locker systems.

## Modules

### LobbyUI.js
Manages all lobby interface functionality including:
- Lobby background rendering with animated maps
- Vehicle selection and preview
- Lobby server connection for live player data
- Panel management (opening/closing features)
- Vehicle hexagon rendering
- Returning to lobby from game

**Key Methods:**
- `renderLobbyBackground()` - Renders the lobby background with current map
- `initializeLobbyBackground()` - Initializes lobby background with animations
- `closeAllPanels()` - Closes all feature panels and returns to lobby view
- `returnToLobby()` - Handles returning to lobby from active game
- `getCurrentLobbyCanvas()` - Gets the appropriate canvas based on vehicle type
- `connectLobbyToServer()` - Establishes WebSocket connection for live lobby data
- `animateLobbyTanks()` - Animates tank previews in lobby
- `updateLobbyBackgroundWithMap()` - Updates lobby background with specific map
- `updateLobbyBackgroundNoMaps()` - Shows "no maps" message
- `renderLobbyTank/Jet/Race()` - Renders vehicles in lobby

### ShopUI.js
Manages the shop system including:
- Shop interface rendering with modern design
- Item purchasing and equipping
- Shop animations and visual effects
- Horizontal scrolling for item rows
- Currency display and management

**Note:** Canvas-based shop system has been removed. Shop functionality now uses HTML interface.
- `stopLobbyShopRendering()` - Stops shop animation loop
- `setupLobbyShopHandler()` - Sets up click handlers for lobby shop

### LockerUI.js
Manages the locker/customization system including:
- Vehicle customization interface
- Item equipping and preview
- Locker animations
- Vehicle stats display
- Multi-vehicle support (tank, jet, race)

**Key Methods:**
- `loadLockerItems()` - Loads items for a specific category
- `equipLockerItem()` - Equips an item from locker
- `updateLockerPreview()` - Updates the main locker preview
- `createLockerItemCard()` - Creates UI card for locker item
- `checkIfItemOwned()` - Checks if player owns an item
- `checkIfItemEquipped()` - Checks if item is currently equipped
- `updateLockerVehicleButtons()` - Updates vehicle selection buttons
- `updateLockerCustomizationOptions()` - Updates customization options
- `updateLockerVehiclePreview()` - Updates vehicle preview
- `selectLockerVehicle()` - Handles vehicle selection
- `renderLockerTank/Jet/Race()` - Renders vehicles in locker
- `animateLockerPreview()` - Animates locker preview
- `stopLockerPreviewAnimation()` - Stops locker animation

## Architecture

All UI modules follow a consistent pattern:
1. **Class-based structure** - Each module is a class with methods
2. **Singleton pattern** - Single instance exported as default
3. **State management** - Uses centralized GameStateManager
4. **Asset loading** - Uses centralized ImageLoader
5. **Backward compatibility** - Functions exposed globally via window object

## Dependencies

- `core/GameState.js` - Centralized state management
- `assets/ImageLoader.js` - Image loading and caching
- `core/Config.js` - Configuration constants

## Integration

The UI modules are imported and initialized in `game.js`:

```javascript
import lobbyUI from './ui/LobbyUI.js';
import shopUI from './ui/ShopUI.js';
import lockerUI from './ui/LockerUI.js';
```

They are also exposed globally for backward compatibility:

```javascript
window.lobbyUI = lobbyUI;
window.shopUI = shopUI;
window.lockerUI = lockerUI;
```

## Testing

UI modules are tested in `tests/ui-modules-integration.test.js` which verifies:
- Module exports and structure
- Required methods exist
- State separation between modules
- Backward compatibility

Run tests with:
```bash
npx vitest run src/client/js/tests/ui-modules-integration.test.js
```

## Future Improvements

- Remove global window exposure once all code is refactored
- Add more comprehensive unit tests for individual methods
- Implement proper TypeScript types
- Add JSDoc documentation for all methods
- Reduce coupling with global window object
