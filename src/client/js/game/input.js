// Input handling
const InputHandler = {
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    lastShootTime: 0,
    shootCooldown: 500, // 500ms cooldown

    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.shouldHandleInput()) return;
            this.onKeyDown(e);
        });
        document.addEventListener('keyup', (e) => {
            if (!this.shouldHandleInput()) return;
            this.onKeyUp(e);
        });
        document.addEventListener('mousemove', (e) => {
            if (!this.shouldHandleInput()) return;
            this.onMouseMove(e);
        });
        document.addEventListener('mousedown', (e) => {
            if (!this.shouldHandleInput()) return;
            this.onMouseDown(e);
        });
        document.addEventListener('mouseup', (e) => {
            if (!this.shouldHandleInput()) return;
            this.onMouseUp(e);
        });
    },

    shouldHandleInput() {
        // Handle input when game is active (check both state objects)
        const gameStateObj = window.gameState || window.GameState;
        if (!gameStateObj) return false;
        
        // Check if we're in game (not in lobby)
        const isInLobby = gameStateObj.isInLobby;
        const gameCanvas = document.getElementById('gameCanvas');
        const gameMapArea = document.getElementById('gameMapArea');
        
        // Allow input if game canvas is visible or we're not in lobby
        return !isInLobby || (gameCanvas && !gameCanvas.classList.contains('hidden')) || (gameMapArea && !gameMapArea.classList.contains('hidden'));
    },

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        if (window.gameState) {
            window.gameState.keys[e.key.toLowerCase()] = true;
        }
    },

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
        if (window.gameState) {
            window.gameState.keys[e.key.toLowerCase()] = false;
        }
    },

    update() {
        // Update keys
    },

    onMouseMove(e) {
        if (!window.gameState) return;

        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();

        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // Update cooldown cursor position
        this.updateCooldownCursor(e.clientX, e.clientY);

        // Calculate mouse angle relative to player position
        const player = window.gameState.players[window.gameState.playerId];
        if (player) {
            // Convert screen mouse position to world coordinates
            const zoom = window.gameState.camera.zoom || 1;
            
            // Calculate mouse position relative to screen center
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const mouseOffsetX = (this.mouse.x - centerX) / zoom;
            const mouseOffsetY = (this.mouse.y - centerY) / zoom;
            
            // World mouse position relative to player (who is at screen center)
            const worldMouseX = player.x + mouseOffsetX;
            const worldMouseY = player.y + mouseOffsetY;

            // Calculate angle from player to mouse position
            this.mouse.angle = Math.atan2(worldMouseY - player.y, worldMouseX - player.x);
        }

        window.gameState.mouse = { ...this.mouse };
    },

    onMouseDown(e) {
        if (!window.gameState) return;

        this.mouse.down = true;

        if (e.button === 0) { // Left click
            if (this.canShoot()) {
                this.shoot();
            } else {
                // Show cooldown cursor if trying to shoot during cooldown
                this.showCooldownCursor();
            }
        }
    },

    onMouseUp(e) {
        this.mouse.down = false;
    },

    shoot() {
        if (!window.gameState) return;

        const player = window.gameState.players[window.gameState.playerId];
        if (!player) return;

        const now = Date.now();
        
        // Check cooldown
        if (now - this.lastShootTime < this.shootCooldown) {
            // Show cooldown cursor if not already showing
            this.showCooldownCursor();
            return;
        }

        this.lastShootTime = now;
        window.gameState.lastShootTime = now;

        // Hide cooldown cursor
        this.hideCooldownCursor();

        const bullet = {
            id: `bullet_${now}_${Math.random()}`,
            x: player.x,
            y: player.y,
            vx: Math.cos(window.gameState.mouse.angle) * 10, // bullet speed
            vy: Math.sin(window.gameState.mouse.angle) * 10,
            playerId: window.gameState.playerId
        };

        window.gameState.bullets.push(bullet);

        // Send to server if available
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            window.socket.send(JSON.stringify({
                type: 'shoot',
                bullet: bullet
            }));
        }

        // Start cooldown timer
        this.startCooldownTimer();
    },

    updateCooldownCursor(clientX, clientY) {
        const cooldownCursor = document.getElementById('cooldownCursor');
        if (cooldownCursor) {
            cooldownCursor.style.left = clientX + 'px';
            cooldownCursor.style.top = clientY + 'px';
        }
    },

    showCooldownCursor() {
        const cooldownCursor = document.getElementById('cooldownCursor');
        const gameCanvas = document.getElementById('gameCanvas');
        
        if (cooldownCursor && gameCanvas) {
            cooldownCursor.classList.remove('hidden');
            gameCanvas.classList.add('game-canvas-cooldown');
        }
    },

    hideCooldownCursor() {
        const cooldownCursor = document.getElementById('cooldownCursor');
        const gameCanvas = document.getElementById('gameCanvas');
        
        if (cooldownCursor && gameCanvas) {
            cooldownCursor.classList.add('hidden');
            gameCanvas.classList.remove('game-canvas-cooldown');
        }
    },

    startCooldownTimer() {
        // Show cooldown cursor immediately after shooting
        this.showCooldownCursor();
        
        // Hide it after cooldown period
        setTimeout(() => {
            this.hideCooldownCursor();
        }, this.shootCooldown);
    },

    canShoot() {
        const now = Date.now();
        return (now - this.lastShootTime) >= this.shootCooldown;
    },

    update() {
        if (!window.gameState) return;

        const player = window.gameState.players[window.gameState.playerId];
        if (!player) return;

        // Check cooldown status and update cursor accordingly
        if (!this.canShoot() && !document.getElementById('cooldownCursor').classList.contains('hidden')) {
            // Keep showing cooldown cursor
        } else if (this.canShoot() && !document.getElementById('cooldownCursor').classList.contains('hidden')) {
            // Hide cooldown cursor when cooldown is over
            this.hideCooldownCursor();
        }

        // Tank-like movement system
        this.updateTankMovement(player);

        // Keep player in bounds
        player.x = Math.max(50, Math.min(window.gameState.gameWidth - 50, player.x));
        player.y = Math.max(50, Math.min(window.gameState.gameHeight - 50, player.y));

        // Send position to server if available
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            window.socket.send(JSON.stringify({
                type: 'move',
                x: player.x,
                y: player.y,
                angle: player.angle
            }));
        }
    },

    updateTankMovement(player) {
        // Initialize velocity if not exists
        if (!player.velocity) {
            player.velocity = { x: 0, y: 0 };
        }

        // Tank physics constants
        const ACCELERATION = 0.3;
        const DECELERATION = 0.85;
        const MAX_SPEED = 4;
        const TURN_SPEED = 0.06;

        // Get input
        const forward = window.gameState.keys['w'];
        const backward = window.gameState.keys['s'];
        const left = window.gameState.keys['a'];
        const right = window.gameState.keys['d'];

        // Tank rotation (body follows movement direction)
        let targetAngle = player.angle || 0;
        
        if (forward || backward) {
            // Calculate movement direction
            let moveAngle = 0;
            
            if (forward && left) {
                moveAngle = -Math.PI / 4; // Forward-left
            } else if (forward && right) {
                moveAngle = Math.PI / 4; // Forward-right
            } else if (backward && left) {
                moveAngle = -3 * Math.PI / 4; // Backward-left
            } else if (backward && right) {
                moveAngle = 3 * Math.PI / 4; // Backward-right
            } else if (forward) {
                moveAngle = 0; // Forward
            } else if (backward) {
                moveAngle = Math.PI; // Backward
            } else if (left) {
                moveAngle = -Math.PI / 2; // Left
            } else if (right) {
                moveAngle = Math.PI / 2; // Right
            }

            targetAngle = moveAngle;
        } else if (left || right) {
            // Pure rotation without movement
            if (left) {
                targetAngle -= TURN_SPEED;
            }
            if (right) {
                targetAngle += TURN_SPEED;
            }
        }

        // Smooth rotation towards target
        const angleDiff = targetAngle - player.angle;
        const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        
        if (Math.abs(normalizedDiff) > 0.01) {
            player.angle += normalizedDiff * 0.15; // Smooth rotation
        }

        // Movement acceleration
        let accelerating = false;
        
        if (forward || backward || left || right) {
            accelerating = true;
            
            // Calculate acceleration direction
            let accelX = 0, accelY = 0;
            
            if (forward) {
                accelY -= ACCELERATION;
            }
            if (backward) {
                accelY += ACCELERATION;
            }
            if (left) {
                accelX -= ACCELERATION;
            }
            if (right) {
                accelX += ACCELERATION;
            }

            // Normalize diagonal movement
            if (accelX !== 0 && accelY !== 0) {
                accelX *= 0.707;
                accelY *= 0.707;
            }

            // Apply acceleration
            player.velocity.x += accelX;
            player.velocity.y += accelY;
        }

        // Apply deceleration when not accelerating
        if (!accelerating) {
            player.velocity.x *= DECELERATION;
            player.velocity.y *= DECELERATION;
        }

        // Limit maximum speed
        const currentSpeed = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.y * player.velocity.y);
        if (currentSpeed > MAX_SPEED) {
            player.velocity.x = (player.velocity.x / currentSpeed) * MAX_SPEED;
            player.velocity.y = (player.velocity.y / currentSpeed) * MAX_SPEED;
        }

        // Apply velocity to position
        player.x += player.velocity.x;
        player.y += player.velocity.y;

        // Store velocity for animation
        player.vx = player.velocity.x;
        player.vy = player.velocity.y;
    }
};

window.InputHandler = InputHandler;