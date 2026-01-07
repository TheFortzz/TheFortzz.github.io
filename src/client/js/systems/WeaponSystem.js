/**
 * WeaponSystem - Manages all weapon-related functionality including shooting, recoil, and animations
 * Consolidates weapon behavior, animations, and visual effects
 */

export default class WeaponSystem {
    constructor(gameState, networkSystem, particleSystem, imageLoader) {
        this.gameState = gameState;
        this.networkSystem = networkSystem;
        this.particleSystem = particleSystem;
        this.imageLoader = imageLoader;
        
        // Shooting system
        this.lastShotTime = 0;
        this.shotCooldown = 500; // 500ms = 2 shots per second
        
        // Gun recoil animation system
        this.gunRecoilAnimation = { left: 0, shake: 0 };
        this.otherPlayerGunRecoils = {}; // Track gun recoil for other players
        
        // Player recoil system
        this.playerRecoil = {
            vx: 0,
            vy: 0,
            active: false,
            duration: 0,
            friction: 0.85
        };
        
        // Weapon animation system
        this.weaponAnimations = new Map();
        
        // Cooldown cursor system
        this.cooldownActive = false;
    }

    /**
     * Update weapon system
     */
    update(deltaTime, activePowerUps = []) {
        this.updateGunRecoil();
        this.updatePlayerRecoil();
        this.updateWeaponAnimations();
    }

    /**
     * Handle shooting input
     */
    handleShooting(currentTime, activePowerUps = []) {
        const player = this.gameState.players[this.gameState.playerId];
        
        const hasRapidFire = activePowerUps.some(powerUp => powerUp.effect === 'rapidFire');
        const cooldown = hasRapidFire ? this.shotCooldown / 2 : this.shotCooldown;

        if (player && this.gameState.isConnected && (currentTime - this.lastShotTime) >= cooldown) {
            // Use smoothGunAngle if available for perfect bullet-weapon alignment
            let shootAngle = this.gameState.mouse.angle;
            if (player.smoothGunAngle !== undefined) {
                shootAngle = player.smoothGunAngle;
            }

            // Get tank velocity for recoil calculation
            const tankVelocity = window.tankVelocity || { x: 0, y: 0 };
            
            this.networkSystem.sendPlayerShoot(shootAngle, { x: tankVelocity.x, y: tankVelocity.y });

            // Update last shot time
            this.lastShotTime = currentTime;

            // Trigger realistic gun recoil animation
            this.gunRecoilAnimation.left = 4;
            this.gunRecoilAnimation.shake = 1;

            // Enhanced player recoil (push back) animation with smooth sliding
            const recoilForce = 0.4;
            const recoilAngle = shootAngle + Math.PI;
            this.playerRecoil.vx = Math.cos(recoilAngle) * recoilForce;
            this.playerRecoil.vy = Math.sin(recoilAngle) * recoilForce;
            this.playerRecoil.active = true;
            this.playerRecoil.duration = 12;

            // Create explosion effect at bullet spawn
            const weaponVisualAngle = shootAngle + Math.PI / 2;
            const bulletAngle = weaponVisualAngle - Math.PI / 2;
            const weaponOffset = 80;
            if (this.particleSystem) {
                this.particleSystem.createExplosion(
                    player.x + Math.cos(bulletAngle) * weaponOffset,
                    player.y + Math.sin(bulletAngle) * weaponOffset, 
                    0.3
                );
            }

            // Trigger weapon and tank body shooting animation with muzzle flash
            this.triggerWeaponAnimation(this.gameState.selectedTank, this.gameState.playerId);
            this.triggerTankBodyAnimation(this.gameState.selectedTank, this.gameState.playerId);
            if (this.particleSystem) {
                this.particleSystem.triggerMuzzleFlash(this.gameState.playerId);
            }
            
            // Start cooldown cursor
            this.startCooldownTimer(cooldown);
        }
    }

