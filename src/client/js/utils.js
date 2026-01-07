// Utility functions
const Utils = {
  // Calculate distance between two points
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Clamp value between min and max
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  // Linear interpolation
  lerp(start, end, t) {
    return start + (end - start) * t;
  },

  // Random number between min and max
  random(min, max) {
    return Math.random() * (max - min) + min;
  },

  // Random integer between min and max (inclusive)
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

window.Utils = Utils;