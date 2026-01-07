// MapRenderer: Render created map ground tiles and buildings during gameplay
(function () {
  const TILE_WIDTH = 120;
  const TILE_STEP_Y = 30; // vertical step in grid coords
  const TILE_DRAW_HEIGHT = 70; // actual draw height of ground image

  // Map ground_X.png to actual file names in /assets/tank/Grounds/
  const GROUND_FILE_MAP = {
    'ground_0': 'water',
    'ground_1': 'water',
    'ground_2': 'BrownCobblestone',
    'ground_3': 'BrownGrass',
    'ground_4': 'Sand',
    'ground_5': 'LightSand',
    'ground_6': 'GrayGround',
    'ground_7': 'LightGreyGround',
    'ground_8': 'WoodenPlanks',
    'ground_9': 'WoodenTile',
    'ground_10': 'RedCobblestone',
    'ground_11': 'PurpleCobblestone',
    'ground_12': 'GreenGrass',
    'ground_13': 'GreenGrass',
    'ground_14': 'YellowGrass',
    'ground_15': 'LightGreyCobblestone',
    'ground_16': 'LightBrownCobblestone',
    'ground_17': 'GoldenCobblestone',
    'ground_18': 'Goldcobblestone'
  };

  // Migrate old paths to correct /assets/tank/Grounds/ paths
  function migrateGroundPath(path) {
    if (!path || typeof path !== 'string') return path;

    // Convert _Group_.png -> water.png
    if (path.includes('_Group_.png')) {
      return '/assets/tank/Grounds/water.png';
    }
    // Convert _Group_ (X).png -> appropriate ground file
    const groupMatch = path.match(/_Group_\s*\((\d+)\)\.png/);
    if (groupMatch) {
      const groundName = GROUND_FILE_MAP[`ground_${groupMatch[1]}`] || 'GreenGrass';
      return `/assets/tank/Grounds/${groundName}.png`;
    }

    // Convert ground_X.png paths to actual file names
    const groundMatch = path.match(/ground_(\d+)\.png/);
    if (groundMatch) {
      const groundName = GROUND_FILE_MAP[`ground_${groundMatch[1]}`] || 'GreenGrass';
      return `/assets/tank/Grounds/${groundName}.png`;
    }

    // Fix paths that don't have the full /assets/tank/Grounds/ prefix
    if (path.includes('Grounds/') && !path.startsWith('/assets/tank/')) {
      return path.replace(/.*Grounds\//, '/assets/tank/Grounds/');
    }

    return path;
  }

  // Migrate all saved maps in localStorage to use correct ground paths
  function migrateAllSavedMaps() {
    try {
      const mapsStr = localStorage.getItem('thefortz.customMaps');
      if (!mapsStr) return;

      let maps = JSON.parse(mapsStr);
      let changed = false;

      maps.forEach((map) => {
        if (Array.isArray(map.groundTiles)) {
          map.groundTiles.forEach((tile) => {
            if (tile && tile.image) {
              // Check for old paths that need migration
              const needsMigration = tile.image.includes('_Group_') ||
              tile.image.match(/ground_\d+\.png/) ||
              tile.image.includes('Grounds/') && !tile.image.startsWith('/assets/tank/');
              if (needsMigration) {
                tile.image = migrateGroundPath(tile.image);
                changed = true;
              }
            }
          });
        }
      });

      if (changed) {
        localStorage.setItem('thefortz.customMaps', JSON.stringify(maps));
        console.log('[MapRenderer] Migrated saved maps to correct ground paths');
      }
    } catch (e) {
      console.warn('[MapRenderer] Failed to migrate saved maps:', e);
    }
  }

  // Run migration on load
  migrateAllSavedMaps();

  const MapRenderer = {
    initialized: false,
    currentMap: null,
    currentMapId: null,
    groundCache: new Map(), // key (type or image) -> HTMLImageElement
    objectImages: new Map(), // imageUrl -> HTMLImageElement

    init() {
      if (this.initialized) return;
      this.initialized = true;
      // Load most played map (fallback to newest) from localStorage
      try {
        const allMaps = this._getSavedMaps();
        // Filter out default Battle Arena - only use player-created maps
        const maps = allMaps.filter((m) => m.isUserCreated !== false && m.name !== 'Battle Arena');

        if (maps && maps.length > 0) {
          const best = this._chooseMostPlayedOrNewest(maps);
          this.loadMap(best);
          console.log('[MapRenderer] Loaded player-created map:', best.name || best.id);
        } else {
          console.log('[MapRenderer] No player-created maps found. Please create a map in Create Map section.');
        }
      } catch (err) {
        console.warn('[MapRenderer] Failed reading localStorage', err);
      }
    },

    loadMap(mapData) {
      if (!mapData) return;
      this.currentMap = mapData;
      this.currentMapId = mapData && mapData.id ? String(mapData.id) : null;

      // Migrate old ground tile paths
      if (Array.isArray(this.currentMap.groundTiles)) {
        this.currentMap.groundTiles.forEach((t) => {
          if (t && t.image) {
            t.image = migrateGroundPath(t.image);
          }
        });
      }

      // Preload ground textures (using tile.image when available)
      this.groundCache.clear();
      if (Array.isArray(this.currentMap.groundTiles)) {
        this.currentMap.groundTiles.forEach((t) => {
          if (!t) return;
          const key = t.type || t.image;
          let imgUrl = t.image || this.typeToUrl(t.type);
          imgUrl = migrateGroundPath(imgUrl);
          if (key && imgUrl && !this.groundCache.has(key)) {
            const img = new Image();
            img.src = imgUrl;
            this.groundCache.set(key, img);
          }
        });
      }

      // Preload object images
      this.objectImages.clear();
      if (Array.isArray(this.currentMap.objects)) {
        this.currentMap.objects.forEach((o) => {
          if (!o || !o.image || typeof o.image !== 'string') return;
          if (!this.objectImages.has(o.image)) {
            const img = new Image();
            img.src = o.image;
            this.objectImages.set(o.image, img);
          }
        });
      }
    },

    typeToUrl(type) {
      // Map ground types to their image URLs in /assets/tank/Grounds/
      const typeMap = {
        'water': '/assets/tank/Grounds/water.png',
        'waterblue': '/assets/tank/Grounds/WaterBlue.png',
        'BlueGrass': '/assets/tank/Grounds/BlueGrass.png',
        'bluegrass': '/assets/tank/Grounds/BlueGrass.png',
        'BrownCobblestone': '/assets/tank/Grounds/BrownCobblestone.png',
        'BrownGrass': '/assets/tank/Grounds/BrownGrass.png',
        'Goldcobblestone': '/assets/tank/Grounds/Goldcobblestone.png',
        'GoldenCobblestone': '/assets/tank/Grounds/GoldenCobblestone.png',
        'GrayGround': '/assets/tank/Grounds/GrayGround.png',
        'GreenGrass': '/assets/tank/Grounds/GreenGrass.png',
        'GreyCobblestone': '/assets/tank/Grounds/Grey Cobblestone.png',
        'LightBrownCobblestone': '/assets/tank/Grounds/LightBrownCobblestone.png',
        'LightGreyCobblestone': '/assets/tank/Grounds/LightGreyCobblestone.png',
        'LightGreyGround': '/assets/tank/Grounds/LightGreyGround.png',
        'LightSand': '/assets/tank/Grounds/LightSand.png',
        'PurpleCobblestone': '/assets/tank/Grounds/PurpleCobblestone.png',
        'RedCobblestone': '/assets/tank/Grounds/RedCobblestone.png',
        'Sand': '/assets/tank/Grounds/Sand.png',
        'WoodenPlanks': '/assets/tank/Grounds/WoodenPlanks.png',
        'WoodenTile': '/assets/tank/Grounds/WoodenTile.png',
        'YellowGrass': '/assets/tank/Grounds/YellowGrass.png',
        // Legacy mappings for old saved maps (ground1-18 types)
        'tank/Grounds/water.png': '/assets/tank/Grounds/water.png',
        'tank/Grounds/Sand.png': '/assets/tank/Grounds/Sand.png',
        'ground0': '/assets/tank/Grounds/water.png',
        'ground1': '/assets/tank/Grounds/water.png',
        'ground2': '/assets/tank/Grounds/BrownCobblestone.png',
        'ground3': '/assets/tank/Grounds/BrownGrass.png',
        'ground4': '/assets/tank/Grounds/Sand.png',
        'ground5': '/assets/tank/Grounds/LightSand.png',
        'ground6': '/assets/tank/Grounds/GrayGround.png',
        'ground7': '/assets/tank/Grounds/LightGreyGround.png',
        'ground8': '/assets/tank/Grounds/WoodenPlanks.png',
        'ground9': '/assets/tank/Grounds/WoodenTile.png',
        'ground10': '/assets/tank/Grounds/RedCobblestone.png',
        'ground11': '/assets/tank/Grounds/PurpleCobblestone.png',
        'ground12': '/assets/tank/Grounds/GreenGrass.png',
        'ground13': '/assets/tank/Grounds/GreenGrass.png',
        'ground14': '/assets/tank/Grounds/YellowGrass.png',
        'ground15': '/assets/tank/Grounds/LightGreyCobblestone.png',
        'ground16': '/assets/tank/Grounds/LightBrownCobblestone.png',
        'ground17': '/assets/tank/Grounds/GoldenCobblestone.png',
        'ground18': '/assets/tank/Grounds/Goldcobblestone.png'
      };

      // Return mapped URL or fallback to GreenGrass
      return typeMap[type] || '/assets/tank/Grounds/GreenGrass.png';
    },

    render(ctx, gameState, canvas) {
      if (!this.currentMap || !ctx || !gameState || !canvas) {
        return;
      }

      // ONLY render user-created map tiles - NO default backgrounds
      // The map creator saves all ground tiles, so we just render those
      const tiles = Array.isArray(this.currentMap.groundTiles) ? this.currentMap.groundTiles : [];

      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        if (!tile || !tile.key) continue;
        const [colStr, rowStr] = tile.key.split(',');
        const col = parseInt(colStr, 10);
        const row = parseInt(rowStr, 10);
        if (!Number.isFinite(col) || !Number.isFinite(row)) continue;

        // compute placement used by creator - EXACT same formula as map creator
        const isoX = col * TILE_WIDTH + row % 2 * (TILE_WIDTH / 2);
        const isoY = row * TILE_STEP_Y;

        // Use tile.image if available, otherwise fall back to type (migrate old paths)
        let imageUrl = tile.image || this.typeToUrl(tile.type);
        imageUrl = migrateGroundPath(imageUrl);
        const cacheKey = imageUrl || tile.type;

        let img = this.groundCache.get(cacheKey);
        if (!img && imageUrl) {
          img = new Image();
          img.src = imageUrl;
          img.onload = () => {
            console.log('✅ Loaded custom ground tile:', cacheKey);
          };
          img.onerror = () => {
            console.warn('❌ Failed to load ground tile:', imageUrl);
          };
          this.groundCache.set(cacheKey, img);
        }

        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, isoX, isoY, TILE_WIDTH, TILE_DRAW_HEIGHT);
        }
      }

      // Render buildings/objects from the clicked map at EXACT positions they were placed
      const objs = Array.isArray(this.currentMap.objects) ? this.currentMap.objects : [];

      for (let i = 0; i < objs.length; i++) {
        const obj = objs[i];
        if (!obj || typeof obj.x !== 'number' || typeof obj.y !== 'number') continue;
        if (!obj.image || typeof obj.image !== 'string') continue; // Skip objects without valid image

        let img = this.objectImages.get(obj.image);
        if (!img) {
          img = new Image();
          img.src = obj.image;
          img.onload = () => {
            console.log('✅ Loaded building:', obj.image);
          };
          img.onerror = () => {
            console.warn('❌ Failed to load building:', obj.image);
          };
          this.objectImages.set(obj.image, img);
        }

        if (img && img.complete && img.naturalWidth > 0) {
          const scale = obj.scale || 1;
          const w = img.naturalWidth * scale;
          const h = img.naturalHeight * scale;
          // Draw at EXACT position from map creator with proper scaling
          ctx.drawImage(img, obj.x - w / 2, obj.y - h / 2, w, h);
        } else {
          // Draw placeholder while loading
          ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
          ctx.fillRect(obj.x - 40, obj.y - 40, 80, 80);
        }
      }
    },

    renderLobbyPreview(ctx, canvas) {
      if (!this.currentMap || !ctx || !canvas) return;

      // Clear canvas
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const tiles = Array.isArray(this.currentMap.groundTiles) ? this.currentMap.groundTiles : [];
      if (tiles.length === 0) {
        ctx.restore();
        return;
      }

      // Calculate map bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      tiles.forEach((t) => {
        if (!t || !t.key) return;
        const [cStr, rStr] = t.key.split(',');
        const c = parseInt(cStr, 10);
        const r = parseInt(rStr, 10);
        if (!Number.isFinite(c) || !Number.isFinite(r)) return;
        const x = c * TILE_WIDTH + r % 2 * (TILE_WIDTH / 2);
        const y = r * TILE_STEP_Y;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + TILE_WIDTH);
        maxY = Math.max(maxY, y + TILE_DRAW_HEIGHT);
      });

      const mapW = Math.max(1, maxX - minX);
      const mapH = Math.max(1, maxY - minY);
      const mapCenterX = (minX + maxX) / 2;
      const mapCenterY = (minY + maxY) / 2;

      // Simple camera animation - smooth movement only
      const time = Date.now() * 0.00025; // Much slower animation (2x slower)
      const moveRange = Math.min(mapW, mapH) * 0.1; // Small movement range
      const cameraX = mapCenterX + Math.sin(time) * moveRange;
      const cameraY = mapCenterY + Math.cos(time * 0.8) * moveRange * 0.6;

      // Much higher zoom level (4x game zoom for close-up view)
      const baseScale = Math.min(canvas.width / mapW, canvas.height / mapH) * 4.0;
      
      // Calculate view offset
      const viewX = canvas.width / 2 - cameraX * baseScale;
      const viewY = canvas.height / 2 - cameraY * baseScale;

      // Simple background
      ctx.fillStyle = 'rgba(15, 20, 15, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw tiles efficiently
      tiles.forEach((t) => {
        const [cStr, rStr] = (t.key || '').split(',');
        const c = parseInt(cStr, 10);
        const r = parseInt(rStr, 10);
        if (!Number.isFinite(c) || !Number.isFinite(r)) return;
        
        const tileX = c * TILE_WIDTH + r % 2 * (TILE_WIDTH / 2);
        const tileY = r * TILE_STEP_Y;
        const screenX = tileX * baseScale + viewX;
        const screenY = tileY * baseScale + viewY;
        
        // Skip tiles outside view
        const tileSize = TILE_WIDTH * baseScale;
        if (screenX + tileSize < 0 || screenX > canvas.width || 
            screenY + tileSize < 0 || screenY > canvas.height) return;

        const key = t.type || t.image;
        let img = this.groundCache.get(key);
        if (!img && t.image) {
          img = new Image();
          img.src = t.image;
          this.groundCache.set(key, img);
        }
        
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, screenX, screenY, 
            TILE_WIDTH * baseScale, TILE_DRAW_HEIGHT * baseScale);
        }
      });

      // Draw objects
      const objs = Array.isArray(this.currentMap.objects) ? this.currentMap.objects : [];
      objs.forEach((o) => {
        if (!o || !o.image || typeof o.image !== 'string') return;
        
        const objScreenX = o.x * baseScale + viewX;
        const objScreenY = o.y * baseScale + viewY;
        
        let img = this.objectImages.get(o.image);
        if (!img) {
          img = new Image();
          img.src = o.image;
          this.objectImages.set(o.image, img);
        }
        
        if (img && img.complete && img.naturalWidth > 0) {
          const objScale = (o.scale || 1) * baseScale * 0.8;
          const w = img.naturalWidth * objScale;
          const h = img.naturalHeight * objScale;
          
          ctx.drawImage(img, objScreenX - w / 2, objScreenY - h / 2, w, h);
        }
      });

      // Simple vignette
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.4,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();
    },

    loadMap(mapData, callback) {
      if (!mapData) {
        console.warn('⚠️ No map data provided to loadMap');
        if (callback) callback();
        return;
      }

      console.log('🗺️ MapRenderer.loadMap:', mapData.name);
      console.log('   - Ground tiles:', mapData.groundTiles?.length || 0);
      console.log('   - Objects:', mapData.objects?.length || 0);

      // Store the complete map data
      this.currentMap = mapData;
      this.currentMapId = mapData.id ? String(mapData.id) : null;

      // Migrate old ground tile paths
      if (Array.isArray(mapData.groundTiles)) {
        mapData.groundTiles.forEach((t) => {
          if (t && t.image) {
            t.image = migrateGroundPath(t.image);
          }
        });
      }

      // Start loading ground images in background (non-blocking)
      this.groundCache.clear();
      if (Array.isArray(mapData.groundTiles)) {
        mapData.groundTiles.forEach((t) => {
          if (!t) return;
          let imgUrl = t.image || this.typeToUrl(t.type);
          imgUrl = migrateGroundPath(imgUrl);
          const key = imgUrl || t.type;
          if (key && imgUrl && !this.groundCache.has(key)) {
            const img = new Image();
            img.src = imgUrl;
            this.groundCache.set(key, img);
          }
        });
      }

      // Start loading building images in background (non-blocking)
      this.objectImages.clear();
      if (Array.isArray(mapData.objects)) {
        mapData.objects.forEach((o) => {
          if (!o || !o.image || typeof o.image !== 'string') return;
          if (!this.objectImages.has(o.image)) {
            const img = new Image();
            img.src = o.image;
            this.objectImages.set(o.image, img);
          }
        });
      }

      console.log('✅ Map loaded instantly (images loading in background):', mapData.name);

      // Call callback immediately - don't wait for images
      if (callback) callback();
    },

    loadById(mapId) {
      const m = this._findMapById(mapId);
      if (m) this.loadMap(m);
    },

    // Helpers
    _getSavedMaps() {
      try {return JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');} catch {return [];}
    },
    _getPlayCounts() {
      try {return JSON.parse(localStorage.getItem('thefortz.mapPlays') || '{}');} catch {return {};}
    },
    _setPlayCounts(obj) {localStorage.setItem('thefortz.mapPlays', JSON.stringify(obj || {}));},
    _chooseMostPlayedOrNewest(maps) {
      const plays = this._getPlayCounts();
      let best = null;let bestPlays = -1;
      maps.forEach((m) => {
        const id = String(m.id || '');
        const p = plays[id] || 0;
        if (p > bestPlays) {bestPlays = p;best = m;}
      });
      if (!best) {
        best = maps.slice().sort((a, b) => new Date(b.created) - new Date(a.created))[0];
      }
      return best;
    },
    _findMapById(id) {
      const maps = this._getSavedMaps();
      return maps.find((m) => String(m.id) === String(id));
    },

    // Draw animated water tile with effects like in the map creator
    drawAnimatedWaterTile(ctx, x, y, width, height) {
      // Isometric diamond points
      const top = { x: x + width / 2, y: y };
      const right = { x: x + width, y: y + height / 2 };
      const bottom = { x: x + width / 2, y: y + height };
      const left = { x: x, y: y + height / 2 };

      // Animated water gradient with time-based shimmer
      const time = Date.now() * 0.001; // Slow animation
      const shimmer = Math.sin(time + x * 0.01 + y * 0.01) * 0.1 + 0.9;

      const gradient = ctx.createLinearGradient(left.x, top.y, right.x, bottom.y);
      gradient.addColorStop(0, `rgba(42, 106, 154, ${shimmer})`); // Lighter blue with shimmer
      gradient.addColorStop(0.3, `rgba(26, 80, 128, ${shimmer * 0.9})`); // Medium blue
      gradient.addColorStop(0.7, `rgba(10, 58, 96, ${shimmer * 0.8})`); // Darker blue
      gradient.addColorStop(1, `rgba(5, 40, 64, ${shimmer * 0.7})`); // Deep dark blue

      // Draw the water diamond
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(right.x, right.y);
      ctx.lineTo(bottom.x, bottom.y);
      ctx.lineTo(left.x, left.y);
      ctx.closePath();
      ctx.fill();

      // Animated border with subtle wave effect
      const waveOffset = Math.sin(time * 2 + x * 0.02) * 0.5;
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.4 + waveOffset * 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Animated highlight on top-left edge (sun reflection)
      const reflectionIntensity = Math.sin(time * 1.5 + x * 0.015) * 0.2 + 0.3;
      ctx.strokeStyle = `rgba(255, 255, 255, ${reflectionIntensity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(left.x, left.y);
      ctx.stroke();

      // Moving water shimmer effect
      const shimmerOffset = Math.sin(time * 3 + x * 0.03 + y * 0.02) * 2;
      ctx.strokeStyle = `rgba(150, 200, 255, ${0.2 + Math.abs(shimmerOffset) * 0.1})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(top.x + 2 + shimmerOffset, top.y + 2);
      ctx.lineTo(left.x + 4 + shimmerOffset, left.y);
      ctx.stroke();
    }
  };

  window.MapRenderer = MapRenderer;
})();