    /**
     * Update gun recoil animation and muzzle flashes
     */
    updateGunRecoil() {
        // Smoothly reduce recoil animation for own player with more realistic physics
        if (this.gunRecoilAnimation.left > 0) {
            this.gunRecoilAnimation.left *= 0.75; // Faster initial recovery
            if (this.gunRecoilAnimation.left < 0.3) this.gunRecoilAnimation.left = 0;
        }

        // Add barrel shake effect for realism
        if (this.gunRecoilAnimation.shake > 0) {
            this.gunRecoilAnimation.shake *= 0.8;
            if (this.gunRecoilAnimation.shake < 0.2) this.gunRecoilAnimation.shake = 0;
        }

        // Update recoil animation for other players
        Object.keys(this.otherPlayerGunRecoils).forEach(playerId => {
            const recoil = this.otherPlayerGunRecoils[playerId];

            if (recoil.left > 0) {
                recoil.left *= 0.75;
                if (recoil.left < 0.3) recoil.left = 0;
            }

            if (recoil.shake > 0) {
                recoil.shake *= 0.8;
                if (recoil.shake < 0.2) recoil.shake = 0;
            }

            // Clean up recoil data if player is no longer in game
            if (!this.gameState.players[playerId]) {
                delete this.otherPlayerGunRecoils[playerId];
            }
        });
    }

    /**
     * Update player recoil physics
     */
    updatePlayerRecoil() {
        if (this.playerRecoil.active) {
            // Apply recoil velocity with friction
            this.playerRecoil.vx *= this.playerRecoil.friction;
            this.playerRecoil.vy *= this.playerRecoil.friction;
            
            // Reduce duration
            this.playerRecoil.duration--;
            
            // Stop recoil when duration expires or velocity is negligible
            if (this.playerRecoil.duration <= 0 || 
                (Math.abs(this.playerRecoil.vx) < 0.01 && Math.abs(this.playerRecoil.vy) < 0.01)) {
                this.playerRecoil.active = false;
                this.playerRecoil.vx = 0;
                this.playerRecoil.vy = 0;
            }
        }
    }

    /**
     * Update weapon animations
     */
    updateWeaponAnimations() {
        // Update weapon sprite animations
        this.weaponAnimations.forEach((animation, animationKey) => {
            if (animation.isPlaying) {
                const currentTime = Date.now();
                if (currentTime - animation.lastFrameTime > animation.frameDelay) {
                    animation.currentFrame++;
                    animation.lastFrameTime = currentTime;
                    
                    if (animation.currentFrame >= animation.totalFrames) {
                        if (animation.loop) {
                            animation.currentFrame = 0;
                        } else {
                            animation.isPlaying = false;
                            animation.currentFrame = 0;
                        }
                    }
                }
            }
        });
    }

    /**
     * Trigger weapon shooting animation
     */
    triggerWeaponAnimation(playerTank, playerId = this.gameState.playerId) {
        const weaponImages = this.imageLoader.weaponImages;
        const weaponImg = weaponImages[playerTank.color]?.[playerTank.weapon];
        
        // Initialize sprite animation for this weapon
        const assetKey = `${playerTank.color}_${playerTank.weapon}`;
        const animation = this.initSpriteAnimation('weapons', playerId, assetKey);

        if (animation) {
            // Start weapon animation only when shooting
            animation.currentFrame = 0;
            animation.lastFrameTime = 0;
            animation.isPlaying = true;
            animation.loop = false; // Play once through all 8 frames then stop
            animation.shootingBurst = false; // Remove burst effect
        }

        // Trigger muzzle flash
        if (this.particleSystem) {
            this.particleSystem.triggerMuzzleFlash(playerId);
        }
    }

    /**
     * Trigger shooting animation using AnimationManager
     */
    triggerShootingAnimation(playerId) {
        if (window.tankAnimationManager) {
            // Tank body movement animation only
        }
    }

    /**
     * Trigger tank body animation
     */
    triggerTankBodyAnimation(playerTank, playerId) {
        if (window.tankAnimationManager) {
            window.tankAnimationManager.createTankBodyAnimation(playerId, playerTank);
        }
    }

    /**
     * Initialize sprite animation for weapons
     */
    initSpriteAnimation(type, playerId, assetKey) {
        const animationKey = `${type}_${playerId}_${assetKey}`;
        
        if (!this.weaponAnimations.has(animationKey)) {
            this.weaponAnimations.set(animationKey, {
                currentFrame: 0,
                totalFrames: 8, // Standard 8-frame weapon animations
                frameDelay: 50, // 50ms per frame
                lastFrameTime: 0,
                isPlaying: false,
                loop: false
            });
        }
        
        return this.weaponAnimations.get(animationKey);
    }

