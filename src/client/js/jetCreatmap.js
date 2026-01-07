// Jet Map Creator
// Creates space-themed maps with asteroids, backgrounds, and jet-specific assets

// Jet map creator state
let jetPlacedObjects = [];
let jetCustomGroundTiles = new Map();
let jetCanvasZoom = 0.5;
let jetTargetCanvasZoom = 0.5;
let jetCanvasOffsetX = 0;
let jetCanvasOffsetY = 0;
let jetTargetCanvasOffsetX = 0;
let jetTargetCanvasOffsetY = 0;
let jetSelectedAsset = null;
let jetCurrentAssetCategory = 'backgrounds';
let jetIsDragging = false;
let jetDragStartX = 0;
let jetDragStartY = 0;

// Keyboard panning state for jet editor
let jetKeysPressed = {};
let jetVelocityX = 0;
let jetVelocityY = 0;
const jetMaxSpeed = 15;
const jetAcceleration = 0.8;
const jetFriction = 0.85;

// Preview state for jet editor
let jetPreviewX = 0;
let jetPreviewY = 0;
let jetIsHovering = false;

// Map boundary radius (world units)
const JET_MAP_RADIUS = 3000;

// Grid snapping for clean object placement
const JET_GRID_SIZE = 32;
let jetGridSnapEnabled = true;

// Snap position to grid
function jetSnapToGrid(x, y, gridSize) {
  if (!jetGridSnapEnabled) return { x, y };
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
}

// Jet asset categories
const jetAssetCategories = {
  backgrounds: {
    name: 'Backgrounds',
    path: '/assets/jet/Backgrounds/',
    assets: [
    { name: 'Stars 1', file: 'spr_overlay_sky_stars1.png' },
    { name: 'Stars 2', file: 'spr_overlay_sky_stars2.png' },
    { name: 'Stars Blue', file: 'spr_overlay_sky_starsblue.png' },
    { name: 'Stars Purple', file: 'spr_overlay_sky_starspurple.png' },
    { name: 'Stars Red', file: 'spr_overlay_sky_starsred.png' },
    { name: 'Nebula 1', file: 'spr_sky_nebula1.png' },
    { name: 'Nebula 2', file: 'spr_sky_nebula2.png' },
    { name: 'Standard Sky', file: 'spr_sky_standard.png' },
    { name: 'Cluster 1', file: 'spr_cluster1.png' },
    { name: 'Cluster 2', file: 'spr_cluster2.png' },
    { name: 'Planet Black', file: 'spr_planet_black.png' },
    { name: 'Planet Blue', file: 'spr_planet_blue.png' },
    { name: 'Planet Pink', file: 'spr_planet_pink.png' },
    { name: 'Star Green', file: 'spr_star_green.png' },
    { name: 'Star Red', file: 'spr_star_red.png' },
    { name: 'Star Red 2', file: 'spr_star_red2.png' }]

  },
  asteroids: {
    name: 'Asteroids',
    path: '/assets/jet/Asteroids/',
    assets: [
    { name: 'Large Rock 1', file: 'Asteroid Large 1/Rock/spr_asteroids_large1_rock_01.png', folder: 'Asteroid Large 1/Rock' },
    { name: 'Large Ice 1', file: 'Asteroid Large 1/Ice/spr_asteroids_large1_ice_01.png', folder: 'Asteroid Large 1/Ice' },
    { name: 'Large Gold 1', file: 'Asteroid Large 1/Gold/spr_asteroids_large1_gold_01.png', folder: 'Asteroid Large 1/Gold' },
    { name: 'Large Rock 2', file: 'Asteroid Large 2/Rock/spr_asteroids_large2_rock_01.png', folder: 'Asteroid Large 2/Rock' },
    { name: 'Medium Rock 1', file: 'Asteroid Medium 1/Rock/spr_asteroids_medium1_rock_01.png', folder: 'Asteroid Medium 1/Rock' },
    { name: 'Medium Ice 1', file: 'Asteroid Medium 1/Ice/spr_asteroids_medium1_ice_01.png', folder: 'Asteroid Medium 1/Ice' },
    { name: 'Small Rock 1', file: 'Asteroid Small 1/Rock/spr_asteroids_small1_rock_01.png', folder: 'Asteroid Small 1/Rock' },
    { name: 'Small Ice 1', file: 'Asteroid Small 1/Ice/spr_asteroids_small1_ice_01.png', folder: 'Asteroid Small 1/Ice' }]

  }
};


