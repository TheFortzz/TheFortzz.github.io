/**
 * RenderSystem - SIMPLE tank rendering
 * Body follows WASD, weapon follows mouse - EASY!
 */

export default class RenderSystem {
    constructor(gameState, canvas, ctx, minimapCanvas, minimapCtx) {
        this.gameState = gameState;
        this.canvas = canvas;
        this.ctx = ctx;
        this.minimapCanvas = minimapCanvas;
        this.minimapCtx = minimapCtx;
        
        // Constants
        this.TANK_VISUAL_SIZE = 428;
        this.GUN_SIZE = 1503;
        
        // State
        this.wallHitAnimations = [];
        this.notifications = [];
        this.damageNumbers = [];
        this.hitMarkers = [];
        
        // Dependencies (will be injected)
        this.particleSystem = null;
        this.imageLoader = null;
        this.tankImages = {};
        this.weaponImages = {};
        this.imagesLoaded = false;
        this.spriteAnimations = { tanks: {}, weapons: {} };
    }
    
    /**
     * Set dependencies after construction
     */
    setDependencies(particleSystem, imageLoader, tankImages, weaponImages, imagesLoaded, spriteAnimations) {
        this.particleSystem = particleSystem;
        this.imageLoader = imageLoader;
        this.tankImages = tankImages;
        this.weaponImages = weaponImages;
        this.imagesLoaded = imagesLoaded;
        this.spriteAnimations = spriteAnimations;
    }
    
    /**
     * Resize canvas to window dimensions
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /**
     * Main render function - coordinates all rendering
     */
    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        if (!ctx || !canvas) {
            console.warn('❌ Canvas or context not available for rendering');
            return;
        }
        
        // Update sprite animations
        this.updateSpriteAnimations();
        
        // Clear canvas with bright blue water background
        ctx.fillStyle = '#4a9ad8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save context for camera transform
        ctx.save();

        // Apply camera transformation to center the player tank
        const zoom = this.gameState.camera.zoom || 1;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Get player position
        const player = this.gameState.players ? this.gameState.players[this.gameState.playerId] : null;
        
        if (player) {
            // Center the player tank on screen
            ctx.translate(centerX, centerY);
            ctx.scale(zoom, zoom);
            ctx.translate(-player.x, -player.y);
        } else {
            // Fallback if no player found - use camera position
            ctx.translate(centerX, centerY);
            ctx.scale(zoom, zoom);
            ctx.translate(-this.gameState.camera.x, -this.gameState.camera.y);
        }

        // Only render the created map - no default backgrounds
        if (window.MapRenderer && window.MapRenderer.currentMap) {
            // Render map (ground tiles and buildings) - map provides its own ground
            window.MapRenderer.render(ctx, this.gameState, canvas);
        } else {
            // Draw a simple grid pattern if no map is loaded
            this.drawDebugGrid(ctx);
        }

        // Draw AI tanks from map
        this.drawAITanks();

        // Draw player tank
        this.drawPlayers();
        
        // Render particle effects
        if (this.particleSystem) {
            this.particleSystem.render();
        }

        // Restore context
        ctx.restore();
        
