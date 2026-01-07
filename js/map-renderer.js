// Map Renderer System - Renders user-created maps as playable battlefields
class MapRenderer {
  constructor() {
    this.currentMap = null;
    this.groundTiles = new Map();
    this.buildings = [];
    this.groundImages = new Map();
    this.buildingImages = new Map(); // Changed from buildingAssets to buildingImages for consistency
    this.isLoaded = false;
    this.loadingProgress = 0;

    this.settings = {
      tileSize: 120,
      tileHeight: 30,
      mapRadius: 2500,
      enableCollisions: true,
      renderDistance: 1000
    };

    this.initialize();
  }

  initialize() {
    this.preloadAssets();
    console.log('🗺️ Map Renderer System initialized');
  }

  async preloadAssets() {
    // Preload ground textures with descriptive names
    const groundTextures = [
    { type: 'water', file: 'water.png' },
    { type: 'waterblue', file: 'WaterBlue.png' },
    { type: 'bluegrass', file: 'BlueGrass.png' },
    { type: 'BrownCobblestone', file: 'BrownCobblestone.png' },
    { type: 'BrownGrass', file: 'BrownGrass.png' },
    { type: 'Goldcobblestone', file: 'Goldcobblestone.png' },
    { type: 'GoldenCobblestone', file: 'GoldenCobblestone.png' },
    { type: 'GrayGround', file: 'GrayGround.png' },
    { type: 'GreenGrass', file: 'GreenGrass.png' },
    { type: 'GreyCobblestone', file: 'Grey Cobblestone.png' },
    { type: 'LightBrownCobblestone', file: 'LightBrownCobblestone.png' },
    { type: 'LightGreyCobblestone', file: 'LightGreyCobblestone.png' },
    { type: 'LightGreyGround', file: 'LightGreyGround.png' },
    { type: 'LightSand', file: 'LightSand.png' },
    { type: 'PurpleCobblestone', file: 'PurpleCobblestone.png' },
    { type: 'RedCobblestone', file: 'RedCobblestone.png' },
    { type: 'Sand', file: 'Sand.png' },
    { type: 'WoodenPlanks', file: 'WoodenPlanks.png' },
    { type: 'WoodenTile', file: 'WoodenTile.png' },
    { type: 'YellowGrass', file: 'YellowGrass.png' }];


    const groundPromises = groundTextures.map(async (ground) => {
      try {
        const img = new Image();
        img.src = `/assets/tank/Grounds/${ground.file}`;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        this.groundImages.set(ground.type, img);
      } catch (error) {
        console.warn(`Failed to load ground texture ${ground.type}:`, error);
        // Create fallback colored rectangle
        this.groundImages.set(ground.type, this.createFallbackGroundTexture(ground.type));
      }
    });

    // Preload building images
    const buildingTypes = [
    'cart', 'farm_house_01', 'farm_house_02', 'farm_house_field',
    'guard_tower', 'house_01', 'house_02', 'inn', 'shop_01', 'shop_02',
    'stall_01', 'stall_02', 'trees', 'windmill'];


    const buildingPromises = buildingTypes.map(async (buildingType) => {
      try {
        const img = new Image();

        // Map building types to their actual folder names and file patterns
        const buildingPathMap = {
          'cart': 'Cart/spr_top_down_view_cart_front',
          'farm_house_01': 'Farm_House_01/spr_top_down_view_farm_house_01_front',
          'farm_house_02': 'Farm_House_02/spr_top_down_view_farm_house_02_front',
          'farm_house_field': 'Farm_House_With_CropFiled/spr_top_down_view_farm_field_front',
          'guard_tower': 'Guard_Tower/spr_top_down_view_guard_tower_front',
          'house_01': 'House_01/spr_top_down_view_house_01_front',
          'house_02': 'House_02/spr_top_down_view_house_02_front',
          'inn': 'Inn/spr_top_down_view_inn_front',
          'shop_01': 'Shop_01/spr_top_down_view_shop_01_front',
          'shop_02': 'Shop_02/spr_top_down_view_shop_02_front',
          'stall_01': 'Stall_01/spr_top_down_view_stall_01_front',
          'stall_02': 'Stall_02/spr_top_down_view_stall_02_front',
          'trees': 'Tree/spr_top_down_view_trees_front',
          'windmill': 'Wind_Mill/spr_top_down_view_windmill_front'
        };

        // Try different possible paths for buildings
        const possiblePaths = [
        `/assets/tank/Buildings/${buildingPathMap[buildingType]}.png`,
        `/assets/tank/Buildings/${buildingType}.png`,
        `/assets/tank/Buildings/${buildingType}/${buildingType}.png`,
        `/assets/images/buildings/${buildingType}.png`];


        let loaded = false;
        for (const path of possiblePaths) {
          try {
            img.src = path;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            loaded = true;
            break;
          } catch (e) {
            continue;
          }
        }

        if (loaded) {
          this.buildingImages.set(buildingType, img);
        } else {
          throw new Error('No valid path found');
        }
      } catch (error) {
        console.warn(`Failed to load building ${buildingType}:`, error);
        // Create fallback building sprite
        this.buildingImages.set(buildingType, this.createFallbackBuildingSprite(buildingType));
      }
    });

    await Promise.all([...groundPromises, ...buildingPromises]);
    console.log('✅ Map assets preloaded');
  }

