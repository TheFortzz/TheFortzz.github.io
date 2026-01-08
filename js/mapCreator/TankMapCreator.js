// Map Creator System - Canvas Rendering Only (UI handled by HTML)
let createMapAnimationId = null;

// Basic player stats placeholder for map creator UI
let playerStatsData = {
    dailyPlayers: [
        { day: 0, players: 0 },
        { day: 1, players: 45 },
        { day: 2, players: 78 },
        { day: 3, players: 120 },
        { day: 4, players: 95 },
        { day: 5, players: 156 },
        { day: 6, players: 203 },
        { day: 7, players: 189 }
    ],
    totalMaps: 0,
    totalPlays: 0,
    avgRating: 0
};

// Main rendering function for create map screen
function startCreateMapRendering() {
    console.log('🗺️ Starting create map rendering...');
    
    // Stop any existing animation
    if (createMapAnimationId) {
        cancelAnimationFrame(createMapAnimationId);
        createMapAnimationId = null;
    }
    
    // Get the create map screen canvas (if it exists)
    const canvas = document.getElementById('mapCreatorCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Animation loop removed - no continuous redrawing needed
    }
    
    // Create interactive elements
    createInteractiveElements();
    
    console.log('✅ Create map rendering started');
}

function stopCreateMapRendering() {
    console.log('🛑 Stopping create map rendering...');
    
    // Stop any existing animation
    if (createMapAnimationId) {
        cancelAnimationFrame(createMapAnimationId);
        createMapAnimationId = null;
    }

    // Remove the create new map button
    const btn = document.getElementById('createNewMapBtn');
    if (btn) btn.remove();
    
    console.log('✅ Create map rendering stopped');
}

function handleMapCreatorClick(event) {
    console.log('🖱️ Map creator click handled:', event);
    
    // Handle click events in the map creator
    if (!event) return;
    
    const canvas = document.getElementById('mapCreatorCanvas');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    console.log(`Click at canvas coordinates: ${x}, ${y}`);
    
    // Add any click handling logic here
    // This could be used for placing objects, selecting areas, etc.
}

function openBlankMapCreator() {
    console.log('🆕 Opening blank map creator...');
    
    // Create modal overlay for map name input
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
    `;

    // Create input container
    const container = document.createElement('div');
    container.style.cssText = `
        background: #1a2a3a;
        border: 3px solid #00f7ff;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 400px;
        width: 90%;
    `;

    container.innerHTML = `
        <h2 style="color: #00f7ff; margin-bottom: 20px;">🗺️ Create New Map</h2>
        <input 
            type="text" 
            id="mapNameInput" 
            placeholder="Enter map name..." 
            maxlength="30"
            style="
                width: 100%;
                padding: 12px;
                font-size: 16px;
                border: 2px solid #00f7ff;
                border-radius: 8px;
                background: #0a1a2a;
                color: white;
                margin-bottom: 20px;
                outline: none;
            "
        />
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="cancelBtn" style="
                padding: 10px 20px;
                background: #666;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Cancel</button>
            <button id="createBtn" style="
                padding: 10px 20px;
                background: #00f7ff;
                color: #fff;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">Create Map</button>
        </div>
    `;

    modal.appendChild(container);
    document.body.appendChild(modal);

    // Focus on input
    const input = container.querySelector('#mapNameInput');
    if (input) input.focus();

    // Handle cancel
    container.querySelector('#cancelBtn').onclick = () => {
        modal.remove();
    };

    // Handle create
    container.querySelector('#createBtn').onclick = () => {
        const mapName = input.value.trim();
        if (!mapName) {
            alert('Please enter a map name!');
            return;
        }

        // Store map name and start editor
        window.currentMapName = mapName;
        modal.remove();

        // Start the map editor
        if (typeof startMapEditor === 'function') {
            startMapEditor(false);
        } else {
            console.error('startMapEditor function not found');
        }
    };

    // Handle Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            container.querySelector('#createBtn').click();
        }
    });
}

function closeBlankMapCreator() {
    console.log('❌ Closing blank map creator...');
    
    // Hide the blank creator
    const blankCreator = document.getElementById('blankMapCreator');
    if (blankCreator) {
        blankCreator.classList.add('hidden');
    }

    // Show the create map screen again
    const createMapScreen = document.getElementById('createMapScreen');
    if (createMapScreen) {
        createMapScreen.classList.remove('hidden');
    }

    // Load saved maps
    if (typeof loadSavedMaps === 'function') {
        loadSavedMaps();
    }
}

function startMapEditor(isEditMode = false) {
    console.log('🚀 Starting map editor...', isEditMode ? '(Edit Mode)' : '(New Map)');
    
    // Show the blank creator
    const blankCreator = document.getElementById('blankMapCreator');
    if (blankCreator) {
        blankCreator.classList.remove('hidden');
        console.log('✅ Map editor opened');
    } else {
        console.error('❌ Blank creator element not found');
    }

    // Hide game minimap if it exists
    const gameMinimap = document.getElementById('minimap');
    if (gameMinimap) {
        gameMinimap.style.display = 'none';
    }

    // Hide top navigation bar while in map editor
    document.body.classList.add('in-editor');
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.dataset._prevDisplay = topBar.style.display || '';
        topBar.style.display = 'none';
        console.log('✅ Top bar hidden');
    }
}

function loadSavedMaps() {
    console.log('📂 Loading saved maps...');
    
    try {
        // Get saved maps from localStorage
        const savedMaps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
        console.log(`Found ${savedMaps.length} saved maps`);
        
        // Get the maps grid container
        const mapsGrid = document.querySelector('.maps-grid');
        if (!mapsGrid) {
            console.warn('Maps grid not found');
            return;
        }
        
        // Clear existing map cards (except create new button)
        const existingCards = mapsGrid.querySelectorAll('.map-card');
        existingCards.forEach(card => card.remove());
        
        // Add saved maps to the grid
        savedMaps.forEach(mapData => {
            const mapCard = createMapCard(mapData);
            // Insert before the create new button
            const createBtn = mapsGrid.querySelector('.create-new-map-btn');
            if (createBtn) {
                mapsGrid.insertBefore(mapCard, createBtn);
            } else {
                mapsGrid.appendChild(mapCard);
            }
        });
        
        console.log('✅ Saved maps loaded successfully');
    } catch (error) {
        console.error('❌ Error loading saved maps:', error);
    }
}

function createMapCard(mapData) {
    const card = document.createElement('div');
    card.className = 'map-card';
    
    const thumbnail = mapData.thumbnail || '';
    const name = mapData.name || 'Untitled Map';
    const objectCount = mapData.objects ? mapData.objects.length : 0;
    const dateCreated = mapData.dateCreated ? new Date(mapData.dateCreated).toLocaleDateString() : 'Unknown';
    
    card.innerHTML = `
        <div class="map-card-thumbnail">
            ${thumbnail ? `<img src="${thumbnail}" alt="${name}">` : '<div style="text-align: center; color: rgba(255, 255, 255, 0.7); font-size: 14px;">🗺️<br>No Preview</div>'}
        </div>
        <div class="map-card-info">
            <h3 class="map-card-title">${name}</h3>
            <div class="map-card-stats">
                <div class="map-card-stat">
                    <span class="map-card-stat-icon">🗺️</span>
                    <span>${objectCount} Objects</span>
                </div>
                <div class="map-card-stat">
                    <span class="map-card-stat-icon">📅</span>
                    <span>${dateCreated}</span>
                </div>
            </div>
            <div class="map-card-actions">
                <button class="map-card-btn" onclick="editMap('${mapData.id || name}')">✏️ Edit</button>
                <button class="map-card-btn delete-btn" onclick="deleteMap('${mapData.id || name}')">🗑️</button>
            </div>
        </div>
    `;
    
    return card;
}

function editMap(mapId) {
    console.log('✏️ Editing map:', mapId);
    
    try {
        // Load the map data
        const savedMaps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
        const mapData = savedMaps.find(map => (map.id || map.name) === mapId);
        
        if (!mapData) {
            alert('Map not found!');
            return;
        }
        
        // Set the current map name
        window.currentMapName = mapData.name;
        
        // Load the map data into the editor
        if (mapData.objects) {
            placedObjects = mapData.objects;
        }
        if (mapData.spawnPoints) {
            spawnPoints = mapData.spawnPoints;
        }
        if (mapData.customGroundTiles) {
            customGroundTiles = new Map(Object.entries(mapData.customGroundTiles));
        }
        
        // Start the map editor in edit mode
        startMapEditor(true);
        
        console.log('✅ Map loaded for editing');
    } catch (error) {
        console.error('❌ Error loading map for editing:', error);
        alert('Failed to load map: ' + error.message);
    }
}

function deleteMap(mapId) {
    console.log('🗑️ Deleting map:', mapId);
    
    if (!confirm('Are you sure you want to delete this map? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Load saved maps
        const savedMaps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
        
        // Filter out the map to delete
        const updatedMaps = savedMaps.filter(map => (map.id || map.name) !== mapId);
        
        // Save back to localStorage
        localStorage.setItem('thefortz.customMaps', JSON.stringify(updatedMaps));
        
        // Reload the maps display
        loadSavedMaps();
        
        console.log('✅ Map deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting map:', error);
        alert('Failed to delete map: ' + error.message);
    }
}

function captureMapThumbnail() {
    let sourceCanvas = document.getElementById('mapCreatorMinimapCanvas');
    if ((!sourceCanvas || !sourceCanvas.width || !sourceCanvas.height) && typeof window !== 'undefined') {
        sourceCanvas = document.getElementById('mapCreatorCanvas');
    }

    if (!sourceCanvas || !sourceCanvas.width || !sourceCanvas.height) {
        console.warn('No canvas available for thumbnail capture');
        return null;
    }

    try {
        const targetWidth = 320;
        const targetHeight = 180;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        const ctx = tempCanvas.getContext('2d');

        ctx.fillStyle = '#041020';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        const aspectRatio = sourceCanvas.width / sourceCanvas.height;
        let drawWidth = targetWidth;
        let drawHeight = drawWidth / aspectRatio;

        if (drawHeight < targetHeight) {
            drawHeight = targetHeight;
            drawWidth = drawHeight * aspectRatio;
        }

        const offsetX = (targetWidth - drawWidth) / 2;
        const offsetY = (targetHeight - drawHeight) / 2;

        ctx.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);

        try {
            return tempCanvas.toDataURL('image/webp', 0.85);
        } catch (err) {
            console.warn('WebP thumbnail capture failed, falling back to PNG', err);
            return tempCanvas.toDataURL('image/png');
        }
    } catch (error) {
        console.warn('Failed to capture map thumbnail', error);
        return null;
    }
}

// Map creator state
let isInMapCreator = false;
let isEditingExistingMap = false;

// Ground texture variables
let groundTexturesLoaded = false;
let groundTextureImages = new Map();





function renderAnalyzeView(ctx, canvas, time, startY) {
    const contentY = startY;

    // Section title
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText('📊 Analytics Dashboard', canvas.width / 2, contentY - 10);

    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Track maps performance and player engagement', canvas.width / 2, contentY + 15);

    // Stats cards
    const statsY = contentY + 60;
    const statBoxWidth = 220;
    const statBoxHeight = 140;
    const statGap = 35;
    const statsStartX = (canvas.width - (statBoxWidth * 3 + statGap * 2)) / 2;

    const stats = [
        { label: 'Total Maps', value: playerStatsData.totalMaps, color: '#00f7ff', icon: '🗺️', desc: 'Available' },
        { label: 'Total Plays', value: playerStatsData.totalPlays, color: '#FFD700', icon: '🎮', desc: 'All Time' },
        { label: 'Avg Rating', value: playerStatsData.avgRating.toFixed(1), color: '#ff69b4', icon: '⭐', desc: 'Out of 5.0' }
    ];

    stats.forEach((stat, i) => {
        const x = statsStartX + i * (statBoxWidth + statGap);
        const y = statsY;

        const mouseOver = window.gameState.mouse &&
            window.gameState.mouse.x >= x && window.gameState.mouse.x <= x + statBoxWidth &&
            window.gameState.mouse.y >= y && window.gameState.mouse.y <= y + statBoxHeight;

        ctx.save();

        // Card shadow
        if (mouseOver) {
            ctx.shadowBlur = 25;
            ctx.shadowColor = `${stat.color}66`;
            ctx.shadowOffsetY = 8;
        } else {
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowOffsetY = 5;
        }

        // Card background
        const cardGradient = ctx.createLinearGradient(x, y, x, y + statBoxHeight);
        cardGradient.addColorStop(0, 'rgba(25, 35, 55, 0.95)');
        cardGradient.addColorStop(1, 'rgba(15, 25, 40, 0.95)');
        ctx.fillStyle = cardGradient;

        const radius = 12;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + statBoxWidth - radius, y);
        ctx.quadraticCurveTo(x + statBoxWidth, y, x + statBoxWidth, y + radius);
        ctx.lineTo(x + statBoxWidth, y + statBoxHeight - radius);
        ctx.quadraticCurveTo(x + statBoxWidth, y + statBoxHeight, x + statBoxWidth - radius, y + statBoxHeight);
        ctx.lineTo(x + radius, y + statBoxHeight);
        ctx.quadraticCurveTo(x, y + statBoxHeight, x, y + statBoxHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Border with color accent
        ctx.strokeStyle = mouseOver ? stat.color : `${stat.color}66`;
        ctx.lineWidth = mouseOver ? 3 : 2;
        ctx.stroke();

        // Top accent bar
        ctx.fillStyle = `${stat.color}33`;
        ctx.fillRect(x + 2, y + 2, statBoxWidth - 4, 8);

        // Icon
        ctx.font = '36px Arial';
        ctx.fillStyle = stat.color;
        ctx.textAlign = 'center';
        ctx.fillText(stat.icon, x + statBoxWidth / 2, y + 50);

        // Value
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = stat.color;
        ctx.fillText(stat.value, x + statBoxWidth / 2, y + 90);
        ctx.shadowBlur = 0;

        // Label
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(stat.label, x + statBoxWidth / 2, y + 110);

        // Description
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(stat.desc, x + statBoxWidth / 2, y + 128);

        ctx.restore();
    });
}

function stopCreateMapRendering() {
    if (createMapAnimationId) {
        cancelAnimationFrame(createMapAnimationId);
        createMapAnimationId = null;
    }

    // Remove the create new map button
    const btn = document.getElementById('createNewMapBtn');
    if (btn) btn.remove();
}

function createInteractiveElements() {
    // Remove existing button if any
    const existingBtn = document.getElementById('createNewMapBtn');
    if (existingBtn) existingBtn.remove();

    // Create "Create New Map" button
    const btn = document.createElement('button');
    btn.id = 'createNewMapBtn';
    btn.textContent = '+ Create New Map';
    btn.onclick = openBlankMapCreator;
    btn.style.cssText = `
        position: absolute;
        left: 100px;
        top: 300px;
        width: 300px;
        height: 200px;
        background: linear-gradient(135deg, rgba(0, 247, 255, 0.2), rgba(0, 200, 220, 0.2));
        border: 3px dashed rgba(0, 247, 255, 0.6);
        color: #00f7ff;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        z-index: 15;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    `;

    btn.onmouseenter = () => {
        btn.style.background = 'linear-gradient(135deg, rgba(0, 247, 255, 0.4), rgba(0, 200, 220, 0.4))';
        btn.style.borderColor = '#00f7ff';
        btn.style.transform = 'scale(1.05)';
    };

    btn.onmouseleave = () => {
        btn.style.background = 'linear-gradient(135deg, rgba(0, 247, 255, 0.2), rgba(0, 200, 220, 0.2))';
        btn.style.borderColor = 'rgba(0, 247, 255, 0.6)';
        btn.style.transform = 'scale(1)';
    };

    document.body.appendChild(btn);
}

// Map Creator State
let currentAssetCategory = 'buildings';
let selectedAsset = null;

// Edit Mode State
let isEditMode = false;
let hoveredObject = null;
let selectedObject = null;

// Canvas state for zoom/pan
let canvasZoom = 1;
let canvasOffsetX = 0;
let canvasOffsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// Smooth interpolation targets
let targetCanvasZoom = 1;
let targetCanvasOffsetX = 0;
let targetCanvasOffsetY = 0;
const smoothingFactor = 0.15; // Higher = faster, lower = smoother (0.1 - 0.3)

// Momentum/inertia for smooth movement
let velocityX = 0;
let velocityY = 0;
const acceleration = 1.2; // How fast it accelerates
const friction = 0.88; // How fast it decelerates (0.85-0.95, lower = faster stop)
const maxSpeed = 20; // Maximum speed

// Expose canvasZoom globally for zoom slider
window.canvasZoom = canvasZoom;

// Keyboard panning state
let keysPressed = {};

// Placed objects on the map
let placedObjects = [];

// Helper: compute placement/preview scale for an asset (matches placement logic)
function getPlacementScale(asset) {
    if (!asset) return 1;
    // self assets are smaller except respawner/speeder
    if (asset.isSelfAsset && asset.subcategory !== 'respawner' && asset.subcategory !== 'speeder') {
        return asset.scale || 0.5;
    }
    // Respawners need a better scale for visibility
    if (asset.isSelfAsset && asset.subcategory === 'respawner') {
        return asset.scale || 0.8;
    }
    // If asset has explicit scale (e.g., resized speeder), use it
    return asset.scale || 1;
}

// Duplicate detection
function isPositionOccupied(x, y, tolerance = 30) {
    return placedObjects.some(obj => {
        const distance = Math.sqrt(Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2));
        return distance < tolerance;
    });
}

// Red X indicator for occupied positions
let showRedX = false;
let redXPosition = { x: 0, y: 0 };
let redXTimer = null;

// Ground tile customization - store custom ground textures per tile
let customGroundTiles = new Map(); // key: "x,y", value: texture type
// Overlays for special ground types (lava, liquid) so they don't replace base ground
let customGroundOverlays = new Map(); // key: "x,y", value: overlay type

// Hover preview state
let hoverWorldX = 0;
let hoverWorldY = 0;
let isHovering = false;

// No grass texture needed - using solid color