        // Draw debug info
        this.drawDebugInfo();
    }
    
    /**
     * Update all sprite animations
     */
    updateSpriteAnimations() {
        const currentTime = Date.now();
        
        // Update weapon animations
        Object.values(this.spriteAnimations.weapons).forEach(anim => {
            if (anim.isPlaying && currentTime - anim.lastFrameTime > anim.frameDuration) {
                anim.currentFrame = (anim.currentFrame + 1) % anim.numFrames;
                anim.lastFrameTime = currentTime;
                
                // Stop non-looping animations when they complete
                if (!anim.loop && anim.currentFrame === 0) {
                    anim.isPlaying = false;
                }
            }
        });
        
        // Tank animations are updated in updateTankAnimation method
    }
    
    /**
     * Render lobby background
     */
    renderLobbyBackground() {
        // Only render full map on tank canvas
        const vehicleType = window.currentLobbyVehicleType || this.gameState.selectedVehicleType || 'tank';
        if (vehicleType !== 'tank') return;
        
        const lobbyCanvas = document.getElementById('tankLobbyBackground');
        if (!lobbyCanvas) {
            console.warn('❌ Tank lobby background canvas not found in renderLobbyBackground');
            return;
        }

        const ctx = lobbyCanvas.getContext('2d');

        // Set canvas size to full screen
        lobbyCanvas.width = window.innerWidth;
        lobbyCanvas.height = window.innerHeight;

        // Fill with dark background first
        ctx.fillStyle = '#0a1a2a';
        ctx.fillRect(0, 0, lobbyCanvas.width, lobbyCanvas.height);

        // Only render created map - NO WATER
        if (window.MapRenderer && window.MapRenderer.currentMap) {
            // Create a mock game state for rendering with centered camera
            const mockGameState = {
                camera: { 
                    x: -lobbyCanvas.width / 2, 
                    y: -lobbyCanvas.height / 2 
                }
            };
            
            // Render the created map
            window.MapRenderer.render(ctx, mockGameState, lobbyCanvas);
            console.log('✅ Tank lobby created map rendered');
        } else {
            // No map available - just show dark background (no water)
            console.log('⚠️ No created map available for tank lobby');
        }
    }
    
    /**
     * Draw AI tanks that were placed in the map creator
     */
    drawAITanks() {
        if (!this.gameState.aiTanks || this.gameState.aiTanks.length === 0) return;
        if (!this.imagesLoaded) return;
        
        const ctx = this.ctx;
        
        this.gameState.aiTanks.forEach(ai => {
            if (ai.health <= 0) return;
            
            ctx.save();
            
            // Get tank images based on AI color
            const aiColor = ai.color || 'red';
            const tankImg = this.tankImages[aiColor]?.['body_halftrack'];
            const weaponImg = this.weaponImages[aiColor]?.['turret_01_mk1'];
            
            // Draw shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(ai.x + 5, ai.y + 5, 45, 30, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw tank body
            ctx.translate(ai.x, ai.y);
            ctx.rotate(ai.angle + Math.PI / 2);
            
            // Apply engine pulse animation
            const pulseScale = 1 + (ai.enginePulse || 0);
            ctx.scale(pulseScale, pulseScale);
            
            if (tankImg && tankImg.complete && tankImg.naturalWidth > 0) {
                const scale = this.TANK_VISUAL_SIZE / Math.max(tankImg.width * 2, tankImg.height);
                ctx.drawImage(
                    tankImg,
                    -tankImg.width * scale / 2,
                    -tankImg.height * scale / 2,
                    tankImg.width * scale,
                    tankImg.height * scale
                );
            } else {
                // Fallback: draw simple tank shape
                ctx.fillStyle = this.getTankColorHex(aiColor);
                ctx.fillRect(-30, -40, 60, 80);
                ctx.fillStyle = '#333';
                ctx.fillRect(-35, -35, 10, 70);
                ctx.fillRect(25, -35, 10, 70);
            }
            
            // Reset rotation for turret
            ctx.scale(1/pulseScale, 1/pulseScale);
            ctx.rotate(-(ai.angle + Math.PI / 2));
            
            // Draw turret
            ctx.rotate(ai.turretAngle + Math.PI / 2);
            
            if (weaponImg && weaponImg.complete && weaponImg.naturalWidth > 0) {
                const weaponScale = (this.TANK_VISUAL_SIZE * 4.32) / Math.max(weaponImg.width, weaponImg.height);
                ctx.drawImage(
                    weaponImg,
                    -weaponImg.width * weaponScale / 2,
                    -weaponImg.height * weaponScale / 2,
                    weaponImg.width * weaponScale,
                    weaponImg.height * weaponScale
                );
            } else {
                // Fallback: draw simple turret
                ctx.fillStyle = this.darkenColor(this.getTankColorHex(aiColor), 20);
                ctx.beginPath();
                ctx.arc(0, 0, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#444';
                ctx.fillRect(-5, -50, 10, 35);
            }
            
            ctx.restore();
            
            // Draw AI name tag
            ctx.save();
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(ai.x - 40, ai.y - 70, 80, 20);
            ctx.fillStyle = '#ff6b6b';
            ctx.fillText('🤖 ' + ai.name, ai.x, ai.y - 55);
            ctx.restore();
            
            // Draw health bar
            if (ai.health < ai.maxHealth) {
                const barWidth = 60;
                const barHeight = 6;
                const healthPercent = ai.health / ai.maxHealth;
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(ai.x - barWidth/2, ai.y - 85, barWidth, barHeight);
                
                ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#f44336';
                ctx.fillRect(ai.x - barWidth/2, ai.y - 85, barWidth * healthPercent, barHeight);
            }
        });
    }
    
    /**
     * Draw players
     */
    drawPlayers() {
        const player = this.gameState.players ? this.gameState.players[this.gameState.playerId] : null;
        if (!player) {
            console.warn('❌ No player found for rendering');
            return;
        }

        const ctx = this.ctx;
        
        // Use smooth position or fallback to regular position
        const renderX = player.smoothX !== undefined ? player.smoothX : player.x;
        const renderY = player.smoothY !== undefined ? player.smoothY : player.y;

        // DIRECT angles - no complex processing
        const bodyRotation = player.bodyAngle || 0;
        let weaponAngle = player.weaponAngle || 0;
        
        console.log('🎨 RENDERING SEPARATE: Body=' + (bodyRotation * 180 / Math.PI).toFixed(1) + '° Weapon=' + (weaponAngle * 180 / Math.PI).toFixed(1) + '° (independent)');
        
        // No adjustment needed - use direct mouse angle
        // weaponAngle -= Math.PI / 2;

        // Try to render with images first
        console.log('🖼️ Images loaded:', this.imagesLoaded, '| Tank images available:', !!this.tankImages, '| Weapon images available:', !!this.weaponImages);
        if (this.imagesLoaded) {
            const playerTankConfig = player.selectedTank || this.gameState.selectedTank;
            const { tankImg, weaponImg } = this.getCurrentTankImages(playerTankConfig);

            if (tankImg && weaponImg && tankImg.complete && weaponImg.complete) {
                // Import Tank class dynamically
                const Tank = window.Tank;
                if (Tank) {
                    // Create Tank instance for rendering
                    const tank = new Tank(playerTankConfig);
                    tank.visualSize = this.TANK_VISUAL_SIZE;

                    // Get sprite animations
                    const tankAssetKey = tank.getTankAssetKey();
                    const tankAnimKey = `${player.id}_${tankAssetKey}`;
                    let tankAnim = this.spriteAnimations.tanks[tankAnimKey];
                    
                    // Initialize tank animation if it doesn't exist
                    if (!tankAnim) {
                        tankAnim = this.initSpriteAnimation('tanks', player.id, tankAssetKey);
                    }
                    
                    // Update tank animation based on movement
                    this.updateTankAnimation(tankAnim, player);
                    
                    const weaponAssetKey = tank.getWeaponAssetKey();
                    const weaponAnimKey = `${player.id}_${weaponAssetKey}`;
                    let weaponAnim = this.spriteAnimations.weapons[weaponAnimKey];
                    
                    // Initialize weapon animation if it doesn't exist
                    if (!weaponAnim) {
                        weaponAnim = this.initSpriteAnimation('weapons', player.id, weaponAssetKey);
                        weaponAnim.isPlaying = false;
                        weaponAnim.loop = false;
                        weaponAnim.currentFrame = 0;
                    }

                    // Render tank using Tank class with enhanced rendering
                    this.renderEnhancedTank(ctx, tank, { tankImg, weaponImg }, {
                        x: renderX,
                        y: renderY,
                        bodyRotation: bodyRotation,
                        weaponAngle: weaponAngle,
                        scale: 1,
                        tankAnimation: tankAnim,
                        weaponAnimation: weaponAnim,
                        player: player
                    });
                    return;
                }
            }
        }
        
        // Fallback: Draw simple tank shapes if images aren't loaded
        console.log('🎨 Drawing fallback tank at:', renderX, renderY, '| Reason: imagesLoaded =', this.imagesLoaded);
        
        ctx.save();
        ctx.translate(renderX, renderY);
        
        // Draw tank shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(5, 5, 35, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw tank body - SEPARATE rotation context (IMPROVED FALLBACK)
        ctx.save();
        ctx.rotate(bodyRotation + Math.PI / 2);
        
        // Better looking tank body
        ctx.fillStyle = '#2196F3'; // Blue tank
        ctx.fillRect(-35, -45, 70, 90);
        
        // Tank tracks (more visible)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-40, -40, 12, 80);
        ctx.fillRect(28, -40, 12, 80);
        
        // Tank details
        ctx.fillStyle = '#1976D2';
        ctx.fillRect(-25, -35, 50, 70);
        
        ctx.restore(); // End body rotation
        
        // Draw weapon - DIRECT mouse angle (IMPROVED FALLBACK)
        ctx.save();
        ctx.rotate(weaponAngle + Math.PI / 2); // Direct mouse angle
        
        // Better looking turret base
        ctx.fillStyle = '#1976D2'; // Darker blue
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        
        // Turret ring
        ctx.strokeStyle = '#0d47a1';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Gun barrel pointing toward mouse (more visible)
        ctx.fillStyle = '#333';
        ctx.fillRect(-6, -55, 12, 40);
        
        // Gun tip
        ctx.fillStyle = '#222';
        ctx.fillRect(-4, -58, 8, 6);
        
        ctx.restore(); // End weapon rotation
        
        ctx.restore();
        
        // Draw player name
        ctx.save();
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(renderX - 40, renderY - 70, 80, 20);
        ctx.fillStyle = '#00ff00';
        ctx.fillText(player.name || 'Player', renderX, renderY - 55);
        ctx.restore();
        
        // Draw health bar
        if (player.health < (player.maxHealth || 100)) {
            const barWidth = 60;
            const barHeight = 6;
            const healthPercent = player.health / (player.maxHealth || 100);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(renderX - barWidth/2, renderY - 85, barWidth, barHeight);
            
            ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#f44336';
            ctx.fillRect(renderX - barWidth/2, renderY - 85, barWidth * healthPercent, barHeight);
        }
    }
    
    /**
     * Get current tank images based on player selection
     */
    getCurrentTankImages(playerTank, forLobby = false) {
        if (this.imageLoader) {
            return this.imageLoader.getCurrentTankImages(playerTank, forLobby);
        }
        return { tankImg: null, weaponImg: null };
    }
    
    /**
     * Initialize sprite animation
     */
    initSpriteAnimation(type, playerId, assetKey) {
        const key = `${playerId}_${assetKey}`;
        if (!this.spriteAnimations[type][key]) {
            const numFrames = type === 'tanks' ? 2 : 8;

            this.spriteAnimations[type][key] = {
                currentFrame: 0,
                lastFrameTime: Date.now(),
                frameDuration: type === 'weapons' ? 50 : 120, // Slower, more realistic animation
                numFrames: numFrames,
                frameWidth: 128,
                frameHeight: 128,
                isPlaying: type === 'tanks',
                loop: type === 'tanks'
            };
        }
        return this.spriteAnimations[type][key];
    }
    
    /**
     * Update tank animation based on movement
     */
    updateTankAnimation(tankAnim, player) {
        if (!tankAnim) return;
        
        // Check if tank is moving
        const isMoving = (player.vx && Math.abs(player.vx) > 0.1) || (player.vy && Math.abs(player.vy) > 0.1);
        
        if (isMoving) {
            // Tank is moving - animate tracks
            tankAnim.isPlaying = true;
            tankAnim.loop = true;
            
            // Speed up animation based on velocity
            const velocity = Math.sqrt((player.vx || 0) ** 2 + (player.vy || 0) ** 2);
            const speedMultiplier = Math.max(0.5, Math.min(2.0, velocity / 50)); // Scale with speed
            tankAnim.frameDuration = Math.max(60, 120 / speedMultiplier);
            
            // Update frame
            const currentTime = Date.now();
            if (currentTime - tankAnim.lastFrameTime > tankAnim.frameDuration) {
                tankAnim.currentFrame = (tankAnim.currentFrame + 1) % tankAnim.numFrames;
                tankAnim.lastFrameTime = currentTime;
            }
        } else {
            // Tank is stationary - stop animation on frame 0
            tankAnim.isPlaying = false;
            tankAnim.currentFrame = 0;
        }
    }
    

    
    /**
     * Normalize angle to [-PI, PI] range
     */
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
    
    /**
     * Render enhanced tank with realistic effects
     */
    renderEnhancedTank(ctx, tank, images, options) {
        const {
            x, y, bodyRotation, weaponAngle, scale,
            tankAnimation, weaponAnimation, player
        } = options;

        ctx.save();
        
        // Draw tank shadow first
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000000';
        ctx.translate(x + 8, y + 8); // Offset shadow
        ctx.rotate(bodyRotation + Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 45, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Main tank position
        ctx.translate(x, y);

        // No extra animations - clean tank rendering

        // Render tank body - COMPLETELY SEPARATE CONTEXT
        ctx.save();
        tank.renderBody(ctx, images.tankImg, {
            rotation: bodyRotation,
            scale,
            spriteAnimation: tankAnimation
        });
        ctx.restore(); // End body context - weapon not affected

        // Render weapon - COMPLETELY SEPARATE CONTEXT
        ctx.save();
        tank.renderWeapon(ctx, images.weaponImg, {
            weaponAngle,
            scale,
            spriteAnimation: weaponAnimation
        });
        ctx.restore(); // End weapon context - body not affected

        ctx.restore();
        
        // Draw enhanced player name with background
        this.drawPlayerNameTag(ctx, x, y, player.name || 'Player', '#00ff00');
        
        // Draw enhanced health bar
        if (player.health < (player.maxHealth || 100)) {
            this.drawHealthBar(ctx, x, y - 85, player.health, player.maxHealth || 100);
        }
    }
    
    /**
     * Draw enhanced player name tag
     */
    drawPlayerNameTag(ctx, x, y, name, color) {
        ctx.save();
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        
        // Measure text for background
        const textWidth = ctx.measureText(name).width;
        const padding = 8;
        
        // Draw background with rounded corners effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - textWidth/2 - padding, y - 75, textWidth + padding * 2, 20);
        
        // Draw border
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - textWidth/2 - padding, y - 75, textWidth + padding * 2, 20);
        
        // Draw text with glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 3;
        ctx.fillStyle = color;
        ctx.fillText(name, x, y - 60);
        
        ctx.restore();
    }
    
    /**
     * Draw enhanced health bar
     */
    drawHealthBar(ctx, x, y, health, maxHealth) {
        const barWidth = 60;
        const barHeight = 8;
        const healthPercent = health / maxHealth;
        
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - barWidth/2 - 1, y - 1, barWidth + 2, barHeight + 2);
        
        // Health bar background
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.fillRect(x - barWidth/2, y, barWidth, barHeight);
        
        // Health bar fill with gradient
        const gradient = ctx.createLinearGradient(x - barWidth/2, y, x + barWidth/2, y);
        if (healthPercent > 0.6) {
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#8BC34A');
        } else if (healthPercent > 0.3) {
            gradient.addColorStop(0, '#FF9800');
            gradient.addColorStop(1, '#FFC107');
        } else {
            gradient.addColorStop(0, '#f44336');
            gradient.addColorStop(1, '#FF5722');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - barWidth/2, y, barWidth * healthPercent, barHeight);
        
        // Health bar border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - barWidth/2, y, barWidth, barHeight);
        
        ctx.restore();
    }
    
    /**
     * Helper to get hex color for AI tank
     */
    getTankColorHex(color) {
        const colors = {
            'blue': '#2196F3',
            'red': '#f44336',
            'camo': '#4CAF50',
            'desert': '#D2691E',
            'purple': '#9C27B0'
        };
        return colors[color] || colors.red;
    }
    
    /**
     * Darken a color by a percentage
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    
    /**
     * Lighten a color by a percentage
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    
    /**
     * Draw debug grid when no map is loaded
     */
    drawDebugGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        const gridSize = 100;
        const bounds = 2000;
        
        // Draw vertical lines
        for (let x = -bounds; x <= bounds; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, -bounds);
            ctx.lineTo(x, bounds);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = -bounds; y <= bounds; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(-bounds, y);
            ctx.lineTo(bounds, y);
            ctx.stroke();
        }
        
        // Draw origin marker
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(-10, -10, 20, 20);
    }
    
    /**
     * Draw debug information
     */
    drawDebugInfo() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 300, 120);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '14px monospace';
        
        const player = this.gameState.players ? this.gameState.players[this.gameState.playerId] : null;
        
        ctx.fillText(`Player ID: ${this.gameState.playerId || 'None'}`, 20, 30);
        ctx.fillText(`Player Exists: ${player ? 'Yes' : 'No'}`, 20, 50);
        
        if (player) {
            ctx.fillText(`Position: (${Math.round(player.x)}, ${Math.round(player.y)})`, 20, 70);
            ctx.fillText(`Velocity: (${Math.round(player.vx || 0)}, ${Math.round(player.vy || 0)})`, 20, 90);
            ctx.fillText(`Angle: ${Math.round((player.angle || 0) * 180 / Math.PI)}°`, 20, 110);
        }
        
        ctx.fillText(`Images Loaded: ${this.imagesLoaded ? 'Yes' : 'No'}`, 20, 130);
        
        ctx.restore();
    }
    
    /**
     * Update and draw notifications
     */
    updateAndDrawNotifications() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.save();
        this.notifications = this.notifications.filter(n => {
            n.y -= 2;
            n.life -= n.decay;

            if (n.life <= 0) return false;

            ctx.globalAlpha = n.life;
            ctx.font = `bold ${n.size || 32}px Arial`;
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 6;
            ctx.strokeText(n.text, canvas.width / 2, n.y);
            ctx.fillStyle = n.color;
            ctx.fillText(n.text, canvas.width / 2, n.y);

            return true;
        });
        ctx.restore();
    }
    
    /**
     * Add notification
     */
    showNotification(text, color = '#FFD700', size = 32) {
        this.notifications.push({
            text,
            color,
            y: 200,
            life: 1,
            decay: 0.01,
            size: size
        });
    }
}