  createFallbackGroundTexture(groundType) {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    // Different colors for different ground types
    const colors = {
      ground1: '#8FBC8F', ground2: '#9ACD32', ground3: '#228B22',
      ground4: '#32CD32', ground5: '#7CFC00', ground6: '#ADFF2F',
      ground7: '#98FB98', ground8: '#90EE90', ground9: '#00FF7F',
      ground10: '#00FA9A', ground11: '#40E0D0', ground12: '#48D1CC',
      ground13: '#DEB887', ground14: '#D2B48C', ground15: '#BC8F8F',
      ground16: '#F4A460', ground17: '#CD853F', ground18: '#A0522D'
    };

    ctx.fillStyle = colors[groundType] || '#8FBC8F';
    ctx.fillRect(0, 0, 120, 120);

    // Add some texture pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(Math.random() * 120, Math.random() * 120, 2, 2);
    }

    return canvas;
  }

  createFallbackBuildingSprite(buildingType) {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    // Different shapes/colors for different buildings
    const buildingStyles = {
      guard_tower: { color: '#8B4513', shape: 'tower' },
      house_01: { color: '#CD853F', shape: 'house' },
      house_02: { color: '#DEB887', shape: 'house' },
      inn: { color: '#D2691E', shape: 'large' },
      shop_01: { color: '#F4A460', shape: 'shop' },
      shop_02: { color: '#DDA0DD', shape: 'shop' },
      windmill: { color: '#DCDCDC', shape: 'windmill' },
      trees: { color: '#228B22', shape: 'tree' }
    };

    const style = buildingStyles[buildingType] || { color: '#8B4513', shape: 'house' };

    ctx.fillStyle = style.color;

    switch (style.shape) {
      case 'tower':
        ctx.fillRect(25, 10, 30, 60);
        ctx.fillRect(20, 5, 40, 10);
        break;
      case 'house':
        ctx.fillRect(15, 35, 50, 35);
        ctx.beginPath();
        ctx.moveTo(10, 35);
        ctx.lineTo(40, 10);
        ctx.lineTo(70, 35);
        ctx.fill();
        break;
      case 'windmill':
        ctx.fillRect(35, 20, 10, 50);
        ctx.beginPath();
        ctx.moveTo(40, 25);
        ctx.lineTo(20, 15);
        ctx.lineTo(60, 35);
        ctx.lineTo(20, 35);
        ctx.lineTo(60, 15);
        ctx.stroke();
        break;
      case 'tree':
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(37, 50, 6, 20);
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(40, 40, 20, 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        ctx.fillRect(20, 30, 40, 40);
    }

    return canvas;
  }

  async loadMapById(mapId) {
    try {
      const maps = this.getSavedMaps();
      const mapData = maps.find((m) => String(m.id) === String(mapId));

      if (!mapData) {
        console.warn(`Map with ID ${mapId} not found`);
        return false;
      }

      return await this.loadMap(mapData);
    } catch (error) {
      console.error('Failed to load map by ID:', error);
      return false;
    }
  }

  async loadMap(mapData) {
    try {
      console.log('🗺️ Loading map:', mapData.name);
      this.loadingProgress = 0;
      this.isLoaded = false;

      // Clear current map
      this.groundTiles.clear();
      this.buildings = [];

      this.currentMap = mapData;

      // Load ground tiles
      if (mapData.groundTiles) {
        mapData.groundTiles.forEach((tile) => {
          this.groundTiles.set(tile.key, {
            type: tile.type,
            image: tile.image,
            x: this.parseCoordinate(tile.key, 'x'),
            y: this.parseCoordinate(tile.key, 'y')
          });
        });
      }

      this.loadingProgress = 50;

      // Load buildings
      if (mapData.objects) {
        for (const objData of mapData.objects) {
          const building = {
            name: objData.name,
            x: objData.x,
            y: objData.y,
            type: this.getBuildingType(objData.name),
            image: null,
            collision: true,
            width: 80,
            height: 80
          };

          // Get the appropriate image
          const buildingType = building.type;
          if (this.buildingImages.has(buildingType)) {
            building.image = this.buildingImages.get(buildingType);
          } else {
            // Try to load from the stored image path
            if (objData.image) {
              try {
                const img = new Image();
                img.src = objData.image;
                await new Promise((resolve) => {
                  img.onload = resolve;
                  img.onerror = resolve; // Continue even if image fails
                });
                building.image = img;
              } catch (e) {
                building.image = this.createFallbackBuildingSprite(buildingType);
              }
            } else {
              building.image = this.createFallbackBuildingSprite(buildingType);
            }
          }

          this.buildings.push(building);
        }
      }

      this.loadingProgress = 100;
      this.isLoaded = true;

      console.log(`✅ Map "${mapData.name}" loaded successfully`);
      console.log(`   - Ground tiles: ${this.groundTiles.size}`);
      console.log(`   - Buildings: ${this.buildings.length}`);

      // Dispatch event that map is loaded
      if (typeof window.gameEvents !== 'undefined') {
        window.gameEvents.dispatch('mapLoaded', {
          mapId: mapData.id,
          mapName: mapData.name,
          groundTiles: this.groundTiles.size,
          buildings: this.buildings.length
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to load map:', error);
      this.isLoaded = false;
      return false;
    }
  }

  parseCoordinate(key, axis) {
    const [x, y] = key.split(',').map(Number);
    return axis === 'x' ? x : y;
  }

  getBuildingType(name) {
    // Map building names to types
    const nameMap = {
      'Guard Tower': 'guard_tower',
      'House 01': 'house_01',
      'House 02': 'house_02',
      'Farm House 01': 'farm_house_01',
      'Farm House 02': 'farm_house_02',
      'Farm House With CropFiled': 'farm_house_field',
      'Inn': 'inn',
      'Shop 01': 'shop_01',
      'Shop 02': 'shop_02',
      'Stall 01': 'stall_01',
      'Stall 02': 'stall_02',
      'Tree': 'trees',
      'Wind Mill': 'windmill',
      'Cart': 'cart'
    };

    return nameMap[name] || name.toLowerCase().replace(/\s+/g, '_');
  }

  render(ctx, cameraOrGameState, canvas) {
    // Handle both camera object and gameState object being passed
    let camera;
    if (cameraOrGameState && cameraOrGameState.camera) {
      // gameState was passed, extract camera
      camera = cameraOrGameState.camera;
    } else if (cameraOrGameState && (cameraOrGameState.x !== undefined || cameraOrGameState.y !== undefined)) {
      // Direct camera object was passed
      camera = cameraOrGameState;
    } else {
      // Fallback to default camera
      camera = { x: 0, y: 0 };
    }

    if (!this.isLoaded || !this.currentMap) {
      // No default terrain - only render user-created maps
      // If no map is loaded, show nothing (the sand background is already rendered)
      console.log('[MapRenderer] No map loaded - skipping render');
      return;
    }

    // Render ground tiles (water background is already rendered by main renderer)
    this.renderGroundTiles(ctx, camera);

    // Render buildings on top
    this.renderBuildings(ctx, camera);
  }

  renderDefaultTerrain(ctx, camera) {
    // Render default grass terrain when no map is loaded (water background is already rendered by main renderer)
    const tileSize = this.settings.tileSize;
    const tileHeight = this.settings.tileHeight;

    // Get the zoom level if available
    const zoom = camera.zoom || 1;

    // Calculate viewport in world coordinates (camera.x/y is center of view)
    const viewWidth = window.innerWidth / zoom;
    const viewHeight = window.innerHeight / zoom;
    const margin = 200;

    // Calculate visible tile range in world coordinates
    const viewLeft = camera.x - viewWidth / 2 - margin;
    const viewRight = camera.x + viewWidth / 2 + margin;
    const viewTop = camera.y - viewHeight / 2 - margin;
    const viewBottom = camera.y + viewHeight / 2 + margin;

    const startCol = Math.floor(viewLeft / tileSize);
    const endCol = Math.ceil(viewRight / tileSize);
    const startRow = Math.floor(viewTop / tileHeight);
    const endRow = Math.ceil(viewBottom / tileHeight);

    // Default grass color
    ctx.fillStyle = '#4a7c59';

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        // Calculate world position (isometric)
        const isoX = col * tileSize + row % 2 * (tileSize / 2);
        const isoY = row * tileHeight;

        // Check if within map boundary
        const distFromCenter = Math.sqrt(isoX * isoX + isoY * isoY);
        if (distFromCenter > this.settings.mapRadius) continue;

        // Draw isometric tile at world position (context transform handles screen conversion)
        ctx.save();
        ctx.translate(isoX, isoY);

        ctx.beginPath();
        ctx.moveTo(0, tileHeight / 2);
        ctx.lineTo(tileSize / 2, 0);
        ctx.lineTo(tileSize, tileHeight / 2);
        ctx.lineTo(tileSize / 2, tileHeight);
        ctx.closePath();
        ctx.fill();

        // Add some variation
        if ((col + row) % 3 === 0) {
          ctx.fillStyle = '#3d6b4a';
          ctx.fillRect(tileSize * 0.2, tileHeight * 0.2, tileSize * 0.6, tileHeight * 0.6);
          ctx.fillStyle = '#4a7c59';
        }

        ctx.restore();
      }
    }
  }

  renderWaterBackground(ctx, camera) {
    const tileWidth = this.settings.tileSize;
    const tileHeight = this.settings.tileHeight;
    const drawHeight = 70;

    // Calculate visible viewport bounds
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    const viewLeft = camera.x;
    const viewTop = camera.y;
    const viewRight = camera.x + canvasWidth;
    const viewBottom = camera.y + canvasHeight;

    // Add padding to ensure full coverage
    const paddingX = tileWidth * 4;
    const paddingY = drawHeight * 6;

    // Calculate tile range
    const startCol = Math.floor((viewLeft - paddingX) / tileWidth);
    const endCol = Math.ceil((viewRight + paddingX) / tileWidth);
    const startRow = Math.floor((viewTop - paddingY) / tileHeight);
    const endRow = Math.ceil((viewBottom + paddingY) / tileHeight);

    // Draw water tiles
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const isoX = col * tileWidth + row % 2 * (tileWidth / 2);
        const isoY = row * tileHeight;

        const screenX = isoX - camera.x;
        const screenY = isoY - camera.y;

        // Draw water tile
        this.drawWaterTile(ctx, screenX, screenY, tileWidth, drawHeight);
      }
    }
  }

  drawWaterTile(ctx, x, y, width, height) {
    // Isometric diamond points
    const top = { x: x + width / 2, y: y };
    const right = { x: x + width, y: y + height / 2 };
    const bottom = { x: x + width / 2, y: y + height };
    const left = { x: x, y: y + height / 2 };

    // Enhanced water gradient with vibrant colors
    const gradient = ctx.createLinearGradient(left.x, top.y, right.x, bottom.y);
    gradient.addColorStop(0, '#4a9ad8'); // Brighter blue (top-left, lit by sun)
    gradient.addColorStop(0.3, '#3a8ac8'); // Medium blue
    gradient.addColorStop(0.7, '#2a7ab8'); // Darker blue
    gradient.addColorStop(1, '#1a6aa8'); // Deep blue (bottom-right, shadow)

    // Draw the water diamond
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.fill();

    // Enhanced border for better definition
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bright highlight on top-left edge (sun reflection)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(left.x, left.y);
    ctx.stroke();

    // Secondary highlight (water shimmer)
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(top.x + 2, top.y + 2);
    ctx.lineTo(left.x + 4, left.y);
    ctx.stroke();

    // Deep shadow on bottom-right edge
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.stroke();

    // Add subtle inner glow for water depth
    ctx.save();
    ctx.globalAlpha = 0.2;
    const centerX = (left.x + right.x) / 2;
    const centerY = (top.y + bottom.y) / 2;
    const radialGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.4);
    radialGradient.addColorStop(0, 'rgba(120, 200, 255, 0.4)');
    radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGradient;
    ctx.fill();
    ctx.restore();
  }

  renderGroundTiles(ctx, camera) {
    const tileSize = this.settings.tileSize;
    const tileHeight = this.settings.tileHeight;

    // Calculate visible viewport bounds
    // NOTE: When called from main game, context transform is already applied
    // so camera.x/y represents the center of the view (player position)
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Get the zoom level if available
    const zoom = camera.zoom || 1;

    // Calculate viewport in world coordinates
    // camera.x/y is the center of the view (player position)
    const viewWidth = canvasWidth / zoom;
    const viewHeight = canvasHeight / zoom;

    // Only render tiles visible in the viewport (with margin)
    const margin = 200;
    const viewLeft = camera.x - viewWidth / 2 - margin;
    const viewRight = camera.x + viewWidth / 2 + margin;
    const viewTop = camera.y - viewHeight / 2 - margin;
    const viewBottom = camera.y + viewHeight / 2 + margin;

    // Convert viewport bounds to tile coordinates
    const startCol = Math.floor(viewLeft / tileSize);
    const endCol = Math.ceil(viewRight / tileSize);
    const startRow = Math.floor(viewTop / tileHeight);
    const endRow = Math.ceil(viewBottom / tileHeight);

    // Render default ground first
    ctx.fillStyle = '#4a7c59';

    let tilesRendered = 0;
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        // Calculate world position (isometric)
        const isoX = col * tileSize + row % 2 * (tileSize / 2);
        const isoY = row * tileHeight;

        // Check if within map boundary
        const distFromCenter = Math.sqrt(isoX * isoX + isoY * isoY);
        if (distFromCenter > this.settings.mapRadius) continue;

        // Render at world position (context transform handles screen conversion)
        // Check if there's a custom ground tile here
        const tileKey = `${col},${row}`;
        const customTile = this.groundTiles.get(tileKey);

        if (customTile && this.groundImages.has(customTile.type)) {
          // Render custom ground tile at world position
          const groundImg = this.groundImages.get(customTile.type);
          ctx.drawImage(groundImg, isoX, isoY, tileSize, tileSize * 0.6);
          tilesRendered++;
        } else {
          // Render default ground at world position
          ctx.save();
          ctx.translate(isoX, isoY);

          ctx.beginPath();
          ctx.moveTo(0, tileHeight / 2);
          ctx.lineTo(tileSize / 2, 0);
          ctx.lineTo(tileSize, tileHeight / 2);
          ctx.lineTo(tileSize / 2, tileHeight);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }
    }
  }

  renderBuildings(ctx, camera) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Get the zoom level if available
    const zoom = camera.zoom || 1;

    // Calculate viewport in world coordinates
    const viewWidth = canvasWidth / zoom;
    const viewHeight = canvasHeight / zoom;
    const margin = 200;

    // Only render buildings visible in viewport (using world coordinates)
    const visibleBuildings = this.buildings.
    filter((building) => {
      // Check if building is within view (camera.x/y is center of view)
      const dx = Math.abs(building.x - camera.x);
      const dy = Math.abs(building.y - camera.y);

      return dx < viewWidth / 2 + building.width + margin &&
      dy < viewHeight / 2 + building.height + margin;
    }).
    sort((a, b) => a.y - b.y);

    visibleBuildings.forEach((building) => {
      // Render at world position (context transform handles screen conversion)
      const worldX = building.x;
      const worldY = building.y;

      if (building.image) {
        ctx.save();

        // Add shadow at world position
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(worldX, worldY + building.height * 0.8,
        building.width * 0.4, building.height * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw building at world position
        ctx.drawImage(
          building.image,
          worldX - building.width / 2,
          worldY - building.height / 2,
          building.width,
          building.height
        );

        ctx.restore();
      }
    });
  }

  isBuildingVisible(building, camera) {
    const margin = 100;
    return building.x > camera.x - margin &&
    building.x < camera.x + window.innerWidth + margin &&
    building.y > camera.y - margin &&
    building.y < camera.y + window.innerHeight + margin;
  }

  // Collision detection for buildings
  checkCollision(x, y, radius = 45) {
    if (!this.settings.enableCollisions) return null;

    for (const building of this.buildings) {
      if (!building.collision) continue;

      const dx = x - building.x;
      const dy = y - building.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const buildingRadius = Math.max(building.width, building.height) / 2;

      if (distance < radius + buildingRadius) {
        return building;
      }
    }

    return null;
  }

  // Get spawn points that don't collide with buildings
  getValidSpawnPoints(count = 8) {
    const spawnPoints = [];
    const maxAttempts = 100;

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let validPoint = null;

      while (attempts < maxAttempts && !validPoint) {
        const angle = Math.PI * 2 * i / count + Math.random() * 0.5;
        const distance = 800 + Math.random() * 1000;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        // Check if point is within map bounds
        if (Math.sqrt(x * x + y * y) > this.settings.mapRadius - 200) {
          attempts++;
          continue;
        }

        // Check collision with buildings
        if (!this.checkCollision(x, y, 100)) {
          validPoint = { x, y };
        }

        attempts++;
      }

      if (validPoint) {
        spawnPoints.push(validPoint);
      } else {
        // Fallback spawn point
        const angle = Math.PI * 2 * i / count;
        spawnPoints.push({
          x: Math.cos(angle) * 1200,
          y: Math.sin(angle) * 1200
        });
      }
    }

    return spawnPoints;
  }

  // Get map bounds
  getMapBounds() {
    return {
      minX: -this.settings.mapRadius,
      maxX: this.settings.mapRadius,
      minY: -this.settings.mapRadius,
      maxY: this.settings.mapRadius,
      radius: this.settings.mapRadius
    };
  }

  // Utility functions
  getSavedMaps() {
    try {
      return JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    } catch (error) {
      console.warn('Failed to load saved maps:', error);
      return [];
    }
  }

  getCurrentMap() {
    return this.currentMap;
  }

  isMapLoaded() {
    return this.isLoaded;
  }

  getLoadingProgress() {
    return this.loadingProgress;
  }

  // Settings
  setRenderDistance(distance) {
    this.settings.renderDistance = distance;
  }

  setCollisionsEnabled(enabled) {
    this.settings.enableCollisions = enabled;
  }

  // Cleanup
  cleanup() {
    this.currentMap = null;
    this.groundTiles.clear();
    this.buildings = [];
    this.isLoaded = false;
    this.loadingProgress = 0;
  }
}

// Global instance
window.MapRenderer = new MapRenderer();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapRenderer;
}