function switchCreateMapTab(tabName) {
    // Hide all tabs
    document.getElementById('createdMapTab').classList.add('hidden');
    document.getElementById('analyzeTab').classList.add('hidden');

    // Show selected tab
    if (tabName === 'created-map') {
        document.getElementById('createdMapTab').classList.remove('hidden');
    } else if (tabName === 'analyze') {
        document.getElementById('analyzeTab').classList.remove('hidden');
    }

    // Update tab buttons
    const tabs = document.querySelectorAll('.feature-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

function openBlankMapCreator() {
    console.log('🆕 openBlankMapCreator() CALLED - Opening CREATE NEW MAP flow...');
    
    // Reset edit mode flag for new map creation
    isEditingExistingMap = false;

    // Hide top navigation bar immediately when entering the create-map flow
    document.body.classList.add('in-editor');
    console.log('🎯 TOP BAR HIDDEN in openBlankMapCreator - added class in-editor to body');

    // Ensure a visible debug banner exists for environments without devtools
    let debugBanner = document.getElementById('mapCreatorDebugBanner');
    if (!debugBanner) {
        debugBanner = document.createElement('div');
        debugBanner.id = 'mapCreatorDebugBanner';
        debugBanner.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:#ffcc00;color:#fff;padding:6px 10px;z-index:100001;font-weight:bold;text-align:left;';
        debugBanner.textContent = 'MapCreator: opening name input...';
        document.body.appendChild(debugBanner);
        // Auto-hide debug banner after a short period to avoid persistent text
        setTimeout(() => {
            try { debugBanner.remove(); } catch (e) { debugBanner.style.display = 'none'; }
        }, 3000);
    } else {
        debugBanner.textContent = 'MapCreator: opening name input...';
        debugBanner.style.display = 'block';
    }

    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
    `;

    // Create input container
    const container = document.createElement('div');
    container.style.cssText = `
        background: #1a2a3a;
        border: 3px solid #00f7ff;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 400px;
        width: 90%;
    `;

    container.innerHTML = `
        <h2 style="color: #00f7ff; margin-bottom: 8px;">🗺️ Create New Map</h2>

        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px;">
            <button id="vehicleTankBtn" style="padding:8px 14px;border-radius:8px;border:2px solid transparent;background:transparent;color:#002b5c;font-weight:700;cursor:pointer;">Tank</button>
            <button id="vehicleJetBtn" style="padding:8px 14px;border-radius:8px;border:2px solid transparent;background:transparent;color:#002b5c;cursor:pointer;">Jet</button>
            <button id="vehicleRaceBtn" style="padding:8px 14px;border-radius:8px;border:2px solid transparent;background:transparent;color:#002b5c;cursor:pointer;">Race</button>
        </div>

        <h3 id="vehicleInfo" style="color: rgba(255,255,255,0.85); font-size:14px; margin-bottom:12px;">Selected: Tank — ready to create a Tank map.</h3>

        <input 
            type="text" 
            id="mapNameInput" 
            placeholder="Enter map name..." 
            maxlength="30"
            style="
                width: 100%;
                padding: 12px;
                font-size: 16px;
                border: 2px solid #00f7ff;
                border-radius: 8px;
                background: #0a1a2a;
                color: white;
                margin-bottom: 20px;
                outline: none;
            "
        />
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="cancelBtn" style="
                padding: 10px 20px;
                background: #666;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Cancel</button>
            <button id="createBtn" style="
                padding: 10px 20px;
                background: #00f7ff;
                color: #fff;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">Create Map</button>
        </div>
    `;

    modal.appendChild(container);
    document.body.appendChild(modal);

    // Use container-scoped selectors to avoid ID collisions
    const input = container.querySelector('#mapNameInput');
    if (input) input.focus();

    const cancelBtnScoped = container.querySelector('#cancelBtn');
    const createBtnScoped = container.querySelector('#createBtn');

    // Vehicle selection: default to tank
    let selectedVehicle = 'tank';
    const tankBtn = container.querySelector('#vehicleTankBtn');
    const jetBtn = container.querySelector('#vehicleJetBtn');
    const raceBtn = container.querySelector('#vehicleRaceBtn');
    const vehicleInfo = container.querySelector('#vehicleInfo');

    function setVehicle(v) {
        selectedVehicle = v;
        // Common dark blue text for all states
        const textColor = '#002b5c';
        const selectedBg = '#bfeeff'; // light blue background for selection
        const unselectedBg = 'transparent';
        const borderColor = '#004080';

        [tankBtn, jetBtn, raceBtn].forEach(btn => {
            if (!btn) return;
            btn.style.background = unselectedBg;
            btn.style.color = textColor;
            btn.style.border = `2px solid rgba(0,0,0,0)`;
            btn.style.boxShadow = 'none';
        });

        // Apply selected style
        const activeBtn = (v === 'tank') ? tankBtn : (v === 'jet') ? jetBtn : raceBtn;
        if (activeBtn) {
            activeBtn.style.background = selectedBg;
            activeBtn.style.color = textColor;
            activeBtn.style.border = `2px solid ${borderColor}`;
            activeBtn.style.boxShadow = '0 4px 10px rgba(0,64,128,0.15)';
        }

        if (vehicleInfo) {
            if (v === 'tank') vehicleInfo.textContent = 'Selected: Tank — ready to create a Tank map.';
            else vehicleInfo.textContent = `Selected: ${v.charAt(0).toUpperCase() + v.slice(1)} — coming soon.`;
            vehicleInfo.style.color = textColor;
        }
    }

    if (tankBtn) tankBtn.onclick = () => setVehicle('tank');
    if (jetBtn) jetBtn.onclick = () => setVehicle('jet');
    if (raceBtn) raceBtn.onclick = () => setVehicle('race');

    // Apply default visual selection
    setVehicle('tank');

    if (cancelBtnScoped) {
        cancelBtnScoped.onclick = () => {
            debugBanner.textContent = 'MapCreator: cancelled';
            modal.remove();
            // Restore top bar if user cancels before opening the editor
            document.body.classList.remove('in-editor');
            console.log('🎯 TOP BAR RESTORED on cancel - removed in-editor class');
        };
    }

    if (createBtnScoped) {
        createBtnScoped.onclick = () => {
            try {
                // Only allow Tank for now
                if (selectedVehicle !== 'tank') {
                    alert((selectedVehicle.charAt(0).toUpperCase() + selectedVehicle.slice(1)) + ' editor coming soon!');
                    return;
                }
                const mapName = input ? input.value.trim() : '';
                if (!mapName) {
                    // visible feedback for users without console
                    debugBanner.textContent = 'MapCreator: please enter a map name';
                    alert('Please enter a map name!');
                    return;
                }

                // Store map name and open editor
                window.currentMapName = mapName;
                debugBanner.textContent = `MapCreator: starting editor for "${mapName}"...`;
                modal.remove();

                // Attempt to start editor and show visible errors if it fails
                try {
                    startMapEditor();
                    debugBanner.textContent = `MapCreator: editor opened for "${mapName}"`;
                } catch (err) {
                    debugBanner.textContent = `MapCreator ERROR: ${err && err.message ? err.message : err}`;
                    alert('Failed to open map editor: ' + (err && err.message ? err.message : err));
                }
            } catch (outerErr) {
                debugBanner.textContent = 'MapCreator outer error: ' + (outerErr && outerErr.message ? outerErr.message : outerErr);
                alert('Unexpected error: ' + (outerErr && outerErr.message ? outerErr.message : outerErr));
            }
        };
    }

    // Handle Enter key inside modal
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && createBtnScoped) createBtnScoped.click();
        });
    }
}

function startMapEditor(isEditMode = false) {
    console.log('Starting map editor for:', window.currentMapName, isEditMode ? '(Edit Mode)' : '(New Map)');

    // Set edit mode flag
    isEditingExistingMap = isEditMode;

    // Initialize ground textures
    if (!groundTexturesLoaded) {
        loadCustomGroundTexture();
    }

    // Reset all map data for new map (not for edit mode)
    if (!isEditMode) {
        spawnPoints = [];
        placedObjects = [];
        customGroundTiles.clear();
        selectedAsset = null;
        selectedObject = null;
        hoveredObject = null;
        console.log('✅ Map data cleared for new map creation');
    }

    // Show blank creator
    const blankCreator = document.getElementById('blankMapCreator');
    if (blankCreator) {
        blankCreator.classList.remove('hidden');
        console.log('✅ Blank creator shown');
    } else {
        console.error('❌ Blank creator element not found');
    }

    // Hide game minimap if it exists
    const gameMinimap = document.getElementById('minimap');
    if (gameMinimap) {
        gameMinimap.style.display = 'none';
    }

    // Hide top navigation bar while in map editor
    document.body.classList.add('in-editor');
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.dataset._prevDisplay = topBar.style.display || '';
        topBar.style.display = 'none';
        console.log('✅ Top bar hidden');
    }

    // Reset zoom to start
    canvasZoom = 0.5;
    targetCanvasZoom = 0.5;
    window.canvasZoom = 0.5;

    // Wait a bit for DOM to update, then initialize canvas
    setTimeout(() => {
        // Initialize map creator canvas (this will center the camera)
        initMapCreatorCanvas();

        // Create zoom slider if it doesn't exist
        createZoomSlider();

        // Load initial assets
        loadAssets(currentAssetCategory);

        // Initialize unselect button hover effects
        initializeUnselectButton();
        
        // Initialize spawn points counter
        updateSpawnPointsCounter();
        
        // Load saved script if exists
        loadMapScript();
        
        console.log('✅ Map editor initialized successfully');

        // Hide debug banner if present (editor opened)
        const debugBanner = document.getElementById('mapCreatorDebugBanner');
        if (debugBanner) {
            try { debugBanner.remove(); } catch (e) { debugBanner.style.display = 'none'; }
        }
    }, 100);
}

// Create zoom slider dynamically (HTML creation removed, keeping function structure)
function createZoomSlider() {
    console.log('Initializing zoom slider functionality...');

    // Initialize edit mode button
    initializeEditModeButton();
    
    // Initialize new editor
    setTimeout(() => {
        initializeNewEditor();
        
        // Ensure assets panel is visible
        const assetsPanel = document.getElementById('assetsPanel');
        if (assetsPanel) {
            assetsPanel.style.display = 'flex';
            assetsPanel.classList.remove('hidden');
            console.log('✅ Assets panel made visible');
        }
    }, 500); // Small delay to ensure DOM is ready

    console.log('✅ Zoom slider functionality initialized (no HTML elements created)');

    // Initialize spawn points system
    initializeSpawnPointsSystem();
}

// Initialize edit mode button (now in HTML)
function initializeEditModeButton() {
    const editButton = document.getElementById('mapCreatorEditButton');
    if (editButton) {
        console.log('✅ Edit mode button found in HTML');
        // The button is already in HTML with onclick handler
        return true;
    } else {
        console.warn('⚠️ Edit mode button not found in HTML');
        return false;
    }
}

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    selectedObject = null;
    hoveredObject = null;
    
    const editButton = document.getElementById('mapCreatorEditButton');
    if (editButton) {
        if (isEditMode) {
            editButton.classList.add('active');
            editButton.innerHTML = '<span class="map-creator-btn-text"><i class="fa-solid fa-pen-to-square"></i></span>';
        } else {
            editButton.classList.remove('active');
            editButton.innerHTML = '<span class="map-creator-btn-text"><i class="fa-solid fa-pen-to-square"></i></span>';
        }
    }
    
    console.log('Edit mode:', isEditMode ? 'ON' : 'OFF');
    renderMapCreatorCanvas();
}

// Show object edit controls
function showObjectEditControls(obj) {
    // Remove existing controls
    hideObjectEditControls();
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'objectEditControls';
    controlsContainer.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(8,18,28,0.95), rgba(12,22,32,0.95));
        border: 2px solid rgba(0,247,255,0.6);
        border-left: 4px solid #00f7ff;
        padding: 15px 20px;
        z-index: 99998;
        color: white;
        backdrop-filter: blur(15px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.6);
        border-radius: 0;
        display: flex;
        gap: 10px;
        align-items: center;
    `;
    
    // Object name
    const objectName = document.createElement('div');
    objectName.textContent = obj.asset.name;
    objectName.style.cssText = 'color: #00f7ff; font-weight: bold; margin-right: 15px; font-size: 14px;';
    controlsContainer.appendChild(objectName);
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️ DELETE';
    deleteBtn.style.cssText = `
        padding: 8px 15px;
        background: linear-gradient(135deg, rgba(255,60,60,0.2), rgba(200,40,40,0.2));
        border: 1px solid rgba(255,80,80,0.5);
        border-left: 3px solid #ff4444;
        color: #ff6666;
        cursor: pointer;
        font-weight: 600;
        font-size: 12px;
        transition: all 0.2s;
        border-radius: 0;
    `;
    deleteBtn.onclick = () => deleteSelectedObject();
    deleteBtn.onmouseenter = () => {
        deleteBtn.style.background = 'linear-gradient(135deg, rgba(255,60,60,0.4), rgba(200,40,40,0.4))';
        deleteBtn.style.borderLeftColor = '#ff6666';
    };
    deleteBtn.onmouseleave = () => {
        deleteBtn.style.background = 'linear-gradient(135deg, rgba(255,60,60,0.2), rgba(200,40,40,0.2))';
        deleteBtn.style.borderLeftColor = '#ff4444';
    };
    controlsContainer.appendChild(deleteBtn);
    
    // Position button (only for buildings)
    if (obj.asset.viewFolder === 'Buildings') {
        const positionBtn = document.createElement('button');
        positionBtn.innerHTML = '🔄 POSITION';
        positionBtn.style.cssText = `
            padding: 8px 15px;
            background: linear-gradient(135deg, rgba(0,150,255,0.2), rgba(0,120,200,0.2));
            border: 1px solid rgba(0,180,255,0.5);
            border-left: 3px solid #0099ff;
            color: #00aaff;
            cursor: pointer;
            font-weight: 600;
            font-size: 12px;
            transition: all 0.2s;
            border-radius: 0;
        `;
        positionBtn.onclick = () => showPositionControls();
        positionBtn.onmouseenter = () => {
            positionBtn.style.background = 'linear-gradient(135deg, rgba(0,150,255,0.4), rgba(0,120,200,0.4))';
            positionBtn.style.borderLeftColor = '#00aaff';
        };
        positionBtn.onmouseleave = () => {
            positionBtn.style.background = 'linear-gradient(135deg, rgba(0,150,255,0.2), rgba(0,120,200,0.2))';
            positionBtn.style.borderLeftColor = '#0099ff';
        };
        controlsContainer.appendChild(positionBtn);
    }

    // If this is a speeder, add resize and free-move controls
    if (obj.asset && obj.asset.subcategory && obj.asset.subcategory.toLowerCase() === 'speeder') {
        const sizeLabel = document.createElement('div');
        sizeLabel.id = 'speederSizeLabel';
        sizeLabel.style.cssText = 'color:#fff;margin-left:8px;font-weight:600;';
        sizeLabel.textContent = `Size: ${obj.scale || 1}`;
        controlsContainer.appendChild(sizeLabel);

        const shrinkBtn = document.createElement('button');
        shrinkBtn.innerHTML = '−';
        shrinkBtn.style.cssText = 'padding:6px 10px;margin-left:8px;cursor:pointer;';
        shrinkBtn.onclick = () => {
            changeSelectedObjectScale(-0.1);
            sizeLabel.textContent = `Size: ${Math.round((selectedObject.scale||1)*100)/100}`;
        };
        controlsContainer.appendChild(shrinkBtn);

        const growBtn = document.createElement('button');
        growBtn.innerHTML = '+';
        growBtn.style.cssText = 'padding:6px 10px;cursor:pointer;';
        growBtn.onclick = () => {
            changeSelectedObjectScale(0.1);
            sizeLabel.textContent = `Size: ${Math.round((selectedObject.scale||1)*100)/100}`;
        };
        controlsContainer.appendChild(growBtn);

        // Free move toggle
        const freeMoveBtn = document.createElement('button');
        freeMoveBtn.innerHTML = 'Free Move';
        freeMoveBtn.style.cssText = 'padding:6px 10px;margin-left:8px;cursor:pointer;';
        freeMoveBtn.onclick = () => {
            if (!selectedObject) return;
            selectedObject.freeMove = !selectedObject.freeMove;
            freeMoveBtn.style.background = selectedObject.freeMove ? '#004466' : '';
        };
        controlsContainer.appendChild(freeMoveBtn);
    }

    // For any self asset (not just speeder), provide basic resize and free-move editing
    if (obj.asset && obj.asset.isSelfAsset && !(obj.asset.subcategory && obj.asset.subcategory.toLowerCase() === 'speeder')) {
        const sizeLabel2 = document.createElement('div');
        sizeLabel2.id = 'selfSizeLabel';
        sizeLabel2.style.cssText = 'color:#fff;margin-left:8px;font-weight:600;';
        sizeLabel2.textContent = `Size: ${obj.scale || getPlacementScale(obj.asset)}`;
        controlsContainer.appendChild(sizeLabel2);

        const shrinkBtn2 = document.createElement('button');
        shrinkBtn2.innerHTML = '−';
        shrinkBtn2.style.cssText = 'padding:6px 10px;margin-left:8px;cursor:pointer;';
        shrinkBtn2.onclick = () => {
            changeSelectedObjectScale(-0.1);
            sizeLabel2.textContent = `Size: ${Math.round((selectedObject.scale||1)*100)/100}`;
        };
        controlsContainer.appendChild(shrinkBtn2);

        const growBtn2 = document.createElement('button');
        growBtn2.innerHTML = '+';
        growBtn2.style.cssText = 'padding:6px 10px;cursor:pointer;';
        growBtn2.onclick = () => {
            changeSelectedObjectScale(0.1);
            sizeLabel2.textContent = `Size: ${Math.round((selectedObject.scale||1)*100)/100}`;
        };
        controlsContainer.appendChild(growBtn2);

        const freeMoveBtn2 = document.createElement('button');
        freeMoveBtn2.innerHTML = 'Free Move';
        freeMoveBtn2.style.cssText = 'padding:6px 10px;margin-left:8px;cursor:pointer;';
        freeMoveBtn2.onclick = () => {
            if (!selectedObject) return;
            selectedObject.freeMove = !selectedObject.freeMove;
            freeMoveBtn2.style.background = selectedObject.freeMove ? '#004466' : '';
        };
        controlsContainer.appendChild(freeMoveBtn2);
    }
    
    document.body.appendChild(controlsContainer);
}

// Hide object edit controls
function hideObjectEditControls() {
    const controls = document.getElementById('objectEditControls');
    if (controls) {
        controls.remove();
    }
    
    const positionControls = document.getElementById('positionControls');
    if (positionControls) {
        positionControls.remove();
    }
}

// Delete selected object
function deleteSelectedObject() {
    if (selectedObject) {
        const index = placedObjects.indexOf(selectedObject);
        if (index > -1) {
            placedObjects.splice(index, 1);
            selectedObject = null;
            hideObjectEditControls();
            renderMapCreatorCanvas();
            console.log('✓ Object deleted');
        }
    }
}

// Adjust selected object scale (for speeder resize control)
function changeSelectedObjectScale(delta) {
    if (!selectedObject) return;
    selectedObject.scale = Math.max(0.1, Math.min(5, (selectedObject.scale || 1) + delta));
    renderMapCreatorCanvas();
}

// Show position controls for buildings
function showPositionControls() {
    // Hide main controls
    hideObjectEditControls();
    
    // Create position controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'positionControls';
    controlsContainer.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(8,18,28,0.95), rgba(12,22,32,0.95));
        border: 2px solid rgba(0,247,255,0.6);
        border-left: 4px solid #00f7ff;
        padding: 15px 20px;
        z-index: 99998;
        color: white;
        backdrop-filter: blur(15px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.6);
        border-radius: 0;
        display: flex;
        gap: 10px;
        align-items: center;
    `;
    
    // Title
    const title = document.createElement('div');
    title.textContent = 'CHANGE DIRECTION:';
    title.style.cssText = 'color: #00f7ff; font-weight: bold; margin-right: 15px; font-size: 14px;';
    controlsContainer.appendChild(title);
    
    // Direction buttons
    const directions = [
        { name: 'FRONT', dir: 'front', icon: '↑' },
        { name: 'BACK', dir: 'back', icon: '↓' },
        { name: 'LEFT', dir: 'left', icon: '←' },
        { name: 'RIGHT', dir: 'right', icon: '→' }
    ];
    
    directions.forEach(direction => {
        const btn = document.createElement('button');
        btn.innerHTML = `${direction.icon} ${direction.name}`;
        btn.style.cssText = `
            padding: 8px 12px;
            background: linear-gradient(135deg, rgba(0,150,255,0.2), rgba(0,120,200,0.2));
            border: 1px solid rgba(0,180,255,0.5);
            border-left: 3px solid #0099ff;
            color: #00aaff;
            cursor: pointer;
            font-weight: 600;
            font-size: 11px;
            transition: all 0.2s;
            border-radius: 0;
        `;
        
        // Highlight current direction
        if (selectedObject && selectedObject.asset.direction === direction.dir) {
            btn.style.background = 'linear-gradient(135deg, rgba(0,200,255,0.4), rgba(0,160,220,0.4))';
            btn.style.borderLeftColor = '#00ccff';
        }
        
        btn.onclick = () => changeObjectDirection(direction.dir);
        btn.onmouseenter = () => {
            btn.style.background = 'linear-gradient(135deg, rgba(0,150,255,0.4), rgba(0,120,200,0.4))';
            btn.style.borderLeftColor = '#00aaff';
        };
        btn.onmouseleave = () => {
            const isActive = selectedObject && selectedObject.asset.direction === direction.dir;
            btn.style.background = isActive ? 
                'linear-gradient(135deg, rgba(0,200,255,0.4), rgba(0,160,220,0.4))' :
                'linear-gradient(135deg, rgba(0,150,255,0.2), rgba(0,120,200,0.2))';
            btn.style.borderLeftColor = isActive ? '#00ccff' : '#0099ff';
        };
        
        controlsContainer.appendChild(btn);
    });
    
    // Back button
    const backBtn = document.createElement('button');
    backBtn.innerHTML = '← BACK';
    backBtn.style.cssText = `
        padding: 8px 15px;
        background: linear-gradient(135deg, rgba(100,100,100,0.2), rgba(80,80,80,0.2));
        border: 1px solid rgba(150,150,150,0.5);
        border-left: 3px solid #999999;
        color: #cccccc;
        cursor: pointer;
        font-weight: 600;
        font-size: 12px;
        transition: all 0.2s;
        border-radius: 0;
        margin-left: 10px;
    `;
    backBtn.onclick = () => {
        hideObjectEditControls();
        showObjectEditControls(selectedObject);
    };
    backBtn.onmouseenter = () => {
        backBtn.style.background = 'linear-gradient(135deg, rgba(100,100,100,0.4), rgba(80,80,80,0.4))';
        backBtn.style.borderLeftColor = '#bbbbbb';
    };
    backBtn.onmouseleave = () => {
        backBtn.style.background = 'linear-gradient(135deg, rgba(100,100,100,0.2), rgba(80,80,80,0.2))';
        backBtn.style.borderLeftColor = '#999999';
    };
    controlsContainer.appendChild(backBtn);
    
    document.body.appendChild(controlsContainer);
}

// Change object direction
function changeObjectDirection(newDirection) {
    if (selectedObject && selectedObject.asset.viewFolder === 'Buildings') {
        // Update asset direction
        selectedObject.asset.direction = newDirection;
        
        // Update image path
        const viewFolderName = 'top_down_view';
        const fileName = selectedObject.asset.fileName;
        const folder = selectedObject.asset.folder;
        const viewFolder = selectedObject.asset.viewFolder;
        
        // Handle special cases for direction suffix
        let directionSuffix = newDirection;
        if (newDirection === 'right' && fileName === 'farm_field' && viewFolder === 'Buildings') {
            directionSuffix = 'right_';
        }
        
        const newImagePath = `/assets/tank/${viewFolder}/${folder}/spr_${viewFolderName}_${fileName}_${directionSuffix}.png`;
        selectedObject.asset.image = newImagePath;
        
        // Load new image
        const newImg = new Image();
        newImg.src = newImagePath;
        newImg.onload = () => {
            selectedObject.image = newImg;
            renderMapCreatorCanvas();
        };
        
        // Update position controls to show new active direction
        showPositionControls();
        
        console.log('✓ Changed object direction to:', newDirection);
    }
}

// Initialize spawn points system
function initializeSpawnPointsSystem() {
    // Create help button
    createHelpButton();
    
    console.log('✅ Spawn points system initialized!');
}

// Create help button with tooltip
function createHelpButton() {
    // Check if help button already exists
    if (document.getElementById('mapCreatorHelpButton')) {
        return;
    }

    // Create help button
    const helpButton = document.createElement('div');
    helpButton.id = 'mapCreatorHelpButton';
    helpButton.textContent = '?';
    helpButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 30px;
        width: 40px;
        height: 40px;
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid rgba(0, 247, 255, 0.5);
        border-radius: 50%;
        color: #00f7ff;
        font-size: 24px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 99999;
        transition: all 0.3s ease;
    `;

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'mapCreatorHelpTooltip';
    tooltip.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 80px;
        width: 280px;
        padding: 15px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #00f7ff;
        border-radius: 8px;
        color: white;
        font-size: 12px;
        z-index: 99998;
        display: none;
        pointer-events: none;
    `;

    tooltip.innerHTML = `
        <div style="color: #00f7ff; font-weight: bold; font-size: 14px; margin-bottom: 8px;">CONTROLS</div>
        <div style="line-height: 1.6;">
            • Mouse Wheel: Zoom in/out<br>
            • Left Click + Drag: Pan camera<br>
            • Arrow Keys / WASD: Scroll map
        </div>
    `;

    // Hover effects
    helpButton.addEventListener('mouseenter', () => {
        helpButton.style.background = 'rgba(0, 247, 255, 0.3)';
        helpButton.style.borderColor = '#00f7ff';
        tooltip.style.display = 'block';
    });

    helpButton.addEventListener('mouseleave', () => {
        helpButton.style.background = 'rgba(0, 0, 0, 0.7)';
        helpButton.style.borderColor = 'rgba(0, 247, 255, 0.5)';
        tooltip.style.display = 'none';
    });

    // Add to body
    document.body.appendChild(helpButton);
    document.body.appendChild(tooltip);

    console.log('✅ Help button created!');
}

// Spawn Points System
let spawnPoints = [];
let isSpawnPointMode = false;

function showSpawnPointMinimap() {
    // Create large centered minimap overlay
    const overlay = document.createElement('div');
    overlay.id = 'spawnPointOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 200000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `;

    // Create header with spawn point counter
    const header = document.createElement('div');
    header.style.cssText = `
        color: #00f7ff;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
        text-shadow: 0 0 10px rgba(0, 247, 255, 0.5);
        text-align: center;
    `;
    header.innerHTML = `<span id="spawnPointCounter">${spawnPoints.length}/20</span> Spawn Points`;
    
    // Create instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        margin-bottom: 20px;
        text-align: center;
        line-height: 1.4;
    `;
    instructions.innerHTML = `Left click to place spawn points • Right click to remove spawn points`;

    // Create large minimap container
    const minimapContainer = document.createElement('div');
    minimapContainer.style.cssText = `
        width: 600px;
        height: 600px;
        background: rgba(0, 0, 0, 0.9);
        border: 4px solid #00f7ff;
        border-radius: 12px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 30px rgba(0, 247, 255, 0.3);
    `;

    // Create minimap canvas
    const minimapCanvas = document.createElement('canvas');
    minimapCanvas.id = 'spawnPointMinimapCanvas';
    minimapCanvas.width = 600;
    minimapCanvas.height = 600;
    minimapCanvas.style.cssText = `
        width: 100%;
        height: 100%;
        cursor: crosshair;
    `;

    // Add click handler for placing spawn points
    minimapCanvas.addEventListener('click', handleSpawnPointClick);
    
    // Add right-click handler for removing spawn points
    minimapCanvas.addEventListener('contextmenu', handleSpawnPointRightClick);

    minimapContainer.appendChild(minimapCanvas);

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
        margin-top: 20px;
        padding: 12px 24px;
        background: rgba(255, 60, 60, 0.2);
        border: 2px solid #ff4444;
        color: #ff6666;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.3s;
    `;
    closeBtn.onclick = closeSpawnPointMinimap;

    overlay.appendChild(header);
    overlay.appendChild(instructions);
    overlay.appendChild(minimapContainer);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    // Start rendering the minimap
    renderSpawnPointMinimap();
}

function handleSpawnPointClick(e) {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert canvas coordinates to world coordinates
    const mapRadius = 2500;
    const canvasSize = 600;
    const scale = canvasSize / (mapRadius * 2);
    
    const worldX = (x - canvasSize / 2) / scale;
    const worldY = (y - canvasSize / 2) / scale;

    // Check if within map bounds
    const distFromCenter = Math.sqrt(worldX * worldX + worldY * worldY);
    if (distFromCenter > mapRadius) return;

    // Check if we already have 20 spawn points
    if (spawnPoints.length >= 20) {
        alert('Maximum 20 spawn points allowed!');
        return;
    }

    // Add spawn point
    spawnPoints.push({ x: worldX, y: worldY });
    
    // Update counter in overlay
    const counter = document.getElementById('spawnPointCounter');
    if (counter) {
        counter.textContent = `${spawnPoints.length}/20`;
    }
    
    // Update counter in HTML panel
    updateSpawnPointsCounter();

    // Re-render minimap
    renderSpawnPointMinimap();
}

function handleSpawnPointRightClick(e) {
    e.preventDefault();
    
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert canvas coordinates to world coordinates
    const mapRadius = 2500;
    const canvasSize = 600;
    const scale = canvasSize / (mapRadius * 2);
    
    const worldX = (x - canvasSize / 2) / scale;
    const worldY = (y - canvasSize / 2) / scale;

    // Find closest spawn point within 50 pixels
    let closestIndex = -1;
    let closestDistance = Infinity;
    
    spawnPoints.forEach((point, index) => {
        const pointX = canvasSize / 2 + point.x * scale;
        const pointY = canvasSize / 2 + point.y * scale;
        const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
        
        if (distance < 20 && distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    // Remove the closest spawn point if found
    if (closestIndex !== -1) {
        spawnPoints.splice(closestIndex, 1);
        
        // Update counter
        const counter = document.getElementById('spawnPointCounter');
        if (counter) {
            counter.textContent = `${spawnPoints.length}/20`;
        }
        
        // Update HTML counter
        updateSpawnPointsCounter();
        
        // Re-render minimap
        renderSpawnPointMinimap();
    }
}

function renderSpawnPointMinimap() {
    const canvas = document.getElementById('spawnPointMinimapCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 600;
    const mapRadius = 2500;
    const scale = size / (mapRadius * 2);

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw map background
    ctx.fillStyle = '#2a7ab8';
    ctx.fillRect(0, 0, size, size);

    // Draw map boundary circle
    ctx.strokeStyle = '#00f7ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, mapRadius * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Draw placed objects
    if (typeof placedObjects !== 'undefined') {
        placedObjects.forEach(obj => {
            if (obj.image && obj.image.complete) {
                const objX = size / 2 + obj.x * scale;
                const objY = size / 2 + obj.y * scale;
                const objSize = 8;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(objX - objSize / 2, objY - objSize / 2, objSize, objSize);
            }
        });
    }

    // Draw spawn points as green circles
    spawnPoints.forEach((point, index) => {
        const pointX = size / 2 + point.x * scale;
        const pointY = size / 2 + point.y * scale;

        // Green circle
        ctx.fillStyle = '#00ff00';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pointX, pointY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Number label
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((index + 1).toString(), pointX, pointY + 4);
    });
}

function closeSpawnPointMinimap() {
    const overlay = document.getElementById('spawnPointOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function updateSpawnPointsCounter() {
    const htmlCounter = document.getElementById('spawnPointsCounter');
    if (htmlCounter) {
        htmlCounter.textContent = `${spawnPoints.length}/20`;
        
        // Change color based on completion
        if (spawnPoints.length === 20) {
            htmlCounter.style.color = '#00ff00'; // Green when complete
        } else if (spawnPoints.length > 0) {
            htmlCounter.style.color = '#ffaa00'; // Orange when in progress
        } else {
            htmlCounter.style.color = '#00f7ff'; // Cyan when empty
        }
    }
}

// Placeholder function for AI Bot functionality
function addAIBot() {
    alert('AI Bot functionality coming soon!');
}

// Test map functionality
function testMap() {
    if (spawnPoints.length !== 20) {
        alert(`Cannot test map: You need exactly 20 spawn points!\nCurrent spawn points: ${spawnPoints.length}/20`);
        return;
    }
    
    if (placedObjects.length === 0) {
        alert('Cannot test map: Add some buildings or objects to your map first!');
        return;
    }
    
    alert('🎮 Map test functionality coming soon!\n\nYour map has:\n• ' + placedObjects.length + ' objects\n• ' + spawnPoints.length + ' spawn points\n• Ready for testing!');
}

function closeBlankMapCreator() {
    console.log('Closing blank map creator...');

    // Hide blank creator
    document.getElementById('blankMapCreator').classList.add('hidden');

    // Show the create map screen again
    const createMapScreen = document.getElementById('createMapScreen');
    if (createMapScreen) {
        createMapScreen.classList.remove('hidden');
    }

    // Only refresh saved maps display if we were editing an existing map
    // Don't show created maps when closing from "Create New Map" flow
    if (isEditingExistingMap) {
        loadSavedMaps();
    }

    // Restore top navigation bar display when leaving editor
    document.body.classList.remove('in-editor');
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.style.display = topBar.dataset._prevDisplay || '';
        delete topBar.dataset._prevDisplay;
        console.log('✅ Top bar restored');
    }

    // Remove zoom slider
    const slider = document.getElementById('mapCreatorZoomSlider');
    if (slider) {
        slider.remove();
        console.log('Zoom slider removed');
    }

    // Remove spawn point overlay if open
    const spawnOverlay = document.getElementById('spawnPointOverlay');
    if (spawnOverlay) {
        spawnOverlay.remove();
        console.log('Spawn point overlay removed');
    }

    // Remove help button
    const helpButton = document.getElementById('mapCreatorHelpButton');
    if (helpButton) {
        helpButton.remove();
    }

    // Remove help tooltip
    const helpTooltip = document.getElementById('mapCreatorHelpTooltip');
    if (helpTooltip) {
        helpTooltip.remove();
    }

    // Reset edit button state
    const editButton = document.getElementById('mapCreatorEditButton');
    if (editButton) {
        editButton.classList.remove('active');
        editButton.innerHTML = '<span class="map-creator-btn-text"><i class="fa-solid fa-pen-to-square"></i></span>';
    }

    // Remove edit controls
    hideObjectEditControls();

    // Reset edit mode
    isEditMode = false;
    isEditingExistingMap = false;
    selectedObject = null;
    hoveredObject = null;

    // Remove any existing create new map button (don't recreate it)
    const existingBtn = document.getElementById('createNewMapBtn');
    if (existingBtn) existingBtn.remove();
}

function toggleAssetsPanel() {
    const assetsPanel = document.getElementById('assetsPanel');
    const minimizeBtn = document.getElementById('minimizeBtn');
    if (!assetsPanel) return;

    // Toggle minimized state
    const isMinimized = assetsPanel.classList.contains('minimized');

    if (isMinimized) {
        // Expand - show content
        assetsPanel.classList.remove('minimized');
        if (minimizeBtn) minimizeBtn.textContent = '−';
    } else {
        // Minimize - hide content
        assetsPanel.classList.add('minimized');
        if (minimizeBtn) minimizeBtn.textContent = '+';
    }
}

function switchAssetCategory(category) {
    currentAssetCategory = category;

    // Update tab states
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        }
    });

    // Show/hide appropriate panels - use wrapper divs now
    const assetsPanel = document.getElementById('assetsPanel-content');
    const playersPanel = document.getElementById('playersPanel');
    const textEditorContainer = document.getElementById('textEditorContainer');
    
    if (category === 'players') {
        if (assetsPanel) assetsPanel.style.display = 'none';
        if (playersPanel) playersPanel.style.display = 'block';
        if (textEditorContainer) textEditorContainer.style.display = 'none';
    } else if (category === 'script') {
        if (assetsPanel) assetsPanel.style.display = 'none';
        if (playersPanel) playersPanel.style.display = 'none';
        if (textEditorContainer) textEditorContainer.style.display = 'block';
        
        // Focus the textarea
        const textarea = document.getElementById('mapScriptEditor');
        if (textarea) {
            setTimeout(() => textarea.focus(), 100);
        }
    } else {
        if (assetsPanel) assetsPanel.style.display = 'block';
        if (playersPanel) playersPanel.style.display = 'none';
        if (textEditorContainer) textEditorContainer.style.display = 'none';
        
        // Load assets for this category
        loadAssets(category);
    }
}

// Track if we're viewing object details
let currentObjectFolder = null;

// Mapping of folder names to file name patterns per view
const objectFileNameMap = {
    'Buildings': {
        'Cart': 'cart',
        'Farm_House_01': 'farm_house_01',
        'Farm_House_02': 'farm_house_02',
        'Farm_House_With_CropFiled': 'farm_field',
        'Guard_Tower': 'guard_tower',
        'House_01': 'house_01',
        'House_02': 'house_02',
        'Inn': 'inn',
        'Shop_01': 'shop_01',
        'Shop_02': 'shop_02',
        'Stall_01': 'stall_01',
        'Stall_02': 'stall_02',
        'Tree': 'trees',
        'Wind_Mill': 'windmill'
    },
    'Front View': {
        'Cart': 'cart',
        'Farm_House_01': 'farm_house_01',
        'Farm_House_02': 'farm_house_02',
        'Farm_House_With_CropFiled': 'farm_house_field',
        'Guard_Tower': 'guard_tower',
        'House_01': 'house_01',
        'House_02': 'house_02',
        'Inn': 'inn',
        'Shop_01': 'shop_01',
        'Shop_02': 'shop_02',
        'Stall_01': 'stall_01',
        'Stall_02': 'stall_02',
        'Tree': 'trees',
        'Wind_Mill': 'windmill'
    },
    'Isometric View': {
        'Cart': 'cart',
        'Farm_House_01': 'farm_house_01',
        'Farm_House_02': 'farm_house_02',
        'Farm_House_With_CropFiled': 'farm_house_field',
        'Guard_Tower': 'guard_tower',
        'House_01': 'house_01',
        'House_02': 'house_02',
        'Inn': 'inn',
        'Shop_01': 'shop_01',
        'Shop_02': 'shop_02',
        'Stall_01': 'stall_01',
        'Stall_02': 'stall_02',
        'Tree': 'trees',
        'Wind_Mill': 'windmill'
    }
};

function loadAssets(category) {
    const assetsGrid = document.getElementById('assetsGrid');
    if (!assetsGrid) {
        console.error('Assets grid not found');
        return;
    }

    console.log('🎨 Loading assets for category:', category);

    // Clear existing content
    assetsGrid.innerHTML = '';
    assetsGrid.className = 'editor-grid';

    // Load assets based on category
    if (category === 'ground') {
        loadGroundAssets(assetsGrid);
        console.log('✅ Ground assets loaded');
    } else if (category === 'buildings') {
        loadBuildingAssets(assetsGrid);
        console.log('✅ Building assets loaded');
    } else if (category === 'self') {
        loadSelfAssets(assetsGrid);
        console.log('✅ Self assets loaded');
    } else if (category === 'players') {
        loadPlayersPanel();
        console.log('✅ Players panel loaded');
    }
}

// Load self (tank-specific) assets
function loadSelfAssets(container) {
    // Show self (tank-specific) assets: Powers, Lootbox, Respawner, Speeder, Bullets
    const sections = [
        { title: 'Powers', path: 'powers', files: ['_Path_ (4).png', '_Path_ (6).png'], icon: '⚡' },
        { title: 'Lootbox', path: 'lootboxes', files: ['lootboxes10+.png', 'lootboxes20+.png', 'lootboxes50+.png', 'lootboxes100+.png'], icon: '🎁' },
        { title: 'Respawner', path: 'respwaner', files: ['RedRe.png', 'blueRe.png'], icon: '🔄' },
        { title: 'Speeder', path: 'speeder', files: ['speed2x.png'], icon: '💨' },
        { title: 'Bullets', path: 'bullets/bullets', files: [], icon: '🔫' }
    ];

    // For bullets we will show a single special box for SpecialBullets
    // (user requested: "only the special bullet box")
    const specialBulletsPreview = '/assets/tank/bullets/SpecialBullets/bullets/arrowBullet.png';

    // build container
    const selfContainer = document.createElement('div');
    selfContainer.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:12px;';

    sections.forEach(section => {
        const header = document.createElement('div');
        header.style.cssText = 'color:#00f7ff;font-weight:700;margin-bottom:6px;';
        header.textContent = section.title;
        selfContainer.appendChild(header);

        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;';

        section.files.forEach(file => {
            const imgPath = `/assets/tank/${section.path}/${file}`;
            const displayName = file.replace(/\.png$/i, '').replace(/_/g, ' ').replace(/\d+/g, '').trim();

            const item = document.createElement('div');
            item.className = 'editor-asset-item';
            item.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px;';

            item.innerHTML = `<div class="asset-preview"><img src="${imgPath}" alt="${displayName}" onerror="this.style.display='none'"></div><div class="asset-name">${displayName || section.title}</div>`;

            const asset = {
                name: displayName || section.title,
                category: 'self',
                subcategory: section.title.toLowerCase(),
                image: imgPath,
                icon: section.icon,
                isSelfAsset: true
            };

            item.onclick = () => selectAsset(asset, item);

            item.onmouseenter = () => { item.style.transform = 'translateY(-3px)'; };
            item.onmouseleave = () => { item.style.transform = 'translateY(0)'; };

            grid.appendChild(item);
        });

        selfContainer.appendChild(grid);
    });

    container.appendChild(selfContainer);
}

// Ground assets loader with real textures
function loadGroundAssets(container) {
    const groundTextures = [
        { name: 'Blue Grass', type: 'bluegrass', file: 'tank/Grounds/BlueGrass.png' },
        { name: 'Brown Cobblestone', type: 'browncobble', file: 'tank/Grounds/BrownCobblestone.png' },
        { name: 'Brown Grass', type: 'browngrass', file: 'tank/Grounds/BrownGrass.png' },
        { name: 'Gold Cobblestone', type: 'goldcobble', file: 'tank/Grounds/Goldcobblestone.png' },
        { name: 'Golden Cobblestone', type: 'goldencobble', file: 'tank/Grounds/GoldenCobblestone.png' },
        { name: 'Gray Ground', type: 'grayground', file: 'tank/Grounds/GrayGround.png' },
        { name: 'Green Grass', type: 'greengrass', file: 'tank/Grounds/GreenGrass.png' },
        { name: 'Light Brown Cobblestone', type: 'lightbrowncobble', file: 'tank/Grounds/LightBrownCobblestone.png' },
        { name: 'Light Grey Cobblestone', type: 'lightgreycobble', file: 'tank/Grounds/LightGreyCobblestone.png' },
        { name: 'Light Grey Ground', type: 'lightgreyground', file: 'tank/Grounds/LightGreyGround.png' },
        { name: 'Light Sand', type: 'lightsand', file: 'tank/Grounds/LightSand.png' },
        { name: 'Purple Cobblestone', type: 'purplecobble', file: 'tank/Grounds/PurpleCobblestone.png' },
        { name: 'Red Cobblestone', type: 'redcobble', file: 'tank/Grounds/RedCobblestone.png' },
        { name: 'Sand', type: 'sand', file: 'tank/Grounds/Sand.png' },
        { name: 'Wooden Planks', type: 'woodenplanks', file: 'tank/Grounds/WoodenPlanks.png' },
        { name: 'Wooden Tile', type: 'woodentile', file: 'tank/Grounds/WoodenTile.png' },
        { name: 'Yellow Grass', type: 'yellowgrass', file: 'tank/Grounds/YellowGrass.png' },
        { name: 'Lava 1', type: 'lava1', file: 'tank/Grounds/lava1.png' },
        { name: 'Lava 2', type: 'lava2', file: 'tank/Grounds/lava2.png' },
        { name: 'Liquid Bubbles 1', type: 'liquid1', file: 'tank/Grounds/liquidBubble1.png' },
        { name: 'Liquid Bubbles 2', type: 'liquid2', file: 'tank/Grounds/liquidBubble2.png' }
    ];

    groundTextures.forEach(ground => {
        const item = createGroundAssetItem(ground);
        item.onclick = () => selectGroundAsset(ground);
        container.appendChild(item);
    });
}

// Building assets loader with real assets
function loadBuildingAssets(container) {
    // Object file name mapping from backup with icons
    const objectFileNameMap = {
        'Buildings': {
            'Cart': { fileName: 'cart', icon: '🚛' },
            'Farm_House_01': { fileName: 'farm_house_01', icon: '🏠' },
            'Farm_House_02': { fileName: 'farm_house_02', icon: '🏡' },
            'Farm_House_With_CropFiled': { fileName: 'farm_field', icon: '🌾' },
            'Guard_Tower': { fileName: 'guard_tower', icon: '🏰' },
            'House_01': { fileName: 'house_01', icon: '🏘️' },
            'House_02': { fileName: 'house_02', icon: '🏠' },
            'Inn': { fileName: 'inn', icon: '🏨' },
            'Shop_01': { fileName: 'shop_01', icon: '🏪' },
            'Shop_02': { fileName: 'shop_02', icon: '🏬' },
            'Stall_01': { fileName: 'stall_01', icon: '🍎' },
            'Stall_02': { fileName: 'stall_02', icon: '🥕' },
            'Tree': { fileName: 'trees', icon: '🌳' },
            'Wind_Mill': { fileName: 'windmill', icon: '🌬️' }
        }
    };

    const viewFolder = 'Buildings';
    const objects = Object.keys(objectFileNameMap[viewFolder]);

    objects.forEach(objName => {
        const objData = objectFileNameMap[viewFolder][objName];
        const fileName = objData.fileName;
        const icon = objData.icon;
        const viewFolderName = 'top_down_view';
        const imagePath = `/assets/tank/${viewFolder}/${objName}/spr_${viewFolderName}_${fileName}_front.png`;

        const asset = {
            name: objName.replace(/_/g, ' '),
            folder: objName,
            fileName: fileName,
            viewFolder: viewFolder,
            image: imagePath,
            icon: icon,
            direction: 'front', // Default direction for direct selection
            isFolder: false // Make it directly selectable like grounds
        };

        const item = createBuildingAssetItem(asset);
        item.onclick = () => selectAsset(asset, item);
        container.appendChild(item);
    });
}

// Create ground asset item with real texture
function createGroundAssetItem(ground) {
    const item = document.createElement('div');
    item.className = 'editor-asset-item ground';
    
    item.innerHTML = `
        <div class="asset-preview">
            <img src="/assets/${ground.file}" alt="${ground.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none'">
        </div>
        <div class="asset-name">${ground.name}</div>
    `;
    
    return item;
}

// Create building asset item with real image
function createBuildingAssetItem(asset) {
    const item = document.createElement('div');
    item.className = 'editor-asset-item building';
    
    item.innerHTML = `
        <div class="asset-preview">
            <img src="${asset.image}" alt="${asset.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.style.display='none'">
        </div>
        <div class="asset-name">${asset.name}</div>
        <div style="color: rgba(255, 255, 255, 0.4); font-size: 10px; text-align: center;">Click to expand</div>
    `;
    
    return item;
}

// Asset selection functions
function selectGroundAsset(ground) {
    selectedAsset = {
        name: ground.name,
        folder: null,
        fileName: ground.file,
        viewFolder: null,
        image: `/assets/${ground.file}`,
        isFolder: false,
        isGround: true,
        groundType: ground.file, // Use file path as groundType to match texture loading
        groundFile: ground.file
    };
    updateAssetSelection();
    updateSelectedAssetVisual();
    console.log('✅ Ground asset selected:', ground.name, 'File:', ground.file);
}

// Open object folder to show different directions
function __openObjectFolder_duplicate_removed__(asset) {
    const assetsGrid = document.getElementById('assetsGrid');
    assetsGrid.innerHTML = '';

    // Add back button
    const backBtn = document.createElement('div');
    backBtn.className = 'editor-asset-item back-button';
    backBtn.innerHTML = `
        <div class="asset-preview">
            <span style="font-size: 24px;">←</span>
        </div>
        <div class="asset-name">Back to Buildings</div>
    `;
    backBtn.onclick = () => {
        selectedAsset = null;
        updateAssetSelection();
        loadAssets('buildings');
    };
    assetsGrid.appendChild(backBtn);

    // Show different directions for this building
    const directions = ['front', 'back', 'left', 'right'];
    const viewFolderName = 'top_down_view';

    directions.forEach(direction => {
        let directionSuffix = direction;
        // Handle special cases
        if (direction === 'right' && asset.fileName === 'farm_field') {
            directionSuffix = 'right_';
        }

        const imagePath = `/assets/tank/${asset.viewFolder}/${asset.folder}/spr_${viewFolderName}_${asset.fileName}_${directionSuffix}.png`;

        const directionAsset = {
            ...asset,
            name: `${asset.name} (${direction})`,
            image: imagePath,
            direction: direction,
            isFolder: false
        };

        const item = document.createElement('div');
        item.className = 'editor-asset-item building-direction';
        
        item.innerHTML = `
            <div class="asset-preview">
                <img src="${imagePath}" alt="${directionAsset.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.style.display='none'">
            </div>
            <div class="asset-name">${directionAsset.name}</div>
            <div style="color: rgba(255, 255, 255, 0.4); font-size: 10px; text-align: center;">Click to select</div>
        `;

        item.onclick = () => selectBuildingAsset(directionAsset);
        assetsGrid.appendChild(item);
    });
}

function selectBuildingAsset(asset) {
    selectedAsset = asset;
    updateAssetSelection();
    updateSelectedAssetVisual();
    console.log('✅ Building asset selected:', asset.name, 'Direction:', asset.direction);
}

// Update visual selection
function updateSelectedAssetVisual() {
    // Remove previous selection
    document.querySelectorAll('.editor-asset-item.selected').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to current item if any
    if (selectedAsset) {
        const items = document.querySelectorAll('.editor-asset-item');
        items.forEach(item => {
            const name = item.querySelector('.asset-name').textContent;
            if (name === selectedAsset.name) {
                item.classList.add('selected');
            }
        });
    }
}

// Load players panel
function loadPlayersPanel() {
    const assetsGrid = document.getElementById('assetsGrid');
    const playersPanel = document.getElementById('playersPanel');
    
    if (assetsGrid) assetsGrid.style.display = 'none';
    if (playersPanel) playersPanel.style.display = 'block';
}


function openObjectFolder(asset) {
    // Control section
    const controlSection = document.createElement('div');
    controlSection.id = 'assetControlSection';
    controlSection.style.cssText = 'padding: 15px 20px; border-bottom: 1px solid rgba(0,247,255,0.15); display: none;';

    // Unselect button
    const unselectBtn = document.createElement('button');
    unselectBtn.textContent = '❌ Unselect Asset';
    unselectBtn.style.cssText = 'width:100%; padding:12px; background: linear-gradient(90deg, rgba(255,60,60,0.15), rgba(220,40,40,0.15)); border: 1px solid rgba(255,80,80,0.4); border-left: 3px solid #ff4444; color:#ff6666; cursor:pointer; font-weight:600; font-size:12px; letter-spacing:0.5px; transition:all 0.2s; text-align:left; border-radius: 0;';
    unselectBtn.onclick = () => {
        selectedAsset = null;
        updateAssetSelection();
        renderMapCreatorCanvas();
    };
    unselectBtn.onmouseenter = () => {
        unselectBtn.style.background = 'linear-gradient(90deg, rgba(255,60,60,0.25), rgba(220,40,40,0.25))';
        unselectBtn.style.borderLeftColor = '#ff6666';
        unselectBtn.style.transform = 'translateX(2px)';
    };
    unselectBtn.onmouseleave = () => {
        unselectBtn.style.background = 'linear-gradient(90deg, rgba(255,60,60,0.15), rgba(220,40,40,0.15))';
        unselectBtn.style.borderLeftColor = '#ff4444';
        unselectBtn.style.transform = 'translateX(0)';
    };
    controlSection.appendChild(unselectBtn);
    assetsPanel.appendChild(controlSection);

        // Category section
        const categorySection = document.createElement('div');
        categorySection.style.cssText = 'padding: 15px 20px; border-bottom: 1px solid rgba(0,247,255,0.15);';
        
        const categoryLabel = document.createElement('div');
        categoryLabel.textContent = 'CATEGORIES';
        categoryLabel.style.cssText = 'font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 10px; letter-spacing: 1px;';
        categorySection.appendChild(categoryLabel);
        
        const catGrid = document.createElement('div');
        catGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px;';
        
        const categories = [
            { id: 'ground', name: 'TERRAIN', icon: '🌍' },
            { id: 'self', name: 'SELF', icon: '🎯' },
            { id: 'tanks', name: 'TANKS', icon: '🚛' },
            { id: 'obstacles', name: 'OBSTACLES', icon: '🧱' },
            { id: 'powerups', name: 'POWER-UPS', icon: '⚡' },
            { id: 'players', name: 'SPAWNS', icon: '🎯' },
            { id: 'script', name: 'SCRIPTS', icon: '📜' }
        ];
        
        categories.forEach(cat => {
            const b = document.createElement('button');
            b.className = 'asset-category-btn';
            b.dataset.category = cat.id;
            b.innerHTML = `<div style="font-size: 14px; margin-bottom: 2px;">${cat.icon}</div><div style="font-size: 10px; font-weight: 600; letter-spacing: 0.5px;">${cat.name}</div>`;
            b.style.cssText = 'padding: 12px 8px; background: linear-gradient(135deg, rgba(0,247,255,0.08), rgba(0,200,220,0.05)); border: 1px solid rgba(0,247,255,0.2); border-left: 2px solid rgba(0,247,255,0.4); color: #00f7ff; cursor: pointer; transition: all 0.2s; text-align: center; border-radius: 0;';
            b.onclick = () => switchAssetCategory(cat.id);
            b.onmouseenter = () => {
                b.style.background = 'linear-gradient(135deg, rgba(0,247,255,0.2), rgba(0,200,220,0.15))';
                b.style.borderLeftColor = '#00f7ff';
                b.style.transform = 'translateX(2px)';
            };
            b.onmouseleave = () => {
                b.style.background = 'linear-gradient(135deg, rgba(0,247,255,0.08), rgba(0,200,220,0.05))';
                b.style.borderLeftColor = 'rgba(0,247,255,0.4)';
                b.style.transform = 'translateX(0)';
            };
            catGrid.appendChild(b);
        });
        
        categorySection.appendChild(catGrid);
        assetsPanel.appendChild(categorySection);

        // Scrollable content area
        const contentArea = document.createElement('div');
        contentArea.style.cssText = 'flex: 1; overflow-y: auto; max-height: calc(85vh - 200px);';
        
        // Assets grid container
        assetsGrid = document.createElement('div');
        assetsGrid.id = 'assetsGrid';
        assetsGrid.style.cssText = 'padding: 15px 20px; display: flex; flex-direction: column; gap: 6px;';
        
        contentArea.appendChild(assetsGrid);
        
        // Create script editor container (hidden by default)
        const textEditorContainer = document.createElement('div');
        textEditorContainer.id = 'textEditorContainer';
        textEditorContainer.style.cssText = `
            display: none;
            padding: 20px;
            height: calc(85vh - 200px);
            overflow: hidden;
        `;
        
        textEditorContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: #00f7ff; margin: 0; font-size: 18px;">📜 Map Script Editor</h3>
                <div style="display: flex; gap: 10px;">
                    <button onclick="saveMapScript()" style="
                        padding: 8px 16px;
                        background: linear-gradient(135deg, rgba(0,247,255,0.2), rgba(0,200,220,0.1));
                        border: 2px solid rgba(0,247,255,0.6);
                        color: #00f7ff;
                        font-size: 12px;
                        font-weight: bold;
                        cursor: pointer;
                        border-radius: 6px;
                        transition: all 0.3s;
                    ">💾 SAVE</button>
                    <button onclick="clearMapScript()" style="
                        padding: 8px 16px;
                        background: linear-gradient(135deg, rgba(255,60,60,0.2), rgba(220,40,40,0.1));
                        border: 2px solid rgba(255,80,80,0.6);
                        color: #ff6666;
                        font-size: 12px;
                        font-weight: bold;
                        cursor: pointer;
                        border-radius: 6px;
                        transition: all 0.3s;
                    ">🗑️ CLEAR</button>
                </div>
            </div>
            <div style="
                background: rgba(0,0,0,0.3);
                border: 2px solid rgba(0,247,255,0.3);
                border-radius: 8px;
                height: calc(100% - 60px);
                position: relative;
                display: flex;
                flex-direction: column;
            ">
                <div style="
                    background: rgba(0,247,255,0.1);
                    padding: 8px 15px;
                    border-bottom: 1px solid rgba(0,247,255,0.3);
                    font-size: 12px;
                    color: rgba(255,255,255,0.7);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <span>📜 Lua Script Editor</span>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="showScriptTemplates()" style="
                            padding: 4px 8px;
                            background: rgba(255,0,255,0.2);
                            border: 1px solid rgba(255,0,255,0.5);
                            color: #ff00ff;
                            font-size: 10px;
                            cursor: pointer;
                            border-radius: 4px;
                        ">📋 TEMPLATES</button>
                        <button onclick="testMapScript()" style="
                            padding: 4px 8px;
                            background: rgba(0,255,0,0.2);
                            border: 1px solid rgba(0,255,0,0.5);
                            color: #00ff00;
                            font-size: 10px;
                            cursor: pointer;
                            border-radius: 4px;
                        ">▶️ TEST</button>
                        <button onclick="showScriptHelp()" style="
                            padding: 4px 8px;
                            background: rgba(255,255,0,0.2);
                            border: 1px solid rgba(255,255,0,0.5);
                            color: #ffff00;
                            font-size: 10px;
                            cursor: pointer;
                            border-radius: 4px;
                        ">❓ HELP</button>
                    </div>
                </div>
                <div id="scriptEditorWrapper" style="
                    width: 100%;
                    flex: 1;
                    position: relative;
                    background: #0a0a0a;
                    border-radius: 6px;
                    overflow: hidden;
                ">
                    <textarea id="mapScriptEditor" placeholder="-- 🚛 TANK MAP SCRIPT EDITOR 🚛
-- Write your tank battle script here (Lua syntax)

-- 🎮 TANK BATTLE EVENTS:
function onBattleStart()
    showMessage('🚛 Tank Battle Started!')
    spawnTankPowerUp('armor', 400, 300)
end

function onTankSpawn(tank)
    showMessage('Tank deployed: ' .. tank.name)
    giveTankWeapon(tank.id, 'cannon')
end

function onTankDestroyed(tank, killer)
    spawnExplosion(tank.x, tank.y)
    showMessage(tank.name .. ' tank destroyed!')
    if killer then
        rewardKiller(killer.id, 'damage_boost')
    end
end

-- 🔧 TANK FUNCTIONS:
-- spawnTank(color, x, y) - Spawn tank at position
-- giveTankWeapon(tankId, weapon) - Give weapon to tank
-- upgradeTankArmor(tankId, level) - Upgrade tank armor
-- setTankSpeed(tankId, speed) - Set tank movement speed
-- spawnTankPowerUp(type, x, y) - Spawn tank power-up
-- createTankBarrier(x, y, width, height) - Create destructible barrier
-- activateTankTurret(x, y) - Place defensive turret

-- 💥 BATTLE FUNCTIONS:
-- spawnExplosion(x, y, radius) - Create explosion
-- createCrater(x, y) - Leave battle damage
-- playTankSound(sound) - Play tank sound effect
-- endBattle(winner) - End tank battle

-- Example: Tank King of the Hill
function tankKingOfHill()
    local tanksInZone = getTanksInArea('control_zone')
    if #tanksInZone == 1 then
        local tank = tanksInZone[1]
        showMessage(tank.name .. ' controls the zone!')
        upgradeTankArmor(tank.id, 2)
    end
end" style="
                        width: 100%;
                        height: 100%;
                        background: transparent;
                        border: none;
                        color: #00ff88;
                        font-family: 'Fira Code', 'Courier New', monospace;
                        font-size: 14px;
                        line-height: 1.5;
                        padding: 15px;
                        resize: none;
                        outline: none;
                        box-sizing: border-box;
                        tab-size: 4;
                    "></textarea>
                    
                    <!-- Syntax highlighting overlay -->
                    <div id="syntaxHighlight" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        font-family: 'Fira Code', 'Courier New', monospace;
                        font-size: 14px;
                        line-height: 1.5;
                        padding: 15px;
                        box-sizing: border-box;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        z-index: 1;
                        color: transparent;
                    "></div>
                </div>
            </div>
        `;
        
        contentArea.appendChild(textEditorContainer);
        assetsPanel.appendChild(contentArea);
        
        // Add custom scrollbar styling
        const style = document.createElement('style');
        style.textContent = `
            #assetsPanel div::-webkit-scrollbar {
                width: 6px;
            }
            #assetsPanel div::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.2);
            }
            #assetsPanel div::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #00f7ff, #0099cc);
                border-radius: 0;
            }
            #assetsPanel div::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, #33ffff, #00ccff);
            }
        `;
        document.head.appendChild(style);

        // assetsPanel is already in HTML, don't append to body
    }
    assetsGrid.innerHTML = '';

    // If we're viewing a specific object's files, show those
    if (currentObjectFolder) {
        loadObjectFiles(currentObjectFolder);
    }

    // Ground PNG textures (use tank asset folder)
    const groundTextures = [
        { name: 'Water', type: 'water', file: 'tank/Grounds/water.png' },
        { name: 'Blue Grass', type: 'bluegrass', file: 'tank/Grounds/BlueGrass.png' },
        { name: 'Brown Cobblestone', type: 'browncobble', file: 'tank/Grounds/BrownCobblestone.png' },
        { name: 'Brown Grass', type: 'browngrass', file: 'tank/Grounds/BrownGrass.png' },
        { name: 'Gold Cobblestone', type: 'goldcobble', file: 'tank/Grounds/Goldcobblestone.png' },
        { name: 'Golden Cobblestone', type: 'goldencobble', file: 'tank/Grounds/GoldenCobblestone.png' },
        { name: 'Gray Ground', type: 'grayground', file: 'tank/Grounds/GrayGround.png' },
        { name: 'Green Grass', type: 'greengrass', file: 'tank/Grounds/GreenGrass.png' },
        { name: 'Light Brown Cobblestone', type: 'lightbrowncobble', file: 'tank/Grounds/LightBrownCobblestone.png' },
        { name: 'Light Grey Cobblestone', type: 'lightgreycobble', file: 'tank/Grounds/LightGreyCobblestone.png' },
        { name: 'Light Grey Ground', type: 'lightgreyground', file: 'tank/Grounds/LightGreyGround.png' },
        { name: 'Light Sand', type: 'lightsand', file: 'tank/Grounds/LightSand.png' },
        { name: 'Purple Cobblestone', type: 'purplecobble', file: 'tank/Grounds/PurpleCobblestone.png' },
        { name: 'Red Cobblestone', type: 'redcobble', file: 'tank/Grounds/RedCobblestone.png' },
        { name: 'Sand', type: 'sand', file: 'tank/Grounds/Sand.png' },
        { name: 'Wooden Planks', type: 'woodenplanks', file: 'tank/Grounds/WoodenPlanks.png' },
        { name: 'Wooden Tile', type: 'woodentile', file: 'tank/Grounds/WoodenTile.png' },
        { name: 'Yellow Grass', type: 'yellowgrass', file: 'tank/Grounds/YellowGrass.png' },
        { name: 'Lava 1', type: 'lava1', file: 'tank/Grounds/lava1.png' },
        { name: 'Lava 2', type: 'lava2', file: 'tank/Grounds/lava2.png' },
        { name: 'Liquid Bubbles 1', type: 'liquid1', file: 'tank/Grounds/liquidBubble1.png' },
        { name: 'Liquid Bubbles 2', type: 'liquid2', file: 'tank/Grounds/liquidBubble2.png' }
    ];

    // Determine active category for this assets panel
    var _category = (typeof category !== 'undefined') ? category : (typeof currentAssetCategory !== 'undefined' ? currentAssetCategory : null);

    // Show only ground textures if ground category is selected
    if (_category === 'ground') {
        // Create perfect grid container for 2 grounds per row - 3x bigger
        const groundsGridContainer = document.createElement('div');
        groundsGridContainer.style.cssText = `
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 25px; 
            margin: 25px auto;
            padding: 25px;
            justify-content: center;
            align-items: start;
            max-width: 100%;
        `;
        
        groundTextures.forEach(ground => {
            const assetItem = document.createElement('div');
            assetItem.className = 'asset-item-grid ground-item';

            const asset = {
                name: ground.name,
                folder: null,
                fileName: ground.file,
                viewFolder: null,
                image: `/assets/${ground.file}`,
                isFolder: false,
                isGround: true,
                groundType: ground.file,
                groundFile: ground.file
            };

            assetItem.onclick = () => selectAsset(asset, assetItem);

            assetItem.innerHTML = `
                <div class="asset-preview" style="
                    width: 100%; 
                    height: 200px; 
                    background: linear-gradient(145deg, rgba(0,247,255,0.08), rgba(0,200,220,0.04)); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    overflow: hidden; 
                    border: 3px solid rgba(0,247,255,0.25); 
                    transition: all 0.3s ease;
                    margin-bottom: 15px;
                    border-radius: 12px;
                ">
                    <img src="/assets/${ground.file}" alt="${asset.name}" style="
                        width: 160%; 
                        height: 160%; 
                        object-fit: cover;
                        transition: transform 0.3s ease;
                        transform-origin: center center;
                    ">
                </div>
                <div class="asset-info" style="text-align: center; padding: 0 8px;">
                    <div style="
                        color: #00f7ff; 
                        font-size: 14px; 
                        font-weight: 700; 
                        text-shadow: 0 0 8px rgba(0,247,255,0.4);
                        margin-bottom: 4px;
                        line-height: 1.3;
                    ">${asset.name}</div>
                    <div style="
                        color: rgba(255, 255, 255, 0.6); 
                        font-size: 11px;
                        font-weight: 500;
                    ">Ground Texture</div>
                </div>
            `;
            
            // Perfect square asset item styling - equal width and height
            assetItem.style.cssText = `
                width: 80px;
                height: 80px;
                padding: 8px; 
                cursor: pointer; 
                background: rgba(139, 69, 19, 0.1); 
                border: 2px solid rgba(139, 69, 19, 0.6); 
                transition: all 0.3s ease; 
                position: relative; 
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
            `;
            
            assetItem.onmouseenter = () => {
                assetItem.style.background = 'linear-gradient(135deg, rgba(0,247,255,0.08), rgba(0,200,220,0.04))';
                assetItem.style.borderColor = 'rgba(0,247,255,0.5)';
                assetItem.style.borderLeftColor = '#00f7ff';
                assetItem.style.transform = 'translateY(-6px) scale(1.02)';
                assetItem.style.boxShadow = '0 12px 35px rgba(0,247,255,0.2)';
                
                const img = assetItem.querySelector('img');
                if (img) img.style.transform = 'scale(1.08)';
            };
            
            assetItem.onmouseleave = () => {
                assetItem.style.background = 'linear-gradient(135deg, rgba(0,247,255,0.02), rgba(0,200,220,0.01))';
                assetItem.style.borderColor = 'rgba(0,247,255,0.15)';
                assetItem.style.borderLeftColor = 'rgba(0,247,255,0.3)';
                assetItem.style.transform = 'translateY(0) scale(1)';
                assetItem.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                
                const img = assetItem.querySelector('img');
                if (img) img.style.transform = 'scale(1)';
            };

            groundsGridContainer.appendChild(assetItem);
        });
        
        assetsGrid.appendChild(groundsGridContainer);
    }





    // Show obstacles category
    if (_category === 'obstacles') {
        const obstaclesContainer = document.createElement('div');
        obstaclesContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            padding: 20px;
        `;

        const obstacles = [
            { name: 'Concrete Barrier', type: 'barrier_concrete', lootbox: 100, destructible: true },
            { name: 'Steel Wall', type: 'barrier_steel', lootbox: 200, destructible: true },
            { name: 'Sandbags', type: 'barrier_sand', lootbox: 50, destructible: true },
            { name: 'Tank Trap', type: 'trap_spikes', lootbox: 150, destructible: true },
            { name: 'Mine Field', type: 'mines', lootbox: 1, destructible: true },
            { name: 'Oil Barrel', type: 'barrel_explosive', lootbox: 25, destructible: true }
        ];

        obstacles.forEach(obstacle => {
            const obstacleItem = document.createElement('div');
            obstacleItem.className = 'asset-item-grid obstacle-item';
            obstacleItem.style.cssText = `
                background: linear-gradient(135deg, rgba(255,100,0,0.1), rgba(200,80,0,0.05));
                border: 2px solid rgba(255,100,0,0.3);
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            `;

            const asset = {
                name: obstacle.name,
                type: obstacle.type,
                category: 'obstacles',
                lootbox: obstacle.lootbox,
                destructible: obstacle.destructible,
                isObstacle: true
            };

            obstacleItem.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 8px;">🧱</div>
                <div style="color: #ff6400; font-weight: bold; font-size: 12px; margin-bottom: 4px;">${obstacle.name}</div>
                <div style="color: rgba(255,255,255,0.6); font-size: 10px;">Lootbox: ${obstacle.lootbox}</div>
                <div style="color: rgba(255,255,255,0.4); font-size: 9px;">${obstacle.destructible ? 'Destructible' : 'Indestructible'}</div>
            `;

            obstacleItem.onclick = () => selectAsset(asset, obstacleItem);
            
            obstacleItem.onmouseenter = () => {
                obstacleItem.style.background = 'linear-gradient(135deg, rgba(255,100,0,0.2), rgba(200,80,0,0.1))';
                obstacleItem.style.borderColor = 'rgba(255,100,0,0.6)';
                obstacleItem.style.transform = 'translateY(-3px) scale(1.05)';
            };
            
            obstacleItem.onmouseleave = () => {
                obstacleItem.style.background = 'linear-gradient(135deg, rgba(255,100,0,0.1), rgba(200,80,0,0.05))';
                obstacleItem.style.borderColor = 'rgba(255,100,0,0.3)';
                obstacleItem.style.transform = 'translateY(0) scale(1)';
            };

            obstaclesContainer.appendChild(obstacleItem);
        });

        assetsGrid.appendChild(obstaclesContainer);
    }

    // Show power-ups category
    if (_category === 'powerups') {
        const powerupsContainer = document.createElement('div');
        powerupsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            padding: 20px;
        `;

        const powerups = [
            { name: 'Armor Boost', type: 'armor', icon: '🛡️', effect: '+50 Armor', color: '#4CAF50' },
            { name: 'Damage Boost', type: 'damage', icon: '💥', effect: '+25 Damage', color: '#F44336' },
            { name: 'Speed Boost', type: 'speed', icon: '⚡', effect: '+30% Speed', color: '#FFEB3B' },
            { name: 'Rapid Fire', type: 'firerate', icon: '🔥', effect: '2x Fire Rate', color: '#FF9800' },
            { name: 'Lootbox', type: 'lootbox', icon: '🎁', effect: 'Random Rewards', color: '#E91E63' },
            { name: 'Ammo Crate', type: 'ammo', icon: '📦', effect: 'Full Ammo', color: '#9C27B0' }
        ];

        powerups.forEach(powerup => {
            const powerupItem = document.createElement('div');
            powerupItem.className = 'asset-item-grid powerup-item';
            powerupItem.style.cssText = `
                background: linear-gradient(135deg, ${powerup.color}20, ${powerup.color}10);
                border: 2px solid ${powerup.color}60;
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            `;

            const asset = {
                name: powerup.name,
                type: powerup.type,
                category: 'powerups',
                effect: powerup.effect,
                icon: powerup.icon,
                isPowerUp: true
            };

            powerupItem.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 8px;">${powerup.icon}</div>
                <div style="color: ${powerup.color}; font-weight: bold; font-size: 12px; margin-bottom: 4px;">${powerup.name}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 10px;">${powerup.effect}</div>
            `;

            powerupItem.onclick = () => selectAsset(asset, powerupItem);
            
            powerupItem.onmouseenter = () => {
                powerupItem.style.background = `linear-gradient(135deg, ${powerup.color}40, ${powerup.color}20)`;
                powerupItem.style.borderColor = `${powerup.color}`;
                powerupItem.style.transform = 'translateY(-3px) scale(1.05)';
                powerupItem.style.boxShadow = `0 8px 25px ${powerup.color}40`;
            };
            
            powerupItem.onmouseleave = () => {
                powerupItem.style.background = `linear-gradient(135deg, ${powerup.color}20, ${powerup.color}10)`;
                powerupItem.style.borderColor = `${powerup.color}60`;
                powerupItem.style.transform = 'translateY(0) scale(1)';
                powerupItem.style.boxShadow = 'none';
            };

            powerupsContainer.appendChild(powerupItem);
        });

            assetsGrid.appendChild(powerupsContainer);
        }

        // Show self (tank-specific) assets: powers, lootbox, respawner, speeder, bullets
        if (_category === 'self') {
            const selfContainer = document.createElement('div');
            selfContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 18px;
                padding: 18px;
            `;

            const sections = [
                { title: 'Powers', path: 'powers', files: ['_Path_ (4).png', '_Path_ (6).png'] },
                { title: 'Lootbox', path: 'lootboxes', files: ['lootboxes10+.png', 'lootboxes20+.png', 'lootboxes50+.png', 'lootboxes100+.png'] },
                { title: 'Buildings', path: 'buildings', files: ['cart', 'farm_house_01', 'farm_house_02', 'farm_field', 'guard_tower', 'house_01', 'house_02', 'inn', 'shop_01', 'shop_02', 'stall_01', 'stall_02', 'trees', 'windmill'], isBuildings: true },
                { title: 'Respawner', path: 'respawner', files: ['RedRe.png', 'blueRe.png'] },
                { title: 'Speeder', path: 'speeder', files: ['speed2x.png'] },
                { title: 'Bullets', path: 'bullets/bullets', files: [] }
            ];

            // populate bullets files (01..66)
            for (let i = 1; i <= 66; i++) {
                const num = String(i).padStart(2, '0');
                sections[4].files.push(`${num}.png`);
            }

            sections.forEach(section => {
                const header = document.createElement('div');
                header.style.cssText = 'color: #00f7ff; font-weight: 700; margin-bottom: 6px;';
                header.textContent = section.title;
                selfContainer.appendChild(header);

                // render bullets section: show only the special box linking to SpecialBullets
                const grid = document.createElement('div');
                grid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;';

                if (section.title === 'Bullets') {
                    const box = document.createElement('div');
                    box.className = 'editor-asset-item';
                    box.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;border:2px dashed rgba(255,255,255,0.08);';

                    box.innerHTML = `
                        <div style="width:64px;height:64px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0b1220,#0f2230);">
                            <img src="${specialBulletsPreview}" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.style.display='none'">
                        </div>
                        <div style="color:#ffd880;margin-top:8px;font-weight:700;">Special Bullets</div>
                        <div style="color:rgba(255,255,255,0.6);font-size:12px;">Open special bullets</div>
                    `;

                    box.onclick = () => {
                        // open a simple modal-like listing of special bullets
                        const overlay = document.createElement('div');
                        overlay.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:100000;';

                        const panel = document.createElement('div');
                        panel.style.cssText = 'width:520px;max-width:90%;background:#07101a;padding:16px;border:2px solid rgba(0,247,255,0.14);border-radius:8px;';
                        panel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h3 style="color:#00f7ff;margin:0">Special Bullets</h3><button id="closeSpecialBullets" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer">✖</button></div>`;

                        const list = document.createElement('div');
                        list.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;';

                        const specialFiles = ['arrowBullet.png','axeBullet.png','fireBullet.png','greenBulet.png','iceBullet.png','purpleBullet.png'];
                        specialFiles.forEach(f => {
                            const p = document.createElement('div');
                            p.className = 'editor-asset-item';
                            p.style.cssText = 'padding:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;';
                            const path = `/assets/tank/bullets/SpecialBullets/bullets/${f}`;
                            p.innerHTML = `<div class="asset-preview"><img src="${path}" onerror="this.style.display='none'"/></div><div class="asset-name">${f.replace(/\.png$/,'')}</div>`;
                            p.onclick = () => selectAsset({ name: f.replace(/\.png$/,''), category: 'self', subcategory: 'special-bullet', image: path }, p);
                            list.appendChild(p);
                        });

                        panel.appendChild(list);
                        overlay.appendChild(panel);
                        document.body.appendChild(overlay);

                        document.getElementById('closeSpecialBullets').onclick = () => overlay.remove();
                    };

                    grid.appendChild(box);
                } else {
                    section.files.forEach(file => {
                        const imgPath = `/assets/tank/${section.path}/${file}`;
                        const displayName = file.replace(/\.png$/i, '').replace(/_/g, ' ').replace(/\d+/g, '').trim();

                        const item = document.createElement('div');
                        item.className = 'editor-asset-item';
                        item.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px;';

                        item.innerHTML = `<div class="asset-preview"><img src="${imgPath}" alt="${displayName}" onerror="this.style.display='none'"></div><div class="asset-name">${displayName || section.title}</div>`;

                        const asset = {
                            name: displayName || section.title,
                            category: 'self',
                            subcategory: section.title.toLowerCase(),
                            image: imgPath,
                            isSelfAsset: true
                        };

                        item.onclick = () => selectAsset(asset, item);
                        grid.appendChild(item);
                    });
                }

                selfContainer.appendChild(grid);
            });

            assetsGrid.appendChild(selfContainer);
        }

    // Show tanks/vehicles category
    if (_category === 'tanks' || _category === 'vehicles') {
        const tanksContainer = document.createElement('div');
        tanksContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            padding: 20px;
        `;

        const tankColors = [
            { color: 'blue', name: 'Blue Squadron', theme: '#2196F3' },
            { color: 'red', name: 'Red Army', theme: '#F44336' },
            { color: 'camo', name: 'Camouflage', theme: '#4CAF50' },
            { color: 'desert', name: 'Desert Storm', theme: '#FF9800' },
            { color: 'purple', name: 'Purple Elite', theme: '#9C27B0' }
        ];

        tankColors.forEach(tankData => {
            const tankItem = document.createElement('div');
            tankItem.className = 'asset-item-grid tank-item';
            tankItem.style.cssText = `
                background: linear-gradient(135deg, ${tankData.theme}20, ${tankData.theme}10);
                border: 2px solid ${tankData.theme}60;
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
                position: relative;
                overflow: hidden;
            `;

            // Create tank preview with body and turret (using animated GIFs)
            const imagePath = `/assets/tank/tanks/${tankData.color}/${tankData.color}_body_halftrack.gif`;
            const turretPath = `/assets/tank/tanks/${tankData.color}/${tankData.color}_turret_01_mk1.gif`;

            const asset = {
                name: tankData.name,
                color: tankData.color,
                category: 'tanks',
                bodyImage: imagePath,
                turretImage: turretPath,
                theme: tankData.theme,
                isTank: true,
                stats: {
                    armor: Math.floor(Math.random() * 50) + 100,
                    damage: Math.floor(Math.random() * 30) + 50,
                    speed: Math.floor(Math.random() * 20) + 30
                }
            };

            tankItem.innerHTML = `
                <div style="position: relative; margin-bottom: 10px;">
                    <img src="${imagePath}" alt="${tankData.name} Body" style="
                        width: 40px;
                        height: 40px;
                        object-fit: contain;
                        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                    " onerror="this.style.display='none'">
                    <img src="${turretPath}" alt="${tankData.name} Turret" style="
                        width: 30px;
                        height: 30px;
                        object-fit: contain;
                        position: absolute;
                        top: -5px;
                        left: 50%;
                        transform: translateX(-50%);
                        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                    " onerror="this.style.display='none'">
                </div>
                <div style="color: ${tankData.theme}; font-weight: bold; font-size: 12px; margin-bottom: 6px;">${tankData.name}</div>
                <div style="display: flex; justify-content: space-between; font-size: 9px; color: rgba(255,255,255,0.6);">
                    <span>🛡️${asset.stats.armor}</span>
                    <span>💥${asset.stats.damage}</span>
                    <span>⚡${asset.stats.speed}</span>
                </div>
            `;

            tankItem.onclick = () => selectAsset(asset, tankItem);
            
            tankItem.onmouseenter = () => {
                tankItem.style.background = `linear-gradient(135deg, ${tankData.theme}40, ${tankData.theme}20)`;
                tankItem.style.borderColor = tankData.theme;
                tankItem.style.transform = 'translateY(-3px) scale(1.05)';
                tankItem.style.boxShadow = `0 8px 25px ${tankData.theme}40`;
            };
            
            tankItem.onmouseleave = () => {
                tankItem.style.background = `linear-gradient(135deg, ${tankData.theme}20, ${tankData.theme}10)`;
                tankItem.style.borderColor = `${tankData.theme}60`;
                tankItem.style.transform = 'translateY(0) scale(1)';
                tankItem.style.boxShadow = 'none';
            };

            tanksContainer.appendChild(tankItem);
        });

        assetsGrid.appendChild(tanksContainer);
    }

    // Show players category
    if (_category === 'players') {
        // Create players content directly in assetsGrid
        const playersContainer = document.createElement('div');
        playersContainer.style.cssText = `
            padding: 20px;
            color: white;
        `;

        // Spawn Points Section
        const spawnSection = document.createElement('div');
        spawnSection.style.cssText = `
            margin-bottom: 25px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(0,247,255,0.05), rgba(0,200,220,0.02));
            border: 1px solid rgba(0,247,255,0.2);
            border-left: 3px solid rgba(0,247,255,0.4);
            border-radius: 8px;
        `;

        spawnSection.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 16px; margin-right: 8px;">📍</span>
                    <h4 style="color: #00f7ff; font-size: 16px; font-weight: bold; margin: 0;">Spawn Points</h4>
                </div>
                <span id="spawnPointsCounter" style="color: #00f7ff; font-weight: bold; font-size: 14px;">${spawnPoints.length}/20</span>
            </div>
            <button onclick="showSpawnPointMinimap()" style="
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, rgba(0,247,255,0.2), rgba(0,200,220,0.1));
                border: 2px solid rgba(0,247,255,0.6);
                color: #00f7ff;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.3s;
                margin-bottom: 10px;
            " onmouseenter="this.style.background='linear-gradient(135deg, rgba(0,247,255,0.3), rgba(0,200,220,0.2))'" 
               onmouseleave="this.style.background='linear-gradient(135deg, rgba(0,247,255,0.2), rgba(0,200,220,0.1))'">
                🎯 Place Spawn Points
            </button>
            <div style="
                font-size: 12px;
                color: rgba(255,255,255,0.6);
                text-align: center;
                line-height: 1.4;
            ">
                Click the button above to open the spawn point placement tool. You need exactly 20 spawn points to publish your map.
            </div>
        `;

        playersContainer.appendChild(spawnSection);
        assetsGrid.appendChild(playersContainer);
    }

    // Show script editor category
    if (_category === 'script') {
        // Show coming soon message
        if (assetsGrid) {
            assetsGrid.innerHTML = '';
            assetsGrid.style.display = 'block';
            
            const comingSoonContainer = document.createElement('div');
            comingSoonContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 400px;
                text-align: center;
                padding: 40px;
            `;
            
            comingSoonContainer.innerHTML = `
                <div style="font-size: 64px; margin-bottom: 20px;">⚙️</div>
                <h2 style="color: #00f7ff; margin: 0 0 15px 0; font-size: 24px;">Script Editor</h2>
                <div style="color: #FFD700; font-size: 18px; font-weight: bold; margin-bottom: 15px;">Coming Soon!</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6; max-width: 400px;">
                    The script editor will allow you to create custom game modes, events, and interactive elements for your tank maps.
                    <br><br>
                    Features in development:
                    <br>• Custom win conditions
                    <br>• Dynamic events
                    <br>• Power-up spawning
                    <br>• Moving platforms
                    <br>• And much more!
                </div>
            `;
            
            assetsGrid.appendChild(comingSoonContainer);
        }
    }

function backToObjects() {
    currentObjectFolder = null;

    // Reload main objects view
    loadAssets(currentAssetCategory);
}

function loadObjectFiles(asset) {
    const assetsGrid = document.getElementById('assetsGrid');
    assetsGrid.innerHTML = '';

    // Add back button
    const backBtn = document.createElement('div');
    backBtn.className = 'asset-item-list';
    backBtn.style.cursor = 'pointer';
    backBtn.innerHTML = `
        <div style="width: 50px; height: 50px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
            <span style="color: rgba(255, 255, 255, 0.6); font-size: 20px;">←</span>
        </div>
        <div style="flex: 1;">
            <div style="color: rgba(255, 255, 255, 0.6); font-size: 13px; font-weight: 500;">Back to Objects</div>
        </div>
    `;
    backBtn.onclick = backToObjects;
    assetsGrid.appendChild(backBtn);

    // Add title
    const title = document.createElement('div');
    title.style.cssText = 'color: white; font-size: 16px; font-weight: 600; margin: 15px 0 10px 0; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);';
    title.textContent = asset.name;
    assetsGrid.appendChild(title);

    // The 4 directions available for each object
    const directions = ['front', 'back', 'left', 'right'];
    const directionIcons = { front: '↑', back: '↓', left: '←', right: '→' };

    directions.forEach(direction => {
        const assetItem = document.createElement('div');
        assetItem.className = 'asset-item-list';

        const viewFolderName = 'top_down_view'; // Files use this prefix
        const fileName = asset.fileName || objectFileNameMap[asset.viewFolder][asset.folder];

        // Handle special cases
        let directionSuffix = direction;

        if (direction === 'right' && fileName === 'farm_field' && asset.viewFolder === 'Buildings') {
            directionSuffix = 'right_';
        }

        const imagePath = `/assets/tank/${asset.viewFolder}/${asset.folder}/spr_${viewFolderName}_${fileName}_${directionSuffix}.png`;

        const fileAsset = {
            name: `${asset.name} ${direction}`,
            folder: asset.folder,
            fileName: fileName,
            viewFolder: asset.viewFolder,
            direction: direction,
            image: imagePath,
            isFolder: false
        };

        assetItem.onclick = () => selectAsset(fileAsset, assetItem);

        assetItem.innerHTML = `
            <div style="width: 50px; height: 50px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img src="${imagePath}" alt="${fileAsset.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.style.display='none'">
            </div>
            <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
                <div style="color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 500; text-transform: capitalize;">${direction}</div>
                <div style="color: rgba(255, 255, 255, 0.4); font-size: 16px;">${directionIcons[direction]}</div>
            </div>
        `;

        assetsGrid.appendChild(assetItem);
    });
}

function selectAsset(asset, element) {
    selectedAsset = asset;

    // Update visual selection
    document.querySelectorAll('.asset-item-list').forEach(item => {
        item.style.background = 'linear-gradient(90deg, rgba(0,247,255,0.03), rgba(0,200,220,0.01))';
        item.style.borderLeftColor = 'rgba(0,247,255,0.2)';
    });
    element.style.background = 'linear-gradient(90deg, rgba(100,150,255,0.15), rgba(80,120,200,0.1))';
    element.style.borderLeftColor = 'rgba(100,150,255,0.6)';

    // Update asset selection UI
    updateAssetSelection();

    console.log('Selected asset:', asset.name);
    // Force a render so hover/preview updates immediately after selection
    renderMapCreatorCanvas();
}

// Function to show/hide unselect button based on selection
function updateAssetSelection() {
    const controlSection = document.getElementById('assetControlSection');
    if (controlSection) {
        if (selectedAsset) {
            controlSection.style.display = 'block';
        } else {
            controlSection.style.display = 'none';
        }
    }
}

// Function to unselect current asset (called from HTML button)
function unselectCurrentAsset() {
    selectedAsset = null;
    updateAssetSelection();
    updateSelectedAssetVisual();
    
    renderMapCreatorCanvas();
    console.log('Asset unselected');
}

// Initialize unselect button hover effects
function initializeUnselectButton() {
    const unselectBtn = document.getElementById('unselectAssetBtn');
    if (unselectBtn) {
        unselectBtn.onmouseenter = () => {
            unselectBtn.style.background = 'linear-gradient(90deg, rgba(255,60,60,0.25), rgba(220,40,40,0.25))';
            unselectBtn.style.borderLeftColor = '#ff6666';
            unselectBtn.style.transform = 'translateX(2px)';
        };
        unselectBtn.onmouseleave = () => {
            unselectBtn.style.background = 'linear-gradient(90deg, rgba(255,60,60,0.15), rgba(220,40,40,0.15))';
            unselectBtn.style.borderLeftColor = '#ff4444';
            unselectBtn.style.transform = 'translateX(0)';
        };
    }
}





function clearAllObjects() {
    if (placedObjects.length === 0 && customGroundTiles.size === 0) {
        alert('No objects or ground tiles to clear!');
        return;
    }

    if (confirm('Are you sure you want to clear all placed objects and painted ground tiles?')) {
        placedObjects = [];
        customGroundTiles.clear();
        renderMapCreatorCanvas();
    }
}

function saveMap() {
    // Check if we have exactly 20 spawn points
    if (spawnPoints.length !== 20) {
        alert(`You need exactly 20 spawn points to publish your map!\nCurrent spawn points: ${spawnPoints.length}/20\n\nClick the "Place Spawn Points" button in the Players section to add spawn points.`);
        return;
    }

    // Use the stored map name from when they created it
    const mapName = window.currentMapName || 'Untitled Map';

    // Serialize placed objects - preserve exact world coordinates
    const serializedObjects = placedObjects.map(obj => ({
        name: obj.asset.name,
        folder: obj.asset.folder,
        fileName: obj.asset.fileName,
        viewFolder: obj.asset.viewFolder,
        direction: obj.asset.direction,
        image: obj.asset.image,
        icon: obj.asset.icon,
        subcategory: obj.asset.subcategory,
        isSelfAsset: obj.asset.isSelfAsset,
        x: obj.x,
        y: obj.y,
        scale: obj.scale,
        width: obj.image ? obj.image.naturalWidth : 0,
        height: obj.image ? obj.image.naturalHeight : 0
    }));

    // Generate ALL ground tiles for the map (including defaults)
    // Match the exact rendering logic from drawGroundSamples()
    const TILE_WIDTH = 120;
    const TILE_HEIGHT = 30;
    const MAP_RADIUS = 2500;
    const DRAW_HEIGHT = 70;

    const serializedGroundTiles = [];
    const maxGridRange = Math.ceil(MAP_RADIUS / TILE_HEIGHT);

    // Generate tiles covering entire map boundary with correct textures
    for (let row = -maxGridRange; row <= maxGridRange; row++) {
        for (let col = -maxGridRange; col <= maxGridRange; col++) {
            // Calculate isometric position (same as editor rendering)
            const isoX = col * TILE_WIDTH + (row % 2) * (TILE_WIDTH / 2);
            const isoY = row * TILE_HEIGHT;
            
            // Check if tile is within circular map boundary
            const distFromMapCenter = Math.sqrt(isoX * isoX + isoY * isoY);
            if (distFromMapCenter > MAP_RADIUS) continue;

            const tileKey = `${col},${row}`;
            let tileData;

            // Check if this tile was custom painted by user
            if (customGroundTiles.has(tileKey)) {
                const customTile = customGroundTiles.get(tileKey);
                tileData = {
                    key: tileKey,
                    type: customTile.type,
                    image: customTile.image
                };
            } else {
                // Use same logic as drawGroundSamples: water at edges, grass in center
                let groundType, groundImage;
                if (distFromMapCenter > MAP_RADIUS * 0.60) {
                    groundType = 'tank/Grounds/water.png';  // Water at outer edges (even bigger area)
                    groundImage = '/assets/tank/Grounds/water.png';
                } else {
                    groundType = 'tank/Grounds/Sand.png'; // Default ground in center
                    groundImage = '/assets/tank/Grounds/Sand.png';
                }
                
                tileData = {
                    key: tileKey,
                    type: groundType,
                    image: groundImage
                };
            }

            serializedGroundTiles.push(tileData);
        }
    }

    // Create map data object
    const mapId = window.currentMapId ? String(window.currentMapId) : String(Date.now());
    const thumbnail = captureMapThumbnail();

    const mapData = {
        id: mapId,
        name: mapName,
        created: new Date().toISOString(),
        objects: serializedObjects,
        groundTiles: serializedGroundTiles,
        spawnPoints: spawnPoints,
        version: '1.0',
        isUserCreated: true,
        settings: {
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_HEIGHT,
            tileDrawHeight: DRAW_HEIGHT,
            mapRadius: MAP_RADIUS
        }
    };

    if (thumbnail) {
        mapData.thumbnail = thumbnail;
    }

    // Save to localStorage
    const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    const existingIndex = maps.findIndex(m => String(m.id) === mapId);
    if (existingIndex !== -1) {
        maps[existingIndex] = mapData;
    } else {
        maps.push(mapData);
    }
    localStorage.setItem('thefortz.customMaps', JSON.stringify(maps));

    console.log('✓ Map saved:', mapName, 'with', placedObjects.length, 'objects and', serializedGroundTiles.length, 'total ground tiles');
    alert(`Map "${mapName}" saved successfully!\n\nObjects: ${placedObjects.length}\nGround tiles: ${serializedGroundTiles.length}`);

    // Only refresh the map display if we were editing an existing map
    // Don't show created maps when saving from "Create New Map" flow
    if (isEditingExistingMap) {
        loadSavedMaps();
    }
}

function loadMap(mapData) {
    // Clear existing map
    placedObjects = [];
    customGroundTiles.clear();
    spawnPoints = [];

    // Load ground tiles
    if (mapData.groundTiles) {
        mapData.groundTiles.forEach(tile => {
            customGroundTiles.set(tile.key, {
                type: tile.type,
                image: tile.image
            });
        });
    }

    // Load objects
    if (mapData.objects) {
        mapData.objects.forEach(objData => {
            const img = new Image();
            img.src = objData.image;

            img.onload = () => {
                // Determine scale based on asset type (same logic as placement)
                const isSelfAsset = objData.viewFolder === 'self' || !objData.viewFolder; // Self assets don't have viewFolder
                const scale = (isSelfAsset && objData.subcategory !== 'respawner' && objData.subcategory !== 'speeder') ? 0.5 : 1;

                placedObjects.push({
                    asset: {
                        name: objData.name,
                        folder: objData.folder,
                        fileName: objData.fileName,
                        viewFolder: objData.viewFolder,
                        direction: objData.direction,
                        image: objData.image,
                        isSelfAsset: isSelfAsset,
                        subcategory: objData.subcategory
                    },
                    x: objData.x,
                    y: objData.y,
                    image: img,
                    scale: scale
                });

                renderMapCreatorCanvas();
            };

            img.onerror = () => {
                console.warn('⚠️ Failed to load saved map image, using icon fallback:', objData.image);

                // Determine scale based on asset type (same logic as placement)
                const isSelfAsset = objData.viewFolder === 'self' || !objData.viewFolder;
                const scale = (isSelfAsset && objData.subcategory !== 'respawner' && objData.subcategory !== 'speeder') ? 0.5 : 1;

                placedObjects.push({
                    asset: {
                        name: objData.name,
                        folder: objData.folder,
                        fileName: objData.fileName,
                        viewFolder: objData.viewFolder,
                        direction: objData.direction,
                        image: objData.image,
                        isSelfAsset: isSelfAsset,
                        subcategory: objData.subcategory,
                        icon: objData.icon || '🎯' // Default icon if none specified
                    },
                    x: objData.x,
                    y: objData.y,
                    image: null, // No image, will use icon
                    useIcon: true,
                    scale: scale
                });

                renderMapCreatorCanvas();
            };
        });
    }

    // Load spawn points
    if (mapData.spawnPoints) {
        spawnPoints = mapData.spawnPoints;
        updateSpawnPointsCounter();
    }

    renderMapCreatorCanvas();
    console.log('✓ Map loaded:', mapData.name);
}

function getSavedMaps() {
    return JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
}

function initMapCreatorCanvas() {
    const canvas = document.getElementById('mapCreatorCanvas');
    if (!canvas) {
        console.error('❌ Map creator canvas not found!');
        return;
    }

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    console.log('✅ Canvas dimensions set:', canvas.width, 'x', canvas.height);

    // Center the camera initially (sync both current and target)
    // Position camera slightly above center to show more ground tiles
    canvasOffsetX = canvas.width / 2;
    canvasOffsetY = canvas.height / 2 - 200; // Offset up by 200px to show more ground
    targetCanvasOffsetX = canvas.width / 2;
    targetCanvasOffsetY = canvas.height / 2 - 200;

    console.log('🎥 Camera initialized at:', canvasOffsetX, canvasOffsetY, 'Canvas size:', canvas.width, canvas.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ Could not get canvas context!');
        return;
    }

    // Canvas initialized successfully

    // Load custom ground texture
    console.log('🌱 Loading ground textures...');
    loadCustomGroundTexture();

    // Remove any existing event listeners first
    canvas.removeEventListener('click', handleCanvasClick);
    canvas.removeEventListener('mousedown', handleCanvasMouseDown);
    canvas.removeEventListener('mousemove', handleCanvasMouseMove);
    canvas.removeEventListener('mouseup', handleCanvasMouseUp);
    canvas.removeEventListener('mouseleave', handleCanvasMouseUp);
    
    // Add event listeners for interaction (wheel handled by setupSmoothWheelZoom)
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('mouseleave', handleCanvasMouseUp);

    // Add keyboard controls for panning
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Setup wheel zoom
    setupSmoothWheelZoom();

    console.log('✅ Map creator canvas initialized');
    console.log('Controls: Mouse wheel to zoom, Left-click to drag, Arrow keys or WASD to scroll');

    // Start animation loop for smooth keyboard panning
    startPanningLoop();
    
    // Force initial render
    setTimeout(() => {
        renderMapCreatorCanvas();
        console.log('✅ Initial render triggered');
    }, 100);
}

// Throttle rendering using requestAnimationFrame
let renderScheduled = false;

function renderMapCreatorCanvas() {
    // OPTIMIZATION: Throttle rendering to prevent excessive calls
    if (renderScheduled) return;

    renderScheduled = true;
    requestAnimationFrame(() => {
        renderScheduled = false;
        actualRenderMapCreatorCanvas();
    });
}

function actualRenderMapCreatorCanvas() {
    const canvas = document.getElementById('mapCreatorCanvas');
    if (!canvas) {
        console.warn('Map creator canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.warn('Could not get canvas context');
        return;
    }

    // Ensure canvas has proper dimensions
    if (canvas.width === 0 || canvas.height === 0) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Clear canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill with a solid background color to ensure water is visible
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Canvas test pattern removed
    
    // Save context state
    ctx.save();

    // Apply zoom and pan transformations
    ctx.translate(canvasOffsetX, canvasOffsetY);
    ctx.scale(canvasZoom, canvasZoom);

    // Calculate camera view
    const camera = {
        x: -canvasOffsetX / canvasZoom,
        y: -canvasOffsetY / canvasZoom
    };

    // Draw isometric water tiles as background
    try {
        // Water rendering removed
    } catch (error) {
        console.error('❌ Error drawing water:', error);
        // Fallback: draw simple blue background
        ctx.fillStyle = '#4a9ad8';
        ctx.fillRect(-5000, -5000, 10000, 10000);
    }

    // Draw ground texture samples on the map (only for new maps, not when editing existing maps)
    if (!isEditingExistingMap) {
        try {
            drawGroundSamples(ctx, camera, canvas.width / canvasZoom, canvas.height / canvasZoom);
        } catch (error) {
            console.error('❌ Error drawing ground samples:', error);
        }
    } else {
        // When editing, only show the custom ground tiles from the saved map
        console.log('🎨 Edit mode: Skipping default ground samples, showing only saved map ground tiles');
    }

    // Render custom painted ground tiles on top
    renderCustomGroundTiles(ctx, camera, canvas.width / canvasZoom, canvas.height / canvasZoom);

    // Draw placed objects
    placedObjects.forEach((obj, index) => {
        if (obj.image && obj.image.complete && obj.image.naturalWidth > 0) {
            const scale = obj.scale || 1;
            const width = obj.image.naturalWidth * scale;
            const height = obj.image.naturalHeight * scale;

            // Draw the object (centered)
            ctx.drawImage(obj.image, obj.x - width / 2, obj.y - height / 2, width, height);

            // Draw selection highlight if hovering
            if (obj.isHovered) {
                ctx.strokeStyle = '#00f7ff';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00f7ff';
                ctx.strokeRect(obj.x - width / 2 - 5, obj.y - height / 2 - 5, width + 10, height + 10);
                ctx.shadowBlur = 0;
            }
        } else if (obj.useIcon && obj.asset && obj.asset.icon) {
            // Draw icon fallback (respect scale by adjusting icon size)
            const baseIconSize = 48;
            const iconSize = (obj.scale || 1) * baseIconSize;
            
            // Draw background circle
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, iconSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = '#00f7ff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw icon
            ctx.font = `${iconSize * 0.6}px Arial`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(obj.asset.icon, obj.x, obj.y);

            // Draw selection highlight if hovering
            if (obj.isHovered) {
                ctx.strokeStyle = '#00f7ff';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00f7ff';
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, iconSize / 2 + 5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
    });

    // Draw red X for occupied positions
    if (showRedX) {
        ctx.save();
        
        // Draw glowing red X
        const xSize = 40;
        const xThickness = 6;
        
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = xThickness;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff3333';
        ctx.lineCap = 'round';
        
        // Draw X lines
        ctx.beginPath();
        ctx.moveTo(redXPosition.x - xSize/2, redXPosition.y - xSize/2);
        ctx.lineTo(redXPosition.x + xSize/2, redXPosition.y + xSize/2);
        ctx.moveTo(redXPosition.x + xSize/2, redXPosition.y - xSize/2);
        ctx.lineTo(redXPosition.x - xSize/2, redXPosition.y + xSize/2);
        ctx.stroke();
        
        // Draw red circle background
        ctx.fillStyle = 'rgba(255, 51, 51, 0.2)';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(redXPosition.x, redXPosition.y, xSize/2 + 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // Draw preview of selected asset at mouse position
    if (isHovering && selectedAsset && !isDragging) {
        if (selectedAsset.isGround) {
            // Preview ground tile
            const tileWidth = 120;
            const tileHeight = 30;
            const drawHeight = 70;

            // Calculate which tile position - snap to grid
            const col = Math.floor(hoverWorldX / tileWidth);
            const row = Math.floor(hoverWorldY / tileHeight);
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
            const isoY = row * tileHeight;

            // Draw semi-transparent preview
            ctx.save();
            ctx.globalAlpha = 0.6;
            if (groundTexturesLoaded && groundTextureImages.has(selectedAsset.groundType)) {
                const groundImg = groundTextureImages.get(selectedAsset.groundType);
                ctx.drawImage(groundImg, isoX, isoY, tileWidth, drawHeight);
            }

            // Draw outline
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = '#00f7ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(isoX, isoY, tileWidth, drawHeight);
            ctx.restore();
        } else if (selectedAsset.image) {
            // Draw glowing grid lines for building snapping (exclude speeder/self objects)
            if (!selectedAsset.isGround && !(selectedAsset.isSelfAsset && selectedAsset.subcategory && selectedAsset.subcategory.toLowerCase() === 'speeder')) {
                ctx.save();
                const gridSize = 60;
                const gridColor = '#00f7ff';
                
                // Draw glowing grid around cursor
                ctx.strokeStyle = gridColor;
                ctx.lineWidth = 1;
                ctx.shadowBlur = 10;
                ctx.shadowColor = gridColor;
                ctx.globalAlpha = 0.5;
                
                // Draw grid lines in a small area around cursor
                const gridRange = 300; // How far to draw grid lines
                const startX = Math.floor((hoverWorldX - gridRange) / gridSize) * gridSize;
                const endX = Math.ceil((hoverWorldX + gridRange) / gridSize) * gridSize;
                const startY = Math.floor((hoverWorldY - gridRange) / gridSize) * gridSize;
                const endY = Math.ceil((hoverWorldY + gridRange) / gridSize) * gridSize;
                
                // Vertical lines
                for (let x = startX; x <= endX; x += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, startY);
                    ctx.lineTo(x, endY);
                    ctx.stroke();
                }
                
                // Horizontal lines
                for (let y = startY; y <= endY; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(startX, y);
                    ctx.lineTo(endX, y);
                    ctx.stroke();
                }
                
                ctx.restore();
            }
            
            // Preview building/object - use cached image from asset
            // Load image if not already loaded
            if (!selectedAsset.previewImage) {
                selectedAsset.previewImage = new Image();
                selectedAsset.previewImage.src = selectedAsset.image;
            }

            const previewImg = selectedAsset.previewImage;
            if (previewImg.complete && previewImg.naturalWidth > 0) {
                const baseW = previewImg.naturalWidth;
                const baseH = previewImg.naturalHeight;
                const scale = getPlacementScale(selectedAsset);
                const width = baseW * scale;
                const height = baseH * scale;

                // Position at cursor (centered)
                const posX = hoverWorldX - width / 2;
                const posY = hoverWorldY - height / 2;

                ctx.save();
                // Draw semi-transparent building preview at placement size
                ctx.globalAlpha = 0.6;
                ctx.drawImage(previewImg, posX, posY, width, height);

                // Draw outline - red if position occupied, cyan if free
                ctx.globalAlpha = 1.0;
                const isOccupied = isPositionOccupied(hoverWorldX, hoverWorldY);
                ctx.strokeStyle = isOccupied ? '#ff3333' : '#00f7ff';
                ctx.lineWidth = isOccupied ? 3 : 2;
                if (isOccupied) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ff3333';
                }
                ctx.strokeRect(posX, posY, width, height);
                
                // Draw small red X if occupied
                if (isOccupied) {
                    const xSize = 20;
                    ctx.strokeStyle = '#ff3333';
                    ctx.lineWidth = 4;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(hoverWorldX - xSize/2, hoverWorldY - xSize/2);
                    ctx.lineTo(hoverWorldX + xSize/2, hoverWorldY + xSize/2);
                    ctx.moveTo(hoverWorldX + xSize/2, hoverWorldY - xSize/2);
                    ctx.lineTo(hoverWorldX - xSize/2, hoverWorldY + xSize/2);
                    ctx.stroke();
                }
                
                ctx.restore();
            }
        }
    }

    // Restore context state
    ctx.restore();

    // Draw fixed center crosshair (always in center of screen)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const crosshairSize = 20;

    ctx.strokeStyle = 'rgba(0, 247, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(0, 247, 255, 0.5)';

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(centerX - crosshairSize, centerY);
    ctx.lineTo(centerX + crosshairSize, centerY);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - crosshairSize);
    ctx.lineTo(centerX, centerY + crosshairSize);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = 'rgba(0, 247, 255, 1)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

}

function handleCanvasClick(e) {
    console.log('=== CANVAS CLICK EVENT ===');
    console.log('Button:', e.button, 'isDragging:', isDragging, 'isEditMode:', isEditMode);

    // Only handle left clicks (button 0)
    if (e.button !== 0) {
        console.log('Not a left click, ignoring');
        return;
    }

    // Check if this was a drag (mouse moved more than 5 pixels or took more than 300ms)
    const mouseMoveDistance = Math.sqrt(
        Math.pow(e.clientX - mouseDownX, 2) +
        Math.pow(e.clientY - mouseDownY, 2)
    );
    const clickDuration = Date.now() - mouseDownTime;

    console.log('Mouse move distance:', mouseMoveDistance, 'Duration:', clickDuration);

    if (isDragging || mouseMoveDistance > 5 || clickDuration > 300) {
        console.log('❌ Ignoring click - was dragging or mouse moved too much');
        return;
    }

    // Handle edit mode object selection
    if (isEditMode) {
        if (hoveredObject) {
            selectedObject = hoveredObject;
            console.log('✓ Selected object for editing:', selectedObject.asset.name);
            showObjectEditControls(selectedObject);
        } else {
            selectedObject = null;
            hideObjectEditControls();
        }
        renderMapCreatorCanvas();
        return;
    }

    if (!selectedAsset) {
        console.log('❌ No asset selected');
        return;
    }

    console.log('✓ Selected asset:', selectedAsset.name, 'isGround:', selectedAsset.isGround);

    const canvas = document.getElementById('mapCreatorCanvas');
    const rect = canvas.getBoundingClientRect();

    // Get mouse position in canvas space
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert to world space (accounting for zoom and pan) - simple direct conversion
    let worldX = (mouseX - canvasOffsetX) / canvasZoom;
    let worldY = (mouseY - canvasOffsetY) / canvasZoom;
    
    // Apply the same grid snapping as hover preview for buildings and objects (not ground)
    if (selectedAsset && !selectedAsset.isGround && !(selectedAsset.isSelfAsset && selectedAsset.subcategory && selectedAsset.subcategory.toLowerCase() === 'speeder')) {
        const gridSize = 32; // Same as TANK_GRID_SIZE - matches hover preview exactly
        worldX = Math.round(worldX / gridSize) * gridSize;
        worldY = Math.round(worldY / gridSize) * gridSize;
    }

    console.log('✓ Click at world position:', worldX, worldY);

    // Check if this is a ground texture (paint mode)
    if (selectedAsset.isGround) {
        // Paint ground tile - use same dimensions as rendering
        const tileWidth = 120;
        const tileHeight = 30;  // Match the rendering tile height

        // Find which tile was clicked - need to account for isometric offset
        // First, get the row
        const tileRow = Math.floor(worldY / tileHeight);

        // Then calculate column accounting for row offset
        const rowOffset = (tileRow % 2) * (tileWidth / 2);
        const tileCol = Math.floor((worldX - rowOffset) / tileWidth);

        const tileKey = `${tileCol},${tileRow}`;

        // If this is a lava/liquid special ground, add as an overlay instead
        const groundLower = (selectedAsset.groundFile || selectedAsset.groundType || '').toLowerCase();
        if (groundLower.includes('lava') || groundLower.includes('liquid')) {
            customGroundOverlays.set(tileKey, {
                type: selectedAsset.groundType,
                image: selectedAsset.image
            });
            console.log('🟠 Added overlay ground at', tileCol, tileRow, 'type:', selectedAsset.groundType);
        } else {
            // Store the ground type for this tile (replace only that tile)
            customGroundTiles.set(tileKey, {
                type: selectedAsset.groundType,
                image: selectedAsset.image
            });
            console.log('✅ Painted ground tile at:', tileCol, tileRow, 'with type:', selectedAsset.groundType);
        }

        console.log('✓ Painted ground tile at:', tileCol, tileRow, 'with type:', selectedAsset.groundType, 'at world pos:', worldX, worldY);
        renderMapCreatorCanvas();
        return;
    }

    // Place building/object
    console.log('✓ Attempting to place building:', selectedAsset.name);
    console.log('✓ Image source:', selectedAsset.image);

    const img = new Image();
    img.src = selectedAsset.image;

    img.onload = () => {
        // Only place if image loaded successfully
        if (img.naturalWidth > 0) {
            // Check for duplicates at this position
            if (isPositionOccupied(worldX, worldY)) {
                // Show red X indicator
                showRedX = true;
                redXPosition = { x: worldX, y: worldY };
                
                // Clear red X after 1 second
                if (redXTimer) clearTimeout(redXTimer);
                redXTimer = setTimeout(() => {
                    showRedX = false;
                    renderMapCreatorCanvas();
                }, 1000);
                
                renderMapCreatorCanvas();
                console.log('❌ Cannot place object - position occupied!');
                return;
            }
            
            // Determine scale for self assets (smaller), with specific scaling for respawners
            let placementScale = 1;
            if (selectedAsset && selectedAsset.isSelfAsset) {
                if (selectedAsset.subcategory === 'respawner') {
                    placementScale = 0.8; // Better size for respawners
                } else if (selectedAsset.subcategory === 'speeder') {
                    placementScale = 1; // Normal size for speeders
                } else {
                    placementScale = 0.5; // Smaller for other self assets
                }
            }

            placedObjects.push({
                asset: selectedAsset,
                x: worldX,
                y: worldY,
                image: img,
                scale: placementScale
            });

            console.log('✓✓✓ Successfully placed object at:', worldX, worldY);
            console.log('Total objects:', placedObjects.length);
            renderMapCreatorCanvas();
        } else {
            console.error('❌ Image loaded but has no dimensions');
        }
    };

    img.onerror = () => {
        console.warn('⚠️ Failed to load image, using icon fallback:', selectedAsset.image);
        
        // Check for duplicates at this position
        if (isPositionOccupied(worldX, worldY)) {
            // Show red X indicator
            showRedX = true;
            redXPosition = { x: worldX, y: worldY };
            
            // Clear red X after 1 second
            if (redXTimer) clearTimeout(redXTimer);
            redXTimer = setTimeout(() => {
                showRedX = false;
                renderMapCreatorCanvas();
            }, 1000);
            
            renderMapCreatorCanvas();
            console.log('❌ Cannot place object - position occupied!');
            return;
        }
        
        // Place object with icon fallback
        let placementScaleFallback = 1;
        if (selectedAsset && selectedAsset.isSelfAsset) {
            if (selectedAsset.subcategory === 'respawner') {
                placementScaleFallback = 0.8; // Better size for respawners
            } else if (selectedAsset.subcategory === 'speeder') {
                placementScaleFallback = 1; // Normal size for speeders
            } else {
                placementScaleFallback = 0.5; // Smaller for other self assets
            }
        }

        placedObjects.push({
            asset: selectedAsset,
            x: worldX,
            y: worldY,
            image: null, // No image, will use icon
            useIcon: true,
            scale: placementScaleFallback
        });

        console.log('✓ Successfully placed object with icon fallback at:', worldX, worldY);
        renderMapCreatorCanvas();
    };
}

// Smooth zoom animation
let targetZoom = 1.0;
let zoomAnimationFrame = null;
let lastMouseX = 0;
let lastMouseY = 0;

function handleCanvasWheel(e) {
    e.preventDefault();

    const canvas = document.getElementById('mapCreatorCanvas');
    const rect = canvas.getBoundingClientRect();

    // Get mouse position
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Store mouse position for zoom buttons
    lastMouseX = mouseX;
    lastMouseY = mouseY;

    // Calculate world position before zoom (the point under the mouse)
    const worldX = (mouseX - canvasOffsetX) / canvasZoom;
    const worldY = (mouseY - canvasOffsetY) / canvasZoom;

    // Calculate new zoom target with smooth animation
    const zoomDelta = e.deltaY > 0 ? 0.95 : 1.05; // Smaller steps for smoother animation
    const newZoom = Math.max(0.5, Math.min(3, targetCanvasZoom * zoomDelta));

    // Update target zoom for smooth animation
    targetCanvasZoom = newZoom;

    // Adjust target offset to keep the world position under the mouse
    targetCanvasOffsetX = mouseX - worldX * newZoom;
    targetCanvasOffsetY = mouseY - worldY * newZoom;

    // Update zoom display
    const zoomDisplay = document.getElementById('zoomDisplay');
    if (zoomDisplay) {
        zoomDisplay.textContent = Math.round(newZoom * 100) + '%';
    }

    // Update slider
    updateZoomSlider(newZoom);
}

let mouseDownX = 0;
let mouseDownY = 0;
let mouseDownTime = 0;
let lastDragX = 0;
let lastDragY = 0;
let dragVelocityX = 0;
let dragVelocityY = 0;
// Object dragging state (for free-move objects)
let objectDragging = false;
let objectDragStartMouseX = 0;
let objectDragStartMouseY = 0;
let objectDragStartX = 0;
let objectDragStartY = 0;

function handleCanvasMouseDown(e) {
    // Store mouse down position and time for click detection
    mouseDownX = e.clientX;
    mouseDownY = e.clientY;
    mouseDownTime = Date.now();

    // If in edit mode and left-clicking a selected object with freeMove enabled, start object drag
    if (isEditMode && e.button === 0 && selectedObject && selectedObject.freeMove && selectedObject.isHovered) {
        e.preventDefault();
        objectDragging = true;
        objectDragStartMouseX = e.clientX;
        objectDragStartMouseY = e.clientY;
        objectDragStartX = selectedObject.x;
        objectDragStartY = selectedObject.y;
        const canvas = document.getElementById('mapCreatorCanvas');
        canvas.style.cursor = 'grabbing';
        return;
    }

    // Left click, right click, or middle click for panning
    if (e.button === 0 || e.button === 2 || e.button === 1) {
        e.preventDefault();
        isDragging = true;
        dragStartX = e.clientX - canvasOffsetX;
        dragStartY = e.clientY - canvasOffsetY;
        lastDragX = e.clientX;
        lastDragY = e.clientY;
        dragVelocityX = 0;
        dragVelocityY = 0;

        const canvas = document.getElementById('mapCreatorCanvas');
        canvas.style.cursor = 'grabbing';
    }
}

function handleCanvasMouseMove(e) {
    const canvas = document.getElementById('mapCreatorCanvas');
    const rect = canvas.getBoundingClientRect();

    // Store mouse position for zoom
    lastMouseX = e.clientX - rect.left;
    lastMouseY = e.clientY - rect.top;

    // Calculate world position for hover preview - simple direct conversion
    let worldX = (lastMouseX - canvasOffsetX) / canvasZoom;
    let worldY = (lastMouseY - canvasOffsetY) / canvasZoom;
    
    // Grid snapping for buildings and objects (not ground) - exclude speeder/self objects
    if (selectedAsset && !selectedAsset.isGround && !(selectedAsset.isSelfAsset && selectedAsset.subcategory && selectedAsset.subcategory.toLowerCase() === 'speeder')) {
        const gridSize = 32; // Same as TANK_GRID_SIZE in tankCreatmap.js
        worldX = Math.round(worldX / gridSize) * gridSize;
        worldY = Math.round(worldY / gridSize) * gridSize;
    }
    
    hoverWorldX = worldX;
    hoverWorldY = worldY;
    isHovering = true;

    // Check for object hovering in edit mode
    if (isEditMode && !isDragging) {
        hoveredObject = null;
        
        // Check if mouse is over any placed object
        for (let i = placedObjects.length - 1; i >= 0; i--) {
            const obj = placedObjects[i];
            let isWithinBounds = false;
            
            if (obj.image && obj.image.complete && obj.image.naturalWidth > 0) {
                const scale = obj.scale || 1;
                const width = obj.image.naturalWidth * scale;
                const height = obj.image.naturalHeight * scale;

                // Check if mouse is within object bounds (respecting scale)
                isWithinBounds = worldX >= obj.x - width / 2 && worldX <= obj.x + width / 2 &&
                                worldY >= obj.y - height / 2 && worldY <= obj.y + height / 2;
            } else if (obj.useIcon) {
                // Check hover for icon-based objects (circular area)
                const iconSize = 48;
                const distance = Math.sqrt(Math.pow(worldX - obj.x, 2) + Math.pow(worldY - obj.y, 2));
                isWithinBounds = distance <= iconSize / 2;
            }
            
            if (isWithinBounds) {
                hoveredObject = obj;
                obj.isHovered = true;
                break;
            }
        }
        
        // Clear hover state for all other objects
        placedObjects.forEach(obj => {
            if (obj !== hoveredObject) {
                obj.isHovered = false;
            }
        });
    }

    if (isDragging) {
        const newOffsetX = e.clientX - dragStartX;
        const newOffsetY = e.clientY - dragStartY;

        // Calculate drag velocity for momentum
        dragVelocityX = e.clientX - lastDragX;
        dragVelocityY = e.clientY - lastDragY;
        lastDragX = e.clientX;
        lastDragY = e.clientY;

        // Update both current and target for smooth dragging
        canvasOffsetX = newOffsetX;
        canvasOffsetY = newOffsetY;
        targetCanvasOffsetX = newOffsetX;
        targetCanvasOffsetY = newOffsetY;
    }

    // Handle object dragging (free-move)
    if (objectDragging && selectedObject) {
        // Compute mouse delta in screen pixels
        const dxPixels = e.clientX - objectDragStartMouseX;
        const dyPixels = e.clientY - objectDragStartMouseY;

        // Convert to world coordinates change
        const dxWorld = dxPixels / canvasZoom;
        const dyWorld = dyPixels / canvasZoom;

        selectedObject.x = objectDragStartX + dxWorld;
        selectedObject.y = objectDragStartY + dyWorld;

        renderMapCreatorCanvas();
        return;
    }

    renderMapCreatorCanvas();
}

function handleCanvasMouseUp(e) {
    if (isDragging) {
        isDragging = false;
        const canvas = document.getElementById('mapCreatorCanvas');
        canvas.style.cursor = 'grab';

        // Apply momentum from drag
        velocityX = dragVelocityX * 0.8; // Scale down the momentum
        velocityY = dragVelocityY * 0.8;
    }

    if (objectDragging) {
        objectDragging = false;
        const canvas = document.getElementById('mapCreatorCanvas');
        if (canvas) canvas.style.cursor = 'grab';
        renderMapCreatorCanvas();
    }
}

// Keyboard controls for panning
function handleKeyDown(e) {
    // Only handle keys when map creator is open
    const mapCreator = document.getElementById('blankMapCreator');
    if (!mapCreator || mapCreator.classList.contains('hidden')) return;

    const key = e.key.toLowerCase();

    // Arrow keys and WASD for panning
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
        e.preventDefault();
        keysPressed[key] = true;
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    keysPressed[key] = false;
}

// Continuous panning loop
let panningLoopId = null;

function startPanningLoop() {
    if (panningLoopId) return;

    function panLoop() {
        const mapCreator = document.getElementById('blankMapCreator');
        if (!mapCreator || mapCreator.classList.contains('hidden')) {
            panningLoopId = requestAnimationFrame(panLoop);
            return;
        }

        // Apply acceleration based on key presses
        let targetVelocityX = 0;
        let targetVelocityY = 0;

        // Calculate target velocity based on keys pressed
        if (keysPressed['arrowup'] || keysPressed['w']) {
            targetVelocityY = maxSpeed;
        }
        if (keysPressed['arrowdown'] || keysPressed['s']) {
            targetVelocityY = -maxSpeed;
        }
        if (keysPressed['arrowleft'] || keysPressed['a']) {
            targetVelocityX = maxSpeed;
        }
        if (keysPressed['arrowright'] || keysPressed['d']) {
            targetVelocityX = -maxSpeed;
        }

        // Smoothly accelerate towards target velocity
        if (targetVelocityX !== 0) {
            velocityX += (targetVelocityX - velocityX) * acceleration * 0.1;
        } else {
            // Apply friction when no keys pressed
            velocityX *= friction;
        }

        if (targetVelocityY !== 0) {
            velocityY += (targetVelocityY - velocityY) * acceleration * 0.1;
        } else {
            // Apply friction when no keys pressed
            velocityY *= friction;
        }

        // Apply velocity to position
        if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
            canvasOffsetX += velocityX;
            canvasOffsetY += velocityY;
            targetCanvasOffsetX = canvasOffsetX;
            targetCanvasOffsetY = canvasOffsetY;
            renderMapCreatorCanvas();
        }

        panningLoopId = requestAnimationFrame(panLoop);
    }

    panLoop();
}


// Draw isometric water tiles as background
function drawIsometricWater(ctx, camera, viewWidth, viewHeight) {
    // Draw a base water background for the visible area so water is always
    // visible even when no individual water tiles fall inside the limited draw window.
    const mapRadiusPixels = 2500;
    const baseFillPadding = Math.max(viewWidth, viewHeight) * 1.5;
    ctx.save();
    ctx.fillStyle = '#2a7ab8';
    // Fill a generous area around the viewport (in world coordinates)
    ctx.fillRect(camera.x - baseFillPadding, camera.y - baseFillPadding, viewWidth + baseFillPadding * 2, viewHeight + baseFillPadding * 2);
    ctx.restore();

    // Limit water tile iteration to a relatively small window around the viewport center
    const waterScale = 1.0; // normal tile size
    const tileWidth = 120 * waterScale;
    const tileHeight = 30 * waterScale;
    const drawHeight = 70 * waterScale;

    const centerWorldX = camera.x + viewWidth / 2;
    const centerWorldY = camera.y + viewHeight / 2;
    const centerCol = Math.floor(centerWorldX / tileWidth);
    const centerRow = Math.floor(centerWorldY / tileHeight);

    // Increase coverage ~2x so water appears noticeably larger (more tiles
    // drawn around the viewport) while keeping each tile the same size.
    const radiusCols = Math.ceil((viewWidth / tileWidth) * 3.2) + 8;
    const radiusRows = Math.ceil((viewHeight / tileHeight) * 3.2) + 8;

    const maxGridRange = Math.ceil(mapRadiusPixels / tileHeight);
    const startCol = Math.max(-maxGridRange, centerCol - radiusCols);
    const endCol = Math.min(maxGridRange, centerCol + radiusCols);
    const startRow = Math.max(-maxGridRange, centerRow - radiusRows);
    const endRow = Math.min(maxGridRange, centerRow + radiusRows);

    let tilesDrawn = 0;
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
            const isoY = row * tileHeight;

            const distFromMapCenter = Math.sqrt(isoX * isoX + isoY * isoY);
            if (distFromMapCenter > mapRadiusPixels) continue;

            drawWaterTile(ctx, isoX, isoY, tileWidth, drawHeight);
            tilesDrawn++;
        }
    }
}

// Draw a single isometric water tile
function drawWaterTile(ctx, x, y, width, height) {
    try {
        // Isometric diamond points
        const top = { x: x + width / 2, y: y };
        const right = { x: x + width, y: y + height / 2 };
        const bottom = { x: x + width / 2, y: y + height };
        const left = { x: x, y: y + height / 2 };

        // Enhanced water gradient with more vibrant colors
        const gradient = ctx.createLinearGradient(left.x, top.y, right.x, bottom.y);
        gradient.addColorStop(0, '#4a9ad8');    // Brighter blue (top-left, lit by sun)
        gradient.addColorStop(0.3, '#3a8ac8');  // Medium blue
        gradient.addColorStop(0.7, '#2a7ab8');  // Darker blue
        gradient.addColorStop(1, '#1a6aa8');    // Deep blue (bottom-right, shadow)

        // Draw the water diamond (scaled size passed from caller)
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
    } catch (error) {
        console.error('❌ Error drawing water tile:', error);
        // Fallback: draw a simple blue rectangle
        ctx.fillStyle = '#4a9ad8';
        ctx.fillRect(x, y, width, height);
    }
}

// Draw ground textures randomly scattered in a circular map
function drawGroundSamples(ctx, camera, viewWidth, viewHeight) {
    if (!groundTexturesLoaded) {
        // Draw simple colored ground as fallback
        drawFallbackGround(ctx, camera, viewWidth, viewHeight);
        return;
    }
    if (groundTextureImages.size === 0) {
        console.warn('⚠️ No ground texture images available');
        return;
    }

    // Same dimensions as custom ground tiles
    const tileWidth = 120;
    const tileHeight = 30;  // Vertical spacing between rows
    const drawHeight = 70;  // Actual height to draw the image

    // Overall map circular boundary (in world pixels)
    const mapRadiusPixels = 2500; // Radius in actual pixels for a true circle

    // OPTIMIZATION: Calculate visible viewport bounds in world coordinates
    const viewLeft = camera.x;
    const viewTop = camera.y;
    const viewRight = camera.x + viewWidth;
    const viewBottom = camera.y + viewHeight;

    // Add generous padding to ensure full screen coverage
    const paddingX = tileWidth * 4;
    const paddingY = drawHeight * 6;

    // Calculate visible tile range
    const startRow = Math.floor((viewTop - paddingY) / tileHeight);
    const endRow = Math.ceil((viewBottom + paddingY) / tileHeight);
    const startCol = Math.floor((viewLeft - paddingX) / tileWidth);
    const endCol = Math.ceil((viewRight + paddingX) / tileWidth);

    // Clamp to map boundaries
    const maxGridRange = Math.ceil(mapRadiusPixels / tileHeight);
    const clampedStartRow = Math.max(-maxGridRange, startRow);
    const clampedEndRow = Math.min(maxGridRange, endRow);
    const clampedStartCol = Math.max(-maxGridRange, startCol);
    const clampedEndCol = Math.min(maxGridRange, endCol);

    // Draw tiles with ground12 (green grass) in center and water at edges
    for (let row = clampedStartRow; row <= clampedEndRow; row++) {
        for (let col = clampedStartCol; col <= clampedEndCol; col++) {
            // Calculate isometric position
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
            const isoY = row * tileHeight;

            // Check distance from center
            const distFromMapCenter = Math.sqrt(isoX * isoX + isoY * isoY);
            if (distFromMapCenter > mapRadiusPixels) continue;

            // Use water (ground1) at edges, ground12 in center
            let groundType;
            if (distFromMapCenter > mapRadiusPixels * 0.60) {
                groundType = 'tank/Grounds/water.png'; // Water at outer edges (even bigger area)
            } else {
                groundType = 'tank/Grounds/Sand.png'; // Default ground in center
            }

            if (!groundTextureImages.has(groundType)) {
                console.warn('Ground texture not found:', groundType);
                continue;
            }

            const groundImg = groundTextureImages.get(groundType);

            // Only draw if image is loaded
            if (groundImg && groundImg.complete && groundImg.naturalWidth > 0) {
                ctx.drawImage(groundImg, isoX, isoY, tileWidth, drawHeight);
            }
        }
    }
}

function drawIsometricTile(ctx, x, y, width, height) {
    // Isometric parallelogram points (diamond shape from top view)
    const top = { x: x + width / 2, y: y };
    const right = { x: x + width, y: y + height / 2 };
    const bottom = { x: x + width / 2, y: y + height };
    const left = { x: x, y: y + height / 2 };

    // Add variation to tiles for more natural look
    const tileId = `${Math.floor(x / width)}_${Math.floor(y / height)}`;
    const variation = (Math.abs(tileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10) / 10;

    // Richer, more vibrant grass colors with variation
    const baseColors = [
        ['#b8f58d', '#a8e87a', '#98d869', '#88c858', '#78b847'],  // Bright variation
        ['#a8e87a', '#98d869', '#88c858', '#78b847', '#68a836'],  // Medium variation
        ['#98d869', '#88c858', '#78b847', '#68a836', '#589825']   // Dark variation
    ];

    const colorSet = baseColors[Math.floor(variation * 3)];

    // Create enhanced 3D gradient with richer colors
    const gradient = ctx.createLinearGradient(left.x, top.y, right.x, bottom.y);
    gradient.addColorStop(0, colorSet[0]);    // Brightest (top-left, lit)
    gradient.addColorStop(0.25, colorSet[1]); // Bright
    gradient.addColorStop(0.5, colorSet[2]);  // Medium
    gradient.addColorStop(0.75, colorSet[3]); // Dark
    gradient.addColorStop(1, colorSet[4]);    // Darkest (bottom-right, shadow)

    // Draw the parallelogram
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.fill();

    // Add very subtle texture noise
    if (variation > 0.3) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = variation > 0.6 ? '#ffffff' : '#000000';
        const dotSize = 1;
        for (let i = 0; i < 3; i++) {
            const dotX = left.x + (right.x - left.x) * Math.random();
            const dotY = top.y + (bottom.y - top.y) * Math.random();
            ctx.fillRect(dotX, dotY, dotSize, dotSize);
        }
        ctx.restore();
    }

    // Stronger border for tile definition
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Enhanced highlight on top-left edges (stronger light source)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(left.x, left.y);
    ctx.stroke();

    // Enhanced shadow on bottom-right edges for more depth
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.stroke();

    // Add inner highlight for extra depth
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y + 3);
    ctx.lineTo(left.x + 3, left.y);
    ctx.stroke();
    ctx.restore();

    // Add inner shadow for extra depth
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(right.x - 3, right.y);
    ctx.lineTo(bottom.x, bottom.y - 3);
    ctx.stroke();
    ctx.restore();
}

function renderBlankMapCreator(ctx, canvas, time) {
    // The actual rendering is now handled by the canvas element itself
    // This function is kept for compatibility but does nothing
}

// Initialize with empty maps - users will create their own
createdMaps = [];

// Update stats
playerStatsData.totalMaps = 0;
playerStatsData.totalPlays = 0;
playerStatsData.avgRating = 0;

// Handle clicks on the create map canvas
function handleMapCreatorClick(e) {
    // Use the correct canvas based on current vehicle type
    const vehicleType = window.currentLobbyVehicleType || 'tank';
    let canvasId = 'lobbyBackground'; // fallback

    if (vehicleType === 'jet') {
        canvasId = 'jetLobbyBackground';
    } else if (vehicleType === 'race') {
        canvasId = 'raceLobbyBackground';
    } else {
        canvasId = 'tankLobbyBackground';
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.log('❌ Canvas not found');
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('🖱️ Click at:', x, y);
    console.log('📍 Click areas:', window.createMapClickAreas);

    if (!window.createMapClickAreas) {
        console.log('❌ No click areas defined');
        return;
    }

    // Check all click areas
    for (const [key, area] of Object.entries(window.createMapClickAreas)) {
        console.log(`Checking ${key}:`, area);
        if (x >= area.x && x <= area.x + area.width &&
            y >= area.y && y <= area.y + area.height) {
            console.log('✅ Clicked:', key);
            if (area.action) {
                area.action();
            }
            break;
        }
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.startCreateMapRendering = startCreateMapRendering;
    window.stopCreateMapRendering = stopCreateMapRendering;
    window.handleMapCreatorClick = handleMapCreatorClick;
    window.openBlankMapCreator = openBlankMapCreator;
    window.closeBlankMapCreator = closeBlankMapCreator;
    window.switchCreateMapTab = switchCreateMapTab;
    window.toggleAssetsPanel = toggleAssetsPanel;
    window.switchAssetCategory = switchAssetCategory;
    window.backToObjects = backToObjects;
    window.openObjectFolder = openObjectFolder;
    window.clearAllObjects = clearAllObjects;
    window.saveMap = saveMap;
    window.publishMap = publishMap;
    window.getPublishedMaps = getPublishedMaps;
    window.getMostPlayedMap = getMostPlayedMap;
    window.unselectCurrentAsset = unselectCurrentAsset;
    window.updateAssetSelection = updateAssetSelection;
    window.initializeUnselectButton = initializeUnselectButton;
    window.toggleEditMode = toggleEditMode;
    window.initializeEditModeButton = initializeEditModeButton;
    window.loadSavedMaps = loadSavedMaps;
    
    console.log('✅ TankMapCreator functions exported to window');
    console.log('🔍 Verifying exports:');
    console.log('  - startCreateMapRendering:', typeof window.startCreateMapRendering);
    console.log('  - loadSavedMaps:', typeof window.loadSavedMaps);
    
    // Dispatch event to notify other modules that TankMapCreator is ready
    if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('tankMapCreatorReady'));
        console.log('📡 tankMapCreatorReady event dispatched');
    }
    
    // Add fallback functions for safety
    window.ensureMapCreatorReady = function(callback) {
        if (typeof window.startCreateMapRendering === 'function' && 
            typeof window.loadSavedMaps === 'function') {
            callback();
        } else {
            console.warn('Map creator functions not ready, retrying...');
            setTimeout(() => window.ensureMapCreatorReady(callback), 100);
        }
    };
}

// ========== MAP PUBLISHING SYSTEM ==========

// Publish a map for others to play
function publishMap() {
    const maps = getSavedMaps();

    if (maps.length === 0) {
        alert('No saved maps to publish! Create and save a map first.');
        return;
    }

    // Get the current map or let user select
    const mapId = window.currentMapId;
    let mapToPublish = maps.find(m => String(m.id) === String(mapId));

    if (!mapToPublish && maps.length === 1) {
        mapToPublish = maps[0];
    } else if (!mapToPublish) {
        // Show selection dialog
        const mapNames = maps.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
        const selection = prompt(`Select a map to publish:\n\n${mapNames}\n\nEnter number (1-${maps.length}):`);
        const index = parseInt(selection) - 1;

        if (index >= 0 && index < maps.length) {
            mapToPublish = maps[index];
        } else {
            alert('Invalid selection!');
            return;
        }
    }

    // Get published maps
    const publishedMaps = getPublishedMaps();

    // Check if already published
    const existingIndex = publishedMaps.findIndex(m => String(m.id) === String(mapToPublish.id));

    if (existingIndex !== -1) {
        if (!confirm(`"${mapToPublish.name}" is already published. Update it?`)) {
            return;
        }

        // Update existing published map
        publishedMaps[existingIndex] = {
            ...publishedMaps[existingIndex],
            name: mapToPublish.name,
            mapData: mapToPublish,
            updatedAt: Date.now()
        };
    } else {
        // Publish new map
        const publishedMap = {
            id: mapToPublish.id,
            name: mapToPublish.name,
            author: window.gameState?.playerName || 'Anonymous',
            createdAt: Date.now(),
            plays: 0,
            likes: 0,
            mapData: mapToPublish,
            thumbnail: mapToPublish.thumbnail || null
        };

        publishedMaps.push(publishedMap);
    }

    // Save to localStorage
    localStorage.setItem('thefortz.publishedMaps', JSON.stringify(publishedMaps));

    console.log('✅ Map published:', mapToPublish.name);
    alert(`✅ "${mapToPublish.name}" published successfully!\n\nOthers can now play your map!`);
}

// Get all published maps
function getPublishedMaps() {
    const maps = localStorage.getItem('thefortz.publishedMaps');
    return maps ? JSON.parse(maps) : [];
}

// Get the most played map
function getMostPlayedMap() {
    const maps = getPublishedMaps();
    if (maps.length === 0) return null;

    // Sort by plays (descending)
    return maps.sort((a, b) => (b.plays || 0) - (a.plays || 0))[0];
}

// Increment play count for a map
function incrementMapPlays(mapId) {
    const publishedMaps = getPublishedMaps();
    const mapIndex = publishedMaps.findIndex(m => String(m.id) === String(mapId));

    if (mapIndex !== -1) {
        publishedMaps[mapIndex].plays = (publishedMaps[mapIndex].plays || 0) + 1;
        localStorage.setItem('thefortz.publishedMaps', JSON.stringify(publishedMaps));
    }
}

// Export new functions
if (typeof window !== 'undefined') {
    window.incrementMapPlays = incrementMapPlays;
}


// Draw isometric grid lines to show tile boundaries
function drawIsometricGrid(ctx, camera, viewWidth, viewHeight) {
    // Isometric tile dimensions (must match the tile rendering)
    const tileWidth = 120;
    const tileHeight = 30;
    const drawHeight = 70;

    const viewLeft = camera.x;
    const viewTop = camera.y;
    const viewRight = camera.x + viewWidth;
    const viewBottom = camera.y + viewHeight;

    // Calculate visible tile range with some padding
    const startCol = Math.floor((viewLeft - tileWidth * 2) / tileWidth);
    const endCol = Math.ceil((viewRight + tileWidth * 2) / tileWidth);
    const startRow = Math.floor((viewTop - tileHeight * 2) / tileHeight);
    const endRow = Math.ceil((viewBottom + tileHeight * 2) / tileHeight);

    ctx.save();

    // Draw 3D isometric tiles with enhanced lighting and depth
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            // Calculate isometric position (same as tile rendering)
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
            const isoY = row * tileHeight;

            // Calculate the 4 corner points of the diamond (top face)
            const top = { x: isoX + tileWidth / 2, y: isoY };
            const right = { x: isoX + tileWidth, y: isoY + drawHeight / 2 };
            const bottom = { x: isoX + tileWidth / 2, y: isoY + drawHeight };
            const left = { x: isoX, y: isoY + drawHeight / 2 };

            // Draw subtle drop shadow first for depth
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // Draw top face with enhanced gradient for 3D effect
            ctx.beginPath();
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(right.x, right.y);
            ctx.lineTo(bottom.x, bottom.y);
            ctx.lineTo(left.x, left.y);
            ctx.closePath();

            // Create radial gradient from center for better lighting
            const centerX = (left.x + right.x) / 2;
            const centerY = (top.y + bottom.y) / 2;
            const radius = tileWidth * 0.7;
            const radialGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');  // Bright center
            radialGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.05)'); // Fade
            radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0.08)');         // Dark edges
            ctx.fillStyle = radialGradient;
            ctx.fill();
            ctx.restore();

            // Draw main border with depth
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Add bright highlight on top edge (strong light from above)
            ctx.beginPath();
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(left.x, left.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Add secondary highlight on left edge
            ctx.beginPath();
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(right.x, right.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Add deep shadow on bottom-right edges
            ctx.beginPath();
            ctx.moveTo(right.x, right.y);
            ctx.lineTo(bottom.x, bottom.y);
            ctx.lineTo(left.x, left.y);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Add inner glow for extra depth
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(top.x + 2, top.y + 2);
            ctx.lineTo(left.x + 4, left.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    ctx.restore();
}

// Render only custom painted ground tiles with proper isometric positioning
function renderCustomGroundTiles(ctx, camera, viewWidth, viewHeight) {
    // Check if there are any custom tiles to render
    if (!customGroundTiles || customGroundTiles.size === 0) {
        return;
    }

    // Isometric tile dimensions
    const tileWidth = 120;   // Width of the tile image
    const tileHeight = 30;   // Vertical spacing between rows (reduced to make tiles overlap)
    const drawHeight = 70;   // Actual height to draw the image (adjusted for better overlap)

    const viewLeft = camera.x;
    const viewTop = camera.y;
    const viewRight = camera.x + viewWidth;
    const viewBottom = camera.y + viewHeight;

    console.log('🎨 Rendering custom ground tiles:', customGroundTiles.size, 'total tiles');

    // Add generous padding to ensure full screen coverage
    // Use drawHeight for Y padding since tiles are taller than their spacing
    const paddingX = tileWidth * 4;
    const paddingY = drawHeight * 6; // Extra padding for tile overlap

    // Calculate visible tile range
    const startCol = Math.floor((viewLeft - paddingX) / tileWidth);
    const endCol = Math.ceil((viewRight + paddingX) / tileWidth);
    const startRow = Math.floor((viewTop - paddingY) / tileHeight);
    const endRow = Math.ceil((viewBottom + paddingY) / tileHeight);

    // OPTIMIZATION: Only iterate through visible tiles, not all custom tiles
    let customTilesRendered = 0;
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const tileKey = `${col},${row}`;
            const customTile = customGroundTiles.get(tileKey);

            if (customTile) {
                // Calculate isometric position
                // Offset every other row by half tile width for diamond pattern
                const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
                const isoY = row * tileHeight;

                // Draw ground texture if available
                if (groundTexturesLoaded && groundTextureImages.has(customTile.type)) {
                    const groundImg = groundTextureImages.get(customTile.type);
                    if (groundImg && groundImg.complete && groundImg.naturalWidth > 0) {
                        ctx.drawImage(groundImg, isoX, isoY, tileWidth, drawHeight);
                        customTilesRendered++;
                    }
                } else if (customTile.color) {
                    // Fallback to color if texture not available
                    ctx.fillStyle = customTile.color;
                    ctx.fillRect(isoX, isoY, tileWidth, drawHeight);
                    customTilesRendered++;
                }
            }
        }
    }

    if (customTilesRendered > 0) {
        console.log('✅ Rendered', customTilesRendered, 'custom ground tiles');
    }

    // Render overlays (lava, liquid) on top of base ground without replacing it
    if (customGroundOverlays && customGroundOverlays.size > 0) {
        let overlayRendered = 0;
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const tileKey = `${col},${row}`;
                const overlay = customGroundOverlays.get(tileKey);
                if (!overlay) continue;

                const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
                const isoY = row * tileHeight;

                if (groundTexturesLoaded && groundTextureImages.has(overlay.type)) {
                    const overlayImg = groundTextureImages.get(overlay.type);
                    if (overlayImg && overlayImg.complete && overlayImg.naturalWidth > 0) {
                        ctx.drawImage(overlayImg, isoX, isoY, tileWidth, drawHeight);
                        overlayRendered++;
                    }
                }
            }
        }

        if (overlayRendered > 0) console.log('🟠 Rendered', overlayRendered, 'ground overlays');
    }
}

// Old terrain rendering function (kept for reference, not used)
function renderParallelogramTerrain(ctx, camera, viewWidth, viewHeight) {
    // Parallelogram tile dimensions (same size as hexagons)
    const tileWidth = 120;  // Same as hex diameter
    const tileHeight = 120; // Same as hex diameter

    const viewLeft = camera.x;
    const viewTop = camera.y;
    const viewRight = camera.x + viewWidth;
    const viewBottom = camera.y + viewHeight;

    // Calculate visible tile range
    const startCol = Math.floor((viewLeft - tileWidth) / tileWidth);
    const endCol = Math.ceil((viewRight + tileWidth) / tileWidth);
    const startRow = Math.floor((viewTop - tileHeight) / tileHeight);
    const endRow = Math.ceil((viewBottom + tileHeight) / tileHeight);

    // Draw parallelogram tiles with terrain textures
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const x = col * tileWidth;
            const y = row * tileHeight;

            // Get terrain type for this position (same logic as hex system)
            const terrainType = getTerrainTypeForPosition(x, y);

            // Draw parallelogram tile with texture
            drawParallelogramTile(ctx, x, y, tileWidth, tileHeight, terrainType);
        }
    }
}

function getTerrainTypeForPosition(x, y) {
    // Use same biome logic as HexTerrainSystem
    const mapCenterX = 5000;
    const mapCenterY = 5000;

    const dx = x - mapCenterX;
    const dy = y - mapCenterY;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);

    // Biome zones (simplified version of hex system)
    if (distFromCenter < 800) return 'grass';
    if (Math.abs(dx + 1200) < 600 && Math.abs(dy + 1200) < 600) return 'forest';
    if (Math.abs(dx - 1200) < 600 && Math.abs(dy - 1200) < 600) return 'forest';
    if (Math.abs(dx - 1500) < 500 && Math.abs(dy + 800) < 500) return 'desert';
    if (Math.abs(dx + 1600) < 400 && Math.abs(dy + 400) < 400) return 'water';
    if (Math.abs(dx - 800) < 450 && Math.abs(dy + 1800) < 450) return 'snow';
    if (Math.abs(dx - 1800) < 250 && Math.abs(dy + 1800) < 250) return 'lava';

    // Default grass with some variation
    const variation = (Math.abs(x + y) % 100) / 100;
    return variation > 0.7 ? 'darkGrass' : 'grass';
}

function drawParallelogramTile(ctx, x, y, width, height, terrainType) {
    // Check if this tile has custom ground painted on it
    const tileCol = Math.floor(x / width);
    const tileRow = Math.floor(y / height);
    const tileKey = `${tileCol},${tileRow}`;
    const customTile = customGroundTiles.get(tileKey);

    if (customTile) {
        // Draw custom painted ground with PNG texture
        if (groundTexturesLoaded && groundTextureImages.has(customTile.type)) {
            const groundImg = groundTextureImages.get(customTile.type);
            drawGroundTexturedParallelogram(ctx, x, y, width, height, groundImg);
        } else {
            // Fallback to default texture
            drawColoredParallelogram(ctx, x, y, width, height, 'grass');
        }
        return;
    }

    // Check if HexTerrainSystem has loaded textures
    const hasTextures = typeof HexTerrainSystem !== 'undefined' &&
        HexTerrainSystem.tilesetLoaded &&
        HexTerrainSystem.tileset.image;

    if (hasTextures) {
        // Draw textured parallelogram using hex tileset
        drawTexturedParallelogram(ctx, x, y, width, height, terrainType);
    } else {
        // Fallback: colored parallelograms
        drawColoredParallelogram(ctx, x, y, width, height, terrainType);
    }
}

// Fallback ground drawing function
function drawFallbackGround(ctx, camera, viewWidth, viewHeight) {
    const tileSize = 64;
    const startX = Math.floor(camera.x / tileSize) * tileSize;
    const startY = Math.floor(camera.y / tileSize) * tileSize;
    const endX = startX + viewWidth + tileSize;
    const endY = startY + viewHeight + tileSize;
    
    ctx.save();
    
    for (let x = startX; x < endX; x += tileSize) {
        for (let y = startY; y < endY; y += tileSize) {
            const screenX = x - camera.x;
            const screenY = y - camera.y;
            
            // Simple pattern: water at edges, grass in center
            const distFromCenter = Math.sqrt(Math.pow(x - 400, 2) + Math.pow(y - 300, 2));
            
            if (distFromCenter > 300) {
                // Water color
                ctx.fillStyle = '#4A90E2';
            } else {
                // Grass color
                ctx.fillStyle = '#7ED321';
            }
            
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
            
            // Add subtle border
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, tileSize, tileSize);
        }
    }
    
    ctx.restore();
}

function loadCustomGroundTexture() {
    console.log('🌱 Starting ground texture loading...');
    
    // Load all 18 ground PNG textures
    const groundFiles = [
        'tank/Grounds/water.png',
        'tank/Grounds/BlueGrass.png',
        'tank/Grounds/BrownCobblestone.png',
        'tank/Grounds/BrownGrass.png',
        'tank/Grounds/Goldcobblestone.png',
        'tank/Grounds/GoldenCobblestone.png',
        'tank/Grounds/GrayGround.png',
        'tank/Grounds/GreenGrass.png',
        'tank/Grounds/LightBrownCobblestone.png',
        'tank/Grounds/LightGreyCobblestone.png',
        'tank/Grounds/LightGreyGround.png',
        'tank/Grounds/LightSand.png',
        'tank/Grounds/PurpleCobblestone.png',
        'tank/Grounds/RedCobblestone.png',
        'tank/Grounds/Sand.png',
        'tank/Grounds/WoodenPlanks.png',
        'tank/Grounds/WoodenTile.png',
        'tank/Grounds/YellowGrass.png',
        'tank/Grounds/lava1.png',
        'tank/Grounds/lava2.png',
        'tank/Grounds/liquidBubble1.png',
        'tank/Grounds/liquidBubble2.png'
    ];

    let loadedCount = 0;
    let errorCount = 0;

    // Set a timeout to force enable ground textures if loading takes too long
    setTimeout(() => {
        if (!groundTexturesLoaded) {
            console.warn('⚠️ Ground texture loading timeout, enabling anyway');
            groundTexturesLoaded = true;
        }
    }, 5000);

    groundFiles.forEach((file, index) => {
        const img = new Image();
        const groundType = `ground${index + 1}`;

        img.onload = () => {
            groundTextureImages.set(groundType, img);
            groundTextureImages.set(file, img); // Also store by filename
            loadedCount++;
            console.log(`✅ Loaded ground texture ${loadedCount}/${groundFiles.length}: ${file}`);

            if (loadedCount === groundFiles.length) {
                groundTexturesLoaded = true;
                console.log(`🎉 All ${groundFiles.length} ground textures loaded successfully!`);
            }
        };

        img.onerror = () => {
            console.warn(`❌ Failed to load ground texture: ${file}`);
            errorCount++;
            loadedCount++;

            if (loadedCount === groundFiles.length) {
                groundTexturesLoaded = true;
                console.log(`⚠️ Ground texture loading completed with ${errorCount} errors`);
            }
        };

        img.src = `/assets/${file}`;
        console.log(`📥 Loading: ${img.src}`);
    });
}

function drawTexturedParallelogram(ctx, x, y, width, height, terrainType) {
    // Try to use custom ground texture first
    if (customGroundLoaded && customGroundTexture) {
        drawCustomTexturedParallelogram(ctx, x, y, width, height);
        return;
    }

    // Fallback to hex tileset
    const tileset = HexTerrainSystem.tileset;
    const tileIndex = tileset.tiles[terrainType] || tileset.tiles.grass || 0;

    // Calculate source position in tileset
    const srcCol = tileIndex % tileset.columns;
    const srcRow = Math.floor(tileIndex / tileset.columns);
    const srcX = srcCol * tileset.tileWidth;
    const srcY = srcRow * tileset.tileHeight;

    ctx.save();

    // Extend slightly to prevent gaps
    const overlap = 1;

    // Create parallelogram clipping path (isometric diamond shape) - slightly larger
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y - overlap);                    // Top
    ctx.lineTo(x + width + overlap, y + height / 2);           // Right
    ctx.lineTo(x + width / 2, y + height + overlap);           // Bottom
    ctx.lineTo(x - overlap, y + height / 2);                   // Left
    ctx.closePath();
    ctx.clip();

    // Draw texture
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scale = Math.max(width / tileset.tileWidth, height / tileset.tileHeight) * 1.25;
    const drawWidth = tileset.tileWidth * scale;
    const drawHeight = tileset.tileHeight * scale;

    ctx.drawImage(
        tileset.image,
        srcX, srcY,
        tileset.tileWidth,
        tileset.tileHeight,
        x + width / 2 - drawWidth / 2,
        y + height / 2 - drawHeight / 2,
        drawWidth,
        drawHeight
    );

    ctx.restore();

    // Very subtle border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineTo(x + width / 2, y + height);
    ctx.lineTo(x, y + height / 2);
    ctx.closePath();
    ctx.stroke();
}

function drawGroundTexturedParallelogram(ctx, x, y, width, height, groundImage) {
    ctx.save();

    // Extend slightly to prevent gaps
    const overlap = 1;

    // Create parallelogram clipping path (isometric diamond shape) - slightly larger
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y - overlap);                    // Top
    ctx.lineTo(x + width + overlap, y + height / 2);           // Right
    ctx.lineTo(x + width / 2, y + height + overlap);           // Bottom
    ctx.lineTo(x - overlap, y + height / 2);                   // Left
    ctx.closePath();
    ctx.clip();

    // Draw ground PNG texture
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate the size needed to fill the diamond completely
    // The diagonal of the diamond is sqrt(2) * width, so we need to scale the image larger
    const scale = 1.5; // Scale up to ensure complete coverage of the diamond shape
    const drawWidth = width * scale;
    const drawHeight = height * scale;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Draw the image centered and scaled to fill the entire diamond
    ctx.drawImage(
        groundImage,
        centerX - drawWidth / 2,
        centerY - drawHeight / 2,
        drawWidth,
        drawHeight
    );

    ctx.restore();

    // Very subtle border only (optional - can be removed for seamless look)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineTo(x + width / 2, y + height);
    ctx.lineTo(x, y + height / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.stroke();
}

function drawCustomTexturedParallelogram(ctx, x, y, width, height) {
    ctx.save();

    // Create parallelogram clipping path (isometric diamond shape)
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);                    // Top
    ctx.lineTo(x + width, y + height / 2);           // Right
    ctx.lineTo(x + width / 2, y + height);           // Bottom
    ctx.lineTo(x, y + height / 2);                   // Left
    ctx.closePath();
    ctx.clip();

    // Draw custom ground texture as repeating pattern
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Create pattern for seamless tiling
    const pattern = ctx.createPattern(customGroundTexture, 'repeat');
    ctx.fillStyle = pattern;

    // Translate to align pattern with tile position
    ctx.translate(x, y);
    ctx.fillRect(0, 0, width, height);

    ctx.restore();

    // Add parallelogram border for definition
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineTo(x + width / 2, y + height);
    ctx.lineTo(x, y + height / 2);
    ctx.closePath();
    ctx.stroke();

    // Add subtle 3D effect edges
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x, y + height / 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + width, y + height / 2);
    ctx.lineTo(x + width / 2, y + height);
    ctx.stroke();
}

function drawColoredParallelogram(ctx, x, y, width, height, terrainType) {
    // Fallback colors matching terrain types
    const colors = {
        grass: ['#a8e87a', '#88c858'],
        darkGrass: ['#78b847', '#68a836'],
        forest: ['#5a9a3a', '#4a8a2a'],
        desert: ['#e8d4a0', '#d8c490'],
        sand: ['#f0e0b0', '#e0d0a0'],
        water: ['#4a9ad8', '#3a8ac8'],
        snow: ['#f0f8ff', '#e0e8f0'],
        ice: ['#c0e8ff', '#b0d8f0'],
        lava: ['#ff4500', '#ff6347'],
        stone: ['#888888', '#777777']
    };

    const colorSet = colors[terrainType] || colors.grass;

    // Extend slightly to prevent gaps
    const overlap = 1;

    // Create gradient for 3D effect
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, colorSet[0]);
    gradient.addColorStop(1, colorSet[1]);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y - overlap);
    ctx.lineTo(x + width + overlap, y + height / 2);
    ctx.lineTo(x + width / 2, y + height + overlap);
    ctx.lineTo(x - overlap, y + height / 2);
    ctx.closePath();
    ctx.fill();

    // Very subtle border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
}


// Draw isometric ground tile - the PNG already contains the isometric 3D view
function drawGroundIsometricTile(ctx, x, y, width, height, groundImage) {
    ctx.save();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the ground image - tiles will overlap because drawHeight > tileHeight
    ctx.drawImage(groundImage, x, y, width, height);

    ctx.restore();
}


// Draw subtle isometric grid for placement guidance
function drawSubtleIsometricGrid(ctx, camera, viewWidth, viewHeight) {
    const tileWidth = 120;
    const tileHeight = 30;
    const drawHeight = 70;

    const viewLeft = camera.x;
    const viewTop = camera.y;
    const viewRight = camera.x + viewWidth;
    const viewBottom = camera.y + viewHeight;

    // Calculate visible tile range - draw fewer lines (every 2nd tile)
    const startCol = Math.floor((viewLeft - tileWidth * 2) / tileWidth);
    const endCol = Math.ceil((viewRight + tileWidth * 2) / tileWidth);
    const startRow = Math.floor((viewTop - tileHeight * 2) / tileHeight);
    const endRow = Math.ceil((viewBottom + tileHeight * 2) / tileHeight);

    ctx.save();

    // Draw very subtle isometric diamond outlines - only every 2nd tile
    for (let row = startRow; row <= endRow; row += 2) {
        for (let col = startCol; col <= endCol; col += 2) {
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
            const isoY = row * tileHeight;

            // Calculate the 4 corner points of the diamond
            const top = { x: isoX + tileWidth / 2, y: isoY };
            const right = { x: isoX + tileWidth, y: isoY + drawHeight / 2 };
            const bottom = { x: isoX + tileWidth / 2, y: isoY + drawHeight };
            const left = { x: isoX, y: isoY + drawHeight / 2 };

            // Draw bold outline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(right.x, right.y);
            ctx.lineTo(bottom.x, bottom.y);
            ctx.lineTo(left.x, left.y);
            ctx.closePath();
            ctx.stroke();
        }
    }

    ctx.restore();
}

// Render hex terrain for map editor (same as normal game)
function renderHexTerrainForEditor(ctx, camera, viewWidth, viewHeight) {
    if (!HexTerrainSystem.tilesetLoaded) return;

    const hexSize = HexTerrainSystem.hexSize;
    const hexWidth = HexTerrainSystem.hexWidth;
    const hexHeight = HexTerrainSystem.hexHeight;
    const vertSpacing = HexTerrainSystem.vertSpacing;

    const viewLeft = camera.x;
    const viewTop = camera.y;
    const viewRight = camera.x + viewWidth;
    const viewBottom = camera.y + viewHeight;

    // Calculate visible hex range with padding
    const startRow = Math.max(0, Math.floor((viewTop - hexHeight) / vertSpacing));
    const endRow = Math.ceil((viewBottom + hexHeight) / vertSpacing);
    const startCol = Math.max(0, Math.floor((viewLeft - hexWidth) / hexWidth));
    const endCol = Math.ceil((viewRight + hexWidth) / hexWidth);

    // Draw hexagons
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const y = row * vertSpacing;
            const offsetX = (row % 2 === 0) ? 0 : hexWidth / 2;
            const x = col * hexWidth + offsetX;

            // Get terrain type for this hex
            const key = `${row},${col}`;
            const terrainType = HexTerrainSystem.terrainMap.get(key) || 'grass';

            // Draw the hex with texture
            drawHexWithTexture(ctx, x, y, hexSize, terrainType);
        }
    }
}

// Draw a single hex with texture from tileset
function drawHexWithTexture(ctx, x, y, size, terrainType) {
    const tileset = HexTerrainSystem.tileset;
    const tileIndex = tileset.tiles[terrainType] || tileset.tiles.grass || 0;

    // Calculate source position in tileset
    const srcCol = tileIndex % tileset.columns;
    const srcRow = Math.floor(tileIndex / tileset.columns);
    const srcX = srcCol * tileset.tileWidth;
    const srcY = srcRow * tileset.tileHeight;

    ctx.save();

    // Create hexagon clipping path with slight overlap to prevent gaps
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + (size + 1) * Math.cos(angle); // +1 for overlap
        const hy = y + (size + 1) * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(hx, hy);
        } else {
            ctx.lineTo(hx, hy);
        }
    }
    ctx.closePath();
    ctx.clip();

    // Draw texture with better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Larger scale for better coverage and detail
    const scale = (size * 2.5) / tileset.tileWidth;
    const drawWidth = tileset.tileWidth * scale;
    const drawHeight = tileset.tileHeight * scale;

    ctx.drawImage(
        tileset.image,
        srcX, srcY,
        tileset.tileWidth,
        tileset.tileHeight,
        x - drawWidth / 2,
        y - drawHeight / 2,
        drawWidth,
        drawHeight
    );

    ctx.restore();

    // Add subtle lighting effect for depth
    ctx.save();
    ctx.globalAlpha = 0.15;
    const gradient = ctx.createRadialGradient(x, y - size * 0.3, 0, x, y, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = gradient;

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
    ctx.restore();

    // Very subtle hex border for definition
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 0.5;
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
    ctx.stroke();
}

// Override: Adjust isometric tile spacing to remove gaps
// Reduce vertical spacing between tiles
const ISOMETRIC_TILE_WIDTH = 120;
const ISOMETRIC_TILE_HEIGHT = 30; // Reduced from 60 to push tiles closer vertically
const ISOMETRIC_HORIZONTAL_OFFSET = 60; // Half of tile width for stagger


// Smooth interpolation update loop
// Ease-out function: starts fast, ends slow
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function smoothCameraUpdate() {
    // Smoothly interpolate zoom with ease-out
    const zoomDiff = targetCanvasZoom - canvasZoom;
    let didChange = false;
    if (Math.abs(zoomDiff) > 0.001) {
        // Calculate easing factor based on distance (closer = slower)
        const distance = Math.abs(zoomDiff);
        const normalizedDistance = Math.min(distance / 2, 1); // Normalize to 0-1
        const easedFactor = easeOutCubic(normalizedDistance) * smoothingFactor + 0.05;

        canvasZoom += zoomDiff * easedFactor;
        window.canvasZoom = canvasZoom;
        didChange = true;
    }

    // Smoothly interpolate position with ease-out
    const offsetXDiff = targetCanvasOffsetX - canvasOffsetX;
    const offsetYDiff = targetCanvasOffsetY - canvasOffsetY;

    if (Math.abs(offsetXDiff) > 0.1 || Math.abs(offsetYDiff) > 0.1) {
        // Calculate easing factor based on distance (closer = slower)
        const distance = Math.sqrt(offsetXDiff * offsetXDiff + offsetYDiff * offsetYDiff);
        const normalizedDistance = Math.min(distance / 500, 1); // Normalize to 0-1
        const easedFactor = easeOutCubic(normalizedDistance) * smoothingFactor + 0.05;

        canvasOffsetX += offsetXDiff * easedFactor;
        canvasOffsetY += offsetYDiff * easedFactor;
        didChange = true;
    }

    // If camera changed, request a render so the user sees updated zoom/pan immediately
    if (didChange) renderMapCreatorCanvas();

    requestAnimationFrame(smoothCameraUpdate);
}

// Start smooth camera updates
smoothCameraUpdate();

// Add smooth mouse wheel zoom handler
function setupSmoothWheelZoom() {
    const canvas = document.getElementById('mapCreatorCanvas');
    if (!canvas) {
        setTimeout(setupSmoothWheelZoom, 100);
        return;
    }

    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate world position before zoom
        const worldX = (mouseX - canvasOffsetX) / canvasZoom;
        const worldY = (mouseY - canvasOffsetY) / canvasZoom;

        // Update zoom target smoothly
        const zoomDelta = e.deltaY > 0 ? 0.95 : 1.05;
        const newZoom = Math.max(0.5, Math.min(3, targetCanvasZoom * zoomDelta));
        targetCanvasZoom = newZoom;

        // Adjust offset target to keep mouse position stable
        targetCanvasOffsetX = mouseX - worldX * newZoom;
        targetCanvasOffsetY = mouseY - worldY * newZoom;

        // Update slider
        updateZoomSlider(newZoom);

        // Update zoom display
        const zoomDisplay = document.getElementById('zoomDisplay');
        if (zoomDisplay) {
            zoomDisplay.textContent = Math.round(newZoom * 100) + '%';
        }
    }, { passive: false });

    console.log('✅ Smooth wheel zoom enabled');
}

// Setup wheel zoom when map creator opens
setupSmoothWheelZoom();

// Update zoom slider visuals (HTML elements removed, function kept for compatibility)
function updateZoomSlider(zoomValue) {
    const slider = document.getElementById('mapZoomSlider');
    const fill = document.getElementById('mapZoomSliderFill');
    const thumb = document.getElementById('mapZoomSliderThumb');

    // HTML elements no longer exist, but keep function for compatibility
    if (!slider || !fill || !thumb) {
        console.log('Zoom slider HTML elements not found (removed by design)');
        return;
    }

    slider.value = zoomValue;

    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const percentage = ((zoomValue - min) / (max - min)) * 100;

    fill.style.width = percentage + '%';
    thumb.style.left = percentage + '%';
}

// Zoom In/Out functions for map creator
function zoomIn() {
    const canvas = document.getElementById('mapCreatorCanvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate world position at center before zoom
    const worldX = (centerX - canvasOffsetX) / canvasZoom;
    const worldY = (centerY - canvasOffsetY) / canvasZoom;

    // Increase zoom target
    const newZoom = Math.min(3, targetCanvasZoom * 1.2);
    targetCanvasZoom = newZoom;

    // Adjust offset target to keep center point stable
    targetCanvasOffsetX = centerX - worldX * newZoom;
    targetCanvasOffsetY = centerY - worldY * newZoom;

    // Update zoom display
    const zoomDisplay = document.getElementById('zoomDisplay');
    if (zoomDisplay) {
        zoomDisplay.textContent = Math.round(newZoom * 100) + '%';
    }

    // Update slider
    updateZoomSlider(newZoom);

    renderMapCreatorCanvas();
}

function zoomOut() {
    const canvas = document.getElementById('mapCreatorCanvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate world position at center before zoom
    const worldX = (centerX - canvasOffsetX) / canvasZoom;
    const worldY = (centerY - canvasOffsetY) / canvasZoom;

    // Decrease zoom target
    const newZoom = Math.max(0.5, targetCanvasZoom / 1.2);
    targetCanvasZoom = newZoom;

    // Adjust offset target to keep center point stable
    targetCanvasOffsetX = centerX - worldX * newZoom;
    targetCanvasOffsetY = centerY - worldY * newZoom;

    // Update zoom display
    const zoomDisplay = document.getElementById('zoomDisplay');
    if (zoomDisplay) {
        zoomDisplay.textContent = Math.round(newZoom * 100) + '%';
    }

    // Update slider
    updateZoomSlider(newZoom);

    renderMapCreatorCanvas();
}

// Make functions globally accessible
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;

// Load and display saved maps
function loadSavedMaps() {
    const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    displayMapCards(maps);
}

// Immediately export loadSavedMaps to ensure it's available
if (typeof window !== 'undefined') {
    window.loadSavedMaps = loadSavedMaps;
    console.log('✅ loadSavedMaps exported immediately');
}

function displayMapCards(maps) {
    const mapsGrid = document.querySelector('.maps-grid');
    if (!mapsGrid) return;

    // Remove existing map cards (keep CREATE NEW button)
    const existingCards = mapsGrid.querySelectorAll('.map-card');
    existingCards.forEach(card => card.remove());

    // Create map cards
    maps.forEach((map, index) => {
        const card = document.createElement('div');
        card.className = 'map-card';

        // Map thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = 'map-card-thumbnail';

        if (map.thumbnail) {
            const img = document.createElement('img');
            img.src = map.thumbnail;
            img.alt = `${map.name} preview`;
            thumbnail.appendChild(img);
        } else {
            thumbnail.innerHTML = `
                <div style="text-align: center; color: rgba(255, 255, 255, 0.7); font-size: 14px;">
                    🗺️<br>
                    No Preview
                </div>
            `;
        }

        // Map info
        const info = document.createElement('div');
        info.className = 'map-card-info';

        const title = document.createElement('h3');
        title.className = 'map-card-title';
        title.textContent = map.name;

        const stats = document.createElement('div');
        stats.className = 'map-card-stats';
        stats.innerHTML = `
            <div class="map-card-stat">
                <span class="map-card-stat-icon">🗺️</span>
                <span>${map.objects ? map.objects.length : 0} Objects</span>
            </div>
            <div class="map-card-stat">
                <span class="map-card-stat-icon">📅</span>
                <span>${new Date(map.created).toLocaleDateString()}</span>
            </div>
        `;

        const actions = document.createElement('div');
        actions.className = 'map-card-actions';
        actions.innerHTML = `
            <button class="map-card-btn" onclick="editMap('${map.id}')">✏️ Edit</button>
            <button class="map-card-btn delete-btn" onclick="deleteMap('${map.id}')">🗑️</button>
        `;

        info.appendChild(title);
        info.appendChild(stats);
        info.appendChild(actions);

        card.appendChild(thumbnail);
        card.appendChild(info);

        // Insert before CREATE NEW button
        const createNewBtn = mapsGrid.querySelector('.create-new-map-btn');
        mapsGrid.insertBefore(card, createNewBtn);
    });
}

// Edit map function
function editMap(mapId) {
    const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    const map = maps.find(m => String(m.id) === String(mapId));

    if (!map) {
        alert('Map not found!');
        return;
    }

    // Set current map info
    window.currentMapName = map.name;
    window.currentMapId = mapId;

    console.log("✏️ Opening EDIT EXISTING MAP flow for:", map.name);

    // Open the editor first in edit mode
    startMapEditor(true);

    // Wait for the editor to initialize, then load the map data
    setTimeout(() => {
        // Ensure ground textures are loaded before loading map
        if (!groundTexturesLoaded) {
            console.log("⏳ Waiting for ground textures to load...");
            const checkTextures = setInterval(() => {
                if (groundTexturesLoaded) {
                    clearInterval(checkTextures);
                    loadMap(map);
                    console.log("✅ Map loaded for editing:", map.name, "with", map.objects?.length || 0, "objects and", map.groundTiles?.length || 0, "ground tiles");
                }
            }, 100);
        } else {
            loadMap(map);
            console.log("✅ Map loaded for editing:", map.name, "with", map.objects?.length || 0, "objects and", map.groundTiles?.length || 0, "ground tiles");
        }
    }, 500);

    // Wait for the editor to initialize, then load the map data
    setTimeout(() => {
        // Ensure ground textures are loaded before loading map
        if (!groundTexturesLoaded) {
            console.log("⏳ Waiting for ground textures to load...");
            const checkTextures = setInterval(() => {
                if (groundTexturesLoaded) {
                    clearInterval(checkTextures);
                    loadMap(map);
                    console.log("✅ Map loaded for editing:", map.name, "with", map.objects?.length || 0, "objects and", map.groundTiles?.length || 0, "ground tiles");
                }
            }, 100);
        } else {
            loadMap(map);
            console.log("✅ Map loaded for editing:", map.name, "with", map.objects?.length || 0, "objects and", map.groundTiles?.length || 0, "ground tiles");
        }
    }, 500);
}

// Analyze map function
function analyzeMap(mapId) {
    const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    const map = maps.find(m => String(m.id) === String(mapId));

    if (!map) {
        alert('Map not found!');
        return;
    }

    const objectCount = map.objects ? map.objects.length : 0;
    const tileCount = map.groundTiles ? map.groundTiles.length : 0;
    const created = new Date(map.created).toLocaleString();

    alert(`📊 Map Analysis: ${map.name}\n\n` +
        `📦 Objects: ${objectCount}\n` +
        `🌍 Ground Tiles: ${tileCount}\n` +
        `📅 Created: ${created}\n` +
        `📏 Version: ${map.version || '1.0'}`);
}

// Delete map function
function deleteMap(mapId) {
    const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    const map = maps.find(m => String(m.id) === String(mapId));

    if (!map) {
        alert('Map not found!');
        return;
    }

    if (confirm(`Are you sure you want to delete "${map.name}"?`)) {
        const updatedMaps = maps.filter(m => String(m.id) !== String(mapId));
        localStorage.setItem('thefortz.customMaps', JSON.stringify(updatedMaps));
        loadSavedMaps(); // Refresh the display
        console.log('Map deleted:', map.name);
    }
}

// Load saved maps when the page loads
document.addEventListener('DOMContentLoaded', loadSavedMaps);

// Add click outside handler to close action buttons
document.addEventListener('click', function(e) {
    // If clicking outside of map cards, hide all action buttons
    if (!e.target.closest('.map-card')) {
        document.querySelectorAll('.map-card-actions').forEach(action => {
            action.style.display = 'none';
            action.closest('.map-card').classList.remove('selected');
        });
    }
});

// Additional exports (these are already exported in the main block above)
if (typeof window !== 'undefined') {
    window.editMap = editMap;
    window.analyzeMap = analyzeMap;
    window.deleteMap = deleteMap;
}

// Editor starters / compatibility exports
window.startMapEditor = typeof startMapEditor === 'function' ? startMapEditor : function() { console.warn('startMapEditor not defined'); };
window.startTankEditor = window.startMapEditor;
window.startJetEditor = function() { alert('Jet editor is not available in this build.'); };
window.startRaceEditor = function() { alert('Race editor is not available in this build.'); };

// Initialize the new editor
function initializeNewEditor() {
    console.log('🎨 Initializing new editor...');
    
    // Make sure the panel is visible
    const assetsPanel = document.getElementById('assetsPanel');
    if (assetsPanel) {
        assetsPanel.classList.remove('minimized');
        console.log('✅ Assets panel found and expanded');
        
        // Initialize drag functionality
        initializeDragFunctionality(assetsPanel);
    } else {
        console.error('❌ Assets panel not found!');
        return;
    }
    
    // Load default category (buildings)
    switchAssetCategory('buildings');
    
    // Initialize unselect button
    initializeUnselectButton();
    
    console.log('✅ New editor initialized!');
}

// Drag functionality for editor panel
function initializeDragFunctionality(panel) {
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panelStartX = 0;
    let panelStartY = 0;
    
    const header = panel.querySelector('.editor-header');
    if (!header) return;
    
    // Restore saved position or use default
    const savedPosition = localStorage.getItem('editorPanelPosition');
    if (savedPosition) {
        try {
            const position = JSON.parse(savedPosition);
            // Validate position is still within screen bounds
            const maxX = window.innerWidth - 320; // panel width
            const maxY = window.innerHeight - 200; // minimum panel height
            
            if (position.left >= 0 && position.left <= maxX && 
                position.top >= 0 && position.top <= maxY) {
                panel.style.left = position.left + 'px';
                panel.style.top = position.top + 'px';
                panel.style.right = 'auto';
                console.log('✅ Restored editor panel position:', position);
            }
        } catch (e) {
            console.warn('Failed to restore panel position:', e);
        }
    }
    
    // Get initial position
    const rect = panel.getBoundingClientRect();
    panelStartX = rect.left;
    panelStartY = rect.top;
    
    // Double-click to reset position
    header.addEventListener('dblclick', (e) => {
        if (e.target.classList.contains('editor-toggle-btn')) return;
        
        panel.style.left = '';
        panel.style.top = '20px';
        panel.style.right = '20px';
        
        // Add a brief highlight effect
        panel.style.boxShadow = '0 12px 35px rgba(0,247,255,0.6)';
        setTimeout(() => {
            panel.style.boxShadow = '';
        }, 300);
        
        console.log('🔄 Reset editor panel position');
    });
    
    header.addEventListener('mousedown', (e) => {
        // Only drag on left click and not on buttons
        if (e.button !== 0 || e.target.classList.contains('editor-toggle-btn')) return;
        
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        const rect = panel.getBoundingClientRect();
        panelStartX = rect.left;
        panelStartY = rect.top;
        
        panel.classList.add('dragging');
        document.body.style.cursor = 'move';
        
        // Prevent text selection
        e.preventDefault();
        
        console.log('🖱️ Started dragging editor panel');
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        let newX = panelStartX + deltaX;
        let newY = panelStartY + deltaY;
        
        // Keep panel within screen bounds
        const panelRect = panel.getBoundingClientRect();
        const maxX = window.innerWidth - panelRect.width;
        const maxY = window.innerHeight - panelRect.height;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        // Snap to edges (within 20px)
        const snapDistance = 20;
        if (newX < snapDistance) newX = 0;
        if (newY < snapDistance) newY = 0;
        if (newX > maxX - snapDistance) newX = maxX;
        if (newY > maxY - snapDistance) newY = maxY;
        
        panel.style.left = newX + 'px';
        panel.style.top = newY + 'px';
        panel.style.right = 'auto'; // Remove right positioning
    });
    
    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        
        isDragging = false;
        panel.classList.remove('dragging');
        document.body.style.cursor = '';
        
        // Save position to localStorage
        const rect = panel.getBoundingClientRect();
        const position = {
            left: rect.left,
            top: rect.top
        };
        localStorage.setItem('editorPanelPosition', JSON.stringify(position));
        
        console.log('✅ Finished dragging editor panel, position saved');
    });
    
    // Handle window resize to keep panel in bounds
    window.addEventListener('resize', () => {
        const rect = panel.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        if (rect.left > maxX) {
            panel.style.left = maxX + 'px';
        }
        if (rect.top > maxY) {
            panel.style.top = maxY + 'px';
        }
    });
    
    console.log('✅ Drag functionality initialized for editor panel');
}

// Toggle text editor visibility
function toggleTextEditor() {
    const textEditorContainer = document.getElementById('textEditorContainer');
    if (textEditorContainer) {
        const isVisible = textEditorContainer.style.display !== 'none';
        textEditorContainer.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            // Focus the textarea when showing
            const textarea = document.getElementById('mapScriptEditor');
            if (textarea) {
                setTimeout(() => textarea.focus(), 100);
            }
        }
    }
}

// Save map script
function saveMapScript() {
    const textarea = document.getElementById('mapScriptEditor');
    if (textarea) {
        const script = textarea.value;
        // Store in map data or localStorage
        if (window.currentMapName) {
            localStorage.setItem(`mapScript_${window.currentMapName}`, script);
            console.log('✅ Map script saved for:', window.currentMapName);
            
            // Show feedback
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅ Saved!';
            btn.style.background = 'linear-gradient(135deg, #44ff44, #22cc22)';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = 'linear-gradient(135deg, #00f7ff, #0099cc)';
            }, 2000);
        }
    }
}

// Clear map script
function clearMapScript() {
    const textarea = document.getElementById('mapScriptEditor');
    if (textarea && confirm('Are you sure you want to clear the script?')) {
        textarea.value = '';
        console.log('✅ Map script cleared');
    }
}

// Load map script when opening editor
function loadMapScript() {
    if (window.currentMapName) {
        const savedScript = localStorage.getItem(`mapScript_${window.currentMapName}`);
        const textarea = document.getElementById('mapScriptEditor');
        if (textarea && savedScript) {
            textarea.value = savedScript;
            console.log('✅ Map script loaded for:', window.currentMapName);
        }
    }
}

// Test map script
function testMapScript() {
    const textarea = document.getElementById('mapScriptEditor');
    if (!textarea) return;
    
    const script = textarea.value.trim();
    if (!script) {
        alert('❌ No script to test!');
        return;
    }
    
    // Initialize script engine if not already done
    if (!window.mapScriptEngine) {
        console.error('❌ Map Script Engine not loaded!');
        return;
    }
    
    // Test the script
    const mapName = window.currentMapName || 'test_map';
    const success = window.mapScriptEngine.loadScript(script, mapName);
    
    if (success) {
        alert('✅ Script syntax is valid!');
        console.log('🧪 Testing script functions...');
        
        // Test common functions if they exist
        try {
            window.mapScriptEngine.executeFunction(mapName, 'onGameStart');
            window.mapScriptEngine.executeFunction(mapName, 'onPlayerSpawn', { name: 'TestPlayer', id: 'test123' });
        } catch (error) {
            console.log('ℹ️ Some functions not found (this is normal)');
        }
    } else {
        alert('❌ Script has syntax errors! Check the console for details.');
    }
}

// Show script help
function showScriptHelp() {
    const helpModal = document.createElement('div');
    helpModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    helpModal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a2a3a, #2a3a4a);
            border: 2px solid #00f7ff;
            border-radius: 12px;
            padding: 30px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #00f7ff; margin: 0;">📜 Map Script Help</h2>
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: #ff4444;
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">✕</button>
            </div>
            
            <div style="line-height: 1.6;">
                <h3 style="color: #00f7ff;">🎮 Event Functions</h3>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px; font-family: monospace;">
                    <div><strong>onGameStart()</strong> - Called when the game begins</div>
                    <div><strong>onPlayerSpawn(player)</strong> - Called when a player spawns</div>
                    <div><strong>onPlayerDeath(player, killer)</strong> - Called when a player dies</div>
                    <div><strong>onObjectDestroy(objectId)</strong> - Called when an object is destroyed</div>
                </div>
                
                <h3 style="color: #00f7ff;">🛠️ Available Functions</h3>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px; font-family: monospace; font-size: 13px;">
                    <div><strong>showMessage(text)</strong> - Display message to all players</div>
                    <div><strong>playSound(file)</strong> - Play sound effect</div>
                    <div><strong>spawnExplosion(x, y)</strong> - Create explosion at position</div>
                    <div><strong>spawnPowerUp(type, x, y)</strong> - Spawn power-up (shield, speed, damage)</div>
                    <div><strong>getPlayersInArea(area)</strong> - Get list of players in named area</div>
                    <div><strong>endGame(result)</strong> - End game with result (victory, defeat)</div>
                    <div><strong>setTimer(callback, delay)</strong> - Execute function after delay (ms)</div>
                    <div><strong>getObject(id)</strong> - Get object by ID</div>
                    <div><strong>moveObject(id, x, y, duration)</strong> - Move object to position</div>
                    <div><strong>destroyObject(id)</strong> - Destroy object</div>
                    <div><strong>randomPosition()</strong> - Get random map position</div>
                </div>
                
                <h3 style="color: #00f7ff;">💡 Example Scripts</h3>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px;">
                    <div style="color: #ffff00;">-- Welcome message</div>
                    <div>function onGameStart()</div>
                    <div>&nbsp;&nbsp;showMessage("Welcome to my custom map!")</div>
                    <div>end</div>
                    <br>
                    <div style="color: #ffff00;">-- Spawn power-up every 30 seconds</div>
                    <div>function onGameStart()</div>
                    <div>&nbsp;&nbsp;setTimer(spawnRandomPowerUp, 30000)</div>
                    <div>end</div>
                    <br>
                    <div>function spawnRandomPowerUp()</div>
                    <div>&nbsp;&nbsp;local pos = randomPosition()</div>
                    <div>&nbsp;&nbsp;spawnPowerUp("shield", pos.x, pos.y)</div>
                    <div>&nbsp;&nbsp;setTimer(spawnRandomPowerUp, 30000)</div>
                    <div>end</div>
                </div>
                
                <div style="background: rgba(255,255,0,0.1); padding: 10px; border-radius: 6px; border-left: 4px solid #ffff00; margin-top: 15px;">
                    <strong>💡 Tip:</strong> Use the TEST button to check your script for syntax errors before saving!
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(helpModal);
}

// Make functions globally available
window.toggleTextEditor = toggleTextEditor;
window.saveMapScript = saveMapScript;
window.clearMapScript = clearMapScript;

// Call initialization when editor starts
if (typeof window !== 'undefined') {
    window.initializeNewEditor = initializeNewEditor;
}
// Launch Enhanced Map Creator
function launchEnhancedMapCreator() {
    // Hide existing map creator if open
    const existingCreator = document.getElementById('enhancedMapCreator');
    if (existingCreator) {
        existingCreator.remove();
    }
    
    // Create and launch enhanced map creator
    const enhancedCreator = new TankMapCreatorEnhanced();
    enhancedCreator.init();
    
    console.log('🚛 Enhanced Tank Map Creator launched!');
}

// Test function to verify map creator is working
function testMapCreatorFunctions() {
    console.log('🧪 Testing Map Creator Functions:');
    console.log('  - startCreateMapRendering:', typeof window.startCreateMapRendering);
    console.log('  - loadSavedMaps:', typeof window.loadSavedMaps);
    console.log('  - launchEnhancedMapCreator:', typeof window.launchEnhancedMapCreator);
    
    if (typeof window.startCreateMapRendering === 'function') {
        console.log('✅ startCreateMapRendering is available');
    } else {
        console.error('❌ startCreateMapRendering is missing');
    }
    
    if (typeof window.loadSavedMaps === 'function') {
        console.log('✅ loadSavedMaps is available');
    } else {
        console.error('❌ loadSavedMaps is missing');
    }
    
    return {
        startCreateMapRendering: typeof window.startCreateMapRendering === 'function',
        loadSavedMaps: typeof window.loadSavedMaps === 'function',
        launchEnhancedMapCreator: typeof window.launchEnhancedMapCreator === 'function'
    };
}

// Make functions globally available
window.launchEnhancedMapCreator = launchEnhancedMapCreator;
window.testMapCreatorFunctions = testMapCreatorFunctions;

// Expose ground texture variables globally
window.groundTexturesLoaded = groundTexturesLoaded;
window.groundTextureImages = groundTextureImages;
window.loadCustomGroundTexture = loadCustomGroundTexture;

// Ensure ground textures are loaded when script loads
if (typeof window !== 'undefined') {
    // Load ground textures immediately
    setTimeout(() => {
        if (!groundTexturesLoaded) {
            console.log('🌱 Auto-loading ground textures...');
            loadCustomGroundTexture();
        }
    }, 1000);
}
// Function to clear demo maps and ensure only real created maps show
function clearDemoMaps() {
    console.log('🧹 Clearing demo maps...');
    
    const STORAGE_KEY = 'thefortz.customMaps';
    const existingMaps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Filter out demo maps (maps with demo_ prefix)
    const realMaps = existingMaps.filter(map => {
        const isDemoMap = map.id && map.id.startsWith('demo_');
        return !isDemoMap;
    });
    
    // Save the filtered maps back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(realMaps));
    
    console.log(`✅ Removed ${existingMaps.length - realMaps.length} demo maps, ${realMaps.length} real maps remain`);
    
    // Refresh the maps display
    if (typeof window.loadSavedMaps === 'function') {
        window.loadSavedMaps();
    } else {
        // Manually refresh the maps grid
        refreshMapsGrid();
    }
}

// Function to refresh the maps grid display
function refreshMapsGrid() {
    console.log('🔄 Refreshing maps grid...');
    
    const mapsGrid = document.querySelector('.maps-grid');
    if (!mapsGrid) {
        console.warn('Maps grid not found');
        return;
    }
    
    // Clear existing map cards (but keep the create new button)
    const mapCards = mapsGrid.querySelectorAll('.map-card');
    mapCards.forEach(card => card.remove());
    
    // Load real maps from localStorage
    const STORAGE_KEY = 'thefortz.customMaps';
    const maps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    console.log(`📍 Loading ${maps.length} real maps`);
    
    // Add each real map to the grid
    maps.forEach(map => {
        if (map && map.name) {
            const mapCard = createMapCard(map);
            // Insert before the create new button
            const createBtn = mapsGrid.querySelector('.create-new-map-btn');
            if (createBtn) {
                mapsGrid.insertBefore(mapCard, createBtn);
            } else {
                mapsGrid.appendChild(mapCard);
            }
        }
    });
}

// Function to create a map card element
function createMapCard(map) {
    const mapCard = document.createElement('div');
    mapCard.className = 'map-card';
    
    const thumbnail = map.thumbnail || '';
    
    mapCard.innerHTML = `
        <div class="map-card-thumbnail">
            ${thumbnail ? 
                `<img src="${thumbnail}" alt="${map.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                `<div style="text-align: center; color: rgba(255, 255, 255, 0.7); font-size: 14px;">🗺️<br>No Preview</div>`
            }
        </div>
        <div class="map-card-info">
            <h3 class="map-card-title">${map.name}</h3>
            <div class="map-card-actions" style="display: none;">
                <button class="map-card-btn" onclick="editMap('${map.id}')">✏️ Edit</button>
                <button class="map-card-btn" onclick="analyzeMap('${map.id}')">📊 Analyze</button>
                <button class="map-card-btn delete-btn" onclick="deleteMap('${map.id}')">🗑️ Delete</button>
            </div>
        </div>
    `;
    
    // Add click handler to toggle buttons
    mapCard.addEventListener('click', function(e) {
        // Don't toggle if clicking on a button
        if (e.target.tagName === 'BUTTON') return;
        
        const actions = this.querySelector('.map-card-actions');
        const isVisible = actions.style.display !== 'none';
        
        // Hide all other action buttons first
        document.querySelectorAll('.map-card-actions').forEach(action => {
            action.style.display = 'none';
            action.closest('.map-card').classList.remove('selected');
        });
        
        // Show this card's actions if they were hidden
        if (!isVisible) {
            actions.style.display = 'flex';
            this.classList.add('selected');
        }
    });
    
    return mapCard;
}

// Function to edit a map
function editMap(mapId) {
    console.log('✏️ Editing map:', mapId);
    
    const STORAGE_KEY = 'thefortz.customMaps';
    const maps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const map = maps.find(m => m.id === mapId);
    
    if (map) {
        // Load the map data into the editor
        window.currentMapName = map.name;
        
        // Load map objects and settings
        if (map.objects) {
            placedObjects = map.objects;
        }
        if (map.spawnPoints) {
            spawnPoints = map.spawnPoints;
        }
        if (map.groundTiles) {
            customGroundTiles = new Map(Object.entries(map.groundTiles));
        }
        
        // Start the map editor in edit mode
        startMapEditor(true);
        
        console.log(`✅ Loaded map "${map.name}" for editing`);
    } else {
        console.error('❌ Map not found:', mapId);
        alert('Map not found!');
    }
}

// Function to delete a map
function deleteMap(mapId) {
    console.log('🗑️ Deleting map:', mapId);
    
    if (!confirm('Are you sure you want to delete this map? This action cannot be undone.')) {
        return;
    }
    
    const STORAGE_KEY = 'thefortz.customMaps';
    const maps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filteredMaps = maps.filter(m => m.id !== mapId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredMaps));
    
    console.log(`✅ Deleted map: ${mapId}`);
    
    // Refresh the display
    refreshMapsGrid();
}

// Function to ensure proper scrolling for maps grid
function fixMapsGridScrolling() {
    console.log('🔧 Fixing maps grid scrolling...');
    
    const mapsGrid = document.querySelector('.maps-grid');
    if (!mapsGrid) {
        console.warn('Maps grid not found');
        return;
    }
    
    // Ensure proper CSS for horizontal scrolling
    mapsGrid.style.display = 'flex';
    mapsGrid.style.flexWrap = 'nowrap';
    mapsGrid.style.overflowX = 'auto';
    mapsGrid.style.overflowY = 'hidden';
    mapsGrid.style.scrollBehavior = 'smooth';
    
    // Ensure all map cards have proper flex properties
    const mapCards = mapsGrid.querySelectorAll('.map-card, .create-new-map-btn');
    mapCards.forEach(card => {
        card.style.flexShrink = '0';
        card.style.minWidth = '336px'; // 20% bigger than original 280px
        card.style.width = '336px';
    });
    
    console.log('✅ Maps grid scrolling fixed');
}

// Initialize when the page loads
if (typeof window !== 'undefined') {
    // Clear demo maps immediately
    setTimeout(() => {
        clearDemoMaps();
        fixMapsGridScrolling();
    }, 1000);
    
    // Make functions globally available
    window.clearDemoMaps = clearDemoMaps;
    window.refreshMapsGrid = refreshMapsGrid;
    window.editMap = editMap;
    window.deleteMap = deleteMap;
    window.fixMapsGridScrolling = fixMapsGridScrolling;
    
    // Also create a loadSavedMaps function if it doesn't exist
    if (!window.loadSavedMaps) {
        window.loadSavedMaps = refreshMapsGrid;
    }
}

// Export functions globally for MapCreatorInit.js
window.startCreateMapRendering = startCreateMapRendering;
window.stopCreateMapRendering = stopCreateMapRendering;
window.handleMapCreatorClick = handleMapCreatorClick;
window.openBlankMapCreator = openBlankMapCreator;
window.closeBlankMapCreator = closeBlankMapCreator;

// Also export other important functions
window.startMapEditor = startMapEditor;
window.loadSavedMaps = loadSavedMaps;
window.editMap = editMap;
window.deleteMap = deleteMap;

console.log('✅ TankMapCreator functions exported globally');

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Load saved maps when the page loads
            setTimeout(() => {
                if (typeof loadSavedMaps === 'function') {
                    loadSavedMaps();
                }
            }, 1000);
        });
    } else {
        // DOM is already loaded
        setTimeout(() => {
            if (typeof loadSavedMaps === 'function') {
                loadSavedMaps();
            }
        }, 1000);
    }
}

