/**
 * Game State Validator
 * Ensures game state always has valid default values
 */

class GameStateValidator {
  static validateAndFixGameState(gameState) {
    if (!gameState) {
      console.warn('GameState is null, creating default state');
      return GameStateValidator.createDefaultGameState();
    }

    // Validate and fix selectedTank
    if (!gameState.selectedTank || 
        !gameState.selectedTank.color || 
        !gameState.selectedTank.body || 
        !gameState.selectedTank.weapon) {
      
      console.warn('Invalid selectedTank, applying defaults:', gameState.selectedTank);
      gameState.selectedTank = {
        color: gameState.selectedTank?.color || 'blue',
        body: gameState.selectedTank?.body || 'body_halftrack',
        weapon: gameState.selectedTank?.weapon || 'turret_01_mk1'
      };
    }

    // Validate and fix selectedJet
    if (!gameState.selectedJet || 
        !gameState.selectedJet.type || 
        !gameState.selectedJet.color) {
      
      console.warn('Invalid selectedJet, applying defaults:', gameState.selectedJet);
      gameState.selectedJet = {
        type: gameState.selectedJet?.type || 'ship1',
        color: gameState.selectedJet?.color || 'purple'
      };
    }

    // Validate and fix selectedRace
    if (!gameState.selectedRace || 
        !gameState.selectedRace.type || 
        !gameState.selectedRace.color) {
      
      console.warn('Invalid selectedRace, applying defaults:', gameState.selectedRace);
      gameState.selectedRace = {
        type: gameState.selectedRace?.type || 'endurance',
        color: gameState.selectedRace?.color || 'blue'
      };
    }

    // Validate ownedItems
    if (!gameState.ownedItems) {
      gameState.ownedItems = {
        colors: ['blue'],
        bodies: ['body_halftrack'],
        weapons: ['turret_01_mk1']
      };
    }

    return gameState;
  }

  static createDefaultGameState() {
    return {
      isInLobby: true,
      selectedVehicleType: 'tank',
      selectedTank: {
        color: 'blue',
        body: 'body_halftrack',
        weapon: 'turret_01_mk1'
      },
      selectedJet: {
        type: 'ship1',
        color: 'purple'
      },
      selectedRace: {
        type: 'endurance',
        color: 'blue'
      },
      ownedItems: {
        colors: ['blue'],
        bodies: ['body_halftrack'],
        weapons: ['turret_01_mk1']
      },
      fortzCurrency: 10000
    };
  }

  static ensureValidTankConfig(tankConfig) {
    if (!tankConfig) {
      return {
        color: 'blue',
        body: 'body_halftrack',
        weapon: 'turret_01_mk1'
      };
    }

    return {
      color: tankConfig.color || 'blue',
      body: tankConfig.body || 'body_halftrack',
      weapon: tankConfig.weapon || 'turret_01_mk1'
    };
  }
}

// Export for use in other modules
window.GameStateValidator = GameStateValidator;