    /**
     * Get bullet color scheme based on weapon color
     */
    getBulletColorFromWeapon(weaponColor) {
        const colorSchemes = {
            'blue': {
                trail: [100, 150, 255],
                mid: [150, 200, 255],
                main: [200, 230, 255],
                outer: '#4A9EFF',
                inner: '#A0D0FF',
                glow: '#4A9EFF'
            },
            'camo': {
                trail: [50, 150, 50],
                mid: [100, 200, 100],
                main: [150, 255, 150],
                outer: '#32CD32',
                inner: '#90EE90',
                glow: '#32CD32'
            },
            'desert': {
                trail: [200, 150, 0],
                mid: [255, 200, 50],
                main: [255, 230, 100],
                outer: '#FFD700',
                inner: '#FFFF80',
                glow: '#FFD700'
            },
            'purple': {
                trail: [150, 50, 200],
                mid: [200, 100, 255],
                main: [230, 150, 255],
                outer: '#9400D3',
                inner: '#DA70D6',
                glow: '#9400D3'
            },
            'red': {
                trail: [200, 50, 50],
                mid: [255, 100, 100],
                main: [255, 150, 150],
                outer: '#DC143C',
                inner: '#FF6B8A',
                glow: '#DC143C'
            }
        };

        return colorSchemes[weaponColor] || colorSchemes['blue'];
    }

