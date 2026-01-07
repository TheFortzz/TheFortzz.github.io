// Enhanced Tank Map Creator with improved UI and functionality
class TankMapCreatorEnhanced {
    constructor() {
        this.selectedAsset = null;
        this.placedObjects = [];
        this.currentTool = 'select';
        this.gridSize = 32;
        this.showGrid = true;
        this.mapSize = { width: 1024, height: 768 };
        this.camera = { x: 0, y: 0, zoom: 1 };
        
        this.assetCategories = {
            terrain: {
                name: 'TERRAIN',
                icon: '🌍',
                color: '#4CAF50',
                assets: this.getTerrainAssets()
            },
            buildings: {
                name: 'BUILDINGS',
                icon: '🏘️',
                color: '#8B4513',
                assets: this.getBuildingAssets()
            },
            tanks: {
                name: 'TANKS',
                icon: '🚛',
                color: '#2196F3',
                assets: this.getTankAssets()
            },
            obstacles: {
                name: 'OBSTACLES',
                icon: '🧱',
                color: '#FF5722',
                assets: this.getObstacleAssets()
            },
            powerups: {
                name: 'POWER-UPS',
                icon: '⚡',
                color: '#FFEB3B',
                assets: this.getPowerUpAssets()
            },
            spawns: {
                name: 'SPAWNS',
                icon: '🎯',
                color: '#E91E63',
                assets: this.getSpawnAssets()
            }
        };
    }

    getTerrainAssets() {
        return [
            { name: 'Water', file: 'water.png', type: 'water' },
            { name: 'Blue Grass', file: 'BlueGrass.png', type: 'grass' },
            { name: 'Green Grass', file: 'GreenGrass.png', type: 'grass' },
            { name: 'Brown Grass', file: 'BrownGrass.png', type: 'grass' },
            { name: 'Yellow Grass', file: 'YellowGrass.png', type: 'grass' },
            { name: 'Sand', file: 'Sand.png', type: 'sand' },
            { name: 'Light Sand', file: 'LightSand.png', type: 'sand' },
            { name: 'Brown Cobblestone', file: 'BrownCobblestone.png', type: 'stone' },
            { name: 'Gray Ground', file: 'GrayGround.png', type: 'stone' },
            { name: 'Wooden Planks', file: 'WoodenPlanks.png', type: 'wood' }
        ];
    }

    getBuildingAssets() {
        return [
            { name: 'House 01', folder: 'House_01', type: 'residential', lootbox: 100 },
            { name: 'House 02', folder: 'House_02', type: 'residential', lootbox: 100 },
            { name: 'Guard Tower', folder: 'Guard_Tower', type: 'military', lootbox: 200 },
            { name: 'Farm House', folder: 'Farm_House_01', type: 'farm', lootbox: 80 },
            { name: 'Shop', folder: 'Shop_01', type: 'commercial', lootbox: 120 },
            { name: 'Inn', folder: 'Inn', type: 'commercial', lootbox: 150 },
            { name: 'Wind Mill', folder: 'Wind_Mill', type: 'industrial', lootbox: 180 },
            { name: 'Tree', folder: 'Tree', type: 'nature', lootbox: 50 }
        ];
    }

    getTankAssets() {
        return [
            { name: 'Blue Tank', color: 'blue', armor: 120, damage: 60, speed: 40 },
            { name: 'Red Tank', color: 'red', armor: 100, damage: 80, speed: 45 },
            { name: 'Camo Tank', color: 'camo', armor: 140, damage: 55, speed: 35 },
            { name: 'Desert Tank', color: 'desert', armor: 110, damage: 70, speed: 42 },
            { name: 'Purple Tank', color: 'purple', armor: 130, damage: 65, speed: 38 }
        ];
    }

    getObstacleAssets() {
        return [
            { name: 'Concrete Barrier', type: 'barrier_concrete', lootbox: 150, destructible: true },
            { name: 'Steel Wall', type: 'barrier_steel', lootbox: 250, destructible: true },
            { name: 'Sandbags', type: 'barrier_sand', lootbox: 80, destructible: true },
            { name: 'Tank Trap', type: 'trap_spikes', lootbox: 120, destructible: true },
            { name: 'Mine Field', type: 'mines', lootbox: 1, destructible: true },
            { name: 'Oil Barrel', type: 'barrel_explosive', lootbox: 30, destructible: true }
        ];
    }

