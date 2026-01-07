// Race Map Creator
// Creates racing track maps with track pieces, obstacles, and race-specific assets

// Migrate old race sprite paths to new consolidated structure
function migrateRaceAssetPath(path) {
  if (!path || typeof path !== 'string') return path;

  // Map old folder/UUID patterns to new paths
  const migrations = {
    'spr_car_endurance_blue': 'cars/endurance_blue.png',
    'spr_car_endurance_red': 'cars/endurance_red.png',
    'spr_car_endurance_yellow': 'cars/endurance_yellow.png',
    'spr_car_endurance_purple': 'cars/endurance_purple.png',
    'spr_car_endurance_white': 'cars/endurance_white.png',
    'spr_car_highspec_blue': 'cars/highspec_blue.png',
    'spr_car_highspec_red': 'cars/highspec_red.png',
    'spr_car_highspec_yellow': 'cars/highspec_yellow.png',
    'spr_car_highspec_purple': 'cars/highspec_purple.png',
    'spr_car_highspec_white': 'cars/highspec_white.png',
    'spr_car_touring_blue': 'cars/touring_blue.png',
    'spr_car_touring_red': 'cars/touring_red.png',
    'spr_car_touring_yellow': 'cars/touring_yellow.png',
    'spr_car_touring_purple': 'cars/touring_purple.png',
    'spr_car_touring_white': 'cars/touring_white.png',
    'spr_car_safety_blue': 'cars/safety_blue.png',
    'spr_car_safety_red': 'cars/safety_red.png',
    'spr_car_safety_green': 'cars/safety_green.png',
    'spr_car_safety_grey': 'cars/safety_grey.png',
    'spr_car_safety_white': 'cars/safety_white.png',
    'spr_car_police': 'cars/police.png',
    'spr_Track_Corner': 'tracks/track_corner.png',
    'spr_Track_Round': 'tracks/track_round.png',
    'spr_Track_Straight_Diagonal': 'tracks/track_straight_diagonal.png',
    'spr_tile_grass': 'tiles/tile_grass.png',
    'spr_tile_sand': 'tiles/tile_sand.png',
    'spr_tile_tarmac': 'tiles/tile_tarmac.png',
    'spr_house1_blue': 'houses/house1_blue.png',
    'spr_house1_orange': 'houses/house1_orange.png',
    'spr_house1_yellow': 'houses/house1_yellow.png',
    'spr_house2_blue': 'houses/house2_blue.png',
    'spr_house2_orange': 'houses/house2_orange.png',
    'spr_house2_yellow': 'houses/house2_yellow.png',
    'spr_house3_blue': 'houses/house3_blue.png',
    'spr_house3_orange': 'houses/house3_orange.png',
    'spr_house3_yellow': 'houses/house3_yellow.png',
    'spr_building': 'buildings/building.png',
    'spr_building2': 'buildings/building2.png',
    'spr_building3': 'buildings/building3.png',
    'spr_billboard_blue': 'billboards/billboard_blue.png',
    'spr_billboard_yellow': 'billboards/billboard_yellow.png',
    'spr_cone': 'cones/cone.png',
    'spr_cone_tipped': 'cones/cone_tipped.png',
    'spr_tyre_black': 'tyres/tyre_black.png',
    'spr_tyre_red': 'tyres/tyre_red.png',
    'spr_tyre_white': 'tyres/tyre_white.png',
    'spr_wall_black': 'walls/wall_black.png',
    'spr_wall_red': 'walls/wall_red.png',
    'spr_wall_white': 'walls/wall_white.png',
    'spr_fuel_barrel_a': 'fuel/fuel_barrel_a.png',
    'spr_fuel_barrel_b': 'fuel/fuel_barrel_b.png',
    'spr_fuel': 'fuel/fuel.png',
    'spr_tree_a': 'plants/tree_a.png',
    'spr_tree_b': 'plants/tree_b.png',
    'spr_tree_c': 'plants/tree_c.png',
    'spr_cactus': 'plants/cactus.png',
    'spr_flower': 'plants/flower.png',
    'spr_plant': 'plants/plant.png',
    'spr_hedge_a': 'plants/hedge_a.png',
    'spr_hedge_b': 'plants/hedge_b.png',
    'spr_rocks_a': 'rocks/rocks_a.png',
    'spr_rocks_b': 'rocks/rocks_b.png',
    'spr_desert_tree_a': 'plants/desert_tree_a.png',
    'spr_desert_tree_b': 'plants/desert_tree_b.png',
    'spr_desert_rocks_a': 'rocks/desert_rocks_a.png',
    'spr_desert_rocks_b': 'rocks/desert_rocks_b.png',
    'spr_desert_plant_a': 'plants/desert_plant_a.png',
    'spr_desert_plant_b': 'plants/desert_plant_b.png',
    'spr_oil_spill_a': 'oil/oil_spill_a.png',
    'spr_oil_spill_b': 'oil/oil_spill_b.png',
    'spr_oil_smear_a': 'oil/oil_smear_a.png',
    'spr_oil_smear_b': 'oil/oil_smear_b.png',
    'spr_tyre_mark_a': 'tyres/tyre_mark_a.png',
    'spr_tyre_mark_b': 'tyres/tyre_mark_b.png',
    'spr_tyre_mark_c': 'tyres/tyre_mark_c.png',
    'spr_crack_a': 'cracks/crack_a.png',
    'spr_crack_b': 'cracks/crack_b.png',
    'spr_Chevrons_Corner': 'chevrons/corner.png',
    'spr_Chevrons_Round': 'chevrons/round.png',
    'spr_Chevrons_Straight_Diagonal': 'chevrons/straight_diagonal.png',
    'spr_lamppost': 'lights/lamppost.png',
    'spr_lights': 'lights/lights.png',
    'spr_lights_green_on': 'lights/lights_green_on.png',
    'spr_lights_red_on': 'lights/lights_red_on.png',
    'spr_sign': 'sign.png',
    'spr_start': 'start.png',
    'spr_start_position': 'start_position.png',
    'spr_pit_marking': 'pit_marking.png',
    'spr_drain': 'drain.png',
    'spr_decal_pavement': 'decal_pavement.png'
  };

  // Check if path contains old folder pattern
  for (const [oldFolder, newPath] of Object.entries(migrations)) {
    if (path.includes(oldFolder)) {
      return '/assets/race/sprites/' + newPath;
    }
  }
  return path;
}

