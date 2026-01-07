
// DOM Map Renderer - Renders maps using HTML elements instead of canvas
(function () {
  // Constants
  const TILE_WIDTH = 120;
  const TILE_STEP_Y = 30;
  const TILE_DRAW_HEIGHT = 70;

  let lobbyAnimationId = null;
  let lobbyOffsetX = 0;
  let lobbyOffsetY = 0;
  const LOBBY_ANIM_SPEED = 0.3;

  const DOMMapRenderer = {
    initialized: false,
    currentMap: null,
    mapContainer: null,
    gameMapContainer: null,
    lobbyMapContainer: null,
    lastRenderTime: 0,
    frameThrottle: 16, // ~60fps

    init() {
      if (this.initialized) return;
      this.initialized = true;

      // Create lobby map container
      this.lobbyMapContainer = document.createElement('div');
      this.lobbyMapContainer.id = 'lobbyMapContainer';
      this.lobbyMapContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2;
                overflow: hidden;
                will-change: transform;
            `;

      // Create game map container
      this.gameMapContainer = document.createElement('div');
      this.gameMapContainer.id = 'gameMapContainer';
      this.gameMapContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 0;
                overflow: hidden;
                will-change: transform;
            `;

      console.log('[DOMMapRenderer] Initialized');
    },

    loadDefaultMap() {
      try {
        const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
        // Load any available maps, not just user-created ones
        const availableMaps = maps.filter((m) => m && m.name && (m.objects || m.groundTiles));

        if (availableMaps.length > 0) {
          this.currentMap = availableMaps[0];
          console.log('[DOMMapRenderer] Loaded map:', this.currentMap.name, 'Objects:', this.currentMap.objects?.length || 0, 'Tiles:', this.currentMap.groundTiles?.length || 0);
        } else {
          console.log('[DOMMapRenderer] No maps available in localStorage');
          this.currentMap = null;
        }
      } catch (error) {
        console.error('[DOMMapRenderer] Error loading maps:', error);
        this.currentMap = null;
      }
    },

    renderToLobby() {
      if (!this.currentMap || !this.lobbyMapContainer) return;

      const lobbyScreen = document.getElementById('lobbyScreen');
      if (!lobbyScreen) return;

      if (this.lobbyMapContainer.children.length > 0) {
        console.log('[DOMMapRenderer] Map already rendered in lobby, skipping');
        return;
      }

      this.lobbyMapContainer.innerHTML = '';

      if (!lobbyScreen.contains(this.lobbyMapContainer)) {
        lobbyScreen.insertBefore(this.lobbyMapContainer, lobbyScreen.firstChild);
      }

      // Hide the canvas backgrounds when showing DOM map
      this.hideCanvasBackgrounds();

      this.renderMap(this.lobbyMapContainer, true);

      if (lobbyAnimationId) cancelAnimationFrame(lobbyAnimationId);
      lobbyOffsetX = 0;
      lobbyOffsetY = 0;
      this.lastRenderTime = 0;
      this.startLobbyAnimation();

      console.log('[DOMMapRenderer] Rendered to lobby with animation');
    },

    startLobbyAnimation() {
      const animate = (timestamp) => {
        // Throttle to ~60fps
        if (timestamp - this.lastRenderTime < this.frameThrottle) {
          lobbyAnimationId = requestAnimationFrame(animate);
          return;
        }
        this.lastRenderTime = timestamp;

        // Smooth panning animation - circular motion
        const time = timestamp * 0.0002;
        lobbyOffsetX = Math.sin(time) * 40;
        lobbyOffsetY = Math.cos(time) * 40;

        // Update entire container transform instead of individual elements
        const mapContent = this.lobbyMapContainer.firstChild;
        if (mapContent) {
          mapContent.style.transform = `translate(${lobbyOffsetX}px, ${lobbyOffsetY}px)`;
        }

        lobbyAnimationId = requestAnimationFrame(animate);
      };
      lobbyAnimationId = requestAnimationFrame(animate);
    },

    renderToGame() {
      // DOM rendering to game area is DISABLED
      // The canvas-based MapRenderer handles game rendering instead
      // This prevents duplicate/conflicting map rendering in the game area
      console.log('[DOMMapRenderer] Game rendering disabled - using canvas MapRenderer instead');
      return;
    },

    startCameraSync() {
      if (this.cameraSyncId) {
        cancelAnimationFrame(this.cameraSyncId);
      }

      const updateMapPosition = () => {
        if (!this.gameMapContainer || typeof gameState === 'undefined' || gameState.isInLobby) {
          return;
        }

        const camera = gameState.camera;
        if (camera) {
          this.gameMapContainer.style.transform = `translate(${-camera.x}px, ${-camera.y}px)`;
        }

        this.cameraSyncId = requestAnimationFrame(updateMapPosition);
      };

      updateMapPosition();
    },

    renderMap(container, isLobby) {
      if (!this.currentMap || !container) return;

      const tiles = this.currentMap.groundTiles || [];
      const objects = this.currentMap.objects || [];
      const settings = this.currentMap.settings || { tileWidth: TILE_WIDTH, tileHeight: TILE_STEP_Y };

      const tileWidth = settings.tileWidth || TILE_WIDTH;
      const tileHeight = settings.tileHeight || TILE_STEP_Y;
      const tileDrawHeight = settings.tileDrawHeight || TILE_DRAW_HEIGHT;

      // Calculate map bounds for centering (lobby only)
      let minX = Infinity,minY = Infinity,maxX = -Infinity,maxY = -Infinity;

      if (isLobby && tiles.length > 0) {
        tiles.forEach((tile) => {
          if (!tile || !tile.key) return;
          const [colStr, rowStr] = tile.key.split(',');
          const col = parseInt(colStr, 10);
          const row = parseInt(rowStr, 10);
          if (!Number.isFinite(col) || !Number.isFinite(row)) return;

          const isoX = col * tileWidth + row % 2 * (tileWidth / 2);
          const isoY = row * tileHeight;

          minX = Math.min(minX, isoX);
          minY = Math.min(minY, isoY);
          maxX = Math.max(maxX, isoX + tileWidth);
          maxY = Math.max(maxY, isoY + tileDrawHeight);
        });
      }

      let offsetX = 0,offsetY = 0;
      if (isLobby && isFinite(minX)) {
        const mapWidth = maxX - minX || 100;
        const mapHeight = maxY - minY || 100;
        offsetX = (window.innerWidth - mapWidth) / 2 - minX;
        offsetY = (window.innerHeight - mapHeight) / 2 - minY;
      }

      // Create a single wrapper container for all elements
      const renderContainer = document.createElement('div');
      renderContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                will-change: transform;
            `;

      // Build HTML string for better performance
      let tilesHTML = '';
      let objectsHTML = '';

      // Render ground tiles
      tiles.forEach((tile) => {
        if (!tile || !tile.key || !tile.image) return;

        const [colStr, rowStr] = tile.key.split(',');
        const col = parseInt(colStr, 10);
        const row = parseInt(rowStr, 10);
        if (!Number.isFinite(col) || !Number.isFinite(row)) return;

        const isoX = col * tileWidth + row % 2 * (tileWidth / 2);
        const isoY = row * tileHeight;

        tilesHTML += `
                    <div class="ground-tile" style="
                        position: absolute;
                        left: ${isoX + offsetX}px;
                        top: ${isoY + offsetY}px;
                        width: ${tileWidth}px;
                        height: ${tileDrawHeight}px;
                        background-image: url('${tile.image}');
                        background-size: 100% 100%;
                        background-position: center top;
                        background-repeat: no-repeat;
                        pointer-events: none;
                        z-index: 1;
                        image-rendering: pixelated;
                        image-rendering: crisp-edges;
                    "></div>
                `;
      });

      // Render objects/buildings
      objects.forEach((obj) => {
        if (!obj || !obj.image || typeof obj.x !== 'number' || typeof obj.y !== 'number') return;

        objectsHTML += `
                    <div class="map-object" style="
                        position: absolute;
                        left: ${obj.x + offsetX}px;
                        top: ${obj.y + offsetY}px;
                        transform: translate(-50%, -50%);
                        pointer-events: none;
                        z-index: ${2 + Math.floor(obj.y)};
                    ">
                        <img src="${obj.image}" style="
                            display: block;
                            max-width: none;
                            width: ${obj.width || 'auto'}px;
                            height: ${obj.height || 'auto'}px;
                            image-rendering: pixelated;
                            image-rendering: -moz-crisp-edges;
                            image-rendering: crisp-edges;
                        ">
                    </div>
                `;
      });

      // Set all HTML at once (much faster than individual appendChild calls)
      renderContainer.innerHTML = tilesHTML + objectsHTML;
      container.appendChild(renderContainer);

      console.log(`[DOMMapRenderer] Rendered ${tiles.length} tiles and ${objects.length} objects | Lobby: ${isLobby}`);
    },

    hideCanvasBackgrounds() {
      console.log('🔍 hideCanvasBackgrounds called');
      const tankCanvas = document.getElementById('tankLobbyBackground');
      const jetCanvas = document.getElementById('jetLobbyBackground');
      const raceCanvas = document.getElementById('raceLobbyBackground');

      console.log('🔍 Canvas visibility before hiding:', {
        tank: tankCanvas ? tankCanvas.style.display : 'not found',
        jet: jetCanvas ? jetCanvas.style.display : 'not found',
        race: raceCanvas ? raceCanvas.style.display : 'not found'
      });

      if (tankCanvas) tankCanvas.style.display = 'none';
      if (jetCanvas) jetCanvas.style.display = 'none';
      if (raceCanvas) raceCanvas.style.display = 'none';

      console.log('[DOMMapRenderer] Hidden canvas backgrounds for DOM map');
    },

    showCanvasBackgrounds() {
      console.log('🔍 showCanvasBackgrounds called');
      // Get current vehicle type and show appropriate canvas
      const currentVehicle = window.currentVehicleType || 'tank';
      console.log('🔍 currentVehicle:', currentVehicle);

      if (currentVehicle === 'tank') {
        const tankCanvas = document.getElementById('tankLobbyBackground');
        if (tankCanvas) tankCanvas.style.display = 'block';
      } else if (currentVehicle === 'jet') {
        const jetCanvas = document.getElementById('jetLobbyBackground');
        if (jetCanvas) jetCanvas.style.display = 'block';
      } else if (currentVehicle === 'race') {
        const raceCanvas = document.getElementById('raceLobbyBackground');
        if (raceCanvas) raceCanvas.style.display = 'block';
      }

      console.log('[DOMMapRenderer] Restored canvas backgrounds');
    },

    hide() {
      if (this.lobbyMapContainer) {
        this.lobbyMapContainer.style.display = 'none';
      }
      if (this.gameMapContainer) {
        this.gameMapContainer.style.display = 'none';
      }
      // Show canvas backgrounds when hiding DOM map
      this.showCanvasBackgrounds();
    },

    show() {
      if (this.lobbyMapContainer) {
        this.lobbyMapContainer.style.display = 'block';
      }
      if (this.gameMapContainer) {
        this.gameMapContainer.style.display = 'block';
      }
    },

    clearLobbyMap() {
      if (this.lobbyMapContainer) {
        this.lobbyMapContainer.innerHTML = '';
      }
      // Restore canvas backgrounds when clearing DOM map
      this.showCanvasBackgrounds();
      console.log('[DOMMapRenderer] Lobby map cleared and canvas backgrounds restored');
    },

    clearMap() {
      if (this.lobbyMapContainer) {
        this.lobbyMapContainer.innerHTML = '';
      }
      if (this.gameMapContainer) {
        this.gameMapContainer.innerHTML = '';
        // Also remove from DOM if attached
        if (this.gameMapContainer.parentNode) {
          this.gameMapContainer.parentNode.removeChild(this.gameMapContainer);
        }
      }
      this.currentMap = null;
      // Restore canvas backgrounds when clearing DOM map
      this.showCanvasBackgrounds();
      console.log('[DOMMapRenderer] Map cleared and canvas backgrounds restored');
    },

    // Clear game map container specifically (called when entering game)
    clearGameMap() {
      if (this.gameMapContainer) {
        this.gameMapContainer.innerHTML = '';
        // Remove from DOM if attached
        if (this.gameMapContainer.parentNode) {
          this.gameMapContainer.parentNode.removeChild(this.gameMapContainer);
        }
      }
      // Stop camera sync if running
      if (this.cameraSyncId) {
        cancelAnimationFrame(this.cameraSyncId);
        this.cameraSyncId = null;
      }
      console.log('[DOMMapRenderer] Game map container cleared');
    }
  };

  window.DOMMapRenderer = DOMMapRenderer;

  DOMMapRenderer.init();

  // Removed automatic rendering on DOM ready - lobby background should only render when explicitly requested
  // This prevents double rendering and ensures proper timing with lobby state
})();