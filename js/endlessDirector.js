// Endless Mode Director: Adaptive difficulty, combo system, and HUD overlay
// This module is client-side only and non-invasive. It provides moment-to-moment pacing and feedback.
// It relies on lightweight hooks from game start and kill events. If hooks are missing, it still runs safely.

(function () {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);

  const FORMAT = {
    time(ms) {
      const s = Math.floor(ms / 1000);
      const m = Math.floor(s / 60);
      const ss = (s % 60).toString().padStart(2, '0');
      return `${m}:${ss}`;
    }
  };

  const EndlessDirector = {
    initialized: false,
    gameState: null,

    // Run state
    runStartTime: 0,
    timeAliveMs: 0,
    lastUpdateTs: 0,

    // Performance sampling
    killsInWindow: 0,
    damageInWindow: 0,
    windowLengthMs: 10000,
    windowStartTs: 0,

    // Combo system
    comboCount: 0,
    comboMultiplier: 1,
    comboDecayMs: 3000,
    comboTimerMs: 0,
    comboMax: 10,

    // Difficulty director
    difficulty: 1.0, // current displayed difficulty [1..10]
    targetDifficulty: 1.0, // internal target, eases towards difficulty
    maxDifficulty: 10.0,
    directorState: 'CALM', // CALM, BUILDUP, PEAK, RECOVERY

    init(gameState) {
      this.gameState = gameState;
      this.initialized = true;
      this.windowStartTs = performance.now();
      if (!this.runStartTime) this.onRunStart();
      console.log('[EndlessDirector] initialized');
    },

    onRunStart() {
      this.runStartTime = performance.now();
      this.timeAliveMs = 0;
      this.killsInWindow = 0;
      this.damageInWindow = 0;
      this.windowStartTs = performance.now();
      this.comboCount = 0;
      this.comboMultiplier = 1;
      this.comboTimerMs = 0;
      this.difficulty = 1.0;
      this.targetDifficulty = 1.5; // small ramp baseline
      this.directorState = 'CALM';
      if (typeof window.showNotification === 'function') {
        window.showNotification('Run Started', '#00D1FF', 28);
      }
    },

    onKill() {
      // Increase combo and refresh timer
      this.comboCount = clamp(this.comboCount + 1, 0, this.comboMax);
      this.comboTimerMs = this.comboDecayMs;
      this.comboMultiplier = 1 + Math.floor(this.comboCount / 2); // +1 every 2 kills

      // Boost perceived performance for the director
      this.killsInWindow += 1;

      // Momentary spike in target difficulty for excitement
      this.targetDifficulty = clamp(this.targetDifficulty + 0.2, 1, this.maxDifficulty);

      // Feedback
      if (typeof window.showNotification === 'function') {
        if (this.comboMultiplier > 1) {
          window.showNotification(`${this.comboMultiplier}x Combo`, '#FFD700', 26);
        }
      }
    },

    onDamage(amount) {
      this.damageInWindow += Math.max(0, amount || 0);
      // Ease off target difficulty when taking damage
      this.targetDifficulty = clamp(this.targetDifficulty - 0.15, 1, this.maxDifficulty);
    },

    // For external systems to fetch multiplier
    getScoreMultiplier() {
      return this.comboMultiplier || 1;
    },

    update(deltaMs, gameState) {
      if (!this.initialized) return;
      if (!deltaMs || deltaMs > 250) deltaMs = 16; // guard
      this.gameState = gameState || this.gameState;

      // Run time
      const now = performance.now();
      if (!this.lastUpdateTs) this.lastUpdateTs = now;
      this.timeAliveMs += deltaMs;

      // Combo decay
      if (this.comboTimerMs > 0) {
        this.comboTimerMs -= deltaMs;
        if (this.comboTimerMs <= 0) {
          this.comboTimerMs = 0;
          this.comboCount = 0;
          this.comboMultiplier = 1;
        }
      }

      // Performance window maintenance
      if (now - this.windowStartTs >= this.windowLengthMs) {
        this.killsInWindow = 0;
        this.damageInWindow = 0;
        this.windowStartTs = now;
      }

      // Baseline difficulty increases with time
      const minutes = this.timeAliveMs / 60000;
      const timeCurve = clamp(1 + minutes * 1.2, 1, this.maxDifficulty); // +1.2 difficulty per minute

      // Player performance proxy: high combo and low damage => increase target; heavy damage => decrease
      const comboFactor = clamp(1 + (this.comboMultiplier - 1) * 0.15, 1, 2.5);
      const damageFactor = clamp(1 - this.damageInWindow / 150, 0.6, 1.0);

      // New target difficulty
      const desired = clamp(timeCurve * comboFactor * damageFactor, 1, this.maxDifficulty);

      // State machine: encourage peaks and recovery
      const prev = this.targetDifficulty;
      this.targetDifficulty = lerp(prev, desired, 0.08); // ease towards desired

      const diffDelta = this.targetDifficulty - this.difficulty;
      this.difficulty = lerp(this.difficulty, this.targetDifficulty, 0.12);

      // Director state classification
      if (diffDelta > 0.05 && this.difficulty > 3) this.directorState = 'BUILDUP';
      if (diffDelta < -0.05) this.directorState = 'RECOVERY';
      if (this.difficulty >= 6.5) this.directorState = 'PEAK';
      if (this.difficulty < 3 && Math.abs(diffDelta) <= 0.05) this.directorState = 'CALM';

      this.lastUpdateTs = now;
    },

    render(ctx, gameState, canvas) {
      if (!this.initialized || !ctx || !canvas) return;

      // HUD container top-center
      const margin = 10;
      const width = 320;
      const height = 70;
      const x = (canvas.width - width) / 2;
      const y = margin;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.9;

      // Background
      ctx.fillStyle = 'rgba(10,10,20,0.65)';
      ctx.roundRect ? ctx.roundRect(x, y, width, height, 10) : ctx.fillRect(x, y, width, height);
      if (!ctx.roundRect) {ctx.fill();} else {ctx.fill();}

      // Title and time
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('ENDLESS', x + 12, y + 18);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#A0B3FF';
      ctx.fillText(`Time ${FORMAT.time(this.timeAliveMs)}`, x + 12, y + 36);

      // Difficulty bar
      const diffNorm = this.difficulty / this.maxDifficulty;
      const barX = x + 12;
      const barY = y + 44;
      const barW = width - 24;
      const barH = 10;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(barX, barY, barW, barH);
      const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
      grad.addColorStop(0, '#00D1FF');
      grad.addColorStop(0.5, '#7CFFB2');
      grad.addColorStop(1, '#FFD15C');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, Math.floor(barW * diffNorm), barH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`Diff ${this.difficulty.toFixed(1)} (${this.directorState})`, x + width - 12, y + 36);

      // Combo display right side
      const comboText = `${this.comboMultiplier}x Combo`;
      ctx.textAlign = 'left';
      ctx.fillStyle = this.comboMultiplier > 1 ? '#FFD700' : '#CCCCCC';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(comboText, x + 12, y + 62);

      // Combo timer bar under combo text
      if (this.comboMultiplier > 1 && this.comboDecayMs > 0) {
        const tNorm = clamp(this.comboTimerMs / this.comboDecayMs, 0, 1);
        const tW = Math.floor((width - 120) * tNorm);
        ctx.fillStyle = 'rgba(255,215,0,0.25)';
        ctx.fillRect(x + 110, y + 54, width - 122, 8);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 110, y + 54, tW, 8);
      }

      ctx.restore();
    }
  };

  // Polyfill for roundRect if needed
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const radius = typeof r === 'number' ? { tl: r, tr: r, br: r, bl: r } : r || { tl: 0, tr: 0, br: 0, bl: 0 };
      this.beginPath();
      this.moveTo(x + radius.tl, y);
      this.lineTo(x + w - radius.tr, y);
      this.quadraticCurveTo(x + w, y, x + w, y + radius.tr);
      this.lineTo(x + w, y + h - radius.br);
      this.quadraticCurveTo(x + w, y + h, x + w - radius.br, y + h);
      this.lineTo(x + radius.bl, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - radius.bl);
      this.lineTo(x, y + radius.tl);
      this.quadraticCurveTo(x, y, x + radius.tl, y);
      this.closePath();
      return this;
    };
  }

  // Expose globally
  window.EndlessDirector = EndlessDirector;
})();