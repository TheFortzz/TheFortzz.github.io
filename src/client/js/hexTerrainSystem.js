// Hexagon Terrain System - Pure JavaScript
// Handles loading and rendering textured hexagon ground tiles

const HexTerrainSystem = {
  // Terrain configuration
  hexSize: 60, // Radius of hexagon (must match game.js)
  hexWidth: 60 * Math.sqrt(3), // ~103.9
  hexHeight: 120, // 60 * 2
  vertSpacing: 90, // 120 * 0.75

  // Tileset images
  tilesetImage: null,
  tilesetLoaded: false,

  // Tileset configuration for "Hex Terrain 1 - 128x144.png" (no pink background!)
  tileset: {
    image: null,
    tileWidth: 128,
    tileHeight: 144,
    columns: 6,
    rows: 3,
    totalTiles: 18,
    // Tile indices for different terrain types (Hex Terrain 1 tileset - 6x3 grid)
    tiles: {
      mud: 0, // Brown mud
      darkMud: 1, // Dark brown mud
      darkGrass: 2, // Dark green grass
      snow: 3, // White snow/ice
      ice: 4, // Light blue ice
      lightIce: 5, // Lighter ice
      desert: 6, // Light desert sand
      sand: 7, // Light sand
      stone: 8, // Gray stone
      asphalt: 9, // Black asphalt/tar
      lava: 10, // Red/orange lava
      redLava: 11, // Brighter red lava
      grass: 12, // Light grass with patches
      forest: 13, // Dark green forest
      cobblestone: 14, // Stone cobbles
      water: 15, // Dark blue water
      lightWater: 16, // Light blue water
      brightWater: 17 // Bright cyan water
    }
  },

  // Terrain map - stores which tile to use for each hexagon position
  terrainMap: new Map(),

  // Initialize the terrain system
  init: function (mapWidth = 7500, mapHeight = 7500) {
    this.hexWidth = this.hexSize * Math.sqrt(3);
    this.hexHeight = this.hexSize * 2;
    this.vertSpacing = this.hexHeight * 0.75;

    // Load tileset image
    this.loadTileset();

    // Generate terrain map with proper dimensions
    this.generateTerrainMap(mapWidth, mapHeight);

    console.log('✓ Hex Terrain System initialized');
  },

  // Load the tileset image
  loadTileset: function () {
    this.tileset.image = new Image();
    this.tileset.image.onload = () => {
      this.tilesetLoaded = true;
      console.log('✓ Hexagon terrain tileset loaded successfully');

      // Re-render lobby background if we're in the lobby
      if (typeof gameState !== 'undefined' && gameState.isInLobby && typeof renderLobbyBackground === 'function') {
        renderLobbyBackground();
      }
    };
    this.tileset.image.onerror = () => {
      console.warn('Hexagon terrain tileset not found, using fallback rendering');
      this.tilesetLoaded = false;
      // Use fallback - the game will render without the texture
    };
    // Use the Hex Terrain 1 tileset (cyan background, no pink!)
    this.tileset.image.src = '/assets/images/terrain/hex-terrain-main.png';
  },

  // Generate terrain map with circular clustering zones
  generateTerrainMap: function (mapWidth, mapHeight) {
    const hexSize = 60;
    const hexWidth = hexSize * Math.sqrt(3);
    const hexHeight = hexSize * 2;
    const vertSpacing = hexHeight * 0.75;

    let hexCount = 0;

    // Map center for biome positioning
    const mapCenterX = mapWidth / 2;
    const mapCenterY = mapHeight / 2;

    // Enhanced biome zones positioned around map center
    const circularZones = [
    // Central grassland (visible in lobby center)
    { centerX: mapCenterX, centerY: mapCenterY, radius: 800, types: ['grass', 'grass', 'darkGrass'], priority: 1 },

    // Forest regions (4 major forests around center)
    { centerX: mapCenterX - 1200, centerY: mapCenterY - 1200, radius: 600, types: ['forest', 'darkGrass', 'grass'], priority: 2 },
    { centerX: mapCenterX + 1200, centerY: mapCenterY + 1200, radius: 550, types: ['forest', 'forest', 'darkGrass'], priority: 2 },
    { centerX: mapCenterX - 1500, centerY: mapCenterY + 1000, radius: 500, types: ['darkGrass', 'forest', 'grass'], priority: 2 },
    { centerX: mapCenterX + 1000, centerY: mapCenterY - 1500, radius: 450, types: ['forest', 'darkGrass'], priority: 2 },

    // Desert regions (3 desert zones)
    { centerX: mapCenterX + 1500, centerY: mapCenterY - 800, radius: 500, types: ['desert', 'sand', 'desert'], priority: 3 },
    { centerX: mapCenterX + 1800, centerY: mapCenterY + 400, radius: 400, types: ['sand', 'desert', 'stone'], priority: 3 },
    { centerX: mapCenterX - 1800, centerY: mapCenterY + 600, radius: 350, types: ['sand', 'desert'], priority: 3 },

    // Water bodies (strategic lakes and rivers)
    { centerX: mapCenterX - 1600, centerY: mapCenterY - 400, radius: 400, types: ['water', 'lightWater', 'brightWater'], priority: 4 },
    { centerX: mapCenterX + 1600, centerY: mapCenterY + 800, radius: 350, types: ['brightWater', 'lightWater', 'water'], priority: 4 },
    { centerX: mapCenterX - 600, centerY: mapCenterY + 1600, radius: 300, types: ['lightWater', 'water'], priority: 4 },

    // Arctic/Snow regions (2 frozen zones)
    { centerX: mapCenterX + 800, centerY: mapCenterY - 1800, radius: 450, types: ['snow', 'ice', 'lightIce'], priority: 5 },
    { centerX: mapCenterX - 800, centerY: mapCenterY - 1900, radius: 350, types: ['lightIce', 'snow', 'ice'], priority: 5 },

    // Rocky/Mountain areas (3 zones)
    { centerX: mapCenterX + 400, centerY: mapCenterY - 600, radius: 350, types: ['stone', 'cobblestone'], priority: 6 },
    { centerX: mapCenterX - 600, centerY: mapCenterY + 1000, radius: 300, types: ['cobblestone', 'stone', 'darkMud'], priority: 6 },
    { centerX: mapCenterX + 2000, centerY: mapCenterY + 1400, radius: 280, types: ['stone', 'asphalt'], priority: 6 },

    // Muddy swamp areas (3 swamps)
    { centerX: mapCenterX - 1000, centerY: mapCenterY + 200, radius: 350, types: ['mud', 'darkMud', 'darkGrass'], priority: 7 },
    { centerX: mapCenterX + 800, centerY: mapCenterY + 600, radius: 300, types: ['darkMud', 'mud'], priority: 7 },
    { centerX: mapCenterX - 400, centerY: mapCenterY - 1000, radius: 280, types: ['mud', 'darkGrass'], priority: 7 },

    // Urban/Industrial zones (2 small areas)
    { centerX: mapCenterX + 600, centerY: mapCenterY + 1200, radius: 250, types: ['asphalt', 'cobblestone'], priority: 8 },
    { centerX: mapCenterX - 2000, centerY: mapCenterY - 1200, radius: 200, types: ['cobblestone', 'asphalt'], priority: 8 },

    // Volcanic lava zones (2 dangerous HAZARD areas - clearly separated)
    { centerX: mapCenterX + 1800, centerY: mapCenterY - 1800, radius: 250, types: ['lava', 'redLava'], priority: 9 },
    { centerX: mapCenterX - 2200, centerY: mapCenterY + 1800, radius: 220, types: ['redLava', 'lava'], priority: 9 }];


    // Default terrain for areas outside zones - safe grass
    const defaultTerrain = 'grass';

    // Generate terrain with EXACT hexagon grid alignment
    for (let row = 0; row * vertSpacing < mapHeight; row++) {
      for (let col = 0; col * hexWidth < mapWidth; col++) {
        const y = row * vertSpacing;
        const offsetX = row % 2 === 0 ? 0 : hexWidth / 2;
        const x = col * hexWidth + offsetX;

        // Only create hexagons STRICTLY within boundaries
        if (x >= hexSize && x <= mapWidth - hexSize &&
        y >= hexSize && y <= mapHeight - hexSize) {

          const key = `${row},${col}`;

          // Find which zone this hex belongs to
          let selectedTerrain = defaultTerrain;
          let highestPriority = 0;
          let selectedDistance = Infinity;

          for (const zone of circularZones) {
            const dx = x - zone.centerX;
            const dy = y - zone.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < zone.radius) {
              if (zone.priority > highestPriority ||
              zone.priority === highestPriority && distance < selectedDistance) {
                highestPriority = zone.priority;
                selectedDistance = distance;

                const distanceRatio = distance / zone.radius;
                let typeIndex;

                // For lava zones (priority 9), use ONLY lava types in core
                if (zone.priority === 9) {
                  if (distanceRatio < 0.6) {
                    // Pure lava core - HAZARD
                    typeIndex = 0;
                  } else {
                    // Edge transition
                    typeIndex = Math.random() < 0.5 ? 0 : 1;
                  }
                } else {
                  // Normal biome variation
                  if (distanceRatio < 0.4) {
                    typeIndex = 0;
                  } else if (distanceRatio < 0.7) {
                    typeIndex = Math.floor(Math.random() * zone.types.length);
                  } else {
                    typeIndex = zone.types.length > 1 ?
                    Math.random() < 0.7 ? zone.types.length - 1 : 0 : 0;
                  }
                }

                selectedTerrain = zone.types[typeIndex];
              }
            }
          }

          this.terrainMap.set(key, selectedTerrain);
          hexCount++;
        }
      }
    }

    console.log(`✓ Generated terrain map with ${hexCount} hexagons in layered biome zones`);
  },

  // Draw a single textured hexagon with high-quality rendering
  drawTexturedHex: function (ctx, centerX, centerY, tileType) {
    if (!this.tilesetLoaded || !this.tileset.image) {
      this.drawHexOutline(ctx, centerX, centerY);
      return;
    }

    const tileIndex = this.tileset.tiles[tileType] || 0;

    // Calculate source position in tileset
    const srcCol = tileIndex % this.tileset.columns;
    const srcRow = Math.floor(tileIndex / this.tileset.columns);
    const srcX = srcCol * this.tileset.tileWidth;
    const srcY = srcRow * this.tileset.tileHeight;

    ctx.save();

    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Create EXACT hexagon clipping path
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i - Math.PI / 6;
      const x = centerX + this.hexSize * Math.cos(angle);
      const y = centerY + this.hexSize * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.clip();

    // Calculate scale to fit the SINGLE tile into the hexagon
    // Hexagon needs to fit within a circle of radius hexSize
    // The tileset tile dimensions are tileWidth x tileHeight
    const hexDiameter = this.hexSize * 2;
    const scaleX = hexDiameter / this.tileset.tileWidth;
    const scaleY = hexDiameter / this.tileset.tileHeight;
    const scale = Math.max(scaleX, scaleY) * 1.15; // 15% larger to ensure full coverage

    const drawWidth = this.tileset.tileWidth * scale;
    const drawHeight = this.tileset.tileHeight * scale;

    // Draw ONLY this specific tile from the tileset
    ctx.drawImage(
      this.tileset.image,
      srcX, srcY, // Source: specific tile position
      this.tileset.tileWidth, // Source: tile width
      this.tileset.tileHeight, // Source: tile height
      centerX - drawWidth / 2, // Dest: centered X
      centerY - drawHeight / 2, // Dest: centered Y
      drawWidth, // Dest: scaled width
      drawHeight // Dest: scaled height
    );

    ctx.restore();

    // Add visual indicator for HAZARD zones (lava)
    if (tileType === 'lava' || tileType === 'redLava') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i - Math.PI / 6;
        const x = centerX + (this.hexSize - 2) * Math.cos(angle);
        const y = centerY + (this.hexSize - 2) * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);else
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  },

  // Fallback: Draw hexagon outline (if textures not loaded)
  drawHexOutline: function (ctx, centerX, centerY) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i - Math.PI / 6;
      const x = centerX + this.hexSize * Math.cos(angle);
      const y = centerY + this.hexSize * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();
  },

  // Render all visible terrain hexagons
  render: function (ctx, camera, canvasWidth, canvasHeight, gameWidth = 7500, gameHeight = 7500) {
    const viewLeft = camera.x;
    const viewRight = camera.x + canvasWidth;
    const viewTop = camera.y;
    const viewBottom = camera.y + canvasHeight;

    // Calculate visible range
    const startRow = Math.max(0, Math.floor(viewTop / this.vertSpacing));
    const endRow = Math.ceil(viewBottom / this.vertSpacing);
    const startCol = Math.max(0, Math.floor(viewLeft / this.hexWidth));
    const endCol = Math.ceil(viewRight / this.hexWidth);

    // Draw all visible hexagons
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const y = row * this.vertSpacing;
        const offsetX = row % 2 === 0 ? 0 : this.hexWidth / 2;
        const x = col * this.hexWidth + offsetX;

        // Only draw if within game boundaries
        if (x >= this.hexSize && x <= gameWidth - this.hexSize &&
        y >= this.hexSize && y <= gameHeight - this.hexSize) {

          const key = `${row},${col}`;
          const tileType = this.terrainMap.get(key) || 'darkGrass';

          this.drawTexturedHex(ctx, x, y, tileType);
        }
      }
    }
  },

  // Render minimap terrain (small version)
  renderMinimap: function (minimapCtx, scale, minimapWidth, minimapHeight, gameWidth = 7500, gameHeight = 7500) {
    if (!this.tilesetLoaded || !this.tileset.image) {
      return; // Skip if not loaded
    }

    // Draw all hexagons on minimap (very small)
    for (let row = 0; row * this.vertSpacing < gameHeight; row++) {
      for (let col = 0; col * this.hexWidth < gameWidth; col++) {
        const y = row * this.vertSpacing;
        const offsetX = row % 2 === 0 ? 0 : this.hexWidth / 2;
        const x = col * this.hexWidth + offsetX;

        if (x >= this.hexSize && x <= gameWidth - this.hexSize &&
        y >= this.hexSize && y <= gameHeight - this.hexSize) {

          const key = `${row},${col}`;
          const tileType = this.terrainMap.get(key) || 'grass';
          const tileIndex = this.tileset.tiles[tileType] || 0;

          // Get tile color instead of rendering full texture (too small for minimap)
          const colors = this.getTileColor(tileType);

          // Draw simple colored hex on minimap
          const miniX = x * scale;
          const miniY = y * scale;
          const miniSize = this.hexSize * scale;

          minimapCtx.fillStyle = colors.fill;
          minimapCtx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i - Math.PI / 6;
            const hx = miniX + miniSize * Math.cos(angle);
            const hy = miniY + miniSize * Math.sin(angle);
            if (i === 0) minimapCtx.moveTo(hx, hy);else
            minimapCtx.lineTo(hx, hy);
          }
          minimapCtx.closePath();
          minimapCtx.fill();
        }
      }
    }
  },

  // Get simplified color for terrain type (for minimap)
  getTileColor: function (tileType) {
    const colorMap = {
      mud: { fill: '#5a4a3a' },
      darkMud: { fill: '#4a3a2a' },
      darkGrass: { fill: '#2d5016' },
      snow: { fill: '#f0f8ff' },
      ice: { fill: '#b0e0e6' },
      lightIce: { fill: '#e0f4ff' },
      desert: { fill: '#e4c990' },
      sand: { fill: '#d4a76a' },
      stone: { fill: '#808080' },
      asphalt: { fill: '#3a3a3a' },
      lava: { fill: '#ff4500' },
      redLava: { fill: '#ff6347' },
      grass: { fill: '#7cbc4a' },
      forest: { fill: '#228b22' },
      cobblestone: { fill: '#a9a9a9' },
      water: { fill: '#1e90ff' },
      lightWater: { fill: '#4da6ff' },
      brightWater: { fill: '#00bfff' }
    };
    return colorMap[tileType] || { fill: '#7cbc4a' };
  }
};

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    HexTerrainSystem.init();
  });
}