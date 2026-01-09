// Map Browser Modal JavaScript
class MapBrowserModal {
  constructor() {
    // Load real maps from localStorage
    this.realMaps = this.loadRealMaps();
    this.filteredMaps = [...this.realMaps];
    this.selectedMap = null;
    this.searchQuery = '';
    this.showLeftScroll = false;
    this.showRightScroll = true;
    this.mapCanvases = new Map(); // Store canvas references for each map
    this.animationFrames = new Map(); // Store animation frame IDs
    this.objectImageCache = new Map(); // Cache for object images

    // DOM elements - Updated to match the actual IDs in index.html
    this.elements = {
      modalOverlay: document.getElementById('mapBrowserModalOverlay'),
      mapBrowserModal: document.getElementById('mapBrowserModal'),
      browseMode: document.getElementById('browseMode'),
      detailMode: document.getElementById('detailMode'),
      searchInput: document.getElementById('searchInput'),
      searchButton: document.getElementById('searchButton'),
      scrollLeftBtn: document.getElementById('scrollLeftBtn'),
      scrollRightBtn: document.getElementById('scrollRightBtn'),
      mapsContainer: document.getElementById('mapsContainer'),
      mapsGrid: document.getElementById('mapsGrid'),
      backButton: document.getElementById('backButton'),
      closeButton: document.getElementById('closeButton'),
      // Detail view elements
      detailMapCanvas: null, // Will be created dynamically
      detailMapName: document.getElementById('detailMapName'),
      detailOnlineCount: document.getElementById('detailOnlineCount'),
      detailCreator: document.getElementById('detailCreator'),
      detailRanking: document.getElementById('detailRanking'),
      detailMapDescription: document.getElementById('detailMapDescription'),
      playButton: document.getElementById('playButton')
    };

    // Ensure modal is hidden by default
    if (this.elements.modalOverlay) {
      this.elements.modalOverlay.style.display = 'none';
    }

    this.init();
  }

  loadRealMaps() {
    try {
      const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
      console.log(`📦 Loaded ${maps.length} real maps from localStorage`);
      
      // Filter valid maps and add metadata
      return maps
        .filter(map => map && map.name && (map.objects || map.groundTiles))
        .map((map, index) => ({
          ...map,
          online: Math.floor(Math.random() * 300) + 50, // Random online count
          ranking: index + 1,
          description: map.description || `A custom ${map.vehicleType || 'tank'} map created by ${map.creator || 'Unknown'}. Experience unique gameplay with custom terrain and obstacles.`
        }));
    } catch (error) {
      console.error('Failed to load maps:', error);
      return [];
    }
  }

  init() {
    this.setupEventListeners();
    this.renderMaps();
    this.checkScroll();
  }