// Export all required functions globally for MapCreatorInit.js
if (typeof window !== 'undefined') {
    window.startCreateMapRendering = startCreateMapRendering;
    window.stopCreateMapRendering = stopCreateMapRendering;
    window.handleMapCreatorClick = handleMapCreatorClick;
    window.loadSavedMaps = loadSavedMaps;
    
    // Export other map creator functions
    if (typeof openBlankMapCreator !== 'undefined') {
        window.openBlankMapCreator = openBlankMapCreator;
    }
    if (typeof closeBlankMapCreator !== 'undefined') {
        window.closeBlankMapCreator = closeBlankMapCreator;
    }
    if (typeof startMapEditor !== 'undefined') {
        window.startMapEditor = startMapEditor;
    }
    if (typeof editMap !== 'undefined') {
        window.editMap = editMap;
    }
    if (typeof deleteMap !== 'undefined') {
        window.deleteMap = deleteMap;
    }
    
    console.log('✅ TankMapCreator functions exported to window object');
}

// Ensure all functions are exported to window object
window.startCreateMapRendering = startCreateMapRendering;
window.stopCreateMapRendering = stopCreateMapRendering;
window.handleMapCreatorClick = handleMapCreatorClick;
window.openBlankMapCreator = openBlankMapCreator;
window.closeBlankMapCreator = closeBlankMapCreator;
window.loadSavedMaps = loadSavedMaps;
window.startMapEditor = startMapEditor;