    /**
     * Advanced realistic muzzle flash system
     */
    drawMuzzleFlash(ctx, weaponImg, gunScale, intensity) {
        ctx.save();

        // Position at weapon tip (closer to match bullet spawn)
        const flashX = 0;
        const flashY = -weaponImg.height * gunScale / 2 + 8; // Moved closer to weapon body

        ctx.translate(flashX, flashY);
        ctx.globalAlpha = intensity;

        // Dynamic flash properties
        const time = Date.now() * 0.01;
        const baseSize = 4;
        const maxSize = baseSize * 1.5;

        // Multi-layer flash for depth
        for (let layer = 0; layer < 3; layer++) {
            ctx.save();

            // Random rotation for each layer
            ctx.rotate((Math.random() - 0.5) * 0.4);

            const layerSize = maxSize - (layer * 0.8);
            const layerAlpha = (1 - layer * 0.3) * intensity;

            // Create dynamic gradient
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, layerSize);

            if (layer === 0) {
                // Outer orange flame
                gradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
                gradient.addColorStop(0.3, `rgba(255, 200, 0, ${layerAlpha * 0.9})`);
                gradient.addColorStop(0.7, `rgba(255, 100, 0, ${layerAlpha * 0.6})`);
                gradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
            } else if (layer === 1) {
                // Middle bright core
                gradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
                gradient.addColorStop(0.4, `rgba(255, 255, 100, ${layerAlpha * 0.8})`);
                gradient.addColorStop(1, `rgba(255, 200, 0, 0)`);
            } else {
                // Inner white hot core
                gradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            }

            ctx.fillStyle = gradient;

            // Draw irregular flash shape
            ctx.beginPath();
            const points = 8;
            for (let pointIndex = 0; pointIndex < points; pointIndex++) {
                const angle = (pointIndex / points) * Math.PI * 2;
                const randomRadius = layerSize * (0.5 + Math.random() * 0.5);
                const xCoord = Math.cos(angle) * randomRadius;
                const yCoord = Math.sin(angle) * randomRadius;

                if (pointIndex === 0) {
                    ctx.moveTo(xCoord, yCoord);
                } else {
                    ctx.lineTo(xCoord, yCoord);
                }
            }
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        // Add flying sparks
        ctx.globalAlpha = intensity * 0.8;
        for (let sparkIndex = 0; sparkIndex < 6; sparkIndex++) {
            const sparkAngle = Math.random() * Math.PI * 2;
            const sparkDistance = 2 + Math.random() * 6;
            const sparkX = Math.cos(sparkAngle) * sparkDistance;
            const sparkY = Math.sin(sparkAngle) * sparkDistance;
            const sparkSize = 0.3 + Math.random() * 0.5;

            // Spark trail
            ctx.strokeStyle = `rgba(255, ${150 + Math.random() * 105}, 0, ${0.6 + Math.random() * 0.4})`;
            ctx.lineWidth = sparkSize;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(sparkX, sparkY);
            ctx.stroke();

            // Spark head
            ctx.fillStyle = `rgba(255, 255, ${100 + Math.random() * 155}, ${0.8 + Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Smoke wisps (very subtle)
        ctx.globalAlpha = intensity * 0.3;
        for (let smokeIndex = 0; smokeIndex < 3; smokeIndex++) {
            const smokeX = (Math.random() - 0.5) * 3;
            const smokeY = -1 - Math.random() * 2;
            const smokeSize = 1 + Math.random();

            ctx.fillStyle = `rgba(100, 100, 100, ${0.2 + Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Show cooldown cursor with bullet loading animation
     */
    showCooldownCursor() {
        console.log('Showing cooldown cursor');
        const gameCanvas = document.getElementById('gameCanvas');
        const gameMapArea = document.getElementById('gameMapArea');
        
        const cursorSvg = 'url("data:image/svg+xml;charset=utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><defs><radialGradient id=\'bulletGrad\' cx=\'50%\' cy=\'50%\'><stop offset=\'0%\' stop-color=\'%23FFD700\' stop-opacity=\'1\'/><stop offset=\'70%\' stop-color=\'%23FF6B00\' stop-opacity=\'0.8\'/><stop offset=\'100%\' stop-color=\'%23514b82\' stop-opacity=\'0.6\'/></radialGradient><filter id=\'glow\'><feGaussianBlur stdDeviation=\'2\' result=\'coloredBlur\'/><feMerge><feMergeNode in=\'coloredBlur\'/><feMergeNode in=\'SourceGraphic\'/></feMerge></filter></defs><g filter=\'url(%23glow)\'><circle cx=\'16\' cy=\'16\' r=\'12\' fill=\'none\' stroke=\'url(%23bulletGrad)\' stroke-width=\'3\' stroke-dasharray=\'8 4\' opacity=\'0.9\'><animateTransform attributeName=\'transform\' type=\'rotate\' values=\'0 16 16;360 16 16\' dur=\'0.15s\' repeatCount=\'indefinite\'/><animate attributeName=\'stroke-dasharray\' values=\'8 4;12 2;8 4\' dur=\'0.3s\' repeatCount=\'indefinite\'/></circle><circle cx=\'16\' cy=\'16\' r=\'6\' fill=\'%23FFD700\' opacity=\'0.7\'><animate attributeName=\'r\' values=\'6;8;6\' dur=\'0.4s\' repeatCount=\'indefinite\'/><animate attributeName=\'opacity\' values=\'0.7;0.3;0.7\' dur=\'0.4s\' repeatCount=\'indefinite\'/></circle><circle cx=\'16\' cy=\'16\' r=\'2\' fill=\'%23FFFFFF\' opacity=\'1\'><animate attributeName=\'opacity\' values=\'1;0.5;1\' dur=\'0.2s\' repeatCount=\'indefinite\'/></circle></g></svg>") 16 16, wait';
        
        if (gameCanvas && gameCanvas.style) {
            gameCanvas.style.cursor = cursorSvg;
            console.log('Cursor changed to enhanced bullet loading animation');
        }
        
        if (gameMapArea && gameMapArea.style) {
            gameMapArea.style.cursor = cursorSvg;
        }
        
        this.cooldownActive = true;
    }

    /**
     * Hide cooldown cursor
     */
    hideCooldownCursor() {
        console.log('Hiding cooldown cursor');
        const gameCanvas = document.getElementById('gameCanvas');
        const gameMapArea = document.getElementById('gameMapArea');
        
        if (gameCanvas && gameCanvas.style) {
            gameCanvas.style.cursor = 'crosshair';
            console.log('Cursor changed back to crosshair');
        }
        
        if (gameMapArea && gameMapArea.style) {
            gameMapArea.style.cursor = 'crosshair';
        }
        
        this.cooldownActive = false;
    }

    /**
     * Start cooldown timer
     */
    startCooldownTimer(cooldownDuration) {
        // Show cooldown cursor with bullet loading animation immediately after shooting
        this.showCooldownCursor();
        
        // Hide cooldown cursor after cooldown period
        setTimeout(() => {
            this.hideCooldownCursor();
        }, cooldownDuration);
    }

    /**
     * Get current weapon images based on player selection
     */
    getCurrentWeaponImages(playerTank = this.gameState.selectedTank, forLobby = false) {
        return this.imageLoader.getCurrentTankImages(playerTank, forLobby);
    }

    /**
     * Get gun recoil animation state
     */
    getGunRecoilAnimation() {
        return this.gunRecoilAnimation;
    }

    /**
     * Get other player gun recoils
     */
    getOtherPlayerGunRecoils() {
        return this.otherPlayerGunRecoils;
    }

    /**
     * Set gun recoil for other player
     */
    setOtherPlayerGunRecoil(playerId, recoilData) {
        this.otherPlayerGunRecoils[playerId] = recoilData;
    }

    /**
     * Get player recoil state
     */
    getPlayerRecoil() {
        return this.playerRecoil;
    }

    /**
     * Check if weapon can shoot
     */
    canShoot(currentTime, activePowerUps = []) {
        const hasRapidFire = activePowerUps.some(powerUp => powerUp.effect === 'rapidFire');
        const cooldown = hasRapidFire ? this.shotCooldown / 2 : this.shotCooldown;
        return (currentTime - this.lastShotTime) >= cooldown;
    }

    /**
     * Get weapon stats for tank configuration (comprehensive tank stats)
     */
    getTankStats(weapon, color = 'blue') {
        // Weapon index (0-7) for progression within a color
        const weaponOrder = ['turret_01_mk1', 'turret_01_mk2', 'turret_01_mk3', 'turret_01_mk4', 
                             'turret_02_mk1', 'turret_02_mk2', 'turret_02_mk3', 'turret_02_mk4'];
        const weaponIndex = weaponOrder.indexOf(weapon);
        const weaponIdx = weaponIndex >= 0 ? weaponIndex : 0;
        
        // Color index (0-4)
        const colorOrder = ['blue', 'camo', 'desert', 'purple', 'red'];
        const colorIndex = colorOrder.indexOf(color);
        const colorIdx = colorIndex >= 0 ? colorIndex : 0;
        
        // TRULY CONTINUOUS: globalIndex = colorIdx * 8 weapons + weaponIdx
        // This makes camo mk1 start right after blue mk8
        const globalIndex = colorIdx * 8 + weaponIdx;
        
        // Base stats for blue mk1
        const baseHealth = 100;
        const baseDamage = 10;
        const baseFireRate = 1.0;
        
        // Each step adds these increments (40 total items: 5 colors x 8 weapons)
        const healthPerStep = 5;    // 100 to 295 over 40 items
        const damagePerStep = 2;    // 10 to 88 over 40 items
        const fireRatePerStep = 0.05; // 1.0 to 2.95 over 40 items
        
        return {
            health: baseHealth + globalIndex * healthPerStep,
            damage: baseDamage + globalIndex * damagePerStep,
            fireRate: Math.round((baseFireRate + globalIndex * fireRatePerStep) * 10) / 10
        };
    }

    /**
     * Get weapon stats for tank configuration (legacy method name)
     */
    getWeaponStats(weapon, color = 'blue') {
        return this.getTankStats(weapon, color);
    }

    /**
     * Check if shop combo is owned
     */
    isShopComboOwned(color, weapon) {
        const ownedItems = this.gameState.ownedItems || { colors: [], weapons: [] };
        const colorOwned = ownedItems.colors?.includes(color) || color === 'blue';
        const weaponOwned = ownedItems.weapons?.includes(weapon) || weapon === 'turret_01_mk1';
        return colorOwned && weaponOwned;
    }

    /**
     * Check if shop combo is equipped
     */
    isShopComboEquipped(color, weapon) {
        const selectedTank = this.gameState.selectedTank || {};
        return selectedTank.color === color && selectedTank.weapon === weapon;
    }

    /**
     * Render shop tank preview
     */
    renderShopTankPreview(canvas, color, weapon) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Create unique key for this canvas
        const canvasKey = `${color}_${weapon}_${canvas.id || Math.random()}`;
        
        // Cancel any existing animation for this canvas
        if (this.shopTankAnimations && this.shopTankAnimations.has(canvasKey)) {
            cancelAnimationFrame(this.shopTankAnimations.get(canvasKey));
            this.shopTankAnimations.delete(canvasKey);
        }
        
        // Initialize shop animations map if not exists
        if (!this.shopTankAnimations) {
            this.shopTankAnimations = new Map();
        }
        
        const drawTank = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Get images from ImageLoader
            const shopTankImageCache = this.imageLoader.shopTankImageCache || {};
            const body = shopTankImageCache[color]?.body || shopTankImageCache[color]?.bodyPng;
            const weap = shopTankImageCache[color]?.weapons[weapon] || shopTankImageCache[color]?.weaponsPng[weapon];
            
            if (!body || !weap) {
                // Images not loaded yet, try again
                const frameId = requestAnimationFrame(drawTank);
                this.shopTankAnimations.set(canvasKey, frameId);
                return;
            }
            
            ctx.save();
            ctx.translate(centerX, centerY);
            
            // Calculate scale to fit canvas (like lobby)
            const size = Math.min(canvas.width, canvas.height) * 0.8;
            const bodyScale = size / Math.max(body.width || 100, body.height || 100);
            const weapScale = size / Math.max(weap.width || 100, weap.height || 100);
            
            // Draw tank body
            ctx.drawImage(
                body,
                -body.width * bodyScale / 2,
                -body.height * bodyScale / 2,
                body.width * bodyScale,
                body.height * bodyScale
            );
            
            // Draw weapon on top
            ctx.drawImage(
                weap,
                -weap.width * weapScale / 2,
                -weap.height * weapScale / 2,
                weap.width * weapScale,
                weap.height * weapScale
            );
            
            ctx.restore();
            
            // STOP HERE - Don't continue animation loop!
            // Images are loaded and drawn, no need to keep animating
            this.shopTankAnimations.delete(canvasKey);
        };
        
        // Start drawing (will stop after first successful draw)
        drawTank();
    }

    /**
     * Stop all shop tank animations
     */
    stopShopTankAnimations() {
        if (this.shopTankAnimations) {
            this.shopTankAnimations.forEach((frameId) => {
                cancelAnimationFrame(frameId);
            });
            this.shopTankAnimations.clear();
        }
    }

    /**
     * Purchase or equip shop combo
     */
    async purchaseOrEquipShopCombo(color, weapon, price) {
        const isOwned = this.isShopComboOwned(color, weapon);
        
        if (!isOwned && price > 0) {
            const currentFortz = this.gameState.fortzCurrency || 0;
            if (currentFortz < price) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Not enough Fortz! Need ${price}`, '#ff5050', 24);
                }
                return;
            }
            
            this.gameState.fortzCurrency -= price;
            
            if (!this.gameState.ownedItems) {
                this.gameState.ownedItems = { colors: ['blue'], bodies: ['body_halftrack'], weapons: ['turret_01_mk1'] };
            }
            if (!this.gameState.ownedItems.colors.includes(color)) {
                this.gameState.ownedItems.colors.push(color);
            }
            if (!this.gameState.ownedItems.weapons.includes(weapon)) {
                this.gameState.ownedItems.weapons.push(weapon);
            }
            
            // Update display
            if (typeof window.updateFortzDisplay === 'function') {
                window.updateFortzDisplay();
            }
        }
        
        // Equip the combo
        this.gameState.selectedTank = { ...this.gameState.selectedTank, color, weapon };
        
        // Save to localStorage
        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }
        
        // Re-render tank
        if (typeof window.renderTankOnCanvas === 'function') {
            window.renderTankOnCanvas('playerTankCanvas', this.gameState.selectedTank, { 
              isLobby: true, 
              scale: 1.8 
            });
        }
    }

    /**
     * Render locker tank weapon only
     */
    renderLockerTankWeaponOnly(ctx, centerX, centerY, tank) {
        const { color, weapon } = tank;
        const lobbyWeaponImages = this.imageLoader.lobbyWeaponImages || {};
        const weaponImg = lobbyWeaponImages[color]?.[weapon];
        
        if (!weaponImg || !weaponImg.complete) return;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.translate(centerX, centerY);
        
        const rotation = (Date.now() * 0.00005) % (Math.PI * 2);
        ctx.rotate(rotation);
        
        const size = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.7;
        const weaponScale = size / Math.max(weaponImg.width, weaponImg.height);
        ctx.drawImage(weaponImg, -weaponImg.width * weaponScale / 2, -weaponImg.height * weaponScale / 2, weaponImg.width * weaponScale, weaponImg.height * weaponScale);
        
        ctx.restore();
    }

    /**
     * Clean up weapon system resources
     */
    cleanup() {
        this.weaponAnimations.clear();
        this.otherPlayerGunRecoils = {};
        this.hideCooldownCursor();
        this.stopShopTankAnimations();
    }
}