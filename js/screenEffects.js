/**
 * Screen Effects System for TheFortz
 * Post-processing effects like screen shake, chromatic aberration, vignette, etc.
 */

const ScreenEffects = {
  effects: {
    shake: {
      active: false,
      intensity: 0,
      duration: 0,
      elapsed: 0,
      offsetX: 0,
      offsetY: 0
    },
    chromaticAberration: {
      active: false,
      intensity: 0
    },
    vignette: {
      active: true,
      intensity: 0.3
    },
    blur: {
      active: false,
      intensity: 0
    },
    colorGrading: {
      active: false,
      hue: 0,
      saturation: 1.0,
      brightness: 1.0,
      contrast: 1.0
    },
    scanlines: {
      active: false,
      intensity: 0.1,
      speed: 1
    },
    glitch: {
      active: false,
      intensity: 0,
      frequency: 0.1
    },
    radialBlur: {
      active: false,
      intensity: 0,
      centerX: 0.5,
      centerY: 0.5
    },
    pixelate: {
      active: false,
      pixelSize: 4
    },
    nightVision: {
      active: false,
      intensity: 1.0
    }
  },

  // Screen shake
  shake(intensity = 10, duration = 500) {
    this.effects.shake.active = true;
    this.effects.shake.intensity = intensity;
    this.effects.shake.duration = duration;
    this.effects.shake.elapsed = 0;
  },

  // Chromatic aberration
  setChromaticAberration(intensity) {
    this.effects.chromaticAberration.active = intensity > 0;
    this.effects.chromaticAberration.intensity = intensity;
  },

  // Vignette
  setVignette(intensity) {
    this.effects.vignette.active = intensity > 0;
    this.effects.vignette.intensity = intensity;
  },

  // Motion blur
  setBlur(intensity) {
    this.effects.blur.active = intensity > 0;
    this.effects.blur.intensity = intensity;
  },

  // Color grading
  setColorGrading(config) {
    this.effects.colorGrading.active = true;
    Object.assign(this.effects.colorGrading, config);
  },

  // Glitch effect
  triggerGlitch(intensity = 0.5, duration = 200) {
    this.effects.glitch.active = true;
    this.effects.glitch.intensity = intensity;
    setTimeout(() => {
      this.effects.glitch.active = false;
    }, duration);
  },

  // Update effects
  update(deltaTime) {
    // Update screen shake
    if (this.effects.shake.active) {
      this.effects.shake.elapsed += deltaTime;

      if (this.effects.shake.elapsed >= this.effects.shake.duration) {
        this.effects.shake.active = false;
        this.effects.shake.offsetX = 0;
        this.effects.shake.offsetY = 0;
      } else {
        const progress = this.effects.shake.elapsed / this.effects.shake.duration;
        const intensity = this.effects.shake.intensity * (1 - progress);

        this.effects.shake.offsetX = (Math.random() - 0.5) * intensity * 2;
        this.effects.shake.offsetY = (Math.random() - 0.5) * intensity * 2;
      }
    }
  },

  // Apply effects to canvas
  apply(ctx, canvas) {
    // Apply shake offset
    if (this.effects.shake.active) {
      ctx.translate(this.effects.shake.offsetX, this.effects.shake.offsetY);
    }
  },

  // Render post-processing effects
  renderPostEffects(ctx, canvas) {
    // Vignette
    if (this.effects.vignette.active) {
      this.renderVignette(ctx, canvas);
    }

    // Scanlines
    if (this.effects.scanlines.active) {
      this.renderScanlines(ctx, canvas);
    }

    // Night vision
    if (this.effects.nightVision.active) {
      this.renderNightVision(ctx, canvas);
    }

    // Glitch
    if (this.effects.glitch.active && Math.random() < this.effects.glitch.frequency) {
      this.renderGlitch(ctx, canvas);
    }
  },

  renderVignette(ctx, canvas) {
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
      canvas.width / 2, canvas.height / 2, canvas.height * 0.8
    );

    const intensity = this.effects.vignette.intensity;
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },

  renderScanlines(ctx, canvas) {
    ctx.save();
    ctx.globalAlpha = this.effects.scanlines.intensity;
    ctx.fillStyle = '#000000';

    const lineHeight = 2;
    const offset = Date.now() * this.effects.scanlines.speed / 100 % (lineHeight * 2);

    for (let y = -offset; y < canvas.height; y += lineHeight * 2) {
      ctx.fillRect(0, y, canvas.width, lineHeight);
    }

    ctx.restore();
  },

  renderNightVision(ctx, canvas) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#00ff00';
    ctx.globalAlpha = this.effects.nightVision.intensity * 0.3;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.1;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() > 0.95) {
        const noise = Math.random() * 100;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  },

  renderGlitch(ctx, canvas) {
    const sliceCount = 5 + Math.floor(Math.random() * 10);
    const intensity = this.effects.glitch.intensity;

    for (let i = 0; i < sliceCount; i++) {
      const sliceY = Math.random() * canvas.height;
      const sliceHeight = 5 + Math.random() * 30;
      const offsetX = (Math.random() - 0.5) * 50 * intensity;

      const imageData = ctx.getImageData(0, sliceY, canvas.width, sliceHeight);
      ctx.putImageData(imageData, offsetX, sliceY);
    }

    // Color shift
    if (Math.random() > 0.7) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = ['#ff0000', '#00ff00', '#0000ff'][Math.floor(Math.random() * 3)];
      ctx.globalAlpha = 0.1 * intensity;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  },

  // Preset effects
  presets: {
    hit: function () {
      ScreenEffects.shake(8, 200);
      ScreenEffects.setChromaticAberration(3);
      setTimeout(() => ScreenEffects.setChromaticAberration(0), 200);
    },

    explosion: function () {
      ScreenEffects.shake(15, 500);
      ScreenEffects.setBlur(5);
      setTimeout(() => ScreenEffects.setBlur(0), 300);
    },

    death: function () {
      ScreenEffects.shake(20, 800);
      ScreenEffects.setColorGrading({
        saturation: 0.3,
        brightness: 0.7
      });
    },

    powerUp: function () {
      ScreenEffects.shake(5, 300);
      ScreenEffects.triggerGlitch(0.3, 150);
    },

    speedBoost: function () {
      ScreenEffects.setBlur(3);
      ScreenEffects.setChromaticAberration(2);
    },

    normal: function () {
      ScreenEffects.setBlur(0);
      ScreenEffects.setChromaticAberration(0);
      ScreenEffects.setColorGrading({
        saturation: 1.0,
        brightness: 1.0,
        contrast: 1.0
      });
    }
  },

  reset() {
    Object.keys(this.effects).forEach((key) => {
      if (key !== 'vignette') {
        this.effects[key].active = false;
      }
    });
  }
};

// Export
if (typeof window !== 'undefined') {
  window.ScreenEffects = ScreenEffects;
}