// Race map creator state
let racePlacedObjects = [];
let raceCanvasZoom = 0.5;
let raceTargetCanvasZoom = 0.5;
let raceCanvasOffsetX = 0;
let raceCanvasOffsetY = 0;
let raceTargetCanvasOffsetX = 0;
let raceTargetCanvasOffsetY = 0;
let raceSelectedAsset = null;
let raceCurrentAssetCategory = 'track';
let raceIsDragging = false;
let raceDragStartX = 0;
let raceDragStartY = 0;

// Keyboard panning state for race editor
let raceKeysPressed = {};
let raceVelocityX = 0;
let raceVelocityY = 0;
const raceMaxSpeed = 15;
const raceAcceleration = 0.8;
const raceFriction = 0.85;

// Race asset categories - consolidated folder structure
const raceAssetCategories = {
  track: {
    name: 'Track Pieces',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'Track Corner', folder: 'tracks', file: 'track_corner.png' },
    { name: 'Track Round', folder: 'tracks', file: 'track_round.png' },
    { name: 'Track Diagonal', folder: 'tracks', file: 'track_straight_diagonal.png' },
    { name: 'Start Line', file: 'start.png' },
    { name: 'Start Position', file: 'start_position.png' },
    { name: 'Pit Marking', file: 'pit_marking.png' }]

  },
  tiles: {
    name: 'Ground Tiles',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'Grass Tile', folder: 'tiles', file: 'tile_grass.png' },
    { name: 'Sand Tile', folder: 'tiles', file: 'tile_sand.png' },
    { name: 'Tarmac Tile', folder: 'tiles', file: 'tile_tarmac.png' }]

  },
  obstacles: {
    name: 'Obstacles',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'Cone', folder: 'cones', file: 'cone.png' },
    { name: 'Cone Tipped', folder: 'cones', file: 'cone_tipped.png' },
    { name: 'Tyre Black', folder: 'tyres', file: 'tyre_black.png' },
    { name: 'Tyre Red', folder: 'tyres', file: 'tyre_red.png' },
    { name: 'Tyre White', folder: 'tyres', file: 'tyre_white.png' },
    { name: 'Wall Black', folder: 'walls', file: 'wall_black.png' },
    { name: 'Wall Red', folder: 'walls', file: 'wall_red.png' },
    { name: 'Wall White', folder: 'walls', file: 'wall_white.png' },
    { name: 'Fuel Barrel A', folder: 'fuel', file: 'fuel_barrel_a.png' },
    { name: 'Fuel Barrel B', folder: 'fuel', file: 'fuel_barrel_b.png' }]

  },
  cars: {
    name: 'Cars',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'Endurance Blue', folder: 'cars', file: 'endurance_blue.png' },
    { name: 'Endurance Red', folder: 'cars', file: 'endurance_red.png' },
    { name: 'Endurance Yellow', folder: 'cars', file: 'endurance_yellow.png' },
    { name: 'Endurance Purple', folder: 'cars', file: 'endurance_purple.png' },
    { name: 'Endurance White', folder: 'cars', file: 'endurance_white.png' },
    { name: 'Highspec Blue', folder: 'cars', file: 'highspec_blue.png' },
    { name: 'Highspec Red', folder: 'cars', file: 'highspec_red.png' },
    { name: 'Highspec Yellow', folder: 'cars', file: 'highspec_yellow.png' },
    { name: 'Highspec Purple', folder: 'cars', file: 'highspec_purple.png' },
    { name: 'Highspec White', folder: 'cars', file: 'highspec_white.png' },
    { name: 'Touring Blue', folder: 'cars', file: 'touring_blue.png' },
    { name: 'Touring Red', folder: 'cars', file: 'touring_red.png' },
    { name: 'Touring Yellow', folder: 'cars', file: 'touring_yellow.png' },
    { name: 'Touring Purple', folder: 'cars', file: 'touring_purple.png' },
    { name: 'Touring White', folder: 'cars', file: 'touring_white.png' },
    { name: 'Safety Blue', folder: 'cars', file: 'safety_blue.png' },
    { name: 'Safety Red', folder: 'cars', file: 'safety_red.png' },
    { name: 'Safety Green', folder: 'cars', file: 'safety_green.png' },
    { name: 'Safety Grey', folder: 'cars', file: 'safety_grey.png' },
    { name: 'Safety White', folder: 'cars', file: 'safety_white.png' },
    { name: 'Police', folder: 'cars', file: 'police.png' },
    { name: 'Wheel', folder: 'cars', file: 'wheel.png' }]

  },
  buildings: {
    name: 'Buildings',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'Building 1', folder: 'buildings', file: 'building.png' },
    { name: 'Building 2', folder: 'buildings', file: 'building2.png' },
    { name: 'Building 3', folder: 'buildings', file: 'building3.png' },
    { name: 'Billboard Blue', folder: 'billboards', file: 'billboard_blue.png' },
    { name: 'Billboard Yellow', folder: 'billboards', file: 'billboard_yellow.png' }]

  },
  houses: {
    name: 'Houses',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'House 1 Blue', folder: 'houses', file: 'house1_blue.png' },
    { name: 'House 1 Orange', folder: 'houses', file: 'house1_orange.png' },
    { name: 'House 1 Yellow', folder: 'houses', file: 'house1_yellow.png' },
    { name: 'House 2 Blue', folder: 'houses', file: 'house2_blue.png' },
    { name: 'House 2 Orange', folder: 'houses', file: 'house2_orange.png' },
    { name: 'House 2 Yellow', folder: 'houses', file: 'house2_yellow.png' },
    { name: 'House 3 Blue', folder: 'houses', file: 'house3_blue.png' },
    { name: 'House 3 Orange', folder: 'houses', file: 'house3_orange.png' },
    { name: 'House 3 Yellow', folder: 'houses', file: 'house3_yellow.png' }]

  },
  plants: {
    name: 'Plants & Trees',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'Tree A', folder: 'plants', file: 'tree_a.png' },
    { name: 'Tree B', folder: 'plants', file: 'tree_b.png' },
    { name: 'Tree C', folder: 'plants', file: 'tree_c.png' },
    { name: 'Cactus', folder: 'plants', file: 'cactus.png' },
    { name: 'Flower', folder: 'plants', file: 'flower.png' },
    { name: 'Plant', folder: 'plants', file: 'plant.png' },
    { name: 'Hedge A', folder: 'plants', file: 'hedge_a.png' },
    { name: 'Hedge B', folder: 'plants', file: 'hedge_b.png' },
    { name: 'Desert Tree A', folder: 'plants', file: 'desert_tree_a.png' },
    { name: 'Desert Tree B', folder: 'plants', file: 'desert_tree_b.png' },
    { name: 'Desert Plant A', folder: 'plants', file: 'desert_plant_a.png' },
    { name: 'Desert Plant B', folder: 'plants', file: 'desert_plant_b.png' }]

  },
  rocks: {
    name: 'Rocks',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'Rocks A', folder: 'rocks', file: 'rocks_a.png' },
    { name: 'Rocks B', folder: 'rocks', file: 'rocks_b.png' },
    { name: 'Desert Rocks A', folder: 'rocks', file: 'desert_rocks_a.png' },
    { name: 'Desert Rocks B', folder: 'rocks', file: 'desert_rocks_b.png' }]

  },
  chevrons: {
    name: 'Chevrons',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'Corner', folder: 'chevrons', file: 'corner.png' },
    { name: 'Round', folder: 'chevrons', file: 'round.png' },
    { name: 'Diagonal', folder: 'chevrons', file: 'straight_diagonal.png' }]

  },
  effects: {
    name: 'Effects',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'Oil Spill A', folder: 'oil', file: 'oil_spill_a.png' },
    { name: 'Oil Spill B', folder: 'oil', file: 'oil_spill_b.png' },
    { name: 'Oil Smear A', folder: 'oil', file: 'oil_smear_a.png' },
    { name: 'Oil Smear B', folder: 'oil', file: 'oil_smear_b.png' },
    { name: 'Tyre Mark A', folder: 'tyres', file: 'tyre_mark_a.png' },
    { name: 'Tyre Mark B', folder: 'tyres', file: 'tyre_mark_b.png' },
    { name: 'Tyre Mark C', folder: 'tyres', file: 'tyre_mark_c.png' },
    { name: 'Crack A', folder: 'cracks', file: 'crack_a.png' },
    { name: 'Crack B', folder: 'cracks', file: 'crack_b.png' },
    { name: 'Drain', file: 'drain.png' },
    { name: 'Pavement', file: 'decal_pavement.png' },
    { name: 'Sign', file: 'sign.png' },
    { name: 'Lamppost', folder: 'lights', file: 'lamppost.png' }]

  },
  lights: {
    name: 'Lights',
    path: '/assets/race/sprites/',
    assets: [
    { name: 'Lights', folder: 'lights', file: 'lights.png' },
    { name: 'Lights Green', folder: 'lights', file: 'lights_green_on.png' },
    { name: 'Lights Red', folder: 'lights', file: 'lights_red_on.png' }]

  }
};

