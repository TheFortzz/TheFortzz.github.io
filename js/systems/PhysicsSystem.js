/**
 * PhysicsSystem - Handles tank movement, collision detection, and physics calculations
 * Extracted from game.js as part of the modular refactoring
 */

import { PHYSICS_CONFIG } from '../core/Config.js';

export default class PhysicsSystem {
    constructor(gameState) {
        this.gameState = gameState;
        
        // Tank physics state
        this.tankVelocity = { x: 0, y: 0 };
        this.lastInputDirection = { x: 0, y: 0 };
        
        // Sprint system state
        this.SPRINT_DURATION = 200; // Maximum sprint stamina (2x longer)
        this.SPRINT_DRAIN_RATE = 2; // How fast sprint drains per frame
        this.SPRINT_REGEN_RATE = 1; // How fast sprint regenerates per frame
        this.SPRINT_SPEED_MULTIPLIER = 1.75; // Speed boost when sprinting
        this.SPRINT_COOLDOWN = 30; // Frames to wait before regenerating after exhaustion
        
        this.sprintStamina = this.SPRINT_DURATION;
        this.sprintCooldown = 0;
        this.isSprinting = false;
        
        // Enhanced player recoil system
        this.playerRecoil = { vx: 0, vy: 0, active: false, duration: 0 };
        
        // Physics constants
        this.TANK_SIZE = 90; // Size for tank collision/positioning - reduced for tighter collision
        this.TANK_RADIUS = this.TANK_SIZE / 2; // Tank collision radius (45 pixels for better collision detection)
        this.CAMERA_SMOOTHING = 0.3; // Smooth camera following for fluid movement
        this.TANK_ROTATION_SPEED = 0.35; // Speed of tank rotation animation (increased for smoother rotation)
        this.GUN_ROTATION_SPEED = 0.3; // Speed of gun rotation (increased for smoother tracking)
        
        // Expose globally for backward compatibility
        if (typeof window !== 'undefined') {
            window.tankVelocity = this.tankVelocity;
            window.lastInputDirection = this.lastInputDirection;
            window.isSprinting = this.isSprinting;
        }
    }

    /**
     * Update tank physics with sliding effect
     * @param {number} inputX - Horizontal input (-1 to 1)
     * @param {number} inputY - Vertical input (-1 to 1)
     */
    updateTankPhysics(inputX, inputY) {
        let maxSpeed = this.isSprinting ? PHYSICS_CONFIG.TANK_SPRINT_MAX_SPEED : PHYSICS_CONFIG.TANK_MAX_SPEED;

        // Apply enhanced player recoil with smooth sliding animation (no rotation, just push back)
        if (this.playerRecoil.active) {
            // Apply knockback force without affecting tank rotation
            this.tankVelocity.x += this.playerRecoil.vx * PHYSICS_CONFIG.TANK_ACCELERATION;
            this.tankVelocity.y += this.playerRecoil.vy * PHYSICS_CONFIG.TANK_ACCELERATION;

            // Smooth exponential decay for sliding effect
            this.playerRecoil.vx *= 0.88;
            this.playerRecoil.vy *= 0.88;

            // Decrease duration counter
            if (this.playerRecoil.duration) {
                this.playerRecoil.duration--;
            }

            // Stop recoil when very small or duration expired
            if ((Math.abs(this.playerRecoil.vx) < 0.3 && Math.abs(this.playerRecoil.vy) < 0.3) || this.playerRecoil.duration <= 0) {
                this.playerRecoil.vx = 0;
                this.playerRecoil.vy = 0;
                this.playerRecoil.active = false;
                this.playerRecoil.duration = 0;
            }
        }

        if (inputX !== 0 || inputY !== 0) {
            // Direct control - smooth sliding movement like the deceleration
            const targetVelocityX = inputX * maxSpeed;
            const targetVelocityY = inputY * maxSpeed;

            // Ultra-smooth acceleration matching the sliding deceleration feel
            this.tankVelocity.x += (targetVelocityX - this.tankVelocity.x) * 0.1;
            this.tankVelocity.y += (targetVelocityY - this.tankVelocity.y) * 0.1;
        } else {
            // Smooth gradual deceleration when no input (no hard stops)
            this.tankVelocity.x *= 0.93;
            this.tankVelocity.y *= 0.93;

            // Only stop when velocity is extremely small (prevents floating point drift)
            if (Math.abs(this.tankVelocity.x) < 0.01) this.tankVelocity.x = 0;
            if (Math.abs(this.tankVelocity.y) < 0.01) this.tankVelocity.y = 0;
        }

        // Limit maximum velocity
        const currentSpeed = Math.sqrt(this.tankVelocity.x * this.tankVelocity.x + this.tankVelocity.y * this.tankVelocity.y);
        if (currentSpeed > maxSpeed) {
            const speedRatio = maxSpeed / currentSpeed;
            this.tankVelocity.x *= speedRatio;
            this.tankVelocity.y *= speedRatio;
        }

        // Store last input for reference
        this.lastInputDirection.x = inputX;
        this.lastInputDirection.y = inputY;
    }