// Show jet map name input
function showJetMapNameInput() {
  console.log('Opening jet map name input...');

  const modal = document.createElement('div');
  modal.id = 'jetMapNameModal';
  modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
    `;

  const container = document.createElement('div');
  container.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 3px solid #ff8800;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 0 30px rgba(255, 136, 0, 0.3);
    `;

  container.innerHTML = `
        <h2 style="color: #ff8800; margin-bottom: 10px;">✈️ JET MAP CREATOR</h2>
        <p style="color: #ccc; margin-bottom: 20px;">Create a space battle arena</p>
        <input 
            type="text" 
            id="jetMapNameInput" 
            placeholder="Enter map name..." 
            maxlength="30"
            style="
                width: 100%;
                padding: 12px;
                font-size: 16px;
                border: 2px solid #ff8800;
                border-radius: 8px;
                background: #0a0a1a;
                color: white;
                margin-bottom: 20px;
                outline: none;
            "
        />
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="jetCancelBtn" style="
                padding: 10px 20px;
                background: #666;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Cancel</button>
            <button id="jetCreateBtn" style="
              padding: 10px 20px;
              background: #ff8800;
              color: #fff;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-weight: bold;
            ">Create Jet Map</button>
        </div>
    `;

  modal.appendChild(container);
  document.body.appendChild(modal);

  const input = document.getElementById('jetMapNameInput');
  input.focus();

  document.getElementById('jetCancelBtn').onclick = () => modal.remove();

  document.getElementById('jetCreateBtn').onclick = () => {
    const mapName = input.value.trim();
    if (!mapName) {
      alert('Please enter a map name!');
      return;
    }
    window.currentJetMapName = mapName;
    window.currentMapVehicleType = 'jet';
    modal.remove();
    startJetMapEditor();
  };

  input.onkeypress = (e) => {
    if (e.key === 'Enter') {
      document.getElementById('jetCreateBtn').click();
    }
  };
}

// Start the jet map editor
function startJetMapEditor() {
  console.log('Starting jet map editor for:', window.currentJetMapName);

  // Hide other screens
  const createMapScreen = document.getElementById('createMapScreen');
  if (createMapScreen) createMapScreen.classList.add('hidden');

  // Create jet map editor container
  createJetMapEditorUI();
}