// Show race map name input
function showRaceMapNameInput() {
  console.log('Opening race map name input...');

  const modal = document.createElement('div');
  modal.id = 'raceMapNameModal';
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
        background: linear-gradient(135deg, #1a2a3a 0%, #162636 100%);
        border: 3px solid #1a5a8c;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 0 30px rgba(26, 90, 140, 0.3);
    `;

  container.innerHTML = `
        <h2 style="color: #4a9ad9; margin-bottom: 10px;">🏎️ RACE MAP CREATOR</h2>
        <p style="color: #ccc; margin-bottom: 20px;">Create a racing track</p>
        <input 
            type="text" 
            id="raceMapNameInput" 
            placeholder="Enter map name..." 
            maxlength="30"
            style="
                width: 100%;
                padding: 12px;
                font-size: 16px;
                border: 2px solid #1a5a8c;
                border-radius: 8px;
                background: #0a1a2a;
                color: white;
                margin-bottom: 20px;
                outline: none;
            "
        />
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="raceCancelBtn" style="
                padding: 10px 20px;
                background: #666;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Cancel</button>
            <button id="raceCreateBtn" style="
                padding: 10px 20px;
                background: #1a5a8c;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">Create Race Map</button>
        </div>
    `;

  modal.appendChild(container);
  document.body.appendChild(modal);

  const input = document.getElementById('raceMapNameInput');
  input.focus();

  document.getElementById('raceCancelBtn').onclick = () => modal.remove();

  document.getElementById('raceCreateBtn').onclick = () => {
    const mapName = input.value.trim();
    if (!mapName) {
      alert('Please enter a map name!');
      return;
    }
    window.currentRaceMapName = mapName;
    window.currentMapVehicleType = 'race';
    modal.remove();
    startRaceMapEditor();
  };

  input.onkeypress = (e) => {
    if (e.key === 'Enter') {
      document.getElementById('raceCreateBtn').click();
    }
  };
}


// Start the race map editor
function startRaceMapEditor() {
  console.log('Starting race map editor for:', window.currentRaceMapName);

  // Hide other screens
  const createMapScreen = document.getElementById('createMapScreen');
  if (createMapScreen) createMapScreen.classList.add('hidden');

  // Create race map editor container
  createRaceMapEditorUI();
}

// Create the race map editor UI
function createRaceMapEditorUI() {
  // Remove existing editor if any
  const existingEditor = document.getElementById('raceMapCreator');
  if (existingEditor) existingEditor.remove();

  const editor = document.createElement('div');
  editor.id = 'raceMapCreator';
  editor.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1a1a0a;
        z-index: 9999;
        display: flex;
    `;

  editor.innerHTML = `
        <!-- Main Canvas Area -->
        <div style="flex: 1; position: relative; overflow: hidden;">
            <canvas id="raceMapCanvas" style="
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
                background: rgba(20, 40, 60, 0.9);
                border: 2px solid #1a5a8c;
                border-radius: 10px;
                padding: 10px 20px;
                display: flex;
                align-items: center;
                gap: 15px;
            ">
                <span style="color: #4a9ad9; font-weight: bold;">🏎️ ${window.currentRaceMapName || 'Race Map'}</span>
                <span style="color: #888;">|</span>
                <span id="raceObjectCount" style="color: #ccc;">Objects: 0</span>
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
                <button onclick="clearRaceMap()" style="
                    padding: 12px 25px;
                    background: #cc3333;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">🗑️ Clear</button>
                <button onclick="saveRaceMap()" style="
                    padding: 12px 25px;
                    background: #33cc33;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">💾 Save Map</button>
                <button onclick="closeRaceMapCreator()" style="
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
            <div id="raceAssetPanel" class="assets-panel minimized" style="
                position: absolute;
                right: 9px;
                top: 80px;
                width: 280px;
                max-height: calc(100vh - 180px);
                background: linear-gradient(180deg, rgba(20, 40, 60, 0.95) 0%, rgba(15, 30, 50, 0.95) 100%);
                border: 3px solid rgba(26, 90, 140, 0.4);
                border-radius: 0;
                overflow: hidden;
                backdrop-filter: blur(20px);
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(26, 90, 140, 0.2);
            ">
                <div class="assets-panel-header" id="raceEditorHeader" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(26, 90, 140, 0.3);
                    position: relative;
                    cursor: move;
                    user-select: none;
                ">
                    <h3 style="margin: 0; font-size: 22px; color: #4a9ad9; pointer-events: none;">Editor</h3>
                    <button class="minimize-btn" id="raceMinimizeBtn" onclick="toggleRaceAssetsPanel()" style="
                        width: 36px;
                        height: 36px;
                        background: rgba(26, 90, 140, 0.1);
                        border: 2px solid rgba(26, 90, 140, 0.4);
                        border-radius: 50%;
                        color: #4a9ad9;
                        font-size: 24px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s ease;
                    ">+</button>
                </div>
                
                <div class="assets-panel-content" id="raceAssetPanelContent" style="
                    padding: 20px;
                    max-height: calc(100vh - 280px);
                    overflow-y: auto;
                    opacity: 0;
                    max-height: 0;
                    transition: all 0.3s ease;
                ">
                    <!-- Category Tabs -->
                    <div id="raceCategoryTabs" style="
                        display: flex;
                        gap: 6px;
                        margin-bottom: 15px;
                        flex-wrap: wrap;
                    ">
                        <button class="race-category-btn active" data-category="track" onclick="switchRaceAssetCategory('track')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.2);
                            border: 2px solid rgba(26, 90, 140, 0.6);
                            color: #4a9ad9;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">🛣️ Track</button>
                        <button class="race-category-btn" data-category="tiles" onclick="switchRaceAssetCategory('tiles')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">🟩 Tiles</button>
                        <button class="race-category-btn" data-category="obstacles" onclick="switchRaceAssetCategory('obstacles')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">🚧 Obstacles</button>
                        <button class="race-category-btn" data-category="buildings" onclick="switchRaceAssetCategory('buildings')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">🏢 Buildings</button>
                        <button class="race-category-btn" data-category="decoration" onclick="switchRaceAssetCategory('decoration')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">🌳 Decor</button>
                        <button class="race-category-btn" data-category="chevrons" onclick="switchRaceAssetCategory('chevrons')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">⬆️ Chevrons</button>
                        <button class="race-category-btn" data-category="pickups" onclick="switchRaceAssetCategory('pickups')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">⚡ Pickups</button>
                        <button class="race-category-btn" data-category="effects" onclick="switchRaceAssetCategory('effects')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">💧 Effects</button>
                        <button class="race-category-btn" data-category="cars" onclick="switchRaceAssetCategory('cars')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">🚗 Cars</button>
                        <button class="race-category-btn" data-category="houses" onclick="switchRaceAssetCategory('houses')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">🏠 Houses</button>
                        <button class="race-category-btn" data-category="plants" onclick="switchRaceAssetCategory('plants')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">🌿 Plants</button>
                        <button class="race-category-btn" data-category="rocks" onclick="switchRaceAssetCategory('rocks')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">🪨 Rocks</button>
                        <button class="race-category-btn" data-category="lights" onclick="switchRaceAssetCategory('lights')" style="
                            flex: 1;
                            min-width: 60px;
                            padding: 6px 8px;
                            background: rgba(26, 90, 140, 0.1);
                            border: 2px solid rgba(26, 90, 140, 0.4);
                            color: rgba(255, 255, 255, 0.8);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 10px;
                            font-weight: 600;
                            transition: all 0.3s;
                        ">💡 Lights</button>
                    </div>
                    
                    <!-- Asset Grid -->
                    <div id="raceAssetGrid" style="
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
  initRaceMapCanvas();

  // Load initial assets
  loadRaceAssets('track');

  // Setup category tabs
  setupRaceCategoryTabs();

  // Setup draggable editor panel
  setupRaceEditorDrag();

  // Create minimap preview
  createRaceMinimap();

  // Load existing map data if editing
  if (window.currentRaceMapData) {
    loadRaceMapData(window.currentRaceMapData);
    window.currentRaceMapData = null; // Clear after loading
  }
}


// Initialize race map canvas
function initRaceMapCanvas() {
  const canvas = document.getElementById('raceMapCanvas');
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Center the camera
  raceCanvasOffsetX = canvas.width / 2;
  raceCanvasOffsetY = canvas.height / 2;
  raceTargetCanvasOffsetX = raceCanvasOffsetX;
  raceTargetCanvasOffsetY = raceCanvasOffsetY;

  const ctx = canvas.getContext('2d');

  // Initial background draw will happen in render loop

  // Setup event listeners
  canvas.addEventListener('click', handleRaceCanvasClick);
  canvas.addEventListener('wheel', handleRaceCanvasZoom);
  canvas.addEventListener('mousedown', handleRaceCanvasMouseDown);
  canvas.addEventListener('mousemove', handleRaceCanvasMouseMove);
  canvas.addEventListener('mouseup', handleRaceCanvasMouseUp);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // Add keyboard controls for WASD panning
  window.addEventListener('keydown', handleRaceKeyDown);
  window.addEventListener('keyup', handleRaceKeyUp);

  // Start render loop
  requestAnimationFrame(renderRaceMap);

  // Start panning loop for smooth keyboard movement
  startRacePanningLoop();
}

// Pre-generated grass blades for consistent background
let raceGrassBlades = [];
let raceGrassGenerated = false;

// Generate grass blades once
function generateRaceGrass() {
  if (raceGrassGenerated) return;
  raceGrassBlades = [];
  // Generate grass in a large area for scrolling
  for (let i = 0; i < 800; i++) {
    raceGrassBlades.push({
      x: (Math.random() - 0.5) * 8000,
      y: (Math.random() - 0.5) * 8000,
      width: 2 + Math.random() * 2,
      height: 6 + Math.random() * 10,
      shade: Math.random() * 0.15
    });
  }
  raceGrassGenerated = true;
}

// Draw grass/track background with camera offset
function drawRaceMapBackground(ctx, canvas, cameraX, cameraY, zoom) {
  // Green grass gradient (fixed to screen)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#2d5a27');
  gradient.addColorStop(0.5, '#3d7a37');
  gradient.addColorStop(1, '#2d5a27');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grass blades that move with camera
  generateRaceGrass();

  ctx.save();
  ctx.translate(canvas.width / 2 + cameraX, canvas.height / 2 + cameraY);
  ctx.scale(zoom, zoom);

  raceGrassBlades.forEach((blade) => {
    ctx.fillStyle = `rgba(0, 50, 0, ${0.1 + blade.shade})`;
    ctx.fillRect(blade.x, blade.y, blade.width, blade.height);
  });

  ctx.restore();
}

// Map boundary radius (world units)
const RACE_MAP_RADIUS = 3000;

// Render race map
function renderRaceMap() {
  const canvas = document.getElementById('raceMapCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Clear and draw background with camera offset
  drawRaceMapBackground(ctx, canvas, raceCanvasOffsetX, raceCanvasOffsetY, raceCanvasZoom);

  // Draw placed objects and boundary
  ctx.save();
  ctx.translate(canvas.width / 2 + raceCanvasOffsetX, canvas.height / 2 + raceCanvasOffsetY);
  ctx.scale(raceCanvasZoom, raceCanvasZoom);

  // Draw circular boundary/fence
  ctx.strokeStyle = '#1a3a5c';
  ctx.lineWidth = 8 / raceCanvasZoom;
  ctx.setLineDash([20 / raceCanvasZoom, 10 / raceCanvasZoom]);
  ctx.beginPath();
  ctx.arc(0, 0, RACE_MAP_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw inner glow
  ctx.strokeStyle = 'rgba(26, 58, 92, 0.3)';
  ctx.lineWidth = 20 / raceCanvasZoom;
  ctx.beginPath();
  ctx.arc(0, 0, RACE_MAP_RADIUS - 15, 0, Math.PI * 2);
  ctx.stroke();

  // Draw grid for all asset placement when any asset is selected
  if (raceSelectedAsset) {
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.2)';
    ctx.lineWidth = 1 / raceCanvasZoom;

    // Calculate visible grid range
    const viewLeft = (-canvas.width / 2 - raceCanvasOffsetX) / raceCanvasZoom;
    const viewRight = (canvas.width / 2 - raceCanvasOffsetX) / raceCanvasZoom;
    const viewTop = (-canvas.height / 2 - raceCanvasOffsetY) / raceCanvasZoom;
    const viewBottom = (canvas.height / 2 - raceCanvasOffsetY) / raceCanvasZoom;

    const startX = Math.floor(viewLeft / RACE_GRID_SIZE) * RACE_GRID_SIZE;
    const endX = Math.ceil(viewRight / RACE_GRID_SIZE) * RACE_GRID_SIZE;
    const startY = Math.floor(viewTop / RACE_GRID_SIZE) * RACE_GRID_SIZE;
    const endY = Math.ceil(viewBottom / RACE_GRID_SIZE) * RACE_GRID_SIZE;

    // Draw vertical lines
    for (let x = startX; x <= endX; x += RACE_GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, Math.max(startY, -RACE_MAP_RADIUS));
      ctx.lineTo(x, Math.min(endY, RACE_MAP_RADIUS));
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += RACE_GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(Math.max(startX, -RACE_MAP_RADIUS), y);
      ctx.lineTo(Math.min(endX, RACE_MAP_RADIUS), y);
      ctx.stroke();
    }
  }

  racePlacedObjects.forEach((obj) => {
    if (obj.image && obj.image.complete) {
      ctx.drawImage(obj.image, obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
    }
  });

  // Draw preview of selected asset at mouse position
  if (raceIsHovering && raceSelectedAsset && !raceIsDragging) {
    // Load preview image if not cached
    if (!raceSelectedAsset.previewImage) {
      raceSelectedAsset.previewImage = new Image();
      raceSelectedAsset.previewImage.src = raceSelectedAsset.path;
    }

    const previewImg = raceSelectedAsset.previewImage;
    if (previewImg.complete && previewImg.naturalWidth > 0) {
      const width = previewImg.naturalWidth;
      const height = previewImg.naturalHeight;

      // Check if placement would be duplicate
      const isDuplicate = checkDuplicatePlacement(racePreviewX, racePreviewY, raceSelectedAsset);

      ctx.save();
      ctx.globalAlpha = isDuplicate ? 0.3 : 0.6;
      ctx.drawImage(previewImg, racePreviewX - width / 2, racePreviewY - height / 2, width, height);

      // Draw outline - red if duplicate, cyan if valid
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = isDuplicate ? '#ff4444' : '#00f7ff';
      ctx.lineWidth = 3 / raceCanvasZoom;
      ctx.strokeRect(racePreviewX - width / 2, racePreviewY - height / 2, width, height);

      // Show X mark if duplicate
      if (isDuplicate) {
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 4 / raceCanvasZoom;
        const size = Math.min(width, height) / 3;
        ctx.beginPath();
        ctx.moveTo(racePreviewX - size, racePreviewY - size);
        ctx.lineTo(racePreviewX + size, racePreviewY + size);
        ctx.moveTo(racePreviewX + size, racePreviewY - size);
        ctx.lineTo(racePreviewX - size, racePreviewY + size);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  ctx.restore();

  // Update object count
  const countEl = document.getElementById('raceObjectCount');
  if (countEl) countEl.textContent = `Objects: ${racePlacedObjects.length}`;

  requestAnimationFrame(renderRaceMap);
}

// Check if placing at this position would be a duplicate (overlapping same asset)
function checkDuplicatePlacement(x, y, asset) {
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

  for (const obj of racePlacedObjects) {
    // Check if same asset type
    if (obj.asset.name === asset.name && obj.asset.folder === asset.folder) {
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

// Grid size for snapping (all assets snap to grid for clean placement)
const RACE_GRID_SIZE = 32;

// All categories snap to grid for consistent placement
const GRID_SNAP_CATEGORIES = [
'track', 'tiles', 'obstacles', 'cars', 'buildings', 'houses',
'plants', 'rocks', 'chevrons', 'effects', 'lights'];


// Snap position to grid
function snapToGrid(x, y, gridSize) {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
}

// Handle canvas click
function handleRaceCanvasClick(e) {
  if (!raceSelectedAsset) return;
  if (raceIsDragging) return; // Don't place while dragging

  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Convert to world coordinates
  let worldX = (clickX - canvas.width / 2 - raceCanvasOffsetX) / raceCanvasZoom;
  let worldY = (clickY - canvas.height / 2 - raceCanvasOffsetY) / raceCanvasZoom;

  // Snap to grid for all assets
  const snapped = snapToGrid(worldX, worldY, RACE_GRID_SIZE);
  worldX = snapped.x;
  worldY = snapped.y;

  // Check for duplicate placement
  if (checkDuplicatePlacement(worldX, worldY, raceSelectedAsset)) {
    console.log('Duplicate placement prevented at:', worldX, worldY);
    return; // Don't place duplicate
  }

  // Create new object
  const img = new Image();
  img.src = raceSelectedAsset.path;
  img.onload = () => {
    racePlacedObjects.push({
      asset: raceSelectedAsset,
      image: img,
      x: worldX,
      y: worldY,
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    console.log('Placed object:', raceSelectedAsset.name, 'at', worldX, worldY);
  };
}

// Handle canvas zoom
function handleRaceCanvasZoom(e) {
  e.preventDefault();
  const canvas = document.getElementById('raceMapCanvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Calculate world position under mouse before zoom
  const worldX = (mouseX - canvas.width / 2 - raceCanvasOffsetX) / raceCanvasZoom;
  const worldY = (mouseY - canvas.height / 2 - raceCanvasOffsetY) / raceCanvasZoom;

  // Apply zoom with multiplier for smoother feel
  const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
  const newZoom = Math.max(0.1, Math.min(3, raceCanvasZoom * zoomDelta));

  // Calculate new offset to keep world position under mouse
  const newOffsetX = mouseX - canvas.width / 2 - worldX * newZoom;
  const newOffsetY = mouseY - canvas.height / 2 - worldY * newZoom;

  // Apply new values
  raceCanvasZoom = newZoom;
  raceTargetCanvasZoom = newZoom;
  raceCanvasOffsetX = newOffsetX;
  raceCanvasOffsetY = newOffsetY;
  raceTargetCanvasOffsetX = newOffsetX;
  raceTargetCanvasOffsetY = newOffsetY;
}

// Handle mouse down for panning
function handleRaceCanvasMouseDown(e) {
  if (e.button === 2 || e.button === 1) {
    raceIsDragging = true;
    raceDragStartX = e.clientX - raceCanvasOffsetX;
    raceDragStartY = e.clientY - raceCanvasOffsetY;
  }
}

// Preview state
let racePreviewX = 0;
let racePreviewY = 0;
let raceIsHovering = false;

// Handle mouse move for panning and preview
function handleRaceCanvasMouseMove(e) {
  const canvas = document.getElementById('raceMapCanvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Update preview position (world coordinates)
  let previewX = (mouseX - canvas.width / 2 - raceCanvasOffsetX) / raceCanvasZoom;
  let previewY = (mouseY - canvas.height / 2 - raceCanvasOffsetY) / raceCanvasZoom;

  // Snap to grid for all assets
  if (raceSelectedAsset) {
    const snapped = snapToGrid(previewX, previewY, RACE_GRID_SIZE);
    previewX = snapped.x;
    previewY = snapped.y;
  }

  racePreviewX = previewX;
  racePreviewY = previewY;
  raceIsHovering = true;

  if (raceIsDragging) {
    raceCanvasOffsetX = e.clientX - raceDragStartX;
    raceCanvasOffsetY = e.clientY - raceDragStartY;
  }
}

// Handle mouse up
function handleRaceCanvasMouseUp(e) {
  raceIsDragging = false;
}


// Setup category tabs
function setupRaceCategoryTabs() {
  const tabs = document.querySelectorAll('.race-category-btn');
  tabs.forEach((tab) => {
    tab.onclick = () => {
      tabs.forEach((t) => {
        t.style.background = '#333';
        t.style.color = 'white';
        t.classList.remove('active');
      });
      tab.style.background = '#1a5a8c';
      tab.style.color = 'white';
      tab.classList.add('active');
      loadRaceAssets(tab.dataset.category);
    };
  });
}

// Load race assets for category
function loadRaceAssets(category) {
  raceCurrentAssetCategory = category;
  const grid = document.getElementById('raceAssetGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const categoryData = raceAssetCategories[category];
  if (!categoryData) return;

  categoryData.assets.forEach((asset) => {
    const assetDiv = document.createElement('div');
    assetDiv.style.cssText = `
            background: #1a2a3a;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 8px;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease;
        `;

    // Build image path - support folder/file or direct file naming
    let imgPath;
    if (asset.folder && asset.file) {
      imgPath = categoryData.path + asset.folder + '/' + asset.file;
    } else if (asset.file) {
      imgPath = categoryData.path + asset.file;
    } else if (asset.folder) {
      imgPath = categoryData.path + asset.folder + '/' + asset.folder + '.png';
    } else {
      imgPath = categoryData.path + asset.name.toLowerCase().replace(/ /g, '_') + '.png';
    }

    assetDiv.innerHTML = `
            <img src="${imgPath}" style="
                max-width: 100%;
                max-height: 60px;
                object-fit: contain;
                background: rgba(0,0,0,0.3);
            " onerror="this.style.display='none'"/>
            <div style="color: #ccc; font-size: 10px; margin-top: 5px;">${asset.name}</div>
        `;

    assetDiv.onmouseenter = () => {
      assetDiv.style.borderColor = '#4a9ad9';
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
      assetDiv.style.borderColor = '#4a9ad9';
      assetDiv.classList.add('selected');

      raceSelectedAsset = {
        name: asset.name,
        path: imgPath,
        folder: asset.folder,
        category: category
      };
      console.log('Selected race asset:', raceSelectedAsset);
    };

    grid.appendChild(assetDiv);
  });
}

// Create minimap preview for race editor
function createRaceMinimap() {
  if (document.getElementById('raceMinimap')) return;

  const minimapContainer = document.createElement('div');
  minimapContainer.id = 'raceMinimap';
  minimapContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        width: 180px;
        height: 180px;
        background: rgba(20, 40, 60, 0.9);
        backdrop-filter: blur(15px);
        border-radius: 50%;
        border: 4px solid rgba(26, 58, 92, 0.8);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(26, 58, 92, 0.4);
        z-index: 99999;
        overflow: hidden;
    `;

  const minimapCanvas = document.createElement('canvas');
  minimapCanvas.id = 'raceMinimapCanvas';
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
  updateRaceMinimap();
}

// Pre-generated static grass for minimap
let raceMinimapGrass = [];

// Update race minimap
function updateRaceMinimap() {
  const canvas = document.getElementById('raceMinimapCanvas');
  const raceEditor = document.getElementById('raceMapCreator');
  if (!canvas || !raceEditor) return;

  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 85;

  // Clear with grass background
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, '#3d7a37');
  gradient.addColorStop(1, '#2d5a27');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Generate static grass once
  if (raceMinimapGrass.length === 0) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius * 0.9;
      raceMinimapGrass.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist
      });
    }
  }

  // Draw static grass texture on minimap
  ctx.fillStyle = 'rgba(0, 40, 0, 0.3)';
  raceMinimapGrass.forEach((blade) => {
    ctx.fillRect(blade.x, blade.y, 1, 4);
  });

  // Scale: minimap radius / world map radius
  const scale = radius / RACE_MAP_RADIUS;

  // Draw objects on minimap (dark blue color)
  racePlacedObjects.forEach((obj) => {
    const minimapX = centerX + obj.x * scale;
    const minimapY = centerY + obj.y * scale;
    const dist = Math.sqrt((minimapX - centerX) ** 2 + (minimapY - centerY) ** 2);
    if (dist < radius) {
      ctx.fillStyle = '#4a90d9';
      ctx.beginPath();
      ctx.arc(minimapX, minimapY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw border (dark blue) - this represents the map boundary
  ctx.strokeStyle = 'rgba(26, 90, 140, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  requestAnimationFrame(updateRaceMinimap);
}

// Clear race map






// Load race map data for editing
function loadRaceMapData(mapData) {
  console.log('Loading race map data:', mapData.name);
  racePlacedObjects = [];

  if (mapData.objects && mapData.objects.length > 0) {
    mapData.objects.forEach((objData) => {
      const img = new Image();
      // Migrate old paths to new structure
      const migratedPath = migrateRaceAssetPath(objData.path);
      img.src = migratedPath;
      img.onerror = () => console.warn('Failed to load race asset:', migratedPath);
      img.onload = () => {
        racePlacedObjects.push({
          asset: {
            name: objData.name,
            path: migratedPath,
            folder: objData.folder,
            category: objData.category
          },
          image: img,
          x: objData.x,
          y: objData.y,
          width: objData.width || img.naturalWidth || 100,
          height: objData.height || img.naturalHeight || 100
        });
      };
    });
  }

  // Update map ID for saving
  if (mapData.id) {
    window.currentRaceMapId = mapData.id;
  }
}

// Save race map





































// Close race map creator






















// Toggle race assets panel (like tank editor)












































// Setup draggable editor panel
function setupRaceEditorDrag() {
  const panel = document.getElementById('raceAssetPanel');
  const header = document.getElementById('raceEditorHeader');
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

// Keyboard controls for race editor panning
function handleRaceKeyDown(e) {
  const raceEditor = document.getElementById('raceMapCreator');
  if (!raceEditor) return;

  const key = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
    e.preventDefault();
    raceKeysPressed[key] = true;
  }
}

function handleRaceKeyUp(e) {
  const key = e.key.toLowerCase();
  raceKeysPressed[key] = false;
}

// Continuous panning loop for race editor
let racePanningLoopId = null;

function startRacePanningLoop() {
  if (racePanningLoopId) cancelAnimationFrame(racePanningLoopId);

  function panLoop() {
    const raceEditor = document.getElementById('raceMapCreator');
    if (!raceEditor) {
      racePanningLoopId = null;
      return;
    }

    let targetVelocityX = 0;
    let targetVelocityY = 0;

    if (raceKeysPressed['arrowup'] || raceKeysPressed['w']) {
      targetVelocityY = raceMaxSpeed;
    }
    if (raceKeysPressed['arrowdown'] || raceKeysPressed['s']) {
      targetVelocityY = -raceMaxSpeed;
    }
    if (raceKeysPressed['arrowleft'] || raceKeysPressed['a']) {
      targetVelocityX = raceMaxSpeed;
    }
    if (raceKeysPressed['arrowright'] || raceKeysPressed['d']) {
      targetVelocityX = -raceMaxSpeed;
    }

    if (targetVelocityX !== 0) {
      raceVelocityX += (targetVelocityX - raceVelocityX) * raceAcceleration * 0.1;
    } else {
      raceVelocityX *= raceFriction;
    }

    if (targetVelocityY !== 0) {
      raceVelocityY += (targetVelocityY - raceVelocityY) * raceAcceleration * 0.1;
    } else {
      raceVelocityY *= raceFriction;
    }

    if (Math.abs(raceVelocityX) > 0.1 || Math.abs(raceVelocityY) > 0.1) {
      raceCanvasOffsetX += raceVelocityX;
      raceCanvasOffsetY += raceVelocityY;
      raceTargetCanvasOffsetX = raceCanvasOffsetX;
      raceTargetCanvasOffsetY = raceCanvasOffsetY;
    }

    // Smooth zoom interpolation
    raceCanvasZoom += (raceTargetCanvasZoom - raceCanvasZoom) * 0.1;

    racePanningLoopId = requestAnimationFrame(panLoop);
  }

  panLoop();
}

// Close race map creator
function closeRaceMapCreator() {
  console.log('Closing race map creator...');
  const editor = document.getElementById('raceMapCreator');
  if (editor) {
    editor.remove();
  }
  
  // Clean up event listeners
  document.removeEventListener('keydown', handleRaceKeyDown);
  document.removeEventListener('keyup', handleRaceKeyUp);
  
  // Stop panning loop
  if (racePanningLoopId) {
    cancelAnimationFrame(racePanningLoopId);
    racePanningLoopId = null;
  }
  
  console.log('✅ Race map creator closed');
}

// Save race map function
function saveRaceMap() {
  console.log('Saving race map...');
  
  if (!window.currentRaceMapName) {
    alert('No map name specified!');
    return;
  }
  
  try {
    // Get placed objects (if they exist)
    const mapData = {
      name: window.currentRaceMapName,
      vehicleType: 'race',
      objects: window.racePlacedObjects || [],
      created: Date.now(),
      version: '1.0'
    };
    
    // Save to localStorage
    const existingMaps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    
    // Check if map already exists
    const existingIndex = existingMaps.findIndex(map => map.name === window.currentRaceMapName);
    
    if (existingIndex >= 0) {
      // Update existing map
      existingMaps[existingIndex] = mapData;
    } else {
      // Add new map
      existingMaps.push(mapData);
    }
    
    localStorage.setItem('thefortz.customMaps', JSON.stringify(existingMaps));
    
    console.log('✅ Race map saved successfully:', window.currentRaceMapName);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification(`Race map "${window.currentRaceMapName}" saved!`, 'success');
    } else {
      alert(`Race map "${window.currentRaceMapName}" saved successfully!`);
    }
    
  } catch (error) {
    console.error('❌ Error saving race map:', error);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Error saving race map!', 'error');
    } else {
      alert('Error saving race map!');
    }
  }
}

// Clear race map function
function clearRaceMap() {
  console.log('Clearing race map...');
  
  if (confirm('Are you sure you want to clear the map? This cannot be undone.')) {
    // Clear placed objects
    if (window.racePlacedObjects) {
      window.racePlacedObjects = [];
    }
    
    // Clear canvas if it exists
    const canvas = document.getElementById('raceMapCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    console.log('✅ Race map cleared');
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Race map cleared!', 'info');
    }
  }
}

// Make functions globally available
window.showRaceMapNameInput = showRaceMapNameInput;
window.startRaceMapEditor = startRaceMapEditor;
window.closeRaceMapCreator = closeRaceMapCreator;
window.saveRaceMap = saveRaceMap;
window.clearRaceMap = clearRaceMap;

// Toggle race assets panel function
function toggleRaceAssetsPanel() {
  console.log('Toggling race assets panel...');
  
  const panel = document.getElementById('raceAssetPanel');
  if (panel) {
    if (panel.classList.contains('minimized')) {
      panel.classList.remove('minimized');
      console.log('✅ Race assets panel expanded');
    } else {
      panel.classList.add('minimized');
      console.log('✅ Race assets panel minimized');
    }
  } else {
    console.warn('⚠️ Race assets panel not found');
  }
}

// Switch race asset category function
function switchRaceAssetCategory(category) {
  console.log('Switching race asset category to:', category);
  
  // Update active button
  const buttons = document.querySelectorAll('.race-category-btn');
  buttons.forEach(btn => {
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Load assets for category (if loadRaceAssets function exists)
  if (typeof loadRaceAssets === 'function') {
    loadRaceAssets(category);
  } else {
    console.log('✅ Switched to race category:', category);
  }
}

window.toggleRaceAssetsPanel = toggleRaceAssetsPanel;
window.switchRaceAssetCategory = switchRaceAssetCategory;