    getPowerUpAssets() {
        return [
            { name: 'Armor Boost', type: 'armor', effect: '+50 Armor', duration: 30 },
            { name: 'Damage Boost', type: 'damage', effect: '+25 Damage', duration: 20 },
            { name: 'Speed Boost', type: 'speed', effect: '+30% Speed', duration: 15 },
            { name: 'Rapid Fire', type: 'firerate', effect: '2x Fire Rate', duration: 10 },
            { name: 'Lootbox', type: 'lootbox', effect: 'Random Rewards', duration: 0 },
            { name: 'Ammo Crate', type: 'ammo', effect: 'Full Ammo', duration: 0 }
        ];
    }

    getSpawnAssets() {
        return [
            { name: 'Player Spawn', type: 'player_spawn', team: 'neutral' },
            { name: 'Team A Spawn', type: 'team_spawn', team: 'blue' },
            { name: 'Team B Spawn', type: 'team_spawn', team: 'red' },
            { name: 'Objective Point', type: 'objective', team: 'neutral' },
            { name: 'Control Point', type: 'control_point', team: 'neutral' }
        ];
    }

    createEnhancedUI() {
        const container = document.createElement('div');
        container.id = 'enhancedMapCreator';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a0a, #1a1a2e);
            z-index: 5000;
            display: flex;
            flex-direction: column;
        `;

        // Top toolbar
        const toolbar = this.createToolbar();
        container.appendChild(toolbar);

        // Main content area
        const mainArea = document.createElement('div');
        mainArea.style.cssText = `
            flex: 1;
            display: flex;
            overflow: hidden;
        `;

        // Left sidebar (assets)
        const sidebar = this.createSidebar();
        mainArea.appendChild(sidebar);

        // Canvas area
        const canvasArea = this.createCanvasArea();
        mainArea.appendChild(canvasArea);

        // Right panel (properties)
        const propertiesPanel = this.createPropertiesPanel();
        mainArea.appendChild(propertiesPanel);

        container.appendChild(mainArea);

        // Bottom status bar
        const statusBar = this.createStatusBar();
        container.appendChild(statusBar);

        return container;
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.style.cssText = `
            height: 60px;
            background: linear-gradient(90deg, #1e3c72, #2a5298);
            border-bottom: 2px solid #00f7ff;
            display: flex;
            align-items: center;
            padding: 0 20px;
            gap: 15px;
        `;

        const tools = [
            { id: 'select', icon: '🖱️', name: 'Select', shortcut: 'V' },
            { id: 'paint', icon: '🖌️', name: 'Paint', shortcut: 'B' },
            { id: 'erase', icon: '🧽', name: 'Erase', shortcut: 'E' },
            { id: 'move', icon: '✋', name: 'Move', shortcut: 'M' },
            { id: 'rotate', icon: '🔄', name: 'Rotate', shortcut: 'R' }
        ];

        tools.forEach(tool => {
            const button = document.createElement('button');
            button.style.cssText = `
                padding: 8px 12px;
                background: ${this.currentTool === tool.id ? '#00f7ff' : 'rgba(255,255,255,0.1)'};
                border: 2px solid ${this.currentTool === tool.id ? '#00f7ff' : 'rgba(255,255,255,0.2)'};
                color: ${this.currentTool === tool.id ? '#000' : '#fff'};
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
            `;

            button.innerHTML = `
                <span style="font-size: 16px;">${tool.icon}</span>
                <span style="font-size: 10px;">${tool.name}</span>
            `;

            button.onclick = () => this.setTool(tool.id);
            toolbar.appendChild(button);
        });

        // Separator
        const separator = document.createElement('div');
        separator.style.cssText = 'width: 2px; height: 40px; background: rgba(255,255,255,0.2); margin: 0 10px;';
        toolbar.appendChild(separator);

        // Grid toggle
        const gridToggle = document.createElement('button');
        gridToggle.innerHTML = `📐 Grid: ${this.showGrid ? 'ON' : 'OFF'}`;
        gridToggle.style.cssText = `
            padding: 8px 12px;
            background: ${this.showGrid ? '#4CAF50' : 'rgba(255,255,255,0.1)'};
            border: 2px solid ${this.showGrid ? '#4CAF50' : 'rgba(255,255,255,0.2)'};
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
        `;
        gridToggle.onclick = () => this.toggleGrid();
        toolbar.appendChild(gridToggle);

        return toolbar;
    }

    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.style.cssText = `
            width: 300px;
            background: linear-gradient(180deg, #16213e, #0f1419);
            border-right: 2px solid #00f7ff;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        // Category tabs
        const categoryTabs = document.createElement('div');
        categoryTabs.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            padding: 10px;
            gap: 5px;
            border-bottom: 1px solid rgba(0,247,255,0.3);
        `;

        Object.entries(this.assetCategories).forEach(([key, category]) => {
            const tab = document.createElement('button');
            tab.style.cssText = `
                flex: 1;
                min-width: 80px;
                padding: 8px 4px;
                background: linear-gradient(135deg, ${category.color}20, ${category.color}10);
                border: 1px solid ${category.color}60;
                color: ${category.color};
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
                font-weight: bold;
                text-align: center;
                transition: all 0.3s;
            `;

            tab.innerHTML = `
                <div style="font-size: 14px;">${category.icon}</div>
                <div>${category.name}</div>
            `;

            tab.onclick = () => this.showCategory(key);
            categoryTabs.appendChild(tab);
        });

        sidebar.appendChild(categoryTabs);

        // Assets container
        const assetsContainer = document.createElement('div');
        assetsContainer.id = 'assetsContainer';
        assetsContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 15px;
        `;

        sidebar.appendChild(assetsContainer);

        return sidebar;
    }

    createCanvasArea() {
        const canvasArea = document.createElement('div');
        canvasArea.style.cssText = `
            flex: 1;
            position: relative;
            background: #000;
            overflow: hidden;
        `;

        const canvas = document.createElement('canvas');
        canvas.id = 'tankMapCanvas';
        canvas.width = this.mapSize.width;
        canvas.height = this.mapSize.height;
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            cursor: crosshair;
        `;

        canvasArea.appendChild(canvas);

        // Add canvas event listeners
        this.setupCanvasEvents(canvas);

        return canvasArea;
    }

    createPropertiesPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            width: 250px;
            background: linear-gradient(180deg, #16213e, #0f1419);
            border-left: 2px solid #00f7ff;
            padding: 20px;
            overflow-y: auto;
        `;

        panel.innerHTML = `
            <h3 style="color: #00f7ff; margin: 0 0 15px 0;">Properties</h3>
            <div id="propertiesContent" style="color: white;">
                <p style="color: rgba(255,255,255,0.6); font-size: 14px;">
                    Select an object to view its properties
                </p>
            </div>
        `;

        return panel;
    }

    createStatusBar() {
        const statusBar = document.createElement('div');
        statusBar.style.cssText = `
            height: 30px;
            background: linear-gradient(90deg, #1e3c72, #2a5298);
            border-top: 1px solid #00f7ff;
            display: flex;
            align-items: center;
            padding: 0 20px;
            font-size: 12px;
            color: white;
            justify-content: space-between;
        `;

        statusBar.innerHTML = `
            <div>Objects: <span id="objectCount">0</span></div>
            <div>Tool: <span id="currentTool">${this.currentTool}</span></div>
            <div>Zoom: <span id="zoomLevel">${Math.round(this.camera.zoom * 100)}%</span></div>
        `;

        return statusBar;
    }

    setupCanvasEvents(canvas) {
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
            
            this.handleCanvasClick(lastX, lastY);
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (isDrawing && this.currentTool === 'paint') {
                this.handleCanvasPaint(x, y);
            }
            
            this.updateCursor(x, y);
        });

        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
        });
    }

    setTool(toolId) {
        this.currentTool = toolId;
        document.getElementById('currentTool').textContent = toolId;
        this.updateToolbar();
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.render();
    }

    showCategory(categoryKey) {
        const category = this.assetCategories[categoryKey];
        const container = document.getElementById('assetsContainer');
        
        container.innerHTML = '';
        
        category.assets.forEach(asset => {
            const assetElement = this.createAssetElement(asset, category);
            container.appendChild(assetElement);
        });
    }

    createAssetElement(asset, category) {
        const element = document.createElement('div');
        element.style.cssText = `
            background: linear-gradient(135deg, ${category.color}15, ${category.color}08);
            border: 2px solid ${category.color}40;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s;
        `;

        element.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 20px;">${category.icon}</div>
                <div>
                    <div style="color: ${category.color}; font-weight: bold; font-size: 14px;">${asset.name}</div>
                    <div style="color: rgba(255,255,255,0.6); font-size: 11px;">
                        ${this.getAssetDescription(asset)}
                    </div>
                </div>
            </div>
        `;

        element.onclick = () => this.selectAsset(asset, category);
        
        element.onmouseenter = () => {
            element.style.background = `linear-gradient(135deg, ${category.color}25, ${category.color}15)`;
            element.style.borderColor = category.color;
            element.style.transform = 'translateY(-2px)';
        };
        
        element.onmouseleave = () => {
            element.style.background = `linear-gradient(135deg, ${category.color}15, ${category.color}08)`;
            element.style.borderColor = `${category.color}40`;
            element.style.transform = 'translateY(0)';
        };

        return element;
    }

    getAssetDescription(asset) {
        if (asset.lootbox) return `Lootbox: ${asset.lootbox}`;
        if (asset.effect) return asset.effect;
        if (asset.armor) return `Armor: ${asset.armor} | Damage: ${asset.damage}`;
        return asset.type || 'Asset';
    }

    selectAsset(asset, category) {
        this.selectedAsset = { ...asset, category: category };
        this.updatePropertiesPanel();
    }

    updatePropertiesPanel() {
        const content = document.getElementById('propertiesContent');
        if (!this.selectedAsset) {
            content.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No asset selected</p>';
            return;
        }

        const asset = this.selectedAsset;
        content.innerHTML = `
            <div style="color: white;">
                <h4 style="color: #00f7ff; margin: 0 0 10px 0;">${asset.name}</h4>
                <div style="font-size: 12px; line-height: 1.6;">
                    ${Object.entries(asset).map(([key, value]) => 
                        key !== 'name' && key !== 'category' ? 
                        `<div><strong>${key}:</strong> ${value}</div>` : ''
                    ).join('')}
                </div>
            </div>
        `;
    }

    handleCanvasClick(x, y) {
        if (this.currentTool === 'select') {
            // If we have a selected asset (like a building), place it instead of selecting
            if (this.selectedAsset) {
                this.placeAsset(x, y);
            } else {
                this.selectObjectAt(x, y);
            }
        } else if (this.currentTool === 'paint' && this.selectedAsset) {
            this.placeAsset(x, y);
        }
    }

    selectObjectAt(x, y) {
        // Find object at position
        const clickedObject = this.placedObjects.find(obj => {
            const dx = obj.x - x;
            const dy = obj.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < 20; // 20 pixel hit radius
        });

        if (clickedObject) {
            this.selectedAsset = clickedObject.asset;
            this.updatePropertiesPanel();
            console.log('Selected object:', clickedObject.asset.name);
        } else {
            this.selectedAsset = null;
            this.updatePropertiesPanel();
        }

        this.render();
    }

    placeAsset(x, y) {
        if (!this.selectedAsset) return;

        const gridX = Math.floor(x / this.gridSize) * this.gridSize;
        const gridY = Math.floor(y / this.gridSize) * this.gridSize;

        const newObject = {
            id: Date.now(),
            asset: this.selectedAsset,
            x: this.showGrid ? gridX : x,
            y: this.showGrid ? gridY : y,
            rotation: 0
        };

        this.placedObjects.push(newObject);
        this.updateObjectCount();
        this.render();
    }

    updateObjectCount() {
        document.getElementById('objectCount').textContent = this.placedObjects.length;
    }

    render() {
        const canvas = document.getElementById('tankMapCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        if (this.showGrid) {
            this.drawGrid(ctx, canvas);
        }
        
        // Draw placed objects
        this.placedObjects.forEach(obj => {
            this.drawObject(ctx, obj);
        });
    }

    drawGrid(ctx, canvas) {
        ctx.strokeStyle = 'rgba(0, 247, 255, 0.2)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < canvas.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < canvas.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    drawObject(ctx, obj) {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);
        
        // Draw placeholder rectangle for now
        ctx.fillStyle = obj.asset.category.color || '#00f7ff';
        ctx.fillRect(-16, -16, 32, 32);
        
        // Draw object name
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(obj.asset.name, 0, -20);
        
        ctx.restore();
    }

    updateToolbar() {
        // Update toolbar button states
        const buttons = document.querySelectorAll('#enhancedMapCreator button');
        buttons.forEach(button => {
            if (button.textContent.includes(this.currentTool)) {
                button.style.background = '#00f7ff';
                button.style.borderColor = '#00f7ff';
                button.style.color = '#000';
            } else {
                button.style.background = 'rgba(255,255,255,0.1)';
                button.style.borderColor = 'rgba(255,255,255,0.2)';
                button.style.color = '#fff';
            }
        });
    }

    handleCanvasPaint(x, y) {
        // Continuous painting for terrain
        if (this.selectedAsset && this.selectedAsset.category.name === 'TERRAIN') {
            this.placeAsset(x, y);
        }
    }

    updateCursor(x, y) {
        const canvas = document.getElementById('tankMapCanvas');
        if (!canvas) return;

        if (this.selectedAsset) {
            canvas.style.cursor = 'crosshair';
        } else {
            canvas.style.cursor = 'default';
        }
    }

    handleZoom(delta) {
        this.camera.zoom = Math.max(0.1, Math.min(3, this.camera.zoom + delta));
        document.getElementById('zoomLevel').textContent = Math.round(this.camera.zoom * 100) + '%';
        this.render();
    }

    init() {
        const ui = this.createEnhancedUI();
        document.body.appendChild(ui);

        // Show terrain category by default
        this.showCategory('terrain');

        // Start rendering
        this.render();
    }
}

// Initialize enhanced map creator
window.TankMapCreatorEnhanced = TankMapCreatorEnhanced;