  setupEventListeners() {
    // Search functionality
    this.elements.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.filterMaps();
      this.renderMaps();
    });

    this.elements.searchButton.addEventListener('click', () => {
      this.elements.searchInput.focus();
    });

    // Scroll functionality
    this.elements.scrollLeftBtn.addEventListener('click', () => {
      this.scrollLeft();
    });

    this.elements.scrollRightBtn.addEventListener('click', () => {
      this.scrollRight();
    });

    this.elements.mapsContainer.addEventListener('scroll', () => {
      this.checkScroll();
    });

    // Detail view navigation
    this.elements.backButton.addEventListener('click', () => {
      this.closeDetails();
    });

    // Close modal
    this.elements.closeButton.addEventListener('click', () => {
      this.closeModal();
    });

    this.elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.elements.modalOverlay) {
        this.closeModal();
      }
    });

    // Play button
    this.elements.playButton.addEventListener('click', () => {
      this.playMap();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.selectedMap) {
          this.closeDetails();
        } else {
          this.closeModal();
        }
      }
    });
  }

  filterMaps() {
    if (!this.searchQuery.trim()) {
      this.filteredMaps = [...this.realMaps];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredMaps = this.realMaps.filter((map) => {
        return (
          map.name.toLowerCase().includes(query) ||
          (map.creator && map.creator.toLowerCase().includes(query)) ||
          map.description.toLowerCase().includes(query) ||
          (map.vehicleType && map.vehicleType.toLowerCase().includes(query))
        );
      });
    }
  }

  renderMaps() {
    const mapsGrid = this.elements.mapsGrid;
    
    // Stop all existing animations
    this.stopAllAnimations();
    
    if (this.filteredMaps.length === 0) {
      mapsGrid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <h3>No maps found</h3>
          <p>Try creating some maps first or use a different search term</p>
        </div>
      `;
      return;
    }

    mapsGrid.innerHTML = this.filteredMaps.map((map) => `
      <div class="map-card" data-map-id="${map.id}">
        <div class="map-canvas-container">
          <canvas class="map-canvas" width="320" height="192" data-map-id="${map.id}"></canvas>
          <div class="map-loading">Loading map...</div>
        </div>
        <div class="map-info">
          <div class="map-name">${map.name}</div>
          <div class="map-meta">
            <span class="map-creator">${map.creator || 'Unknown'}</span>
            <span class="separator">|</span>
            <span class="map-creator">${map.online} online</span>
            <span class="separator">|</span>
            <span class="map-ranking">Top: ${map.ranking}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Add click event listeners to map cards
    mapsGrid.querySelectorAll('.map-card').forEach(card => {
      card.addEventListener('click', () => {
        const mapId = card.dataset.mapId;
        const map = this.realMaps.find(m => m.id === mapId);
        if (map) {
          this.showDetails(map);
        }
      });
    });

    // Start rendering maps on canvases
    setTimeout(() => {
      this.renderMapCanvases();
    }, 100);
  }

  renderMapCanvases() {
    const canvases = this.elements.mapsGrid.querySelectorAll('.map-canvas');
    
    canvases.forEach(canvas => {
      const mapId = canvas.dataset.mapId;
      const map = this.realMaps.find(m => m.id === mapId);
      const loadingElement = canvas.parentElement.querySelector('.map-loading');
      
      if (map) {
        this.renderMapOnCanvas(canvas, map, () => {
          // Hide loading overlay when map is rendered
          if (loadingElement) {
            loadingElement.style.display = 'none';
          }
        });
      }
    });
  }

  renderMapOnCanvas(canvas, map, onComplete) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      if (onComplete) onComplete();
      return;
    }

    // Animation state (stored per canvas)
    if (!this.thumbnailAnimations) {
      this.thumbnailAnimations = new Map();
    }
    if (!this.thumbnailImageCache) {
      this.thumbnailImageCache = new Map();
    }

    if (!this.thumbnailAnimations.has(canvas)) {
      this.thumbnailAnimations.set(canvas, {
        offsetX: 0,
        offsetY: 0,
        time: 0,
        animationId: null,
        imagesLoaded: new Map()
      });
    }

    const anim = this.thumbnailAnimations.get(canvas);

    // Preload tile images
    if (map.groundTiles && map.groundTiles.length > 0) {
      map.groundTiles.forEach(tile => {
        if (tile.image && !this.thumbnailImageCache.has(tile.image)) {
          const img = new Image();
          img.src = tile.image;
          this.thumbnailImageCache.set(tile.image, img);
          img.onload = () => {
            anim.imagesLoaded.set(tile.image, true);
          };
        }
      });
    }

    // Preload object images
    if (map.objects && map.objects.length > 0) {
      map.objects.forEach(obj => {
        if (obj.image && !this.thumbnailImageCache.has(obj.image)) {
          const img = new Image();
          img.src = obj.image;
          this.thumbnailImageCache.set(obj.image, img);
          img.onload = () => {
            anim.imagesLoaded.set(obj.image, true);
          };
        }
      });
    }

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark gradient background (matches lobby)
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(5, 10, 25, 1)');
      gradient.addColorStop(0.5, 'rgba(10, 15, 35, 1)');
      gradient.addColorStop(1, 'rgba(15, 20, 40, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Isometric tile dimensions (same as lobby)
      const TILE_WIDTH = 120;
      const TILE_HEIGHT = 30;
      const DRAW_HEIGHT = 70;
      const scale = 0.2;

      // Animate camera movement (slow circular motion)
      anim.time += 0.01;
      anim.offsetX = Math.sin(anim.time * 0.5) * 30;
      anim.offsetY = Math.cos(anim.time * 0.5) * 20;

      const centerX = canvas.width / 2 + anim.offsetX;
      const centerY = canvas.height / 2 + anim.offsetY;

      // Draw ground tiles with actual PNG images
      if (map.groundTiles && map.groundTiles.length > 0) {
        map.groundTiles.forEach(tile => {
          if (!tile.key) return;

          const [colStr, rowStr] = tile.key.split(',');
          const col = parseInt(colStr, 10);
          const row = parseInt(rowStr, 10);

          // Isometric positioning
          const isoX = col * TILE_WIDTH + (row % 2) * (TILE_WIDTH / 2);
          const isoY = row * TILE_HEIGHT;
          const x = centerX + isoX * scale;
          const y = centerY + isoY * scale;
          const w = TILE_WIDTH * scale;
          const h = DRAW_HEIGHT * scale;

          // Subtle pulsing effect
          const pulse = Math.sin(anim.time * 2) * 0.05 + 0.95;

          ctx.save();
          ctx.globalAlpha = pulse;

          // Draw actual tile PNG image if loaded
          if (tile.image && this.thumbnailImageCache.has(tile.image)) {
            const img = this.thumbnailImageCache.get(tile.image);
            if (img.complete && img.naturalWidth > 0) {
              ctx.drawImage(img, x, y, w, h);
            }
          }

          ctx.restore();
        });
      }

      // Draw objects with actual PNG images and glow
      if (map.objects && map.objects.length > 0) {
        map.objects.forEach(obj => {
          const x = centerX + obj.x * scale;
          const y = centerY + obj.y * scale;
          const w = (obj.width || 50) * scale;
          const h = (obj.height || 50) * scale;

          // Pulsing glow effect
          const glowIntensity = (Math.sin(anim.time * 3) + 1) * 0.5;

          ctx.save();

          // Draw actual object PNG if loaded
          if (obj.image && this.thumbnailImageCache.has(obj.image)) {
            const img = this.thumbnailImageCache.get(obj.image);
            if (img.complete && img.naturalWidth > 0) {
              // Add glow effect
              ctx.shadowBlur = 15 * glowIntensity;
              ctx.shadowColor = 'rgba(0, 247, 255, 0.8)';
              
              ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
            }
          }

          ctx.restore();
        });
      }

      // Continue animation
      anim.animationId = requestAnimationFrame(animate);
    };

    // Stop any existing animation
    if (anim.animationId) {
      cancelAnimationFrame(anim.animationId);
    }

    // Start animation
    animate();
    
    if (onComplete) onComplete();
  }

  renderWithHexTerrain(ctx, map, mapWidth, mapHeight) {
    // Render ground tiles using the hex terrain system - render ALL tiles for complete map view
    if (map.groundTiles && map.groundTiles.length > 0) {
      map.groundTiles.forEach(tile => {
        if (window.HexTerrainSystem && window.HexTerrainSystem.drawTexturedHex) {
          // Use the actual PNG textures from the hex terrain system
          window.HexTerrainSystem.drawTexturedHex(ctx, tile.x, tile.y, tile.type);
        }
      });
    } else {
      // Generate comprehensive default terrain if no ground tiles exist
      this.generateComprehensiveTerrain(ctx, mapWidth, mapHeight);
    }
    
    // Render objects on top
    this.renderMapObjects(ctx, map);
  }

  generateComprehensiveTerrain(ctx, mapWidth, mapHeight) {
    // Generate a comprehensive terrain pattern using hex terrain system - render more tiles
    const hexSize = 60;
    const hexWidth = hexSize * Math.sqrt(3);
    const hexHeight = hexSize * 2;
    const vertSpacing = hexHeight * 0.75;
    
    // Create a complete terrain map with varied biomes
    for (let row = 0; row * vertSpacing < mapHeight; row += 2) { // Reduced skip for more coverage
      for (let col = 0; col * hexWidth < mapWidth; col += 2) { // Reduced skip for more coverage
        const y = row * vertSpacing;
        const offsetX = (row % 2 === 0) ? 0 : hexWidth / 2;
        const x = col * hexWidth + offsetX;
        
        if (x >= hexSize && x <= mapWidth - hexSize &&
            y >= hexSize && y <= mapHeight - hexSize) {
          
          // Create varied terrain based on position and noise
          let terrainType = 'grass';
          const centerX = mapWidth / 2;
          const centerY = mapHeight / 2;
          const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          
          // Add some noise for natural variation
          const noiseX = Math.sin(x * 0.001) * Math.cos(y * 0.001);
          const noiseY = Math.cos(x * 0.001) * Math.sin(y * 0.001);
          const noise = (noiseX + noiseY) * 0.5;
          
          // Create biome zones
          if (distanceFromCenter < 800) {
            // Central grassland
            terrainType = Math.random() < 0.7 ? 'grass' : 'darkGrass';
          } else if (distanceFromCenter < 1500) {
            // Mixed terrain zone
            const rand = Math.random() + noise * 0.3;
            if (rand < 0.3) terrainType = 'grass';
            else if (rand < 0.5) terrainType = 'darkGrass';
            else if (rand < 0.7) terrainType = 'forest';
            else if (rand < 0.85) terrainType = 'stone';
            else terrainType = 'mud';
          } else if (distanceFromCenter < 2500) {
            // Outer terrain zone
            const rand = Math.random() + noise * 0.4;
            if (rand < 0.2) terrainType = 'desert';
            else if (rand < 0.4) terrainType = 'sand';
            else if (rand < 0.6) terrainType = 'stone';
            else if (rand < 0.75) terrainType = 'forest';
            else if (rand < 0.9) terrainType = 'water';
            else terrainType = 'cobblestone';
          } else {
            // Edge zones with special terrain
            const rand = Math.random() + noise * 0.5;
            if (rand < 0.25) terrainType = 'water';
            else if (rand < 0.4) terrainType = 'desert';
            else if (rand < 0.55) terrainType = 'stone';
            else if (rand < 0.7) terrainType = 'snow';
            else if (rand < 0.85) terrainType = 'lava';
            else terrainType = 'ice';
          }
          
          if (window.HexTerrainSystem && window.HexTerrainSystem.drawTexturedHex) {
            window.HexTerrainSystem.drawTexturedHex(ctx, x, y, terrainType);
          }
        }
      }
    }
  }

  generateDefaultTerrain(ctx, mapWidth, mapHeight) {
    // Fallback terrain generation with more variety
    const hexSize = 60;
    const hexWidth = hexSize * Math.sqrt(3);
    const hexHeight = hexSize * 2;
    const vertSpacing = hexHeight * 0.75;
    
    // Create a more comprehensive terrain map
    for (let row = 0; row * vertSpacing < mapHeight; row += 2) { // Reduced skip
      for (let col = 0; col * hexWidth < mapWidth; col += 2) { // Reduced skip
        const y = row * vertSpacing;
        const offsetX = (row % 2 === 0) ? 0 : hexWidth / 2;
        const x = col * hexWidth + offsetX;
        
        if (x >= hexSize && x <= mapWidth - hexSize &&
            y >= hexSize && y <= mapHeight - hexSize) {
          
          // Choose terrain type based on position with more variety
          let terrainType = 'grass';
          const centerX = mapWidth / 2;
          const centerY = mapHeight / 2;
          const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          
          if (distanceFromCenter < 1000) {
            const rand = Math.random();
            if (rand < 0.6) terrainType = 'grass';
            else if (rand < 0.8) terrainType = 'darkGrass';
            else terrainType = 'forest';
          } else if (distanceFromCenter < 2000) {
            const rand = Math.random();
            if (rand < 0.3) terrainType = 'grass';
            else if (rand < 0.5) terrainType = 'darkGrass';
            else if (rand < 0.7) terrainType = 'forest';
            else if (rand < 0.85) terrainType = 'stone';
            else terrainType = 'mud';
          } else {
            const rand = Math.random();
            if (rand < 0.2) terrainType = 'desert';
            else if (rand < 0.35) terrainType = 'sand';
            else if (rand < 0.5) terrainType = 'stone';
            else if (rand < 0.65) terrainType = 'forest';
            else if (rand < 0.8) terrainType = 'water';
            else terrainType = 'snow';
          }
          
          if (window.HexTerrainSystem && window.HexTerrainSystem.drawTexturedHex) {
            window.HexTerrainSystem.drawTexturedHex(ctx, x, y, terrainType);
          }
        }
      }
    }
  }

  renderGroundTiles(ctx, map) {
    if (!map.groundTiles) return;
    
    const hexSize = 60;
    
    map.groundTiles.forEach(tile => {
      // Enhanced color palette for different terrain types
      if (tile.type === 'grass') {
        ctx.fillStyle = '#2d5016';
      } else if (tile.type === 'darkGrass') {
        ctx.fillStyle = '#1a3009';
      } else if (tile.type === 'forest') {
        ctx.fillStyle = '#0f2005';
      } else if (tile.type === 'sand') {
        ctx.fillStyle = '#8b7355';
      } else if (tile.type === 'desert') {
        ctx.fillStyle = '#c19a6b';
      } else if (tile.type === 'stone') {
        ctx.fillStyle = '#4a4a4a';
      } else if (tile.type === 'cobblestone') {
        ctx.fillStyle = '#6b6b6b';
      } else if (tile.type === 'water') {
        ctx.fillStyle = '#1e40af';
      } else if (tile.type === 'lightWater') {
        ctx.fillStyle = '#3b82f6';
      } else if (tile.type === 'brightWater') {
        ctx.fillStyle = '#06b6d4';
      } else if (tile.type === 'lava') {
        ctx.fillStyle = '#dc2626';
      } else if (tile.type === 'redLava') {
        ctx.fillStyle = '#ef4444';
      } else if (tile.type === 'snow') {
        ctx.fillStyle = '#f8fafc';
      } else if (tile.type === 'ice') {
        ctx.fillStyle = '#bfdbfe';
      } else if (tile.type === 'lightIce') {
        ctx.fillStyle = '#dbeafe';
      } else if (tile.type === 'mud') {
        ctx.fillStyle = '#451a03';
      } else if (tile.type === 'darkMud') {
        ctx.fillStyle = '#292524';
      } else if (tile.type === 'asphalt') {
        ctx.fillStyle = '#1f2937';
      } else {
        ctx.fillStyle = '#2d5016'; // Default grass
      }
      
      // Draw hexagon with enhanced styling
      this.drawEnhancedHexagon(ctx, tile.x, tile.y, hexSize, tile.type);
    });
  }

  drawEnhancedHexagon(ctx, x, y, size, tileType) {
    ctx.save();
    
    // Draw filled hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = x + size * Math.cos(angle);
      const hy = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(hx, hy);
      } else {
        ctx.lineTo(hx, hy);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // Add subtle border for certain terrain types
    if (tileType === 'water' || tileType === 'lava' || tileType === 'snow') {
      ctx.strokeStyle = tileType === 'water' ? '#1d4ed8' : 
                       tileType === 'lava' ? '#b91c1c' : '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  renderMapObjects(ctx, map) {
    if (!map.objects) return;
    
    map.objects.forEach(obj => {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      
      if (obj.rotation) {
        ctx.rotate(obj.rotation);
      }
      
      // Try to render with PNG assets if available
      if (obj.image && this.tryRenderObjectImage(ctx, obj)) {
        // Successfully rendered with image
      } else {
        // Fallback to simple shapes
        this.renderObjectFallback(ctx, obj);
      }
      
      ctx.restore();
    });
  }

  tryRenderObjectImage(ctx, obj) {
    // Try to use cached images or load new ones
    if (!this.objectImageCache) {
      this.objectImageCache = new Map();
    }
    
    let img = this.objectImageCache.get(obj.image);
    if (!img) {
      img = new Image();
      img.src = obj.image;
      this.objectImageCache.set(obj.image, img);
      return false; // Image not loaded yet
    }
    
    if (img.complete && img.naturalWidth > 0) {
      const scale = obj.scale || 1;
      const width = (obj.width || img.naturalWidth) * scale;
      const height = (obj.height || img.naturalHeight) * scale;
      
      ctx.drawImage(img, -width/2, -height/2, width, height);
      return true;
    }
    
    return false;
  }

  renderObjectFallback(ctx, obj) {
    // Enhanced rendering for different object types with more detail
    if (obj.type === 'wall' || obj.type === 'building') {
      // Enhanced wall/building rendering
      ctx.fillStyle = '#4a5568';
      ctx.strokeStyle = '#718096';
      ctx.lineWidth = 2;
      
      // Add depth effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
      ctx.strokeRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
      
      // Add highlight
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#a0aec0';
      ctx.fillRect(-obj.width/2, -obj.height/2, obj.width/4, obj.height/4);
      
    } else if (obj.type === 'tree') {
      // Enhanced tree rendering
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      // Brown trunk with texture
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-6, -15, 12, 25);
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(-6, -15, 4, 25); // Highlight
      
      // Green leaves with multiple layers
      const radius = obj.radius || 30;
      
      // Shadow layer
      ctx.fillStyle = '#1a5d1a';
      ctx.beginPath();
      ctx.arc(2, -13, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Main leaves
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(0, -15, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight layer
      ctx.fillStyle = '#32CD32';
      ctx.beginPath();
      ctx.arc(-5, -20, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      
    } else if (obj.type === 'rock') {
      // Enhanced rock rendering
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      const radius = obj.radius || 25;
      
      // Main rock body
      ctx.fillStyle = '#696969';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Rock texture with irregular shape
      ctx.fillStyle = '#808080';
      ctx.beginPath();
      ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = '#A9A9A9';
      ctx.beginPath();
      ctx.arc(-radius * 0.4, -radius * 0.4, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      
    } else {
      // Enhanced generic object
      ctx.fillStyle = '#4a5568';
      ctx.strokeStyle = '#718096';
      ctx.lineWidth = 2;
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillRect(-20, -20, 40, 40);
      ctx.strokeRect(-20, -20, 40, 40);
      
      // Add some detail
      ctx.fillStyle = '#a0aec0';
      ctx.fillRect(-15, -15, 10, 10);
      
      ctx.shadowColor = 'transparent';
    }
  }

  drawHexagon(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = x + size * Math.cos(angle);
      const hy = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(hx, hy);
      } else {
        ctx.lineTo(hx, hy);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  stopAllAnimations() {
    // Stop old animation frames
    this.animationFrames.forEach((frameId, canvas) => {
      cancelAnimationFrame(frameId);
    });
    this.animationFrames.clear();

    // Stop thumbnail animations
    if (this.thumbnailAnimations) {
      this.thumbnailAnimations.forEach((anim, canvas) => {
        if (anim.animationId) {
          cancelAnimationFrame(anim.animationId);
        }
      });
      this.thumbnailAnimations.clear();
    }
  }

  checkScroll() {
    const container = this.elements.mapsContainer;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    this.showLeftScroll = scrollLeft > 10;
    this.showRightScroll = scrollLeft < scrollWidth - clientWidth - 10;

    // Update button visibility
    this.elements.scrollLeftBtn.style.display = this.showLeftScroll ? 'flex' : 'none';
    this.elements.scrollRightBtn.style.display = this.showRightScroll ? 'flex' : 'none';
  }

  scrollLeft() {
    const container = this.elements.mapsContainer;
    container.scrollBy({ left: -400, behavior: 'smooth' });
  }

  scrollRight() {
    const container = this.elements.mapsContainer;
    container.scrollBy({ left: 400, behavior: 'smooth' });
  }

  showDetails(map) {
    this.selectedMap = map;
    
    // Update detail view content
    this.elements.detailMapName.textContent = map.name;
    this.elements.detailOnlineCount.textContent = map.online;
    this.elements.detailCreator.textContent = map.creator || 'Unknown';
    this.elements.detailRanking.textContent = `Top ${map.ranking}`;
    this.elements.detailMapDescription.textContent = map.description;

    // Create detail canvas if it doesn't exist
    const detailCanvasContainer = document.querySelector('.detail-canvas-container');
    if (!detailCanvasContainer) {
      // Update the HTML structure for detail view
      const detailContent = document.querySelector('.detail-content');
      if (detailContent) {
        const imageContainer = detailContent.querySelector('.detail-image-container');
        if (imageContainer) {
          imageContainer.innerHTML = `
            <div class="detail-canvas-container">
              <canvas class="detail-canvas" width="600" height="400"></canvas>
            </div>
          `;
        }
      }
    }

    const detailCanvas = document.querySelector('.detail-canvas');
    if (detailCanvas) {
      this.renderMapOnCanvas(detailCanvas, map);
    }

    // Switch to detail view with animation
    this.elements.browseMode.classList.add('hidden');
    this.elements.detailMode.classList.remove('hidden');
  }

  closeDetails() {
    this.selectedMap = null;
    
    // Stop detail canvas animation
    const detailCanvas = document.querySelector('.detail-canvas');
    if (detailCanvas && this.animationFrames.has(detailCanvas)) {
      cancelAnimationFrame(this.animationFrames.get(detailCanvas));
      this.animationFrames.delete(detailCanvas);
    }
    
    // Switch back to browse view
    this.elements.detailMode.classList.add('hidden');
    this.elements.browseMode.classList.remove('hidden');
  }

  playMap() {
    if (this.selectedMap) {
      console.log('Playing map:', this.selectedMap.name);
      
      // Here you would integrate with your actual game system
      // For example: startGame(this.selectedMap);
      
      // Show a notification
      this.showNotification(`Starting ${this.selectedMap.name}...`);
      
      // Close modal after a delay
      setTimeout(() => {
        this.closeModal();
      }, 1500);
    }
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, var(--accent-red), var(--accent-red-hover));
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      z-index: 1100;
      font-weight: 600;
      animation: slideInRight 0.3s ease;
      border: 2px solid var(--accent-blue);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  openModal() {
    // Reload maps in case new ones were created
    this.realMaps = this.loadRealMaps();
    this.filteredMaps = [...this.realMaps];
    
    this.elements.modalOverlay.style.display = 'flex';
    this.renderMaps();
    
    // Focus on search input
    setTimeout(() => {
      this.elements.searchInput.focus();
    }, 100);
  }

  closeModal() {
    this.elements.modalOverlay.style.display = 'none';
    this.closeDetails(); // Reset to browse view
    this.searchQuery = '';
    this.elements.searchInput.value = '';
    this.stopAllAnimations(); // Stop all animations when closing
    this.filterMaps();
  }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize the modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.mapBrowserModal = new MapBrowserModal();
  
  // Expose functions globally for integration
  window.openMapBrowserModal = () => {
    window.mapBrowserModal.openModal();
  };
  
  window.closeMapBrowserModal = () => {
    window.mapBrowserModal.closeModal();
  };
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapBrowserModal;
}