// Create the jet map editor UI
function createJetMapEditorUI() {
  // Remove existing editor if any
  const existingEditor = document.getElementById('jetMapCreator');
  if (existingEditor) existingEditor.remove();

  const editor = document.createElement('div');
  editor.id = 'jetMapCreator';
  editor.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0a0a1a;
        z-index: 9999;
        display: flex;
    `;

  editor.innerHTML = `
        <!-- Main Canvas Area -->
        <div style="flex: 1; position: relative; overflow: hidden;">
            <canvas id="jetMapCanvas" style="
                width: 100%;
                height: 100%;
                cursor: crosshair;
            "></canvas>
            
            <!-- Top Bar -->
            <div style="
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(26, 26, 46, 0.9);
                border: 2px solid #ff8800;
                border-radius: 10px;
                padding: 10px 20px;
                display: flex;
                align-items: center;
                gap: 15px;
            ">
                <span style="color: #ff8800; font-weight: bold;">✈️ ${window.currentJetMapName || 'Jet Map'}</span>
                <span style="color: #888;">|</span>
                <span id="jetObjectCount" style="color: #ccc;">Objects: 0</span>
            </div>
            
            <!-- Action Buttons -->
            <div style="
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 10px;
            ">
                <button onclick="clearJetMap()" style="
                    padding: 12px 25px;
                    background: #cc3333;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">🗑️ Clear</button>
                <button onclick="saveJetMap()" style="
                    padding: 12px 25px;
                    background: #33cc33;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">💾 Save Map</button>
                <button onclick="closeJetMapCreator()" style="
                    padding: 12px 25px;
                    background: #666;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">❌ Close</button>
            </div>
            
            <!-- Right Panel - Editor (like tank editor) -->
            <div id="jetAssetPanel" class="assets-panel minimized" style="
                position: absolute;
                right: 9px;
                top: 80px;
                width: 280px;
                max-height: calc(100vh - 180px);
                background: linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
                border: 3px solid rgba(255, 136, 0, 0.4);
                border-radius: 0;
                overflow: hidden;
                backdrop-filter: blur(20px);
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 136, 0, 0.2);
            ">
                <div class="assets-panel-header" id="jetEditorHeader" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(255, 136, 0, 0.3);
                    position: relative;
                    cursor: move;
                    user-select: none;
                ">
                    <h3 style="margin: 0; font-size: 22px; color: #ff8800; pointer-events: none;">Editor</h3>
                    <button class="minimize-btn" id="jetMinimizeBtn" onclick="toggleJetAssetsPanel()" style="
                        width: 36px;
                        height: 36px;
                        background: rgba(255, 136, 0, 0.1);
                        border: 2px solid rgba(255, 136, 0, 0.4);
                        border-radius: 50%;
                        color: #ff8800;
                        font-size: 24px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s ease;
                    ">+</button>
                </div>
                
                <div class="assets-panel-content" id="jetAssetPanelContent" style="
                    padding: 20px;
                    max-height: calc(100vh - 280px);
                    overflow-y: auto;
                    opacity: 0;
                    max-height: 0;
                    transition: all 0.3s ease;
                ">
                    <!-- Category Tabs -->
                    <div id="jetCategoryTabs" style="
                        display: flex;
                        gap: 10px;
                        margin-bottom: 15px;
                        flex-wrap: wrap;
                    ">
                        <button class="jet-category-btn active" data-category="backgrounds" onclick="switchJetAssetCategory('backgrounds')" style="
                            flex: 1;
                            min-width: 100px;
                            padding: 8px 12px;
                            background: rgba(255, 136, 0, 0.2);
                            border: 2px solid rgba(255, 136, 0, 0.6);
                            color: #ff8800;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 13px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">🌌 Backgrounds</button>
                        <button class="jet-category-btn" data-category="asteroids" onclick="switchJetAssetCategory('asteroids')" style="
                            flex: 1;
                            min-width: 100px;
                            padding: 8px 12px;
                            background: rgba(255, 165, 0, 0.2);
                            border: 2px solid rgba(255, 165, 0, 0.6);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 13px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">☄️ Asteroids</button>
                    </div>
                    
                    <!-- Asset Grid -->
                    <div id="jetAssetGrid" style="
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                    "></div>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(editor);

  // Initialize canvas
  initJetMapCanvas();

  // Load initial assets
  loadJetAssets('backgrounds');

  // Setup category tabs
  setupJetCategoryTabs();

  // Setup draggable editor panel
  setupJetEditorDrag();

  // Create minimap preview
  createJetMinimap();

  // Load existing map data if editing
  if (window.currentJetMapData) {
    loadJetMapData(window.currentJetMapData);
    window.currentJetMapData = null; // Clear after loading
  }
}


// Initialize jet map canvas
function initJetMapCanvas() {
  const canvas = document.getElementById('jetMapCanvas');
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Center the camera
  jetCanvasOffsetX = canvas.width / 2;
  jetCanvasOffsetY = canvas.height / 2;
  jetTargetCanvasOffsetX = jetCanvasOffsetX;
  jetTargetCanvasOffsetY = jetCanvasOffsetY;

  const ctx = canvas.getContext('2d');

  // Initial background draw will happen in render loop

  // Setup event listeners
  canvas.addEventListener('click', handleJetCanvasClick);
  canvas.addEventListener('wheel', handleJetCanvasZoom);
  canvas.addEventListener('mousedown', handleJetCanvasMouseDown);
  canvas.addEventListener('mousemove', handleJetCanvasMouseMove);
  canvas.addEventListener('mouseup', handleJetCanvasMouseUp);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // Add keyboard controls for WASD panning
  window.addEventListener('keydown', handleJetKeyDown);
  window.addEventListener('keyup', handleJetKeyUp);

  // Start render loop
  requestAnimationFrame(renderJetMap);

  // Start panning loop for smooth keyboard movement
  startJetPanningLoop();
}

// Pre-generated stars for consistent background
let jetStars = [];
let jetStarsGenerated = false;