    /**
     * Check if a position is near a wall (hexagon collision)
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @returns {boolean} True if position is near a wall
     */
    isNearWall(x, y) {
        const HEX_SIZE = 40; // Must match server hexagon size

        for (const wall of this.gameState.walls) {
            const centerX = wall.x;
            const centerY = wall.y;
            const hexRadius = wall.radius || HEX_SIZE;

            // Check collision with proper hitbox distance
            if (this.distance({ x: x, y: y }, { x: centerX, y: centerY }) < hexRadius + this.TANK_RADIUS) {
                // More precise hexagon collision check
                // Calculate angle from hexagon center to tank
                const angle = Math.atan2(y - centerY, x - centerX);

                // Find the closest hexagon edge
                let minDistance = Infinity;
                for (let i = 0; i < 6; i++) {
                    const hexAngle1 = (Math.PI / 3) * i - Math.PI / 6;
                    const hexAngle2 = (Math.PI / 3) * (i + 1) - Math.PI / 6;

                    const x1 = centerX + hexRadius * Math.cos(hexAngle1);
                    const y1 = centerY + hexRadius * Math.sin(hexAngle1);
                    const x2 = centerX + hexRadius * Math.cos(hexAngle2);
                    const y2 = centerY + hexRadius * Math.sin(hexAngle2);

                    // Distance from point to line segment
                    const dist = this.distanceToSegment(x, y, x1, y1, x2, y2);
                    minDistance = Math.min(minDistance, dist);
                }

                // Block if the hitbox touches the wall
                if (minDistance < this.TANK_RADIUS) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Calculate distance between two points
     * @param {Object} point1 - First point with x, y properties
     * @param {Object} point2 - Second point with x, y properties
     * @returns {number} Distance between points
     */
    distance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate distance from point to line segment
     * @param {number} px - Point X coordinate
     * @param {number} py - Point Y coordinate
     * @param {number} x1 - Line segment start X
     * @param {number} y1 - Line segment start Y
     * @param {number} x2 - Line segment end X
     * @param {number} y2 - Line segment end Y
     * @returns {number} Distance from point to line segment
     */
    distanceToSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Update camera position to follow player
     * @param {Object} player - Player object with x, y coordinates
     */
    updateCamera(player) {
        // Only update camera for our own player
        if (!player || player.id !== this.gameState.playerId) return;

        // Skip camera update if player position is not valid (prevents NaN camera values)
        if (!Number.isFinite(player.x) || !Number.isFinite(player.y)) return;

        // Initialize zoom if not set
        if (!this.gameState.camera.zoom) {
            this.gameState.camera.zoom = 1;
        }

        // Store player position in camera for reference
        // The actual centering is done in the render function
        this.gameState.camera.x = player.x;
        this.gameState.camera.y = player.y;
        this.gameState.camera.initialized = true;
    }

    /**
     * Update sprint system
     */
    updateSprintSystem() {
        // Handle sprint cooldown
        if (this.sprintCooldown > 0) {
            this.sprintCooldown--;
        }

        // Check if player is moving
        const isMoving = Math.abs(this.tankVelocity.x) > 0.1 || Math.abs(this.tankVelocity.y) > 0.1;

        // Normal sprint system
        if (this.isSprinting && isMoving && this.sprintStamina > 0) {
            // Drain stamina while sprinting
            this.sprintStamina -= this.SPRINT_DRAIN_RATE;
            if (this.sprintStamina <= 0) {
                this.sprintStamina = 0;
                this.isSprinting = false;
                this.sprintCooldown = this.SPRINT_COOLDOWN; // Start cooldown when exhausted
            }
        } else {
            // Regenerate stamina when not sprinting
            if (!this.isSprinting && this.sprintCooldown <= 0) {
                this.sprintStamina += this.SPRINT_REGEN_RATE;
                if (this.sprintStamina > this.SPRINT_DURATION) {
                    this.sprintStamina = this.SPRINT_DURATION;
                }
            }
        }

        // Update sprint bar UI
        this.updateSprintUI();

        // Update global reference for backward compatibility
        if (typeof window !== 'undefined') {
            window.isSprinting = this.isSprinting;
        }
    }

    /**
     * Update sprint UI elements
     */
    updateSprintUI() {
        const sprintBar = document.getElementById('sprintBar');
        if (sprintBar) {
            const percentage = (this.sprintStamina / this.SPRINT_DURATION) * 100;
            sprintBar.style.width = percentage + '%';

            // Change color based on stamina level
            if (percentage > 50) {
                sprintBar.style.backgroundColor = '#4CAF50'; // Green
            } else if (percentage > 25) {
                sprintBar.style.backgroundColor = '#FF9800'; // Orange
            } else {
                sprintBar.style.backgroundColor = '#F44336'; // Red
            }
        }

        const sprintValue = document.getElementById('sprintValue');
        if (sprintValue) {
            sprintValue.textContent = Math.ceil(this.sprintStamina);
        }
    }

    /**
     * Apply recoil force to the tank
     * @param {number} vx - Recoil velocity X
     * @param {number} vy - Recoil velocity Y
     * @param {number} duration - Duration of recoil effect
     */
    applyRecoil(vx, vy, duration = 10) {
        this.playerRecoil.vx = vx;
        this.playerRecoil.vy = vy;
        this.playerRecoil.active = true;
        this.playerRecoil.duration = duration;
    }

    /**
     * Get current player velocity
     * @param {string} playerId - Player ID to get velocity for
     * @returns {Object} Velocity object with x, y properties
     */
    getCurrentPlayerVelocity(playerId) {
        if (playerId === this.gameState.playerId) {
            return this.tankVelocity; // Use the current tankVelocity
        }
        // For other players, estimate velocity from position changes
        const player = this.gameState.players[playerId];
        if (player && player.lastPosition) {
            const dx = player.x - player.lastPosition.x;
            const dy = player.y - player.lastPosition.y;
            return { x: dx * 60, y: dy * 60 }; // Scale to per-second velocity
        }
        return { x: 0, y: 0 };
    }

    /**
     * Update bullet positions for smooth client-side movement
     */
    updateBulletPhysics() {
        this.gameState.bullets.forEach(bullet => {
            if (bullet.vx !== undefined && bullet.vy !== undefined) {
                bullet.x += bullet.vx;
                bullet.y += bullet.vy;
            }
        });
    }

    /**
     * Interpolate other players' positions for smooth movement
     */
    interpolatePlayerPositions() {
        Object.values(this.gameState.players).forEach(player => {
            if (player.id !== this.gameState.playerId && player.targetX !== undefined && player.targetY !== undefined) {
                // Smooth interpolation towards target position
                const interpSpeed = 1;
                player.x += (player.targetX - player.x) * interpSpeed;
                player.y += (player.targetY - player.y) * interpSpeed;
            }
        });
    }

    /**
     * Update physics system - main update loop
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update local player movement
        this.updateLocalPlayerMovement();
        
        // Update sprint system
        this.updateSprintSystem();
        
        // Update bullet physics
        this.updateBulletPhysics();
        
        // Interpolate other players' positions
        this.interpolatePlayerPositions();
    }

    /**
     * Update local player movement based on input
     */
    updateLocalPlayerMovement() {
        if (!this.gameState.players) {
            this.gameState.players = {};
        }
        
        const player = this.gameState.players[this.gameState.playerId];
        if (!player) {
            console.warn('❌ No player found for movement update');
            return;
        }

        if (!this.gameState.keys) {
            this.gameState.keys = {};
        }

        // Get input - check both lowercase and KeyCode formats
        let inputX = 0;
        let inputY = 0;

        if (this.gameState.keys['w'] || this.gameState.keys['ArrowUp'] || this.gameState.keys['KeyW']) inputY -= 1;
        if (this.gameState.keys['s'] || this.gameState.keys['ArrowDown'] || this.gameState.keys['KeyS']) inputY += 1;
        if (this.gameState.keys['a'] || this.gameState.keys['ArrowLeft'] || this.gameState.keys['KeyA']) inputX -= 1;
        if (this.gameState.keys['d'] || this.gameState.keys['ArrowRight'] || this.gameState.keys['KeyD']) inputX += 1;

        // Debug movement input
        if (inputX !== 0 || inputY !== 0) {
            console.log('🎮 Movement input:', { inputX, inputY, keys: Object.keys(this.gameState.keys).filter(k => this.gameState.keys[k]) });
        }

        // Normalize diagonal movement
        if (inputX !== 0 && inputY !== 0) {
            inputX *= 0.707;
            inputY *= 0.707;
        }

        // Update tank physics
        this.updateTankPhysics(inputX, inputY);

        // Apply velocity to player position with safety checks
        if (isFinite(this.tankVelocity.x) && isFinite(this.tankVelocity.y)) {
            const oldX = player.x;
            const oldY = player.y;
            
            player.x = (player.x || 0) + this.tankVelocity.x;
            player.y = (player.y || 0) + this.tankVelocity.y;
            
            // Debug position changes
            if (Math.abs(this.tankVelocity.x) > 0.1 || Math.abs(this.tankVelocity.y) > 0.1) {
                console.log('🚀 Player moved:', { 
                    from: { x: Math.round(oldX), y: Math.round(oldY) }, 
                    to: { x: Math.round(player.x), y: Math.round(player.y) },
                    velocity: { x: Math.round(this.tankVelocity.x * 10) / 10, y: Math.round(this.tankVelocity.y * 10) / 10 }
                });
            }
        }

        // Ensure player position is always finite
        player.x = isFinite(player.x) ? player.x : this.gameState.gameWidth / 2;
        player.y = isFinite(player.y) ? player.y : this.gameState.gameHeight / 2;

        // Store velocity for animation
        player.vx = this.tankVelocity.x;
        player.vy = this.tankVelocity.y;

        // Update smooth positions for rendering
        player.smoothX = player.x;
        player.smoothY = player.y;

        // Update player angle based on movement direction
        if (inputX !== 0 || inputY !== 0) {
            const targetAngle = Math.atan2(inputY, inputX);
            player.angle = targetAngle;
            player.currentRotation = targetAngle;
        }

        // Update mouse angle for turret
        // DISABLED: Let game.js handle weapon angle directly
        // if (this.gameState.mouse && this.gameState.mouse.angle !== undefined) {
        //     // Mouse angle is already calculated by InputSystem
        //     player.turretAngle = this.gameState.mouse.angle;
        //     player.smoothGunAngle = this.gameState.mouse.angle;
        // }

        // Keep player in bounds (expanded bounds for testing)
        const bounds = 2000;
        player.x = Math.max(-bounds, Math.min(bounds, player.x));
        player.y = Math.max(-bounds, Math.min(bounds, player.y));

        // Update camera to follow player
        this.updateCamera(player);
    }

    /**
     * Update camera to follow player
     */
    updateCamera(player) {
        if (!this.gameState.camera) {
            this.gameState.camera = { x: 0, y: 0, zoom: 1 };
        }

        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        // Safety checks for player position
        const playerX = isFinite(player.x) ? player.x : this.gameState.gameWidth / 2;
        const playerY = isFinite(player.y) ? player.y : this.gameState.gameHeight / 2;

        // Smooth camera following
        const targetX = playerX - canvas.width / 2;
        const targetY = playerY - canvas.height / 2;

        // Safety checks for camera position
        if (isFinite(targetX) && isFinite(targetY)) {
            this.gameState.camera.x += (targetX - this.gameState.camera.x) * this.CAMERA_SMOOTHING;
            this.gameState.camera.y += (targetY - this.gameState.camera.y) * this.CAMERA_SMOOTHING;
        }

        // Ensure camera position is always finite
        this.gameState.camera.x = isFinite(this.gameState.camera.x) ? this.gameState.camera.x : 0;
        this.gameState.camera.y = isFinite(this.gameState.camera.y) ? this.gameState.camera.y : 0;
    }

    /**
     * Get tank size for collision detection
     * @returns {number} Tank size
     */
    getTankSize() {
        return this.TANK_SIZE;
    }

    /**
     * Get tank radius for collision detection
     * @returns {number} Tank radius
     */
    getTankRadius() {
        return this.TANK_RADIUS;
    }

    /**
     * Get current tank velocity
     * @returns {Object} Velocity object with x, y properties
     */
    getTankVelocity() {
        return { ...this.tankVelocity };
    }

    /**
     * Get sprint status
     * @returns {boolean} True if currently sprinting
     */
    getIsSprinting() {
        return this.isSprinting;
    }

    /**
     * Set sprint status
     * @param {boolean} sprinting - Whether to sprint or not
     */
    setIsSprinting(sprinting) {
        // Only allow sprinting if we have stamina and no cooldown
        if (sprinting && this.sprintStamina > 0 && this.sprintCooldown <= 0) {
            this.isSprinting = true;
        } else {
            this.isSprinting = false;
        }
        
        // Update global reference for backward compatibility
        if (typeof window !== 'undefined') {
            window.isSprinting = this.isSprinting;
        }
    }

    /**
     * Get sprint stamina
     * @returns {number} Current sprint stamina
     */
    getSprintStamina() {
        return this.sprintStamina;
    }

    /**
     * Get last input direction
     * @returns {Object} Last input direction with x, y properties
     */
    getLastInputDirection() {
        return { ...this.lastInputDirection };
    }
}