/**
 * ParticleSystem - Manages all particle effects including explosions, smoke, trails, and weather
 * Consolidates particle rendering and updates from the main game loop
 */

import { PHYSICS_CONFIG } from '../core/Config.js';

export default class ParticleSystem {
    constructor(gameState, canvas, ctx) {
        this.gameState = gameState;
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Particle arrays
        this.bulletTrails = [];
        this.explosionParticles = [];
        this.impactParticles = [];
        this.exhaustParticles = [];
        this.muzzleFlashes = {};
        this.screenShake = { intensity: 0, duration: 0, startTime: 0 };
        
        // Weather system
        this.weatherSystem = {
            active: false,
            type: 'none', // 'rain', 'snow', 'fog', 'storm'
            intensity: 0,
            particles: [],
            windX: 0,
            windY: 0
        };
        
        // Hit markers for visual feedback
        this.hitMarkers = [];
    }

    /**
     * Update all particle systems
     */
    update() {
        this.updateBulletTrails();
        this.updateExplosions();
        this.updateImpactParticles();
        this.updateExhaustSmoke();
        this.updateMuzzleFlashes();
        this.updateWeatherSystem();
        this.updateHitMarkers();
    }

    /**
     * Render all particle effects
     */
    render() {
        this.renderBulletTrails();
        this.renderExplosions();
        this.renderImpactParticles();
        this.renderExhaustSmoke();
        this.renderMuzzleFlashes();
        this.renderWeatherEffects();
        this.renderHitMarkers();
        this.applyScreenShake();
    }

    // ===== BULLET TRAILS =====
    
    /**
     * Create a bullet trail particle
     */
    createBulletTrail(bullet) {
        this.bulletTrails.push({
            x: bullet.x,
            y: bullet.y,
            vx: bullet.vx * 0.5,
            vy: bullet.vy * 0.5,
            color: bullet.color || 'blue',
            life: 1,
            decay: 0.05,
            size: 2 + Math.random()
        });
    }

    /**
     * Update bullet trail particles
     */
    updateBulletTrails() {
        this.bulletTrails = this.bulletTrails.filter(trail => {
            trail.x += trail.vx * 0.3;
            trail.y += trail.vy * 0.3;
            trail.life -= trail.decay;
            return trail.life > 0;
        });
    }

    /**
     * Render bullet trails
     */
    renderBulletTrails() {
        this.ctx.save();
        this.bulletTrails.forEach(trail => {
            const bulletColor = this.getBulletColorFromWeapon(trail.color);
            this.ctx.globalAlpha = trail.life * 0.6;
            this.ctx.fillStyle = bulletColor.outer;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = bulletColor.glow;
            this.ctx.beginPath();
            this.ctx.arc(trail.x, trail.y, trail.size * trail.life, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }

    // ===== EXPLOSIONS =====
    
    /**
     * Create explosion particles
     */
    createExplosion(x, y, size = 1) {
        const particleCount = Math.floor(30 * size);
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 3 + Math.random() * 4 * size;
            this.explosionParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: (2 + Math.random() * 3) * size,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                color: i % 3 === 0 ? '#FF6B00' : i % 3 === 1 ? '#FFD700' : '#FF0000'
            });
        }
    }