console.log('🔧 Functions exported:', {
    startCreateMapRendering: typeof window.startCreateMapRendering,
    stopCreateMapRendering: typeof window.stopCreateMapRendering,
    handleMapCreatorClick: typeof window.handleMapCreatorClick,
    openBlankMapCreator: typeof window.openBlankMapCreator,
    closeBlankMapCreator: typeof window.closeBlankMapCreator,
    loadSavedMaps: typeof window.loadSavedMaps
});

// Function to add test maps for scrolling demonstration
function addTestMapsForScrolling() {
    const STORAGE_KEY = 'thefortz.customMaps';
    const existingMaps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Add 10 test maps if there aren't many maps already
    if (existingMaps.length < 5) {
        for (let i = 1; i <= 10; i++) {
            const testMap = {
                id: `test_map_${i}`,
                name: `Test Map ${i}`,
                objects: [],
                groundTiles: [],
                createdAt: new Date().toISOString(),
                version: '1.0'
            };
            existingMaps.push(testMap);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingMaps));
        console.log('✅ Added 10 test maps for scrolling demonstration');

        // Refresh the display
        if (typeof loadSavedMaps === 'function') {
            loadSavedMaps();
        }
    }
}

// Make function globally available for testing
window.addTestMapsForScrolling = addTestMapsForScrolling;