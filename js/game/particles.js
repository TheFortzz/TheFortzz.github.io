// Advanced particle system for game effects
const ParticleSystem = {
    particles: [],

    create(x, y, type = 'explosion', count = 8) {
        const types = {
            explosion: { color: '#ff6b00', velocity: 5, life: 0.6 },
            hit: { color: '#ffff00', velocity: 3, life: 0.4 },
            powerup: { color: '#00ff00', velocity: 2, life: 0.8 },
            blood: { color: '#ff3333', velocity: 4, life: 0.5 }
        };

        const config = types[type] || types.explosion;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = config.velocity + Math.random() * 2;

            this.particles.push({
                x: x + Math.random() * 20 - 10,
                y: y + Math.random() * 20 - 10,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: config.life,
                maxLife: config.life,
                color: config.color,
                size: 3 + Math.random() * 2,
                decay: Math.random() * 0.5 + 0.5
            });
        }
    },

    update(deltaTime) {
        const dt = deltaTime / 1000;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx * dt * 60;
            p.y += p.vy * dt * 60;
            p.life -= p.decay * dt;
            p.vy += 0.3; // gravity

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },

    render(ctx, camera, canvas) {
        ctx.save();

        this.particles.forEach(p => {
            const screenX = p.x - camera.x + canvas.width / 2;
            const screenY = p.y - camera.y + canvas.height / 2;

            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
};

window.ParticleSystem = ParticleSystem;