    /**
     * Update explosion particles
     */
    updateExplosions() {
        this.explosionParticles = this.explosionParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.vy += 0.15; // Gravity
            p.life -= p.decay;
            return p.life > 0;
        });
    }

    /**
     * Render explosion particles
     */
    renderExplosions() {
        this.ctx.save();
        this.explosionParticles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    // ===== BULLET IMPACTS =====
    
    /**
     * Create bullet impact particles
     */
    createBulletImpact(x, y, impactType, bulletColor) {
        const particleCount = impactType === 'player' ? 15 : 10;

        // Use weapon color for impact particles if provided, otherwise default colors
        let color = '#FFD700';
        if (bulletColor) {
            const colorScheme = this.getBulletColorFromWeapon(bulletColor);
            color = colorScheme.outer;
        } else if (impactType === 'player') {
            color = '#FF4444';
        }

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5);
            const speed = 3 + Math.random() * 4;

            this.impactParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 2 + Math.random() * 2,
                life: 1,
                decay: 0.03 + Math.random() * 0.02
            });
        }

        // Add hit marker for player hits
        if (impactType === 'player') {
            this.hitMarkers.push({
                startTime: Date.now(),
                duration: 300
            });
        }
    }

    /**
     * Update impact particles
     */
    updateImpactParticles() {
        this.impactParticles = this.impactParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // Gravity
            particle.life -= particle.decay;
            return particle.life > 0;
        });
    }

    /**
     * Render impact particles
     */
    renderImpactParticles() {
        this.ctx.save();
        this.impactParticles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 5;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    // ===== EXHAUST SMOKE =====
    
    /**
     * Create exhaust smoke particles
     */
    createExhaustSmoke(x, y, tankRotation, velocity, isSprinting = false) {
        // Only create smoke when moving
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (speed < 1) return;

        // Calculate exhaust position at back of tank based on tank body rotation
        const exhaustOffset = 35; // Distance from tank center to back
        const exhaustX = x - Math.cos(tankRotation) * exhaustOffset;
        const exhaustY = y - Math.sin(tankRotation) * exhaustOffset;

        // Create smoke particles with speed-based density
        const baseCount = Math.floor(speed / 2);
        const particleCount = baseCount + (isSprinting ? 4 : 1);

        for (let i = 0; i < particleCount; i++) {
            const spread = 0.5;
            // Particles shoot out the back of the tank (opposite direction of tank rotation)
            const particleAngle = tankRotation + Math.PI + (Math.random() - 0.5) * spread;
            const particleSpeed = (isSprinting ? 0.8 : 0.4) + Math.random() * 0.3; // Much slower particles = shorter trail

            this.exhaustParticles.push({
                x: exhaustX + (Math.random() - 0.5) * 15,
                y: exhaustY + (Math.random() - 0.5) * 15,
                vx: Math.cos(particleAngle) * particleSpeed - velocity.x * 0.25,
                vy: Math.sin(particleAngle) * particleSpeed - velocity.y * 0.25,
                size: (isSprinting ? 1.5 : 1) + Math.random() * 1.5,
                life: 1,
                decay: 0.03 + Math.random() * 0.02, // Faster decay = shorter trail
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.06,
                isSprint: isSprinting,
                speedFactor: speed / PHYSICS_CONFIG.TANK_MAX_SPEED // Track speed for fade effects
            });
        }
    }

    /**
     * Update exhaust smoke particles
     */
    updateExhaustSmoke() {
        this.exhaustParticles = this.exhaustParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.96; // Slow down
            particle.vy *= 0.96;
            particle.life -= particle.decay;
            particle.rotation += particle.rotationSpeed;
            particle.size += particle.isSprint ? 0.25 : 0.15; // Expand smoke faster when sprinting
            return particle.life > 0;
        });
    }

    /**
     * Render exhaust smoke particles
     */
    renderExhaustSmoke() {
        this.ctx.save();

        this.exhaustParticles.forEach(particle => {
            const alpha = particle.life * (particle.isSprint ? 0.5 : 0.4);

            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);

            // Smoke gradient - darker and more visible for sprint
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
            if (particle.isSprint) {
                gradient.addColorStop(0, `rgba(90, 90, 100, ${alpha})`);
                gradient.addColorStop(0.5, `rgba(70, 70, 80, ${alpha * 0.7})`);
                gradient.addColorStop(1, `rgba(50, 50, 60, 0)`);
            } else {
                gradient.addColorStop(0, `rgba(80, 80, 90, ${alpha})`);
                gradient.addColorStop(0.5, `rgba(60, 60, 70, ${alpha * 0.6})`);
                gradient.addColorStop(1, `rgba(40, 40, 50, 0)`);
            }

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });

        this.ctx.restore();
    }

    // ===== MUZZLE FLASHES =====
    
    /**
     * Trigger muzzle flash for a player
     */
    triggerMuzzleFlash(playerId) {
        this.muzzleFlashes[playerId] = {
            intensity: 1.0,
            timer: 0,
            duration: 150, // Shorter, more realistic flash duration
            startTime: Date.now(),
            flashType: Math.floor(Math.random() * 3) // Random flash variation
        };

        // Add subtle screen shake for own player's shots
        if (playerId === this.gameState.playerId) {
            this.triggerScreenShake(1.5, 80); // Reduced shake for new animation
        }
    }

    /**
     * Update muzzle flashes
     */
    updateMuzzleFlashes() {
        const currentTime = Date.now();
        Object.keys(this.muzzleFlashes).forEach(playerId => {
            const flash = this.muzzleFlashes[playerId];
            const elapsed = currentTime - flash.startTime;
            
            if (elapsed >= flash.duration) {
                delete this.muzzleFlashes[playerId];
            } else {
                flash.intensity = 1.0 - (elapsed / flash.duration);
            }
        });
    }

    /**
     * Render muzzle flashes
     */
    renderMuzzleFlashes() {
        // Muzzle flash rendering is typically handled by the weapon rendering system
        // This method is kept for consistency and future enhancements
    }

    // ===== SCREEN SHAKE =====
    
    /**
     * Trigger screen shake effect
     */
    triggerScreenShake(intensity, duration) {
        this.screenShake = {
            intensity: intensity,
            duration: duration,
            startTime: Date.now()
        };
    }

    /**
     * Apply screen shake to the canvas
     */
    applyScreenShake() {
        const currentTime = Date.now();
        const elapsed = currentTime - this.screenShake.startTime;
        
        if (elapsed < this.screenShake.duration) {
            const progress = elapsed / this.screenShake.duration;
            const currentIntensity = this.screenShake.intensity * (1 - progress);
            
            const shakeX = (Math.random() - 0.5) * currentIntensity * 2;
            const shakeY = (Math.random() - 0.5) * currentIntensity * 2;
            
            this.ctx.translate(shakeX, shakeY);
        }
    }

    // ===== WEATHER SYSTEM =====
    
    /**
     * Create weather particle
     */
    createWeatherParticle(type) {
        const particle = {
            x: Math.random() * (this.canvas.width + 200) - 100,
            y: -20,
            vx: this.weatherSystem.windX,
            vy: 2 + Math.random() * 3,
            size: type === 'snow' ? 2 + Math.random() * 3 : 1 + Math.random() * 2,
            life: 1,
            type: type
        };

        if (type === 'rain') {
            particle.vy = 8 + Math.random() * 4;
            particle.size = 1 + Math.random();
        }

        this.weatherSystem.particles.push(particle);
    }

    /**
     * Update weather system
     */
    updateWeatherSystem() {
        if (!this.weatherSystem.active) return;

        // Create new particles
        const particleCount = this.weatherSystem.intensity * 3;
        for (let i = 0; i < particleCount; i++) {
            if (this.weatherSystem.particles.length < 500) {
                this.createWeatherParticle(this.weatherSystem.type);
            }
        }

        // Update particles
        this.weatherSystem.particles = this.weatherSystem.particles.filter(p => {
            p.x += p.vx + this.gameState.camera.x * 0.01;
            p.y += p.vy;

            if (p.y > this.canvas.height + 20 || p.x < -100 || p.x > this.canvas.width + 100) {
                return false;
            }

            return true;
        });
    }

    /**
     * Render weather effects
     */
    renderWeatherEffects() {
        if (!this.weatherSystem.active || this.weatherSystem.particles.length === 0) return;

        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Screen coordinates

        this.weatherSystem.particles.forEach(p => {
            this.ctx.globalAlpha = 0.6;

            if (p.type === 'rain') {
                this.ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
                this.ctx.lineWidth = p.size;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2);
                this.ctx.stroke();
            } else if (p.type === 'snow') {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        this.ctx.restore();
    }

    /**
     * Toggle weather system
     */
    toggleWeather(type = 'rain') {
        this.weatherSystem.active = !this.weatherSystem.active;
        this.weatherSystem.type = type;
        this.weatherSystem.intensity = this.weatherSystem.active ? 1 : 0;
        this.weatherSystem.windX = (Math.random() - 0.5) * 2;

        if (!this.weatherSystem.active) {
            this.weatherSystem.particles = [];
        }

        return this.weatherSystem.active;
    }

    // ===== HIT MARKERS =====
    
    /**
     * Update hit markers
     */
    updateHitMarkers() {
        const currentTime = Date.now();
        this.hitMarkers = this.hitMarkers.filter(marker => {
            return (currentTime - marker.startTime) < marker.duration;
        });
    }

    /**
     * Render hit markers
     */
    renderHitMarkers() {
        // Hit marker rendering is typically handled by the UI system
        // This method is kept for consistency and future enhancements
    }

    // ===== UTILITY METHODS =====
    
    /**
     * Get bullet color scheme from weapon type
     */
    getBulletColorFromWeapon(weaponColor) {
        const colorSchemes = {
            'blue': { outer: '#4A90E2', glow: '#87CEEB' },
            'green': { outer: '#50C878', glow: '#90EE90' },
            'yellow': { outer: '#FFD700', glow: '#FFFF99' },
            'red': { outer: '#FF6B6B', glow: '#FFB6C1' },
            'purple': { outer: '#9B59B6', glow: '#DDA0DD' }
        };
        
        return colorSchemes[weaponColor] || colorSchemes['blue'];
    }

    /**
     * Clear all particles (useful for cleanup or scene transitions)
     */
    clearAllParticles() {
        this.bulletTrails = [];
        this.explosionParticles = [];
        this.impactParticles = [];
        this.exhaustParticles = [];
        this.muzzleFlashes = {};
        this.weatherSystem.particles = [];
        this.hitMarkers = [];
        this.screenShake = { intensity: 0, duration: 0, startTime: 0 };
    }

    /**
     * Get particle system statistics (for debugging)
     */
    getStats() {
        return {
            bulletTrails: this.bulletTrails.length,
            explosionParticles: this.explosionParticles.length,
            impactParticles: this.impactParticles.length,
            exhaustParticles: this.exhaustParticles.length,
            weatherParticles: this.weatherSystem.particles.length,
            muzzleFlashes: Object.keys(this.muzzleFlashes).length,
            hitMarkers: this.hitMarkers.length,
            total: this.bulletTrails.length + this.explosionParticles.length + 
                   this.impactParticles.length + this.exhaustParticles.length + 
                   this.weatherSystem.particles.length
        };
    }
}