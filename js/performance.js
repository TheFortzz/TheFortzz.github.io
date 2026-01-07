// Performance optimization utilities

const PerformanceOptimizer = {
  // Cache for rendered elements
  cache: new Map(),

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Request animation frame with FPS limit
  requestAnimationFrameThrottled(callback, fps = 30) {
    const interval = 1000 / fps;
    let lastTime = 0;

    const throttledCallback = (currentTime) => {
      if (currentTime - lastTime >= interval) {
        lastTime = currentTime;
        callback(currentTime);
      }
    };

    return throttledCallback;
  },

  // Offscreen canvas for caching
  createOffscreenCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  },

  // Cache rendered content
  cacheRender(key, renderFunc, width, height) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const canvas = this.createOffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    renderFunc(ctx);

    this.cache.set(key, canvas);
    return canvas;
  },

  // Clear cache
  clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  },

  // Batch DOM updates
  batchDOMUpdates(updates) {
    requestAnimationFrame(() => {
      updates.forEach((update) => update());
    });
  },

  // Lazy load images
  lazyLoadImage(src, callback) {
    const img = new Image();
    img.onload = () => callback(img);
    img.onerror = () => callback(null);
    img.src = src;
  },

  // Object pooling for particles
  createObjectPool(createFunc, initialSize = 100) {
    const pool = [];
    const active = [];

    // Pre-create objects
    for (let i = 0; i < initialSize; i++) {
      pool.push(createFunc());
    }

    return {
      get() {
        const obj = pool.length > 0 ? pool.pop() : createFunc();
        active.push(obj);
        return obj;
      },
      release(obj) {
        const index = active.indexOf(obj);
        if (index > -1) {
          active.splice(index, 1);
          pool.push(obj);
        }
      },
      clear() {
        pool.length = 0;
        active.length = 0;
      }
    };
  },

  // Measure performance
  measurePerformance(name, func) {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  },

  // FPS counter
  createFPSCounter() {
    let frames = 0;
    let lastTime = performance.now();
    let fps = 60;

    return {
      update() {
        frames++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
          fps = Math.round(frames * 1000 / (currentTime - lastTime));
          frames = 0;
          lastTime = currentTime;
        }
        return fps;
      },
      getFPS() {
        return fps;
      }
    };
  }
};

// Export for use in other modules
window.PerformanceOptimizer = PerformanceOptimizer;