/**
 * Advanced Lighting System for TheFortz
 * Dynamic lighting with shadows, glows, and atmospheric effects
 */

const AdvancedLighting = {
  lights: [],
  ambientLight: 0.3,
  shadowsEnabled: true,
  bloomEnabled: true,

  // Light types
  createLight(config) {
    return {
      id: config.id || `light_${Date.now()}_${Math.random()}`,
      x: config.x || 0,
      y: config.y || 0,
      radius: config.radius || 100,
      intensity: config.intensity || 1.0,
      color: config.color || '#FFFFFF',
      flicker: config.flicker || false,
      flickerSpeed: config.flickerSpeed || 0.1,
      flickerAmount: config.flickerAmount || 0.2,
      pulse: config.pulse || false,
      pulseSpeed: config.pulseSpeed || 0.05,
      pulseAmount: config.pulseAmount || 0.3,
      castsShadows: config.castsShadows !== false,
      type: config.type || 'point', // point, spot, directional
      angle: config.angle || 0,
      spread: config.spread || Math.PI / 4,
      followTarget: config.followTarget || null,
      time: 0
    };
  },

  // Add light to scene
  addLight(config) {
    const light = this.createLight(config);
    this.lights.push(light);
    return light;
  },

  // Remove light
  removeLight(lightId) {
    this.lights = this.lights.filter((l) => l.id !== lightId);
  },

  // Update lights
  update(deltaTime) {
    this.lights.forEach((light) => {
      light.time += deltaTime / 1000;

      // Follow target
      if (light.followTarget) {
        light.x = light.followTarget.x;
        light.y = light.followTarget.y;
      }

      // Flicker effect
      if (light.flicker) {
        const flickerNoise = Math.sin(light.time * light.flickerSpeed * 10) * light.flickerAmount;
        light.currentIntensity = light.intensity * (1 + flickerNoise);
      }

      // Pulse effect
      if (light.pulse) {
        const pulseValue = Math.sin(light.time * light.pulseSpeed * Math.PI * 2) * light.pulseAmount;
        light.currentRadius = light.radius * (1 + pulseValue);
        light.currentIntensity = light.intensity * (1 + pulseValue * 0.5);
      }

      // Set defaults if no effects
      if (!light.flicker && !light.pulse) {
        light.currentIntensity = light.intensity;
        light.currentRadius = light.radius;
      }
    });
  },

  // Render lighting layer
  render(ctx, camera, canvas) {
    if (this.lights.length === 0) return;

    // Create lighting canvas
    const lightCanvas = document.createElement('canvas');
    lightCanvas.width = canvas.width;
    lightCanvas.height = canvas.height;
    const lightCtx = lightCanvas.getContext('2d');

    // Fill with ambient light
    lightCtx.fillStyle = `rgba(0, 0, 0, ${1 - this.ambientLight})`;
    lightCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Set blend mode for lights
    lightCtx.globalCompositeOperation = 'lighter';

    // Render each light
    this.lights.forEach((light) => {
      const screenX = light.x - camera.x;
      const screenY = light.y - camera.y;

      // Skip if off-screen
      if (screenX < -light.radius || screenX > canvas.width + light.radius ||
      screenY < -light.radius || screenY > canvas.height + light.radius) {
        return;
      }

      const radius = light.currentRadius || light.radius;
      const intensity = light.currentIntensity || light.intensity;

      if (light.type === 'point') {
        this.renderPointLight(lightCtx, screenX, screenY, radius, intensity, light.color);
      } else if (light.type === 'spot') {
        this.renderSpotLight(lightCtx, screenX, screenY, radius, intensity, light.color, light.angle, light.spread);
      }
    });

    // Apply lighting to main canvas
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(lightCanvas, 0, 0);
    ctx.restore();

    // Bloom effect
    if (this.bloomEnabled) {
      this.renderBloom(ctx, canvas);
    }
  },

  renderPointLight(ctx, x, y, radius, intensity, color) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    // Parse color
    const alpha = intensity;
    gradient.addColorStop(0, this.addAlpha(color, alpha));
    gradient.addColorStop(0.5, this.addAlpha(color, alpha * 0.5));
    gradient.addColorStop(1, this.addAlpha(color, 0));

    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  },

  renderSpotLight(ctx, x, y, radius, intensity, color, angle, spread) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Create cone shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, -spread / 2, spread / 2);
    ctx.closePath();

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, this.addAlpha(color, intensity));
    gradient.addColorStop(0.7, this.addAlpha(color, intensity * 0.3));
    gradient.addColorStop(1, this.addAlpha(color, 0));

    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  },

  renderBloom(ctx, canvas) {
    // Simple bloom by drawing lights again with blur
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = 'blur(20px)';
    ctx.globalAlpha = 0.3;

    // Re-render lights with blur
    this.lights.forEach((light) => {
      const screenX = light.x - (camera?.x || 0);
      const screenY = light.y - (camera?.y || 0);
      const radius = (light.currentRadius || light.radius) * 0.5;

      ctx.fillStyle = light.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  },

  addAlpha(color, alpha) {
    // Convert hex to rgba
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  },

  // Preset light configurations
  presets: {
    muzzleFlash: (x, y) => ({
      x, y,
      radius: 80,
      intensity: 1.5,
      color: '#FFA500',
      flicker: true,
      flickerSpeed: 0.5,
      flickerAmount: 0.4
    }),

    explosion: (x, y) => ({
      x, y,
      radius: 200,
      intensity: 2.0,
      color: '#FF6600',
      pulse: true,
      pulseSpeed: 2.0,
      pulseAmount: 0.5
    }),

    powerUp: (x, y, color = '#FFD700') => ({
      x, y,
      radius: 60,
      intensity: 0.8,
      color: color,
      pulse: true,
      pulseSpeed: 0.5,
      pulseAmount: 0.3
    }),

    tank: (x, y) => ({
      x, y,
      radius: 50,
      intensity: 0.6,
      color: '#FFFFFF',
      followTarget: { x, y }
    })
  },

  clear() {
    this.lights = [];
  }
};

// Export
if (typeof window !== 'undefined') {
  window.AdvancedLighting = AdvancedLighting;
}