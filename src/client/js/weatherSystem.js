/**
 * Weather System for TheFortz
 * Dynamic weather effects including rain, snow, fog, and storms
 */

const WeatherSystem = {
    currentWeather: 'clear',
    intensity: 0,
    particles: [],
    maxParticles: 500,
    windX: 0,
    windY: 0,
    fogDensity: 0,
    lightningTimer: 0,
    lightningActive: false,

    weatherTypes: {
        clear: {
            particles: 0,
            fogDensity: 0,
            ambientLight: 1.0,
            windStrength: 0
        },
        rain: {
            particles: 300,
            fogDensity: 0.1,
            ambientLight: 0.7,
            windStrength: 2,
            particleConfig: {
                width: 2,
                height: 15,
                speed: 15,
                color: 'rgba(174, 194, 224, 0.6)'
            }
        },
        heavyRain: {
            particles: 500,
            fogDensity: 0.2,
            ambientLight: 0.5,
            windStrength: 4,
            lightning: true,
            particleConfig: {
                width: 2,
                height: 20,
                speed: 20,
                color: 'rgba(174, 194, 224, 0.8)'
            }
        },
        snow: {
            particles: 200,
            fogDensity: 0.15,
            ambientLight: 0.9,
            windStrength: 1,
            particleConfig: {
                size: 4,
                speed: 3,
                color: 'rgba(255, 255, 255, 0.8)',
                drift: true
            }
        },
        blizzard: {
            particles: 400,
            fogDensity: 0.3,
            ambientLight: 0.6,
            windStrength: 5,
            particleConfig: {
                size: 5,
                speed: 8,
                color: 'rgba(255, 255, 255, 0.9)',
                drift: true
            }
        },
        fog: {
            particles: 0,
            fogDensity: 0.4,
            ambientLight: 0.6,
            windStrength: 0.5
        },
        sandstorm: {
            particles: 350,
            fogDensity: 0.25,
            ambientLight: 0.7,
            windStrength: 6,
            particleConfig: {
                size: 3,
                speed: 10,
                color: 'rgba(194, 178, 128, 0.6)',
                drift: true
            }
        }
    },

    // Set weather
    setWeather(weatherType, transitionTime = 2000) {
        if (!this.weatherTypes[weatherType]) return;

        this.currentWeather = weatherType;
        const weather = this.weatherTypes[weatherType];

        // Smooth transition
        this.transitionTo(weather, transitionTime);
    },

    transitionTo(targetWeather, duration) {
        const startTime = Date.now();
        const startIntensity = this.intensity;
        const startFog = this.fogDensity;
        const startWind = this.windX;

        const transition = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);

            // Ease in-out
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            this.intensity = startIntensity + (1 - startIntensity) * eased;
            this.fogDensity = startFog + (targetWeather.fogDensity - startFog) * eased;
            this.windX = startWind + (targetWeather.windStrength - startWind) * eased;

            if (progress < 1) {
                requestAnimationFrame(transition);
            }
        };

        transition();
    },

    // Update weather
    update(deltaTime, canvas) {
        const weather = this.weatherTypes[this.currentWeather];
        if (!weather) return;

        // Update wind
        this.windX += (Math.random() - 0.5) * 0.1;
        this.windX *= 0.95; // Damping
        this.windY = Math.sin(Date.now() / 1000) * 0.5;

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += (p.vx + this.windX) * deltaTime / 16;
            p.y += (p.vy + this.windY) * deltaTime / 16;

            // Drift for snow
            if (p.drift) {
                p.x += Math.sin(p.y / 50 + Date.now() / 1000) * 0.5;
            }

            // Remove if off screen
            return p.y < canvas.height + 50 && p.x > -50 && p.x < canvas.width + 50;
        });

        // Add new particles
        const targetParticles = weather.particles * this.intensity;
        while (this.particles.length < targetParticles && this.particles.length < this.maxParticles) {
            this.particles.push(this.createParticle(canvas, weather.particleConfig));
        }

        // Lightning
        if (weather.lightning) {
            this.updateLightning(deltaTime);
        }
    },

    createParticle(canvas, config) {
        if (!config) return null;

        const particle = {
            x: Math.random() * (canvas.width + 200) - 100,
            y: -50,
            vx: 0,
            vy: config.speed || 5,
            ...config
        };

        return particle;
    },

    updateLightning(deltaTime) {
        this.lightningTimer += deltaTime;

        if (!this.lightningActive && this.lightningTimer > 3000 + Math.random() * 5000) {
            this.lightningActive = true;
            this.lightningTimer = 0;
            this.lightningFlashes = 1 + Math.floor(Math.random() * 3);
            this.lightningDelay = 0;
        }

        if (this.lightningActive) {
            this.lightningDelay += deltaTime;
            if (this.lightningDelay > 100) {
                this.lightningFlashes--;
                this.lightningDelay = 0;

                if (this.lightningFlashes <= 0) {
                    this.lightningActive = false;
                }
            }
        }
    },

    // Render weather
    render(ctx, canvas, camera) {
        // Render fog
        if (this.fogDensity > 0) {
            this.renderFog(ctx, canvas);
        }

        // Render particles
        ctx.save();
        this.particles.forEach(p => {
            if (p.height) {
                // Rain
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.width;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 2, p.y - p.height);
                ctx.stroke();
            } else {
                // Snow/sand
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();

        // Render lightning
        if (this.lightningActive && this.lightningFlashes % 2 === 1) {
            this.renderLightning(ctx, canvas);
        }
    },

    renderFog(ctx, canvas) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        const alpha = this.fogDensity * this.intensity;

        gradient.addColorStop(0, `rgba(200, 200, 200, ${alpha * 0.3})`);
        gradient.addColorStop(0.5, `rgba(180, 180, 180, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(160, 160, 160, ${alpha * 0.3})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    renderLightning(ctx, canvas) {
        // Flash effect
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Lightning bolt
        const startX = Math.random() * canvas.width;
        const segments = 10;
        let x = startX;
        let y = 0;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FFFFFF';

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let i = 0; i < segments; i++) {
            x += (Math.random() - 0.5) * 50;
            y += canvas.height / segments;
            ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.restore();
    },

    // Get current weather data
    getCurrentWeather() {
        return {
            type: this.currentWeather,
            intensity: this.intensity,
            fogDensity: this.fogDensity,
            windX: this.windX,
            windY: this.windY
        };
    },

    clear() {
        this.particles = [];
        this.currentWeather = 'clear';
        this.intensity = 0;
        this.fogDensity = 0;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.WeatherSystem = WeatherSystem;
}
