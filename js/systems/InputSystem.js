/**
 * Input handling system
 * Manages keyboard, mouse, and touch input events
 * 
 * Global compatibility: This module maintains backward compatibility
 * by exposing certain state variables globally while using proper imports internally.
 */

// Import required modules
import gameStateManager from '../core/GameState.js';

class InputSystem {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false, angle: 0 };
    this.touch = { x: 0, y: 0, active: false };
    this.listeners = [];
    this.initialized = false;
    this.inputHandlersSetup = false;
    this.canvasHandlersSetup = false;

    // Game-specific input state
    this.autoFireEnabled = false;
    this.aimbotEnabled = false;
    this.isSprinting = false;
  }

  /**
   * Initialize input system
   */
  initialize() {
    // Set up global mouse position tracking immediately
    this.setupGlobalMouseTracking();

    this.setupInputHandlers();
    this.initialized = true;
    console.log('🎮 InputSystem initialized');
  }

  /**
   * Setup global mouse position tracking
   */
  setupGlobalMouseTracking() {
    if (!window.globalMousePos) {
      // Initialize to current mouse position if available, otherwise center of screen
      const currentMouseEvent = window.currentMouseEvent;
      if (currentMouseEvent) {
        window.globalMousePos = { x: currentMouseEvent.clientX, y: currentMouseEvent.clientY };
        console.log('🖱️ Global mouse tracking initialized with current mouse position');
      } else {
        window.globalMousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        console.log('🖱️ Global mouse tracking initialized to center of screen');
      }

      // Track mouse globally for weapon angle calculations
      const mouseMoveHandler = (e) => {
        window.globalMousePos = { x: e.clientX, y: e.clientY };
        // Store the current event for initialization
        window.currentMouseEvent = e;
      };

      document.addEventListener('mousemove', mouseMoveHandler);

      // Store reference for cleanup
      this.listeners.push({
        element: document,
        event: 'mousemove',
        handler: mouseMoveHandler
      });
    }
  }

  /**
   * Setup input handlers (main entry point)
   */
  setupInputHandlers() {
    // Setup keyboard handlers only once
    if (!this.inputHandlersSetup) {
      this.inputHandlersSetup = true;
      this.setupKeyboardHandlers();
    }

    // Setup canvas handlers only when canvas exists (will retry until successful)
    const canvas = document.getElementById('gameCanvas');
    if (!this.canvasHandlersSetup && canvas) {
      console.log('🎯 Setting up canvas handlers for gameCanvas');
      this.setupCanvasHandlers(canvas);
      this.canvasHandlersSetup = true;
    } else if (!canvas) {
      console.log('❌ gameCanvas not found, retrying...');
    }
  }

  /**
   * Setup keyboard handlers with game-specific logic
   */
  setupKeyboardHandlers() {
    const keydownHandler = (e) => this.handleGameKeyDown(e);
    const keyupHandler = (e) => this.handleGameKeyUp(e);

    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);

    // Store references for cleanup
    this.listeners.push(
      { element: document, event: 'keydown', handler: keydownHandler },
      { element: document, event: 'keyup', handler: keyupHandler }
    );
  }

  /**
   * Setup canvas handlers for mouse and wheel events
   */
  setupCanvasHandlers(canvas) {
    if (!canvas) {
      console.warn('Canvas not available for event handlers');
      return;
    }

    console.log('Setting up canvas event handlers');

    // Mouse wheel zoom handler
    const wheelHandler = (e) => this.handleWheel(e, canvas);
    const mousemoveHandler = (e) => this.handleCanvasMouseMove(e, canvas);
    const mousedownHandler = (e) => this.handleCanvasMouseDown(e, canvas);

    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    document.addEventListener('mousemove', mousemoveHandler);
    canvas.addEventListener('mousedown', mousedownHandler);

    // Setup lobby canvas handlers
    this.setupLobbyCanvasHandlers();

    // Store references for cleanup
    this.listeners.push(
      { element: canvas, event: 'wheel', handler: wheelHandler },
      { element: document, event: 'mousemove', handler: mousemoveHandler },
      { element: canvas, event: 'mousedown', handler: mousedownHandler }
    );

    // Weapon angle is now initialized properly in game.js - don't override it here
    // It will be updated on mouse move through handleCanvasMouseMove
    if (window.WEAPON_ANGLE === undefined) {
      // Fallback only if somehow not initialized - calculate from current mouse position
      const globalMousePos = window.globalMousePos || {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      };
      const rect = canvas.getBoundingClientRect();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const mouseX = globalMousePos.x - rect.left;
      const mouseY = globalMousePos.y - rect.top;
      const fallbackAngle = Math.atan2(mouseY - centerY, mouseX - centerX);

      window.WEAPON_ANGLE = fallbackAngle;
      window.WEAPON_ANGLE_INITIALIZED = true;
      console.log(`🎯 WEAPON_ANGLE fallback initialized to ${(fallbackAngle * 180 / Math.PI).toFixed(1)}° from mouse position`);
    }
  }

  /**
   * Setup lobby canvas specific handlers
   */
  setupLobbyCanvasHandlers() {
    const getCurrentLobbyCanvas = () => {
      const vehicleType = window.currentLobbyVehicleType || 'tank';
      return document.getElementById(`${vehicleType}LobbyBackground`);
    };

    const lobbyCanvas = getCurrentLobbyCanvas();
    if (lobbyCanvas && !lobbyCanvas.hasAttribute('data-map-creator-listener')) {
      const mousemoveHandler = (e) => {
        const rect = lobbyCanvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // Update global gameState if available
        if (window.gameState) {
          window.gameState.mouse.x = this.mouse.x;
          window.gameState.mouse.y = this.mouse.y;
        }
      };

      const clickHandler = (e) => {
        // Only handle map creator clicks if the create map screen is open
        if (window.gameState?.showCreateMap && typeof window.handleMapCreatorClick === 'function') {
          window.handleMapCreatorClick(e);
        }
      };

      lobbyCanvas.addEventListener('mousemove', mousemoveHandler);
      lobbyCanvas.addEventListener('click', clickHandler);
      lobbyCanvas.setAttribute('data-map-creator-listener', 'true');

      this.listeners.push(
        { element: lobbyCanvas, event: 'mousemove', handler: mousemoveHandler },
        { element: lobbyCanvas, event: 'click', handler: clickHandler }
      );
    }
  }

  /**
   * Handle game-specific key down events
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleGameKeyDown(e) {
    // Handle H key for chat FIRST - works in both lobby and game
    if ((e.key === 'h' || e.key === 'H') && !e.target.matches('input, textarea')) {
      e.preventDefault();
      e.stopPropagation();

      const chatModal = document.getElementById('chatModal');
      const chatInput = document.getElementById('chatInput');

      if (chatModal && chatInput) {
        chatModal.classList.remove('hidden');
        setTimeout(() => chatInput.focus(), 50);
        console.log('Chat modal opened');
      } else {
        console.log('Chat elements not found');
      }
      return;
    }

    const keyLower = e.key.toLowerCase();
    const keyCode = e.code;

    this.keys[keyLower] = true;
    this.keys[keyCode] = true;

    // Debug key presses for WASD
    if (['w', 'a', 's', 'd'].includes(keyLower) || ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(keyCode)) {
      console.log('🎮 Key pressed:', { key: e.key, code: e.code, keyLower, keyCode });
    }

    // Update global gameState if available
    if (window.gameState) {
      if (!window.gameState.keys) {
        window.gameState.keys = {};
      }
      window.gameState.keys[keyLower] = true;
      window.gameState.keys[keyCode] = true;
    }

    // Handle sprint key (Shift or Space)
    if (e.key === 'Shift' || e.key === ' ') {
      this.isSprinting = true;
      // Update physics system if available
      if (window.physicsSystem) {
        window.physicsSystem.setIsSprinting(true);
      }
      // Update global for backward compatibility
      if (typeof window !== 'undefined' && window.isSprinting !== undefined) {
        window.isSprinting = true;
      }
    }

    // Handle Q key for auto-fire
    if (keyLower === 'q' && !window.gameState?.isInLobby) {
      this.autoFireEnabled = true;
      // Update global for backward compatibility
      if (typeof window !== 'undefined' && window.autoFireEnabled !== undefined) {
        window.autoFireEnabled = true;
      }
    }
  }

  /**
   * Handle game-specific key up events
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleGameKeyUp(e) {
    const keyLower = e.key.toLowerCase();
    const keyCode = e.code;

    this.keys[keyLower] = false;
    this.keys[keyCode] = false;

    // Debug key releases for WASD
    if (['w', 'a', 's', 'd'].includes(keyLower) || ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(keyCode)) {
      console.log('🎮 Key released:', { key: e.key, code: e.code, keyLower, keyCode });
    }

    // Update global gameState if available
    if (window.gameState) {
      if (!window.gameState.keys) {
        window.gameState.keys = {};
      }
      window.gameState.keys[keyLower] = false;
      window.gameState.keys[keyCode] = false;
    }

    // Handle sprint key release
    if (e.key === 'Shift' || e.key === ' ') {
      this.isSprinting = false;
      // Update physics system if available
      if (window.physicsSystem) {
        window.physicsSystem.setIsSprinting(false);
      }
      // Update global for backward compatibility
      if (typeof window !== 'undefined' && window.isSprinting !== undefined) {
        window.isSprinting = false;
      }
    }

    // Handle Q key release to stop auto-fire
    if (keyLower === 'q') {
      this.autoFireEnabled = false;
      // Update global for backward compatibility
      if (typeof window !== 'undefined' && window.autoFireEnabled !== undefined) {
        window.autoFireEnabled = false;
      }
    }

    // Handle E key release for aimbot toggle
    if (keyLower === 'e') {
      this.aimbotEnabled = !this.aimbotEnabled;
      // Update global for backward compatibility
      if (typeof window !== 'undefined' && window.aimbotEnabled !== undefined) {
        window.aimbotEnabled = this.aimbotEnabled;
      }

      // Show notification if function exists
      if (typeof window.showNotification === 'function') {
        const status = this.aimbotEnabled ? 'ENABLED' : 'DISABLED';
        const color = this.aimbotEnabled ? '#00FF00' : '#FF0000';
        window.showNotification(`Aim Assist ${status}`, color);
      }
    }

    // Handle R key for rain weather
    if (keyLower === 'r' && !window.gameState?.isInLobby && typeof window.toggleWeather === 'function') {
      window.toggleWeather('rain');
    }

    // Handle N key for snow weather
    if (keyLower === 'n' && !window.gameState?.isInLobby && typeof window.toggleWeather === 'function') {
      window.toggleWeather('snow');
    }

    // ESC key - close any open feature
    if (keyLower === 'escape') {
      this.handleEscapeKey();
    }
  }

  /**
   * Handle escape key to close open panels
   */
  handleEscapeKey() {
    const gameState = window.gameState;
    if (!gameState) return;

    if (gameState.showShop) {
      if (typeof window.closeAllPanels === 'function') window.closeAllPanels();
    } else if (gameState.showLocker) {
      // Use imported gameStateManager instead of global
      gameStateManager.updateGameState({ showLocker: false, openedFeature: null });
      if (typeof window.stopLockerRendering === 'function') window.stopLockerRendering();
    } else if (gameState.showSettings) {
      // Use imported gameStateManager instead of global
      gameStateManager.updateGameState({ showSettings: false, openedFeature: null });
      if (typeof window.stopSettingsRendering === 'function') window.stopSettingsRendering();
    } else if (gameState.showFriends) {
      // Use imported gameStateManager instead of global
      gameStateManager.updateGameState({ showFriends: false, openedFeature: null });
      if (typeof window.stopFriendsRendering === 'function') window.stopFriendsRendering();
      if (typeof window.stopFriendVehicleRendering === 'function') window.stopFriendVehicleRendering();
    }
  }

  /**
   * Handle wheel events for zooming
   * @param {WheelEvent} e - Wheel event
   * @param {HTMLCanvasElement} canvas - Game canvas
   */
  handleWheel(e, canvas) {
    const gameState = window.gameState;
    if (!gameState || gameState.isInLobby) return; // Only zoom in game

    e.preventDefault();

    const zoomSpeed = 0.001;
    const minZoom = 0.5;
    const maxZoom = 2.0;

    // Get mouse position in world coordinates before zoom
    const zoom = gameState.camera.zoom || 1;
    const mouseWorldX = gameState.camera.x + (this.mouse.x - canvas.width / 2) / zoom;
    const mouseWorldY = gameState.camera.y + (this.mouse.y - canvas.height / 2) / zoom;

    // Update zoom
    const delta = -e.deltaY * zoomSpeed;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
    gameState.camera.zoom = newZoom;

    // Adjust camera position to keep mouse point stable
    const newMouseWorldX = gameState.camera.x + (this.mouse.x - canvas.width / 2) / newZoom;
    const newMouseWorldY = gameState.camera.y + (this.mouse.y - canvas.height / 2) / newZoom;

    gameState.camera.x += mouseWorldX - newMouseWorldX;
    gameState.camera.y += mouseWorldY - newMouseWorldY;
  }

  /**
   * Handle canvas mouse move events - SUPER SIMPLE weapon tracking
   * @param {MouseEvent} e - Mouse event
   * @param {HTMLCanvasElement} canvas - Game canvas
   */
  handleCanvasMouseMove(e, canvas) {
    // Get canvas bounds - CRITICAL for accurate mouse tracking
    const rect = canvas.getBoundingClientRect();

    // Calculate mouse position relative to canvas
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;

    // DIRECT weapon angle - from screen center to mouse
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const weaponAngle = Math.atan2(this.mouse.y - centerY, this.mouse.x - centerX);

    // Store DIRECTLY on window for immediate access - BYPASS ALL OTHER SYSTEMS
    window.WEAPON_ANGLE = weaponAngle;
    window.WEAPON_ANGLE_INITIALIZED = true; // Mark as properly initialized

    // Also store mouse position for debugging
    window.MOUSE_POS = { x: this.mouse.x, y: this.mouse.y };

    // Debug logging (only in development)
    if (window.DEBUG_MOUSE_TRACKING) {
        console.debug(`Mouse: (${this.mouse.x.toFixed(0)}, ${this.mouse.y.toFixed(0)}) -> Weapon: ${(weaponAngle * 180 / Math.PI).toFixed(1)}°`);
    }

    // Update global mouse position for initialization consistency
    if (window.globalMousePos) {
      window.globalMousePos.x = e.clientX;
      window.globalMousePos.y = e.clientY;
    }
  }

  /**
   * Initialize weapon angle based on current mouse position
   * Ensures weapon follows mouse immediately when game starts
   * @param {HTMLCanvasElement} canvas - Game canvas
   */
  initializeWeaponAngle(canvas) {
    if (!canvas) {
      console.warn('Cannot initialize weapon angle: canvas not available');
      return;
    }

    // Get current global mouse position, fallback to center of screen
    const globalMousePos = window.globalMousePos || {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };

    const rect = canvas.getBoundingClientRect();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Calculate mouse position relative to canvas (same as handleCanvasMouseMove)
    const mouseX = globalMousePos.x - rect.left;
    const mouseY = globalMousePos.y - rect.top;

    // Calculate weapon angle from canvas center to mouse position
    const weaponAngle = Math.atan2(mouseY - centerY, mouseX - centerX);

    // Update global weapon angle
    window.WEAPON_ANGLE = weaponAngle;
    window.WEAPON_ANGLE_INITIALIZED = true; // Mark as properly initialized

    // Also update internal mouse state for consistency
    this.mouse.x = mouseX;
    this.mouse.y = mouseY;
    this.mouse.angle = weaponAngle;

    console.log(`🎯 Weapon angle initialized: ${(weaponAngle * 180 / Math.PI).toFixed(1)}° (mouse: ${mouseX.toFixed(0)}, ${mouseY.toFixed(0)})`);
  }
  
  /**
   * Normalize angle to [-PI, PI] range
   * @param {number} angle - Angle to normalize
   * @returns {number} Normalized angle
   */
  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  /**
   * Handle canvas mouse down events
   * @param {MouseEvent} e - Mouse event
   * @param {HTMLCanvasElement} canvas - Game canvas
   */
  handleCanvasMouseDown(e, canvas) {
    if (e.button === 0) {// Left click
      const gameState = window.gameState;

      // Shop clicks now handled by HTML interface

      // Don't shoot if in lobby or shop is open
      if (gameState?.isInLobby) {
        return;
      }

      // Handle shooting if not in shop
      this.handleShooting(gameState);
    }

    this.mouse.down = true;
    this.updateMousePosition(e);
  }

  /**
   * Handle shooting logic
   * @param {Object} gameState - Current game state
   */
  handleShooting(gameState) {
    const currentTime = Date.now();
    const player = gameState.players[gameState.playerId];

    if (!player || !gameState.isConnected) return;

    // Apply rapid fire power-up
    const hasRapidFire = window.activePowerUps?.some((p) => p.effect === 'rapidFire') || false;
    const SHOT_COOLDOWN = window.SHOT_COOLDOWN || 500;
    const cooldown = hasRapidFire ? SHOT_COOLDOWN / 2 : SHOT_COOLDOWN;

    // Check shooting cooldown
    const lastShotTime = window.lastShotTime || 0;
    if (currentTime - lastShotTime >= cooldown) {
      // Use precise target angle for bullet accuracy, not the smoothed visual angle
      let shootAngle = gameState.mouse.targetAngle || this.mouse.angle;
      
      // Override with server-synced angle if available for perfect accuracy
      if (player.smoothGunAngle !== undefined) {
        shootAngle = player.smoothGunAngle;
      }

      console.log('Shooting bullet at precise angle:', shootAngle);

      // Send to server if function exists
      if (typeof window.sendToServer === 'function') {
        const tankVelocity = window.physicsSystem ? window.physicsSystem.getTankVelocity() : { x: 0, y: 0 };
        window.sendToServer('playerShoot', {
          angle: shootAngle,
          tankVelocity: tankVelocity
        });
      }

      // Update last shot time (use global for backward compatibility)
      if (typeof window !== 'undefined') {
        window.lastShotTime = currentTime;
      }

      // Hide cooldown cursor when shooting
      if (typeof window.hideCooldownCursor === 'function') {
        window.hideCooldownCursor();
      }

      // Trigger weapon animation
      this.triggerWeaponAnimation(gameState, player);

      // Create explosion effect and recoil animations
      this.handleShootingEffects(player, shootAngle);
    }
  }
  
  /**
   * Trigger weapon shooting animation
   * @param {Object} gameState - Current game state
   * @param {Object} player - Player object
   */
  triggerWeaponAnimation(gameState, player) {
    // Find weapon animation for this player
    if (window.renderSystem && window.renderSystem.spriteAnimations) {
      const playerTankConfig = player.selectedTank || gameState.selectedTank;
      const weaponAssetKey = `${playerTankConfig.color}_${playerTankConfig.weapon}`;
      const weaponAnimKey = `${player.id}_${weaponAssetKey}`;
      const weaponAnim = window.renderSystem.spriteAnimations.weapons[weaponAnimKey];
      
      if (weaponAnim) {
        // Start weapon animation from frame 0
        weaponAnim.currentFrame = 0;
        weaponAnim.isPlaying = true;
        weaponAnim.loop = false;
        weaponAnim.lastFrameTime = Date.now();
        weaponAnim.frameDuration = 40; // Fast shooting animation
        
        console.log('🔫 Weapon animation triggered');
      }
    }
  }

  /**
   * Handle shooting visual effects and recoil
   * @param {Object} player - Player object
   * @param {number} shootAngle - Shooting angle
   */
  handleShootingEffects(player, shootAngle) {
    // Create explosion effect at bullet spawn
    if (typeof window.createExplosion === 'function') {
      const weaponVisualAngle = shootAngle + Math.PI / 2;
      const bulletAngle = weaponVisualAngle - Math.PI / 2;
      const weaponOffset = 80;
      window.createExplosion(
        player.x + Math.cos(bulletAngle) * weaponOffset,
        player.y + Math.sin(bulletAngle) * weaponOffset,
        0.3
      );
    }

    // Trigger realistic gun recoil animation
    if (window.gunRecoilAnimation) {
      window.gunRecoilAnimation.left = 4;
      window.gunRecoilAnimation.shake = 1;
    }

    // Enhanced player recoil animation
    if (window.physicsSystem) {
      const recoilForce = 0.4;
      const recoilAngle = shootAngle + Math.PI;
      const recoilVx = Math.cos(recoilAngle) * recoilForce;
      const recoilVy = Math.sin(recoilAngle) * recoilForce;
      window.physicsSystem.applyRecoil(recoilVx, recoilVy, 10);
    }
  }

  /**
   * Update mouse position
   * @param {MouseEvent} e - Mouse event
   */
  updateMousePosition(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  /**
   * Handle touch start events
   * @param {TouchEvent} e - Touch event
   */
  handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.touch.active = true;
      this.touch.x = e.touches[0].clientX;
      this.touch.y = e.touches[0].clientY;
    }
  }

  /**
   * Handle touch end events
   * @param {TouchEvent} e - Touch event
   */
  handleTouchEnd(e) {
    e.preventDefault();
    this.touch.active = false;
  }

  /**
   * Handle touch move events
   * @param {TouchEvent} e - Touch event
   */
  handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.touch.x = e.touches[0].clientX;
      this.touch.y = e.touches[0].clientY;
    }
  }

  /**
   * Check if a key is currently pressed
   * @param {string} key - Key to check
   * @returns {boolean} True if key is pressed
   */
  isKeyPressed(key) {
    return !!this.keys[key];
  }

  /**
   * Get current mouse state
   * @returns {Object} Mouse state object
   */
  getMouseState() {
    return { ...this.mouse };
  }

  /**
   * Get current touch state
   * @returns {Object} Touch state object
   */
  getTouchState() {
    return { ...this.touch };
  }

  /**
   * Get current input state
   * @returns {Object} Complete input state
   */
  getInputState() {
    return {
      keys: { ...this.keys },
      mouse: { ...this.mouse },
      touch: { ...this.touch },
      autoFireEnabled: this.autoFireEnabled,
      aimbotEnabled: this.aimbotEnabled,
      isSprinting: this.isSprinting
    };
  }

  /**
   * Get movement input from WASD/Arrow keys
   * @returns {Object} Movement input with x, y components
   */
  getMovementInput() {
    let inputX = 0,inputY = 0;

    const wPressed = this.keys['w'] || this.keys['ArrowUp'] || this.keys['KeyW'];
    const sPressed = this.keys['s'] || this.keys['ArrowDown'] || this.keys['KeyS'];
    const aPressed = this.keys['a'] || this.keys['ArrowLeft'] || this.keys['KeyA'];
    const dPressed = this.keys['d'] || this.keys['ArrowRight'] || this.keys['KeyD'];

    if (wPressed) inputY -= 1;
    if (sPressed) inputY += 1;
    if (aPressed) inputX -= 1;
    if (dPressed) inputX += 1;

    // Normalize diagonal movement
    if (inputX !== 0 && inputY !== 0) {
      const length = Math.sqrt(inputX * inputX + inputY * inputY);
      inputX /= length;
      inputY /= length;
    }

    return { x: inputX, y: inputY };
  }

  /**
   * Check if any movement key is pressed
   * @returns {boolean} True if any movement key is pressed
   */
  isMoving() {
    const movement = this.getMovementInput();
    return movement.x !== 0 || movement.y !== 0;
  }

  /**
   * Get game-specific input flags
   * @returns {Object} Game input flags
   */
  getGameInputFlags() {
    return {
      autoFireEnabled: this.autoFireEnabled,
      aimbotEnabled: this.aimbotEnabled,
      isSprinting: this.isSprinting
    };
  }

  /**
   * Update input system (called each frame)
   * @param {number} deltaTime - Time since last update
   * @param {Object} gameState - Current game state
   */
  update(deltaTime, gameState) {
    // Update game state with current input
    if (gameState) {
      gameState.keys = { ...this.keys };
      gameState.mouse = { ...this.mouse };

      // Update game-specific input flags for backward compatibility
      if (typeof window !== 'undefined') {
        if (window.autoFireEnabled !== undefined) window.autoFireEnabled = this.autoFireEnabled;
        if (window.aimbotEnabled !== undefined) window.aimbotEnabled = this.aimbotEnabled;
        if (window.isSprinting !== undefined) window.isSprinting = this.isSprinting;
      }
    }

    // Setup canvas handlers if not done yet (retry mechanism)
    if (!this.canvasHandlersSetup) {
      this.setupInputHandlers();
    }
    
    // Just update mouse position, weapon angle calculated directly in RenderSystem
    if (gameState && gameState.mouse) {
      gameState.mouse.x = this.mouse.x;
      gameState.mouse.y = this.mouse.y;
    }
  }
  


  /**
   * Cleanup input system
   */
  cleanup() {
    // Remove all event listeners
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    this.listeners = [];
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false, angle: 0 };
    this.touch = { x: 0, y: 0, active: false };
    this.initialized = false;
    this.inputHandlersSetup = false;
    this.canvasHandlersSetup = false;

    // Reset game-specific input state
    this.autoFireEnabled = false;
    this.aimbotEnabled = false;
    this.isSprinting = false;

    console.log('🧹 InputSystem cleaned up');
  }
}

export default InputSystem;