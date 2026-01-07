// CrazyGames SDK Integration Module
// Handles all CrazyGames SDK functionality including ads, cloud saves, and user accounts

const CrazyGamesIntegration = {
  sdk: null,
  isInitialized: false,
  adCallbacks: null,
  lastAdTime: 0,
  adCooldown: 60000, // 60 seconds between ads

  // Initialize the SDK
  init: function () {
    if (typeof window.CrazyGames !== 'undefined' && window.CrazyGames.SDK) {
      this.sdk = window.CrazyGames.SDK;

      // Check if SDK is in production environment
      if (window.CrazyGames.SDK.environment !== 'production') {
        console.log('⚠️ CrazyGames SDK not in production - running in development mode');
        this.isInitialized = false;
        return false;
      }

      this.isInitialized = true;
      console.log('✓ CrazyGames SDK initialized successfully');

      // Setup ad callbacks
      this.setupAdCallbacks();

      // Load user data
      this.loadUserData();

      return true;
    } else {
      console.warn('CrazyGames SDK not available - running in development mode');
      return false;
    }
  },

  // Setup advertisement callbacks
  setupAdCallbacks: function () {
    this.adCallbacks = {
      adStarted: () => {
        console.log('Ad started');
        // Pause game when ad starts
        if (typeof pauseGame === 'function') {
          pauseGame();
        }
        // Mute game audio
        if (window.gameState && window.gameState.settings) {
          window.gameState.audioMuted = true;
        }
      },
      adFinished: () => {
        console.log('Ad finished');
        // Resume game when ad ends
        if (typeof resumeGame === 'function') {
          resumeGame();
        }
        // Unmute game audio
        if (window.gameState && window.gameState.settings) {
          window.gameState.audioMuted = false;
        }
      },
      adError: (error) => {
        console.log('Ad error:', error);
        // Resume game if ad fails
        if (typeof resumeGame === 'function') {
          resumeGame();
        }
        if (window.gameState && window.gameState.settings) {
          window.gameState.audioMuted = false;
        }
      }
    };
  },

  // Trigger gameplay start event
  gameplayStart: function () {
    if (this.isInitialized && this.sdk.game && this.sdk.game.gameplayStart) {
      try {
        this.sdk.game.gameplayStart();
        console.log('✓ CrazyGames: Gameplay started');
      } catch (error) {
        console.error('Error triggering gameplayStart:', error);
      }
    }
  },

  // Trigger gameplay stop event
  gameplayStop: function () {
    if (this.isInitialized && this.sdk.game && this.sdk.game.gameplayStop) {
      try {
        this.sdk.game.gameplayStop();
        console.log('✓ CrazyGames: Gameplay stopped');
      } catch (error) {
        console.error('Error triggering gameplayStop:', error);
      }
    }
  },

  // Show midgame ad (after death, level completion, etc)
  showMidgameAd: function () {
    if (!this.isInitialized || !this.sdk.ad) {
      console.log('SDK not available - skipping ad');
      return Promise.resolve();
    }

    // Check cooldown
    const now = Date.now();
    if (now - this.lastAdTime < this.adCooldown) {
      console.log('Ad cooldown active - skipping');
      return Promise.resolve();
    }

    this.lastAdTime = now;

    return new Promise((resolve) => {
      try {
        this.sdk.ad.requestAd('midgame', {
          adStarted: () => {
            this.adCallbacks.adStarted();
          },
          adFinished: () => {
            this.adCallbacks.adFinished();
            resolve();
          },
          adError: (error) => {
            this.adCallbacks.adError(error);
            resolve();
          }
        });
      } catch (error) {
        console.error('Error requesting midgame ad:', error);
        resolve();
      }
    });
  },

  // Show rewarded ad (player watches for reward)
  showRewardedAd: function (rewardCallback) {
    if (!this.isInitialized || !this.sdk.ad) {
      console.log('SDK not available - skipping rewarded ad');
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      try {
        this.sdk.ad.requestAd('rewarded', {
          adStarted: () => {
            this.adCallbacks.adStarted();
          },
          adFinished: () => {
            this.adCallbacks.adFinished();
            // Give reward to player
            if (typeof rewardCallback === 'function') {
              rewardCallback();
            }
            resolve(true);
          },
          adError: (error) => {
            this.adCallbacks.adError(error);
            resolve(false);
          }
        });
      } catch (error) {
        console.error('Error requesting rewarded ad:', error);
        resolve(false);
      }
    });
  },

  // Save game data to cloud
  saveGameData: async function (data) {
    if (!this.isInitialized || !this.sdk.data) {
      console.log('SDK not available - saving locally only');
      localStorage.setItem('gameData', JSON.stringify(data));
      return;
    }

    try {
      // Save to CrazyGames cloud
      await this.sdk.data.setItem('gameData', JSON.stringify(data));
      console.log('✓ Game data saved to CrazyGames cloud');

      // Also save locally as backup
      localStorage.setItem('gameData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to CrazyGames cloud:', error);
      // Fallback to local storage
      localStorage.setItem('gameData', JSON.stringify(data));
    }
  },

  // Load game data from cloud
  loadGameData: async function () {
    if (!this.isInitialized || !this.sdk.data) {
      console.log('SDK not available - loading from local storage');
      const localData = localStorage.getItem('gameData');
      return localData ? JSON.parse(localData) : null;
    }

    try {
      // Try to load from CrazyGames cloud first
      const cloudData = await this.sdk.data.getItem('gameData');
      if (cloudData) {
        console.log('✓ Game data loaded from CrazyGames cloud');
        return JSON.parse(cloudData);
      }

      // Fallback to local storage
      const localData = localStorage.getItem('gameData');
      return localData ? JSON.parse(localData) : null;
    } catch (error) {
      console.error('Error loading from CrazyGames cloud:', error);
      // Fallback to local storage
      const localData = localStorage.getItem('gameData');
      return localData ? JSON.parse(localData) : null;
    }
  },

  // Load user data (username, avatar, etc)
  loadUserData: async function () {
    // Check if SDK is in production environment
    if (window.CrazyGames?.SDK?.environment !== 'production') {
      return null; // Silent return in non-production
    }

    // Check if SDK exists and is initialized
    if (!window.CrazyGames?.SDK || !this.isInitialized) {
      return null;
    }

    // Check if user API exists
    if (!this.sdk?.user) {
      return null;
    }

    try {
      const user = await this.sdk.user.getUser();
      if (user) {
        console.log('✓ CrazyGames user loaded:', user.username);
        return {
          username: user.username,
          profilePictureUrl: user.profilePictureUrl,
          userId: user.userId
        };
      }
    } catch (error) {
      console.error('Error loading CrazyGames user:', error);
    }

    return null;
  },

  // Get user token for backend authentication
  getUserToken: async function () {
    if (!this.isInitialized || !this.sdk.user) {
      return null;
    }

    try {
      const token = await this.sdk.user.getUserToken();
      return token;
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  },

  // Happytime (when player is having fun, no ads)
  happytime: function () {
    if (this.isInitialized && this.sdk.game && this.sdk.game.happytime) {
      try {
        this.sdk.game.happytime();
        console.log('✓ CrazyGames: Happytime triggered');
      } catch (error) {
        console.error('Error triggering happytime:', error);
      }
    }
  },

  // Loading start
  loadingStart: function () {
    if (this.isInitialized && this.sdk.game && this.sdk.game.loadingStart) {
      try {
        this.sdk.game.loadingStart();
        console.log('✓ CrazyGames: Loading started');
      } catch (error) {
        console.error('Error triggering loadingStart:', error);
      }
    }
  },

  // Loading stop
  loadingStop: function () {
    if (this.isInitialized && this.sdk.game && this.sdk.game.loadingStop) {
      try {
        this.sdk.game.loadingStop();
        console.log('✓ CrazyGames: Loading stopped');
      } catch (error) {
        console.error('Error triggering loadingStop:', error);
      }
    }
  },

  // Save data to cloud storage
  saveToCloud: async function (data) {
    if (!this.isInitialized || !this.sdk.data) {
      console.log('SDK not available - saving locally only');
      localStorage.setItem('gameData', JSON.stringify(data));
      return false;
    }

    try {
      await this.sdk.data.setItem('gameData', JSON.stringify(data));
      console.log('✓ Data saved to CrazyGames cloud');
      // Also save locally as backup
      localStorage.setItem('gameData', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to CrazyGames cloud:', error);
      // Fallback to local storage
      localStorage.setItem('gameData', JSON.stringify(data));
      return false;
    }
  },

  // Load data from cloud storage
  loadFromCloud: async function () {
    if (!this.isInitialized || !this.sdk.data) {
      console.log('SDK not available - loading from local storage');
      const localData = localStorage.getItem('gameData');
      return localData ? JSON.parse(localData) : null;
    }

    try {
      const dataString = await this.sdk.data.getItem('gameData');
      if (dataString) {
        const data = JSON.parse(dataString);
        console.log('✓ Data loaded from CrazyGames cloud');
        // Also save locally as backup
        localStorage.setItem('gameData', JSON.stringify(data));
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error loading from CrazyGames cloud:', error);
      // Fallback to local storage
      const localData = localStorage.getItem('gameData');
      return localData ? JSON.parse(localData) : null;
    }
  }
};

// Initialize SDK when the page loads
window.addEventListener('DOMContentLoaded', () => {
  CrazyGamesIntegration.init();
});

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.CrazyGamesIntegration = CrazyGamesIntegration;
}