// Generate stars once
function generateJetStars() {
  if (jetStarsGenerated) return;
  jetStars = [];
  // Generate stars in a large area for scrolling
  for (let i = 0; i < 500; i++) {
    jetStars.push({
      x: (Math.random() - 0.5) * 8000,
      y: (Math.random() - 0.5) * 8000,
      size: Math.random() * 2 + 0.5,
      brightness: Math.random() * 0.5 + 0.5
    });
  }
  jetStarsGenerated = true;
}

// Draw space background with camera offset
function drawJetMapBackground(ctx, canvas, cameraX, cameraY, zoom) {
  // Dark space gradient (fixed to screen)
  const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height));
  gradient.addColorStop(0, '#1a1a3e');
  gradient.addColorStop(0.5, '#0a0a2a');
  gradient.addColorStop(1, '#000010');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw stars that move with camera
  generateJetStars();

  ctx.save();
  ctx.translate(canvas.width / 2 + cameraX, canvas.height / 2 + cameraY);
  ctx.scale(zoom, zoom);

  jetStars.forEach((star) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// Render jet map
function renderJetMap() {
  const canvas = document.getElementById('jetMapCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Clear and draw background with camera offset
  drawJetMapBackground(ctx, canvas, jetCanvasOffsetX, jetCanvasOffsetY, jetCanvasZoom);

  // Draw placed objects and boundary
  ctx.save();
  ctx.translate(canvas.width / 2 + jetCanvasOffsetX, canvas.height / 2 + jetCanvasOffsetY);
  ctx.scale(jetCanvasZoom, jetCanvasZoom);

  // Draw circular boundary/fence
  ctx.strokeStyle = '#ff8800';
  ctx.lineWidth = 8 / jetCanvasZoom;
  ctx.setLineDash([20 / jetCanvasZoom, 10 / jetCanvasZoom]);
  ctx.beginPath();
  ctx.arc(0, 0, JET_MAP_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw inner glow
  ctx.strokeStyle = 'rgba(255, 136, 0, 0.3)';
  ctx.lineWidth = 20 / jetCanvasZoom;
  ctx.beginPath();
  ctx.arc(0, 0, JET_MAP_RADIUS - 15, 0, Math.PI * 2);
  ctx.stroke();

  jetPlacedObjects.forEach((obj) => {
    if (obj.image && obj.image.complete) {
      ctx.drawImage(obj.image, obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
    }
  });

  // Draw preview of selected asset at mouse position
  if (jetIsHovering && jetSelectedAsset && !jetIsDragging) {
    // Load preview image if not cached
    if (!jetSelectedAsset.previewImage) {
      jetSelectedAsset.previewImage = new Image();
      jetSelectedAsset.previewImage.src = jetSelectedAsset.path;
    }

    const previewImg = jetSelectedAsset.previewImage;
    if (previewImg.complete && previewImg.naturalWidth > 0) {
      const width = previewImg.naturalWidth;
      const height = previewImg.naturalHeight;

      // Check if placement would be duplicate
      const isDuplicate = checkJetDuplicatePlacement(jetPreviewX, jetPreviewY, jetSelectedAsset);

      ctx.save();
      ctx.globalAlpha = isDuplicate ? 0.3 : 0.6;
      ctx.drawImage(previewImg, jetPreviewX - width / 2, jetPreviewY - height / 2, width, height);

      // Draw outline - red if duplicate, orange if valid
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = isDuplicate ? '#ff4444' : '#ff8800';
      ctx.lineWidth = 3 / jetCanvasZoom;
      ctx.strokeRect(jetPreviewX - width / 2, jetPreviewY - height / 2, width, height);

      // Show X mark if duplicate
      if (isDuplicate) {
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 4 / jetCanvasZoom;
        const size = Math.min(width, height) / 3;
        ctx.beginPath();
        ctx.moveTo(jetPreviewX - size, jetPreviewY - size);
        ctx.lineTo(jetPreviewX + size, jetPreviewY + size);
        ctx.moveTo(jetPreviewX + size, jetPreviewY - size);
        ctx.lineTo(jetPreviewX - size, jetPreviewY + size);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  ctx.restore();

  // Update object count
  const countEl = document.getElementById('jetObjectCount');
  if (countEl) countEl.textContent = `Objects: ${jetPlacedObjects.length}`;

  requestAnimationFrame(renderJetMap);
}

// Check if placing at this position would be a duplicate (overlapping same asset)
function checkJetDuplicatePlacement(x, y, asset) {
  // Get the size of the asset being placed
  let newWidth = 100;
  let newHeight = 100;

  // Use cached preview image size if available
  if (asset.previewImage && asset.previewImage.complete && asset.previewImage.naturalWidth > 0) {
    newWidth = asset.previewImage.naturalWidth;
    newHeight = asset.previewImage.naturalHeight;
  }

  // Calculate bounding box of new placement
  const newLeft = x - newWidth / 2;
  const newRight = x + newWidth / 2;
  const newTop = y - newHeight / 2;
  const newBottom = y + newHeight / 2;

  for (const obj of jetPlacedObjects) {
    // Check if same asset type
    if (obj.asset.name === asset.name) {
      // Get existing object bounds
      const objLeft = obj.x - obj.width / 2;
      const objRight = obj.x + obj.width / 2;
      const objTop = obj.y - obj.height / 2;
      const objBottom = obj.y + obj.height / 2;

      // Check for bounding box overlap (with small margin)
      const margin = 10;
      const overlapsX = newLeft < objRight - margin && newRight > objLeft + margin;
      const overlapsY = newTop < objBottom - margin && newBottom > objTop + margin;

      if (overlapsX && overlapsY) {
        return true; // Overlapping duplicate found
      }
    }
  }
  return false;
}

// Handle canvas click
function handleJetCanvasClick(e) {
  if (!jetSelectedAsset) return;
  if (jetIsDragging) return; // Don't place while dragging

  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Convert to world coordinates
  let worldX = (clickX - canvas.width / 2 - jetCanvasOffsetX) / jetCanvasZoom;
  let worldY = (clickY - canvas.height / 2 - jetCanvasOffsetY) / jetCanvasZoom;

  // Snap to grid for clean placement
  const snapped = jetSnapToGrid(worldX, worldY, JET_GRID_SIZE);
  worldX = snapped.x;
  worldY = snapped.y;

  // Check for duplicate placement
  if (checkJetDuplicatePlacement(worldX, worldY, jetSelectedAsset)) {
    console.log('Duplicate placement prevented at:', worldX, worldY);
    return; // Don't place duplicate
  }

  // Create new object
  const img = new Image();
  img.src = jetSelectedAsset.path;
  img.onload = () => {
    jetPlacedObjects.push({
      asset: jetSelectedAsset,
      image: img,
      x: worldX,
      y: worldY,
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    console.log('Placed object:', jetSelectedAsset.name, 'at', worldX, worldY);
  };
}

// Handle canvas zoom
function handleJetCanvasZoom(e) {
  e.preventDefault();
  const canvas = document.getElementById('jetMapCanvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Calculate world position under mouse before zoom
  const worldX = (mouseX - canvas.width / 2 - jetCanvasOffsetX) / jetCanvasZoom;
  const worldY = (mouseY - canvas.height / 2 - jetCanvasOffsetY) / jetCanvasZoom;

  // Apply zoom with multiplier for smoother feel
  const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
  const newZoom = Math.max(0.1, Math.min(3, jetCanvasZoom * zoomDelta));

  // Calculate new offset to keep world position under mouse
  const newOffsetX = mouseX - canvas.width / 2 - worldX * newZoom;
  const newOffsetY = mouseY - canvas.height / 2 - worldY * newZoom;

  // Apply new values
  jetCanvasZoom = newZoom;
  jetTargetCanvasZoom = newZoom;
  jetCanvasOffsetX = newOffsetX;
  jetCanvasOffsetY = newOffsetY;
  jetTargetCanvasOffsetX = newOffsetX;
  jetTargetCanvasOffsetY = newOffsetY;
}

// Handle mouse down for panning
function handleJetCanvasMouseDown(e) {
  if (e.button === 2 || e.button === 1) {
    jetIsDragging = true;
    jetDragStartX = e.clientX - jetCanvasOffsetX;
    jetDragStartY = e.clientY - jetCanvasOffsetY;
  }
}

// Handle mouse move for panning and preview
function handleJetCanvasMouseMove(e) {
  const canvas = document.getElementById('jetMapCanvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Update preview position (world coordinates)
  jetPreviewX = (mouseX - canvas.width / 2 - jetCanvasOffsetX) / jetCanvasZoom;
  jetPreviewY = (mouseY - canvas.height / 2 - jetCanvasOffsetY) / jetCanvasZoom;

  // Snap preview to grid for clean placement
  const snapped = jetSnapToGrid(jetPreviewX, jetPreviewY, JET_GRID_SIZE);
  jetPreviewX = snapped.x;
  jetPreviewY = snapped.y;
  jetIsHovering = true;

  if (jetIsDragging) {
    jetCanvasOffsetX = e.clientX - jetDragStartX;
    jetCanvasOffsetY = e.clientY - jetDragStartY;
  }
}

// Handle mouse up
function handleJetCanvasMouseUp(e) {
  jetIsDragging = false;
}


// Setup category tabs
function setupJetCategoryTabs() {
  const tabs = document.querySelectorAll('.jet-category-btn');
  tabs.forEach((tab) => {
    tab.onclick = () => {
      tabs.forEach((t) => {
        t.style.background = '#333';
        t.style.color = 'white';
        t.classList.remove('active');
      });
      tab.style.background = '#ff8800';
      tab.style.color = 'black';
      tab.classList.add('active');
      loadJetAssets(tab.dataset.category);
    };
  });
}

// Load jet assets for category
function loadJetAssets(category) {
  jetCurrentAssetCategory = category;
  const grid = document.getElementById('jetAssetGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const categoryData = jetAssetCategories[category];
  if (!categoryData) return;

  categoryData.assets.forEach((asset) => {
    const assetDiv = document.createElement('div');
    assetDiv.style.cssText = `
            background: #1a1a2e;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 8px;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease;
        `;

    const imgPath = categoryData.path + asset.file;

    assetDiv.innerHTML = `
            <img src="${imgPath}" style="
                max-width: 100%;
                max-height: 60px;
                object-fit: contain;
            " onerror="this.src='/assets/jet/Backgrounds/spr_sky_standard.png'"/>
            <div style="color: #ccc; font-size: 10px; margin-top: 5px;">${asset.name}</div>
        `;

    assetDiv.onmouseenter = () => {
      assetDiv.style.borderColor = '#ff8800';
      assetDiv.style.transform = 'scale(1.05)';
    };
    assetDiv.onmouseleave = () => {
      if (!assetDiv.classList.contains('selected')) {
        assetDiv.style.borderColor = '#333';
      }
      assetDiv.style.transform = 'scale(1)';
    };

    assetDiv.onclick = () => {
      // Deselect others
      grid.querySelectorAll('div').forEach((d) => {
        d.style.borderColor = '#333';
        d.classList.remove('selected');
      });
      // Select this one
      assetDiv.style.borderColor = '#ff8800';
      assetDiv.classList.add('selected');

      jetSelectedAsset = {
        name: asset.name,
        path: imgPath,
        category: category
      };
      console.log('Selected jet asset:', jetSelectedAsset);
    };

    grid.appendChild(assetDiv);
  });
}

// Create minimap preview for jet editor
function createJetMinimap() {
  if (document.getElementById('jetMinimap')) return;

  const minimapContainer = document.createElement('div');
  minimapContainer.id = 'jetMinimap';
  minimapContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        width: 180px;
        height: 180px;
        background: rgba(10, 10, 30, 0.9);
        backdrop-filter: blur(15px);
        border-radius: 50%;
        border: 4px solid rgba(255, 136, 0, 0.6);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 136, 0, 0.3);
        z-index: 99999;
        overflow: hidden;
    `;

  const minimapCanvas = document.createElement('canvas');
  minimapCanvas.id = 'jetMinimapCanvas';
  minimapCanvas.width = 180;
  minimapCanvas.height = 180;
  minimapCanvas.style.cssText = `
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 50%;
    `;

  minimapContainer.appendChild(minimapCanvas);
  document.body.appendChild(minimapContainer);

  // Start updating minimap
  updateJetMinimap();
}

// Pre-generated static stars for minimap
let jetMinimapStars = [];

// Update jet minimap
function updateJetMinimap() {
  const canvas = document.getElementById('jetMinimapCanvas');
  const jetEditor = document.getElementById('jetMapCreator');
  if (!canvas || !jetEditor) return;

  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 85;

  // Clear with space background
  ctx.fillStyle = '#0a0a2a';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Generate static stars once
  if (jetMinimapStars.length === 0) {
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius * 0.9;
      jetMinimapStars.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist
      });
    }
  }

  // Draw static stars on minimap
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  jetMinimapStars.forEach((star) => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
    ctx.fill();
  });

  // Scale: minimap radius / world map radius
  const scale = radius / JET_MAP_RADIUS;

  // Draw objects on minimap
  jetPlacedObjects.forEach((obj) => {
    const minimapX = centerX + obj.x * scale;
    const minimapY = centerY + obj.y * scale;
    const dist = Math.sqrt((minimapX - centerX) ** 2 + (minimapY - centerY) ** 2);
    if (dist < radius) {
      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.arc(minimapX, minimapY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw border - this represents the map boundary
  ctx.strokeStyle = 'rgba(255, 136, 0, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  requestAnimationFrame(updateJetMinimap);
}

// Clear jet map






// Load jet map data for editing
function loadJetMapData(mapData) {
  console.log('Loading jet map data:', mapData.name);
  jetPlacedObjects = [];

  if (mapData.objects && mapData.objects.length > 0) {
    mapData.objects.forEach((objData) => {
      const img = new Image();
      img.src = objData.path;
      img.onload = () => {
        jetPlacedObjects.push({
          asset: {
            name: objData.name,
            path: objData.path,
            category: objData.category
          },
          image: img,
          x: objData.x,
          y: objData.y,
          width: objData.width || 100,
          height: objData.height || 100
        });
      };
    });
  }

  // Update map ID for saving
  if (mapData.id) {
    window.currentJetMapId = mapData.id;
  }
}

// Save jet map




































// Close jet map creator






















// Toggle jet assets panel (like tank editor)












































// Setup draggable editor panel
function setupJetEditorDrag() {
  const panel = document.getElementById('jetAssetPanel');
  const header = document.getElementById('jetEditorHeader');
  if (!panel || !header) return;

  let isDragging = false;
  let startX, startY, initialX, initialY;

  header.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('minimize-btn')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    panel.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.left = initialX + dx + 'px';
    panel.style.top = initialY + dy + 'px';
    panel.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      panel.style.transition = '';
    }
  });
}

// Keyboard controls for jet editor panning
function handleJetKeyDown(e) {
  const jetEditor = document.getElementById('jetMapCreator');
  if (!jetEditor) return;

  const key = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
    e.preventDefault();
    jetKeysPressed[key] = true;
  }
}

function handleJetKeyUp(e) {
  const key = e.key.toLowerCase();
  jetKeysPressed[key] = false;
}

// Continuous panning loop for jet editor
let jetPanningLoopId = null;

function startJetPanningLoop() {
  if (jetPanningLoopId) cancelAnimationFrame(jetPanningLoopId);

  function panLoop() {
    const jetEditor = document.getElementById('jetMapCreator');
    if (!jetEditor) {
      jetPanningLoopId = null;
      return;
    }

    let targetVelocityX = 0;
    let targetVelocityY = 0;

    if (jetKeysPressed['arrowup'] || jetKeysPressed['w']) {
      targetVelocityY = jetMaxSpeed;
    }
    if (jetKeysPressed['arrowdown'] || jetKeysPressed['s']) {
      targetVelocityY = -jetMaxSpeed;
    }
    if (jetKeysPressed['arrowleft'] || jetKeysPressed['a']) {
      targetVelocityX = jetMaxSpeed;
    }
    if (jetKeysPressed['arrowright'] || jetKeysPressed['d']) {
      targetVelocityX = -jetMaxSpeed;
    }

    if (targetVelocityX !== 0) {
      jetVelocityX += (targetVelocityX - jetVelocityX) * jetAcceleration * 0.1;
    } else {
      jetVelocityX *= jetFriction;
    }

    if (targetVelocityY !== 0) {
      jetVelocityY += (targetVelocityY - jetVelocityY) * jetAcceleration * 0.1;
    } else {
      jetVelocityY *= jetFriction;
    }

    if (Math.abs(jetVelocityX) > 0.1 || Math.abs(jetVelocityY) > 0.1) {
      jetCanvasOffsetX += jetVelocityX;
      jetCanvasOffsetY += jetVelocityY;
      jetTargetCanvasOffsetX = jetCanvasOffsetX;
      jetTargetCanvasOffsetY = jetCanvasOffsetY;
    }

    // Smooth zoom interpolation
    jetCanvasZoom += (jetTargetCanvasZoom - jetCanvasZoom) * 0.1;

    jetPanningLoopId = requestAnimationFrame(panLoop);
  }

  panLoop();
}

// Close jet map creator
function closeJetMapCreator() {
  console.log('Closing jet map creator...');
  const editor = document.getElementById('jetMapCreator');
  if (editor) {
    editor.remove();
  }
  
  // Clean up event listeners
  document.removeEventListener('keydown', handleJetKeyDown);
  document.removeEventListener('keyup', handleJetKeyUp);
  
  // Stop panning loop
  if (jetPanningLoopId) {
    cancelAnimationFrame(jetPanningLoopId);
    jetPanningLoopId = null;
  }
  
  console.log('✅ Jet map creator closed');
}

// Save jet map function
function saveJetMap() {
  console.log('Saving jet map...');
  
  if (!window.currentJetMapName) {
    alert('No map name specified!');
    return;
  }
  
  try {
    // Get placed objects (if they exist)
    const mapData = {
      name: window.currentJetMapName,
      vehicleType: 'jet',
      objects: window.jetPlacedObjects || [],
      created: Date.now(),
      version: '1.0'
    };
    
    // Save to localStorage
    const existingMaps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    
    // Check if map already exists
    const existingIndex = existingMaps.findIndex(map => map.name === window.currentJetMapName);
    
    if (existingIndex >= 0) {
      // Update existing map
      existingMaps[existingIndex] = mapData;
    } else {
      // Add new map
      existingMaps.push(mapData);
    }
    
    localStorage.setItem('thefortz.customMaps', JSON.stringify(existingMaps));
    
    console.log('✅ Jet map saved successfully:', window.currentJetMapName);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Jet map "${window.currentJetMapName}" saved!`, 'success');
    } else {
      alert(`Jet map "${window.currentJetMapName}" saved successfully!`);
    }
    
  } catch (error) {
    console.error('❌ Error saving jet map:', error);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Error saving jet map!', 'error');
    } else {
      alert('Error saving jet map!');
    }
  }
}

// Clear jet map function
function clearJetMap() {
  console.log('Clearing jet map...');
  
  if (confirm('Are you sure you want to clear the map? This cannot be undone.')) {
    // Clear placed objects
    if (window.jetPlacedObjects) {
      window.jetPlacedObjects = [];
    }
    
    // Clear canvas if it exists
    const canvas = document.getElementById('jetMapCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    console.log('✅ Jet map cleared');
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Jet map cleared!', 'info');
    }
  }
}

// Make functions globally available
window.showJetMapNameInput = showJetMapNameInput;
window.startJetMapEditor = startJetMapEditor;
window.closeJetMapCreator = closeJetMapCreator;
window.saveJetMap = saveJetMap;
window.clearJetMap = clearJetMap;

// Toggle jet assets panel function
function toggleJetAssetsPanel() {
  console.log('Toggling jet assets panel...');
  
  const panel = document.getElementById('jetAssetPanel');
  if (panel) {
    if (panel.classList.contains('minimized')) {
      panel.classList.remove('minimized');
      console.log('✅ Jet assets panel expanded');
    } else {
      panel.classList.add('minimized');
      console.log('✅ Jet assets panel minimized');
    }
  } else {
    console.warn('⚠️ Jet assets panel not found');
  }
}

// Switch jet asset category function
function switchJetAssetCategory(category) {
  console.log('Switching jet asset category to:', category);
  
  // Update active button
  const buttons = document.querySelectorAll('.jet-category-btn');
  buttons.forEach(btn => {
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Load assets for category (if loadJetAssets function exists)
  if (typeof loadJetAssets === 'function') {
    loadJetAssets(category);
  } else {
    console.log('✅ Switched to jet category:', category);
  }
}

window.toggleJetAssetsPanel = toggleJetAssetsPanel;
window.switchJetAssetCategory = switchJetAssetCategory;