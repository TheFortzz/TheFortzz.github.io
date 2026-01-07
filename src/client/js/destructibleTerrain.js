// Destructible Terrain System - Trees, Walls, Cover
// Dynamic environment that responds to combat

const DestructibleTerrain = {
    // Destructible objects
    objects: [],
    debris: [],

    // Object types
    OBJECT_TYPES: {
        TREE: {
            id: 'tree',
            health: 100,
            width: 40,
            height: 80,
            color: '#228B22',
            debrisCount: 8,
            debrisColor: '#8B4513'
        },
        WALL: {
            id: 'wall',
            health: 200,
            width: 60,
            height: 60,
            color: '#808080',
            debrisCount: 12,
            debrisColor: '#696969'
        },
        CRATE: {
            id: 'crate',
            health: 50,
            width: 40,
            height: 40,
            color: '#8B4513',
            debrisCount: 6,
            debrisColor: '#654321'
        },
        ROCK: {
            id: 'rock',
            health: 150,
            width: 50,
            height: 50,
            color: '#A9A9A9',
            debrisCount: 10,
            debrisColor: '#808080'
        }
    },

    // Initialize terrain objects
    init(gameWidth, gameHeight, count = 50) {
        this.objects = [];

        const types = Object.values(this.OBJECT_TYPES);

        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];

            this.objects.push({
                id: `obj_${i}`,
                type: type.id,
                x: 200 + Math.random() * (gameWidth - 400),
                y: 200 + Math.random() * (gameHeight - 400),
                health: type.health,
                maxHealth: type.health,
                width: type.width,
                height: type.height,
                rotation: Math.random() * Math.PI * 2,
                destroyed: false
            });
        }

        console.log(`🌳 Initialized ${count} destructible terrain objects`);
    },

    // Damage an object
    damageObject(objectId, damage) {
        const obj = this.objects.find(o => o.id === objectId);
        if (!obj || obj.destroyed) return null;

        obj.health -= damage;

        if (obj.health <= 0) {
            return this.destroyObject(obj);
        }

        return {
            damaged: true,
            healthPercent: obj.health / obj.maxHealth
        };
    },

    // Destroy an object
    destroyObject(obj) {
        obj.destroyed = true;

        const type = this.OBJECT_TYPES[obj.type.toUpperCase()];

        // Create debris
        for (let i = 0; i < type.debrisCount; i++) {
            const angle = (Math.PI * 2 * i) / type.debrisCount + (Math.random() - 0.5) * 0.5;
            const speed = 3 + Math.random() * 5;

            this.debris.push({
                x: obj.x,
                y: obj.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                life: 1,
                decay: 0.01,
                color: type.debrisColor
            });
        }

        // Screen shake
        if (window.VisualPolish) {
            window.VisualPolish.applyScreenShake(5);
        }

        // Sound
        if (window.EnhancedSoundSystem) {
            window.EnhancedSoundSystem.playExplosion(0.5);
        }

        return {
            destroyed: true,
            debris: type.debrisCount
        };
    },

    // Check collision with object
    checkCollision(x, y, radius) {
        return this.objects.find(obj => {
            if (obj.destroyed) return false;

            const dx = x - obj.x;
            const dy = y - obj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            return dist < (obj.width / 2 + radius);
        });
    },

    // Update debris
    update() {
        this.debris = this.debris.filter(d => {
            d.x += d.vx;
            d.y += d.vy;
            d.vy += 0.2; // Gravity
            d.vx *= 0.98;
            d.vy *= 0.98;
            d.rotation += d.rotationSpeed;
            d.life -= d.decay;

            return d.life > 0;
        });
    },

    // Render terrain objects
    render(ctx) {
        // Render objects
        this.objects.forEach(obj => {
            if (obj.destroyed) return;

            const type = this.OBJECT_TYPES[obj.type.toUpperCase()];
            const healthPercent = obj.health / obj.maxHealth;

            ctx.save();
            ctx.translate(obj.x, obj.y);
            ctx.rotate(obj.rotation);

            // Damage tint
            const damageTint = healthPercent < 0.5 ? 0.5 : 1;
            ctx.globalAlpha = damageTint;

            // Draw object based on type
            switch (obj.type) {
                case 'tree':
                    this.renderTree(ctx, type, healthPercent);
                    break;
                case 'wall':
                    this.renderWall(ctx, type, healthPercent);
                    break;
                case 'crate':
                    this.renderCrate(ctx, type, healthPercent);
                    break;
                case 'rock':
                    this.renderRock(ctx, type, healthPercent);
                    break;
            }

            ctx.restore();
        });

        // Render debris
        ctx.save();
        this.debris.forEach(d => {
            ctx.globalAlpha = d.life;
            ctx.fillStyle = d.color;
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);
            ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
            ctx.restore();
        });
        ctx.restore();
    },

    // Render tree
    renderTree(ctx, type, healthPercent) {
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-type.width / 4, 0, type.width / 2, type.height / 2);

        // Foliage
        ctx.fillStyle = type.color;
        ctx.beginPath();
        ctx.arc(0, -type.height / 4, type.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Damage cracks
        if (healthPercent < 0.7) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-type.width / 8, type.height / 4);
            ctx.lineTo(type.width / 8, type.height / 3);
            ctx.stroke();
        }
    },

    // Render wall
    renderWall(ctx, type, healthPercent) {
        ctx.fillStyle = type.color;
        ctx.fillRect(-type.width / 2, -type.height / 2, type.width, type.height);

        // Bricks
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        for (let y = -type.height / 2; y < type.height / 2; y += 15) {
            ctx.beginPath();
            ctx.moveTo(-type.width / 2, y);
            ctx.lineTo(type.width / 2, y);
            ctx.stroke();
        }

        // Damage cracks
        if (healthPercent < 0.5) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-type.width / 2, -type.height / 4);
            ctx.lineTo(type.width / 2, type.height / 4);
            ctx.stroke();
        }
    },

    // Render crate
    renderCrate(ctx, type, healthPercent) {
        ctx.fillStyle = type.color;
        ctx.fillRect(-type.width / 2, -type.height / 2, type.width, type.height);

        // Wood planks
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const y = -type.height / 2 + (i * type.height / 3);
            ctx.beginPath();
            ctx.moveTo(-type.width / 2, y);
            ctx.lineTo(type.width / 2, y);
            ctx.stroke();
        }
    },

    // Render rock
    renderRock(ctx, type, healthPercent) {
        ctx.fillStyle = type.color;
        ctx.beginPath();

        // Irregular rock shape
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 * i) / points;
            const radius = type.width / 2 * (0.8 + Math.random() * 0.4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};

// Export for use in game
window.DestructibleTerrain = DestructibleTerrain;
