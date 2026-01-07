// Enhanced Weather System - Rain, Fog, Snow, Storms
// Dynamic environmental effects that impact gameplay

const EnhancedWeather = {
    // Current weather state
    active: false,
    type: 'none', // 'rain', 'fog', 'snow', 'storm', 'sandstorm'
    intensity: 0,
    targetIntensity: 0,
    transitionSpeed: 0.01,

    // Weather particles
    particles: [],
    maxParticles: 500,

    // Wind
    wind: {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        changeInterval: 5000,
        lastChange: 0
    },

    // Fog settings
    fog: {
        density: 0,
        color: 'rgba(200, 200, 200, 0.3)',
        viewReduction: 0.5 // Reduces view distance by 50%
    },

    // Lightning (for storms)
    lightning: {
        active: false,
        strikes: [],
        nextStrike: 0
    },

    // Activate weather
    activate(weatherType, intensity = 0.7) {
        this.active = true;
        this.type = weatherType;
        this.targetIntensity = Math.max(0, Math.min(1, intensity));

        console.log(`🌦️ Weather activated: ${weatherType} (intensity: ${intensity})`);

        // Initialize particles for this weather type
        this.initializeParticles();
    },

    // Deactivate weather
    deactivate() {
        this.targetIntensity = 0;
        setTimeout(() => {
            if (this.intensity <= 0.1) {
                this.active = false;
                this.particles = [];
                console.log('☀️ Weather cleared');
            }
        }, 2000);
    },

    // Initialize particles based on weather type
    initializeParticles() {
        this.particles = [];

        const count = Math.floor(this.maxParticles * this.targetIntensity);

        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    },

    // Create a weather particle
    createParticle() {
        const particle = {
            x: Math.random() * 2000 - 1000, // Relative to camera
            y: Math.random() * 2000 - 1000,
            vx: 0,
            vy: 0,
            size: 1,
            life: 1,
            opacity: 1
        };

        switch (this.type) {
            case 'rain':
                particle.vx = this.wind.x + (Math.random() - 0.5) * 2;
                particle.vy = 15 + Math.random() * 10;
                particle.size = 1 + Math.random() * 2;
                particle.opacity = 0.3 + Math.random() * 0.4;
                break;

            case 'snow':
                particle.vx = this.wind.x * 0.5 + (Math.random() - 0.5);
                particle.vy = 2 + Math.random() * 3;
                particle.size = 2 + Math.random() * 3;
                particle.opacity = 0.6 + Math.random() * 0.4;
                particle.rotation = Math.random() * Math.PI * 2;
                particle.rotationSpeed = (Math.random() - 0.5) * 0.1;
                break;

            case 'sandstorm':
                particle.vx = this.wind.x * 2 + (Math.random() - 0.5) * 5;
                particle.vy = (Math.random() - 0.5) * 3;
                particle.size = 1 + Math.random() * 2;
                particle.opacity = 0.2 + Math.random() * 0.3;
                break;

            case 'storm':
                // Storm is heavy rain + lightning
                particle.vx = this.wind.x * 1.5 + (Math.random() - 0.5) * 3;
                particle.vy = 20 + Math.random() * 15;
                particle.size = 1.5 + Math.random() * 2.5;
                particle.opacity = 0.4 + Math.random() * 0.4;
                break;
        }

        return particle;
    },

    // Update weather
    update(deltaTime, camera, canvas) {
        if (!this.active && this.intensity <= 0) return;

        const now = Date.now();

        // Smoothly transition intensity
        if (this.intensity < this.targetIntensity) {
            this.intensity = Math.min(this.targetIntensity, this.intensity + this.transitionSpeed);
        } else if (this.intensity > this.targetIntensity) {
            this.intensity = Math.max(this.targetIntensity, this.intensity - this.transitionSpeed);
        }

        // Update wind
        if (now - this.wind.lastChange > this.wind.changeInterval) {
            this.wind.targetX = (Math.random() - 0.5) * 10;
            this.wind.targetY = (Math.random() - 0.5) * 3;
            this.wind.lastChange = now;
        }

        this.wind.x += (this.wind.targetX - this.wind.x) * 0.01;
        this.wind.y += (this.wind.targetY - this.wind.y) * 0.01;

        // Update fog
        if (this.type === 'fog') {
            this.fog.density = this.intensity * 0.7;
        }

        // Update lightning
        if (this.type === 'storm') {
            this.updateLightning(now);
        }

        // Update particles
        this.updateParticles(camera, canvas);
    },

    // Update particles
    updateParticles(camera, canvas) {
        // Add new particles if needed
        while (this.particles.length < this.maxParticles * this.intensity) {
            this.particles.push(this.createParticle());
        }

        // Update existing particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.rotation !== undefined) {
                p.rotation += p.rotationSpeed;
            }

            // Reset particles that go off screen
            const screenX = p.x + camera.x;
            const screenY = p.y + camera.y;

            if (screenY > canvas.height + 100) {
                p.y = -100;
                p.x = Math.random() * canvas.width - camera.x;
                return true;
            }

            if (screenX < -100 || screenX > canvas.width + 100) {
                p.x = Math.random() * canvas.width - camera.x;
                return true;
            }

            return true;
        });
    },

    // Update lightning
    updateLightning(now) {
        if (now > this.lightning.nextStrike) {
            // Create lightning strike
            this.lightning.strikes.push({
                x: Math.random() * 2000,
                y: Math.random() * 2000,
                startTime: now,
                duration: 200,
                intensity: 0.5 + Math.random() * 0.5
            });

            // Schedule next strike
            this.lightning.nextStrike = now + 3000 + Math.random() * 7000;
        }

        // Remove old strikes
        this.lightning.strikes = this.lightning.strikes.filter(strike => {
            return (now - strike.startTime) < strike.duration;
        });
    },

    // Render weather
    render(ctx, camera, canvas) {
        if (!this.active && this.intensity <= 0) return;

        ctx.save();

        // Render fog
        if (this.type === 'fog' && this.fog.density > 0) {
            ctx.fillStyle = `rgba(200, 200, 200, ${this.fog.density})`;
            ctx.fillRect(camera.x, camera.y, canvas.width, canvas.height);
        }

        // Render particles
        this.renderParticles(ctx, camera);

        // Render lightning
        if (this.type === 'storm') {
            this.renderLightning(ctx, camera, canvas);
        }

        ctx.restore();
    },

    // Render particles
    renderParticles(ctx, camera) {
        this.particles.forEach(p => {
            ctx.globalAlpha = p.opacity * this.intensity;

            const x = p.x + camera.x;
            const y = p.y + camera.y;

            switch (this.type) {
                case 'rain':
                case 'storm':
                    ctx.strokeStyle = '#aaccff';
                    ctx.lineWidth = p.size;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + p.vx * 2, y + p.vy * 2);
                    ctx.stroke();
                    break;

                case 'snow':
                    ctx.fillStyle = '#ffffff';
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(p.rotation);
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    ctx.restore();
                    break;

                case 'sandstorm':
                    ctx.fillStyle = '#d2b48c';
                    ctx.beginPath();
                    ctx.arc(x, y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        });

        ctx.globalAlpha = 1;
    },

    // Render lightning
    renderLightning(ctx, camera, canvas) {
        const now = Date.now();

        this.lightning.strikes.forEach(strike => {
            const elapsed = now - strike.startTime;
            const alpha = 1 - (elapsed / strike.duration);

            // Flash the entire screen
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = alpha * strike.intensity * 0.3;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            // Draw lightning bolt
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffffff';

            const startX = strike.x;
            const startY = 0;
            const endY = strike.y;

            ctx.beginPath();
            ctx.moveTo(startX, startY);

            // Jagged lightning path
            let currentY = startY;
            let currentX = startX;

            while (currentY < endY) {
                currentY += 50 + Math.random() * 50;
                currentX += (Math.random() - 0.5) * 60;
                ctx.lineTo(currentX, currentY);
            }

            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        ctx.globalAlpha = 1;
    },

    // Get gameplay effects
    getGameplayEffects() {
        const effects = {
            visibilityReduction: 0,
            movementPenalty: 0,
            accuracyPenalty: 0
        };

        switch (this.type) {
            case 'fog':
                effects.visibilityReduction = this.intensity * 0.5;
                break;

            case 'rain':
                effects.accuracyPenalty = this.intensity * 0.1;
                effects.movementPenalty = this.intensity * 0.05;
                break;

            case 'snow':
                effects.movementPenalty = this.intensity * 0.15;
                effects.visibilityReduction = this.intensity * 0.2;
                break;

            case 'sandstorm':
                effects.visibilityReduction = this.intensity * 0.7;
                effects.accuracyPenalty = this.intensity * 0.2;
                effects.movementPenalty = this.intensity * 0.1;
                break;

            case 'storm':
                effects.visibilityReduction = this.intensity * 0.3;
                effects.accuracyPenalty = this.intensity * 0.15;
                effects.movementPenalty = this.intensity * 0.1;
                break;
        }

        return effects;
    }
};

// Export for use in game
window.EnhancedWeather = EnhancedWeather;

// Auto-activate random weather for testing (remove in production)
if (typeof window !== 'undefined') {
    setTimeout(() => {
        const weatherTypes = ['rain', 'fog', 'snow', 'storm', 'sandstorm'];
        const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        EnhancedWeather.activate(randomWeather, 0.6);
        console.log(`🌦️ Random weather activated: ${randomWeather}`);
    }, 5000);
}
