// Game renderer
const Renderer = {
    canvas: null,
    ctx: null,
    groundTextures: [],
    groundTileSize: 500,
    texturesLoaded: false,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) return false;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loadGroundTextures();
        
        return true;
    },

    loadGroundTextures() {
        const groundFiles = [
            'water.png', 'WaterBlue.png', 'BlueGrass.png', 'BrownCobblestone.png', 'BrownGrass.png',
            'Goldcobblestone.png', 'GoldenCobblestone.png', 'GrayGround.png',
            'GreenGrass.png', 'Grey Cobblestone.png', 'LightBrownCobblestone.png',
            'LightGreyCobblestone.png', 'LightGreyGround.png', 'LightSand.png',
            'PurpleCobblestone.png', 'RedCobblestone.png', 'Sand.png',
            'WoodenPlanks.png', 'WoodenTile.png', 'YellowGrass.png'
        ];
        let loadedCount = 0;

        groundFiles.forEach(filename => {
            const img = new Image();
            img.src = `/assets/tank/Grounds/${filename}`;
            
            img.onload = () => {
                loadedCount++;
                if (loadedCount === groundFiles.length) {
                    this.texturesLoaded = true;
                }
            };
            
            img.onerror = () => {
                console.warn(`Failed to load ground texture: ${filename}`);
                loadedCount++;
                if (loadedCount === groundFiles.length) {
                    this.texturesLoaded = true;
                }
            };
            
            this.groundTextures.push(img);
        });
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    clear() {
        // Fill with simple dark background
        this.ctx.fillStyle = '#2d4a3a'; // Dark green background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // Removed complex terrain rendering - using simple ground instead

    drawSimpleGround() {
        // Simple grass background
        this.ctx.fillStyle = '#4a7c59'; // Dark green grass
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add some texture with a subtle pattern
        this.ctx.fillStyle = 'rgba(60, 120, 80, 0.3)';
        const camera = GameState.camera || { x: 0, y: 0 };
        
        for (let x = -camera.x % 40; x < this.canvas.width; x += 40) {
            for (let y = -camera.y % 40; y < this.canvas.height; y += 40) {
                if ((Math.floor(x / 40) + Math.floor(y / 40)) % 2 === 0) {
                    this.ctx.fillRect(x, y, 40, 40);
                }
            }
        }
    },

    renderDOMMap() {
        // Render the current DOM map if available
        if (window.DOMMapRenderer && window.DOMMapRenderer.currentMap) {
            const camera = GameState.camera || { x: 0, y: 0 };
            
            // Simple map rendering - just draw ground tiles
            this.ctx.fillStyle = '#4a7c59'; // Grass background
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // If the map has ground tiles, render them
            const map = window.DOMMapRenderer.currentMap;
            if (map.groundTiles && Array.isArray(map.groundTiles)) {
                map.groundTiles.forEach(tile => {
                    if (tile && tile.x !== undefined && tile.y !== undefined) {
                        const screenX = tile.x - camera.x + this.canvas.width / 2;
                        const screenY = tile.y - camera.y + this.canvas.height / 2;
                        
                        // Draw tile (simple colored rectangle for now)
                        this.ctx.fillStyle = tile.color || '#6b8e23';
                        this.ctx.fillRect(screenX - 30, screenY - 15, 60, 30);
                    }
                });
            }
        } else {
            this.drawSimpleGround();
        }
    },

    render() {
        this.clear();
        
        // Render call (debug logging removed)
        
        // Render the created map if available
        if (window.MapRenderer && window.MapRenderer.isLoaded) {
            window.MapRenderer.render(this.ctx, GameState.camera);
        } else if (window.DOMMapRenderer && window.DOMMapRenderer.currentMap) {
            // Render DOM map if available
            this.renderDOMMap();
        } else {
            // Fallback to simple ground
            this.drawSimpleGround();
        }
        
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.translate(-GameState.camera.x, -GameState.camera.y);

        // Update particles
        if (window.ParticleSystem) {
            window.ParticleSystem.update(16);
        }

        // Draw powerups first
        if (window.gameState && window.gameState.powerUps) {
            window.gameState.powerUps.forEach(pu => this.drawPowerUp(pu));
        }

        // Draw players
        Object.values(GameState.players).forEach(player => {
            this.drawPlayer(player);
        });

        // Draw bullets
        GameState.bullets.forEach(bullet => {
            this.drawBullet(bullet);
        });

        // Draw particles
        if (window.ParticleSystem) {
            window.ParticleSystem.render(this.ctx, GameState.camera, this.canvas);
        }

        // Draw damage numbers
        if (window.damageNumbers) {
            window.damageNumbers.forEach((dn, i) => {
                dn.y -= 2;
                dn.life -= 0.02;
                
                if (dn.life > 0) {
                    this.ctx.fillStyle = dn.color;
                    this.ctx.globalAlpha = dn.life;
                    this.ctx.font = `bold ${16 + (1 - dn.life) * 8}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(dn.text, dn.x, dn.y);
                    this.ctx.globalAlpha = 1;
                } else {
                    window.damageNumbers.splice(i, 1);
                }
            });
        }

        this.ctx.restore();

        // Draw UI
        this.drawUI();
    },

    drawPowerUp(pu) {
        this.ctx.save();
        this.ctx.translate(pu.x, pu.y);
        
        const time = Date.now() * 0.003;
        this.ctx.scale(1 + Math.sin(time) * 0.1, 1 + Math.sin(time) * 0.1);
        
        const colors = {
            health: '#00ff00',
            shield: '#00ffff',
            ammo: '#ffff00',
            speed: '#ff00ff',
            damage: '#ff6600'
        };
        
        this.ctx.fillStyle = colors[pu.type] || '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    },

    drawPlayer(player) {
        // Initialize animation frame if not exists
        if (!player.animFrame) player.animFrame = 0;
        if (!player.lastAnimUpdate) player.lastAnimUpdate = Date.now();
        
        // Update track animation when moving
        const speed = Math.sqrt((player.vx || 0) ** 2 + (player.vy || 0) ** 2);
        if (speed > 0.1) {
            const now = Date.now();
            if (now - player.lastAnimUpdate > 50) {
                player.animFrame = (player.animFrame + 1) % 4;
                player.lastAnimUpdate = now;
            }
        }

        // Safety check for player position
        const playerX = isFinite(player.x) ? player.x : 0;
        const playerY = isFinite(player.y) ? player.y : 0;

        this.ctx.save();
        this.ctx.translate(playerX, playerY);

        // Glow effect for player
        if (player.id === GameState.playerId) {
            this.ctx.shadowColor = '#00f7ff';
            this.ctx.shadowBlur = 20;
        }

        // Draw actual tank images if available
        if (player.tankConfig && window.imageLoader) {
            this.drawTankImages(player);
        } else {
            // Fallback to simple shapes
            this.drawSimpleTank(player);
        }

        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
        
        // Draw name tag (with safety checks)
        const namePlayerX = isFinite(player.x) ? player.x : 0;
        const namePlayerY = isFinite(player.y) ? player.y : 0;
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText(player.name || 'Tank', namePlayerX, namePlayerY - 70);
        this.ctx.shadowBlur = 0;

        // Draw health bar (with safety checks)
        const barWidth = 90;
        const barHeight = 10;
        const healthPercent = Math.max(0, Math.min(1, (player.health || 100) / 100));
        
        // Safety check for player position
        const healthPlayerX = isFinite(player.x) ? player.x : 0;
        const healthPlayerY = isFinite(player.y) ? player.y : 0;
        
        // Background
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(healthPlayerX - barWidth/2, healthPlayerY - 55, barWidth, barHeight);
        
        // Health gradient (with safety checks)
        const gradientStartX = healthPlayerX - barWidth/2;
        const gradientEndX = healthPlayerX + barWidth/2;
        
        if (isFinite(gradientStartX) && isFinite(gradientEndX)) {
            const healthGradient = this.ctx.createLinearGradient(gradientStartX, 0, gradientEndX, 0);
            if (healthPercent > 0.6) {
                healthGradient.addColorStop(0, '#00ff00');
                healthGradient.addColorStop(1, '#44ff44');
            } else if (healthPercent > 0.3) {
                healthGradient.addColorStop(0, '#ffaa00');
                healthGradient.addColorStop(1, '#ffdd44');
            } else {
                healthGradient.addColorStop(0, '#ff3333');
                healthGradient.addColorStop(1, '#ff6666');
            }
            
            this.ctx.fillStyle = healthGradient;
            this.ctx.fillRect(healthPlayerX - barWidth/2, healthPlayerY - 55, barWidth * healthPercent, barHeight);
        }
        
        // Border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(healthPlayerX - barWidth/2, healthPlayerY - 55, barWidth, barHeight);

        // Draw level indicator (with safety checks)
        if (player.level) {
            const levelPlayerX = isFinite(player.x) ? player.x : 0;
            const levelPlayerY = isFinite(player.y) ? player.y : 0;
            
            this.ctx.fillStyle = '#00f7ff';
            this.ctx.font = 'bold 11px Arial';
            this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
            this.ctx.shadowBlur = 3;
            this.ctx.fillText(`LvL ${player.level}`, levelPlayerX, levelPlayerY - 40);
            this.ctx.shadowBlur = 0;
        }
    },

    drawTankImages(player) {
        const { color, body, weapon } = player.tankConfig;
        const scale = 0.8; // Scale for game rendering
        
        // Get tank images from imageLoader
        const bodyImg = window.imageLoader.tankImages[color] && window.imageLoader.tankImages[color][body];
        const weaponImg = window.imageLoader.weaponImages[color] && window.imageLoader.weaponImages[color][weapon];

        // Draw tank body (rotates with movement)
        if (bodyImg) {
            this.ctx.save();
            this.ctx.rotate(player.angle || 0);
            
            const bodyWidth = bodyImg.width * scale;
            const bodyHeight = bodyImg.height * scale;
            this.ctx.drawImage(bodyImg, -bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
            this.ctx.restore();
        }

        // Draw weapon/turret (rotates to face mouse)
        if (weaponImg) {
            this.ctx.save();
            // Use turret angle if available, otherwise use mouse angle or player angle
            const turretAngle = player.turretAngle !== undefined 
                ? player.turretAngle 
                : (window.gameState && window.gameState.mouse.angle !== undefined) 
                    ? window.gameState.mouse.angle 
                    : (player.angle || 0);
            this.ctx.rotate(turretAngle);
            
            const weaponWidth = weaponImg.width * scale;
            const weaponHeight = weaponImg.height * scale;
            this.ctx.drawImage(weaponImg, -weaponWidth / 2, -weaponHeight / 2, weaponWidth, weaponHeight);
            this.ctx.restore();
        }

        // If images aren't loaded, fall back to simple tank
        if (!bodyImg || !weaponImg) {
            this.drawSimpleTank(player);
        }
    },

    drawSimpleTank(player) {
        this.ctx.rotate(player.angle || 0);

        // Draw tank body with gradient
        const bodyGradient = this.ctx.createLinearGradient(-45, -30, 45, 30);
        const playerColor = player.id === GameState.playerId ? '#00f7ff' : '#ff6b6b';
        bodyGradient.addColorStop(0, playerColor);
        bodyGradient.addColorStop(1, player.id === GameState.playerId ? '#0088ff' : '#ff3333');
        
        this.ctx.fillStyle = bodyGradient;
        this.ctx.fillRect(-45, -30, 90, 60);
        
        // Animated tank tracks
        this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.lineWidth = 2;
        
        // Left track
        this.ctx.fillRect(-45, -30, 15, 60);
        this.ctx.strokeRect(-45, -30, 15, 60);
        
        // Right track
        this.ctx.fillRect(30, -30, 15, 60);
        this.ctx.strokeRect(30, -30, 15, 60);
        
        // Track tread marks (animated)
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 2;
        const trackOffset = (player.animFrame * 15) % 60;
        
        for (let i = -30 + trackOffset; i < 30; i += 15) {
            // Left track treads
            this.ctx.beginPath();
            this.ctx.moveTo(-42, i);
            this.ctx.lineTo(-33, i);
            this.ctx.stroke();
            
            // Right track treads
            this.ctx.beginPath();
            this.ctx.moveTo(33, i);
            this.ctx.lineTo(42, i);
            this.ctx.stroke();
        }

        // Draw turret with rotation
        const turretColor = player.id === GameState.playerId ? '#00d4dd' : '#ff5252';
        const turretGradient = this.ctx.createLinearGradient(-15, -50, 15, 20);
        turretGradient.addColorStop(0, turretColor);
        turretGradient.addColorStop(1, player.id === GameState.playerId ? '#0066aa' : '#cc2222');
        
        this.ctx.fillStyle = turretGradient;
        
        // Turret base
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Turret barrel
        this.ctx.fillRect(-8, -55, 16, 60);
        
        // Barrel highlight
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        this.ctx.fillRect(-6, -55, 12, 8);
        
        // Barrel tip
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(-6, -55, 12, 3);
    },

    drawBullet(bullet) {
        this.ctx.save();
        
        // Trail effect
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(bullet.x - bullet.vx, bullet.y - bullet.vy);
        this.ctx.lineTo(bullet.x, bullet.y);
        this.ctx.stroke();
        
        // Bullet glow
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(bullet.x, bullet.y, CONFIG.BULLET.SIZE + 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Core
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.arc(bullet.x, bullet.y, CONFIG.BULLET.SIZE - 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    },

    drawUI() {
        const player = GameState.getPlayer();
        if (!player) return;

        const padding = 20;
        const lineHeight = 25;
        
        // Health panel background
        this.ctx.fillStyle = 'rgba(0, 20, 40, 0.7)';
        this.ctx.fillRect(padding - 5, padding - 5, 250, lineHeight * 4 + 10);
        this.ctx.strokeStyle = '#00f7ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(padding - 5, padding - 5, 250, lineHeight * 4 + 10);

        // Draw health
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`❤️ Health: ${Math.ceil(player.health || 100)}`, padding, padding + lineHeight);
        
        // Draw score
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText(`⭐ Score: ${player.score || 0}`, padding, padding + lineHeight * 2);
        
        // Draw kills
        this.ctx.fillStyle = '#ff6666';
        this.ctx.fillText(`💥 Kills: ${player.kills || 0}`, padding, padding + lineHeight * 3);
        
        // Draw ammo
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillText(`🔫 Ammo: ${player.ammo || '∞'}`, padding, padding + lineHeight * 4);

        // Minimap in corner
        this.drawMinimap();
        
        // FPS counter
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`FPS: ${Math.round(1000/16)}`, this.canvas.width - 20, 20);
    },

    drawMinimap() {
        const minimapX = this.canvas.width - 170;
        const minimapY = 20;
        const minimapSize = 150;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Border
        this.ctx.strokeStyle = '#00f7ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Scale
        const scale = minimapSize / 7500;
        
        // Draw all players on minimap
        Object.values(GameState.players).forEach(p => {
            const px = minimapX + p.x * scale;
            const py = minimapY + p.y * scale;
            
            this.ctx.fillStyle = p.id === GameState.playerId ? '#00ff00' : '#ff3333';
            this.ctx.beginPath();
            this.ctx.arc(px, py, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
};

window.Renderer = Renderer;
