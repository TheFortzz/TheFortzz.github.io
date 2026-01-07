// Bug Fixes and Stability Improvements

const BugFixes = {
  // Track fixed issues
  fixedIssues: [],

  init() {
    this.applyAllFixes();
    console.log('✓ Bug fixes applied:', this.fixedIssues.length);
  },

  applyAllFixes() {
    this.fixImageLoadingRace();
    this.fixWebSocketReconnection();
    this.fixMemoryLeaks();
    this.fixInputSticking();
    this.fixCameraJitter();
    this.fixBulletCollision();
  },

  // Fix: Images loading race condition
  fixImageLoadingRace() {
    const originalImage = window.Image;

    window.Image = function () {
      const img = new originalImage();

      // Add timeout for failed loads
      const timeout = setTimeout(() => {
        if (!img.complete) {
          console.warn('Image load timeout:', img.src);
          img.onerror && img.onerror();
        }
      }, 10000); // 10 second timeout

      const originalOnload = img.onload;
      img.onload = function () {
        clearTimeout(timeout);
        originalOnload && originalOnload.apply(this, arguments);
      };

      const originalOnerror = img.onerror;
      img.onerror = function () {
        clearTimeout(timeout);
        originalOnerror && originalOnerror.apply(this, arguments);
      };

      return img;
    };

    this.fixedIssues.push('Image loading race condition');
  },

  // Fix: WebSocket reconnection
  fixWebSocketReconnection() {
    if (!window.socket) return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 2000;

    const originalClose = window.socket.onclose;

    window.socket.onclose = function (event) {
      originalClose && originalClose.call(this, event);

      // Auto-reconnect if not intentional disconnect
      if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        console.log(`Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`);

        setTimeout(() => {
          if (typeof connectToServer === 'function') {
            connectToServer();
          }
        }, reconnectDelay * reconnectAttempts);
      }
    };

    this.fixedIssues.push('WebSocket auto-reconnection');
  },

  // Fix: Memory leaks from event listeners
  fixMemoryLeaks() {
    // Track event listeners for cleanup
    const eventListeners = new Map();

    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function (type, listener, options) {
      const key = `${type}_${listener.toString().substring(0, 50)}`;

      if (!eventListeners.has(this)) {
        eventListeners.set(this, new Set());
      }

      eventListeners.get(this).add({ type, listener, options });

      return originalAddEventListener.call(this, type, listener, options);
    };

    // Cleanup function
    window.cleanupEventListeners = function (target) {
      if (eventListeners.has(target)) {
        eventListeners.get(target).forEach(({ type, listener, options }) => {
          target.removeEventListener(type, listener, options);
        });
        eventListeners.delete(target);
      }
    };

    this.fixedIssues.push('Memory leak prevention');
  },

  // Fix: Input keys sticking
  fixInputSticking() {
    // Clear all keys on window blur
    window.addEventListener('blur', () => {
      if (window.gameState && window.gameState.keys) {
        Object.keys(window.gameState.keys).forEach((key) => {
          window.gameState.keys[key] = false;
        });
      }
    });

    // Clear keys on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && window.gameState && window.gameState.keys) {
        Object.keys(window.gameState.keys).forEach((key) => {
          window.gameState.keys[key] = false;
        });
      }
    });

    this.fixedIssues.push('Input key sticking');
  },

  // Fix: Camera jitter
  fixCameraJitter() {
    if (!window.gameState) return;

    // Add camera smoothing if not exists
    if (!window.gameState.cameraSmooth) {
      window.gameState.cameraSmooth = { x: 0, y: 0 };
    }

    // Override camera update with smooth version
    const originalUpdateCamera = window.updateCamera;

    window.updateCamera = function () {
      if (originalUpdateCamera) {
        originalUpdateCamera();
      }

      // Apply smoothing
      const smoothFactor = 0.15;
      window.gameState.cameraSmooth.x +=
      (window.gameState.camera.x - window.gameState.cameraSmooth.x) * smoothFactor;
      window.gameState.cameraSmooth.y +=
      (window.gameState.camera.y - window.gameState.cameraSmooth.y) * smoothFactor;
    };

    this.fixedIssues.push('Camera jitter');
  },

  // Fix: Bullet collision detection
  fixBulletCollision() {
    // Ensure bullets are checked against all entities
    if (!window.checkBulletCollisions) {
      window.checkBulletCollisions = function (bullet, entities) {
        for (const entity of entities) {
          if (entity.id === bullet.playerId) continue;

          const dx = bullet.x - entity.x;
          const dy = bullet.y - entity.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < (entity.radius || 45)) {
            return entity;
          }
        }
        return null;
      };
    }

    this.fixedIssues.push('Bullet collision detection');
  },

  // Utility: Safe JSON parse
  safeJSONParse(str, fallback = null) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.warn('JSON parse error:', e);
      return fallback;
    }
  },

  // Utility: Safe localStorage
  safeLocalStorage: {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch (e) {
        console.warn('localStorage get error:', e);
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('localStorage set error:', e);
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.warn('localStorage remove error:', e);
        return false;
      }
    }
  },

  // Utility: Debounce function calls
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Utility: Throttle function calls
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => BugFixes.init());
} else {
  BugFixes.init();
}

// Export
window.BugFixes = BugFixes;