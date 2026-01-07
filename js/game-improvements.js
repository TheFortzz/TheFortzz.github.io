// Game Functionality Improvements

const GameImprovements = {
  // Delta time for smooth animations
  lastTime: 0,
  deltaTime: 0,

  // Input buffering for better responsiveness
  inputBuffer: [],
  maxBufferSize: 5,

  // Collision detection optimization
  spatialGrid: new Map(),
  gridCellSize: 200,

  // Network optimization
  lastNetworkUpdate: 0,
  networkUpdateRate: 33, // 30 updates per second

  // Smooth camera
  cameraSmoothing: 0.1,
  targetCamera: { x: 0, y: 0 },

  init() {
    console.log('✓ Game improvements initialized');
  },

  // Improved delta time calculation
  updateDeltaTime(currentTime) {
    this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Clamp delta time to prevent huge jumps
    this.deltaTime = Math.min(this.deltaTime, 0.1); // Max 100ms

    return this.deltaTime;
  },

  // Buffer input for better responsiveness
  bufferInput(input) {
    this.inputBuffer.push({
      ...input,
      timestamp: Date.now()
    });

    // Keep buffer size limited
    if (this.inputBuffer.length > this.maxBufferSize) {
      this.inputBuffer.shift();
    }
  },

  // Process buffered inputs
  processInputBuffer() {
    const now = Date.now();

    // Remove old inputs (older than 100ms)
    this.inputBuffer = this.inputBuffer.filter((input) =>
    now - input.timestamp < 100
    );

    return this.inputBuffer;
  },

  // Spatial grid for collision detection
  updateSpatialGrid(entities) {
    this.spatialGrid.clear();

    entities.forEach((entity) => {
      const cellX = Math.floor(entity.x / this.gridCellSize);
      const cellY = Math.floor(entity.y / this.gridCellSize);
      const key = `${cellX},${cellY}`;

      if (!this.spatialGrid.has(key)) {
        this.spatialGrid.set(key, []);
      }

      this.spatialGrid.get(key).push(entity);
    });
  },

  // Get nearby entities (much faster than checking all)
  getNearbyEntities(x, y, radius) {
    const nearby = [];
    const cellRadius = Math.ceil(radius / this.gridCellSize);
    const centerCellX = Math.floor(x / this.gridCellSize);
    const centerCellY = Math.floor(y / this.gridCellSize);

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerCellX + dx},${centerCellY + dy}`;
        const entities = this.spatialGrid.get(key);

        if (entities) {
          nearby.push(...entities);
        }
      }
    }

    return nearby;
  },

  // Smooth camera movement
  updateCamera(targetX, targetY, currentCamera) {
    this.targetCamera.x = targetX;
    this.targetCamera.y = targetY;

    // Lerp camera position
    currentCamera.x += (this.targetCamera.x - currentCamera.x) * this.cameraSmoothing;
    currentCamera.y += (this.targetCamera.y - currentCamera.y) * this.cameraSmoothing;

    return currentCamera;
  },

  // Network update throttling
  shouldSendNetworkUpdate(currentTime) {
    if (currentTime - this.lastNetworkUpdate >= this.networkUpdateRate) {
      this.lastNetworkUpdate = currentTime;
      return true;
    }
    return false;
  },

  // Interpolate between positions for smooth movement
  interpolate(start, end, alpha) {
    return start + (end - start) * alpha;
  },

  // Predict player position based on velocity
  predictPosition(player, deltaTime) {
    return {
      x: player.x + (player.vx || 0) * deltaTime,
      y: player.y + (player.vy || 0) * deltaTime
    };
  },

  // Check if entity is in viewport (for culling)
  isInViewport(entity, camera, canvas, padding = 100) {
    return (
      entity.x > camera.x - padding &&
      entity.x < camera.x + canvas.width + padding &&
      entity.y > camera.y - padding &&
      entity.y < camera.y + canvas.height + padding);

  },

  // Clamp value between min and max
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  // Distance between two points
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Check circle collision
  circleCollision(x1, y1, r1, x2, y2, r2) {
    const dist = this.distance(x1, y1, x2, y2);
    return dist < r1 + r2;
  },

  // Check rectangle collision
  rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (
      x1 < x2 + w2 &&
      x1 + w1 > x2 &&
      y1 < y2 + h2 &&
      y1 + h1 > y2);

  },

  // Angle between two points
  angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  // Normalize angle to -PI to PI
  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  },

  // Lerp angle (shortest path)
  lerpAngle(start, end, alpha) {
    const diff = this.normalizeAngle(end - start);
    return start + diff * alpha;
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GameImprovements.init());
} else {
  GameImprovements.init();
}

// Export
window.GameImprovements = GameImprovements;