// Create Map System - Simplified (View Only)
let createMapAnimationId = null;

// Debug function to test map creator directly
function debugMapCreator() {
    console.log('🔧 DEBUG: Testing map creator directly...');
    
    // Set required globals
    window.currentMapName = 'Debug Map';
    window.selectedMapVehicleType = 'tank';
    window.currentMapId = null;
    
    // Clear any existing data
    if (typeof placedObjects !== 'undefined') placedObjects = [];
    if (typeof customGroundTiles !== 'undefined') customGroundTiles.clear();
    
    // Start the map editor directly
    startMapEditor('tank');
}

// Make it globally available
window.debugMapCreator = debugMapCreator;
window.showVehicleTypeSelection = showVehicleTypeSelection;

// Debug function to test canvas directly
function testCanvasDirectly() {
    console.log('🧪 Testing canvas directly...');
    
    const blankCreator = document.getElementById('blankMapCreator');
    const canvas = document.getElementById('mapCreatorCanvas');
    
    console.log('blankMapCreator found:', !!blankCreator);
    console.log('mapCreatorCanvas found:', !!canvas);
    
    if (blankCreator) {
        // Force show the container
        document.body.appendChild(blankCreator);
        blankCreator.style.cssText = `
            display: block !important;
            visibility: visible !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 99999 !important;
            background: #ff0000 !important;
            opacity: 1 !important;
        `;
        console.log('✅ Forced blankMapCreator visible with red background');
    }
    
    if (canvas) {
        canvas.style.cssText = `
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 1 !important;
            width: 80% !important;
            height: 80% !important;
            margin: 10% !important;
            background: #00ff00 !important;
        `;
        
        // Draw something on canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
            canvas.width = 800;
            canvas.height = 600;
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CANVAS TEST', canvas.width/2, canvas.height/2);
        }
        console.log('✅ Forced canvas visible with test content');
    }
}

window.testCanvasDirectly = testCanvasDirectly;

const MAP_BUTTONS = [
    { id: 'created-map', name: 'Created Maps', color: '#00f7ff', icon: '🗺️' },
    { id: 'analyze', name: 'Analytics', color: '#FFD700', icon: '📊' }
];

let selectedButton = 'created-map';

let createdMaps = [];
let hoveredMapIndex = -1;
let mapCardAnimations = [];

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

// Map creator state
let isInMapCreator = false;

function startCreateMapRendering() {
    if (createMapAnimationId) return;

    const canvas = document.getElementById('tankLobbyBackground');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Add click event listener to canvas for create map interactions
    canvas.removeEventListener('click', handleMapCreatorClick); // Remove existing listener if any
    canvas.addEventListener('click', handleMapCreatorClick);
    console.log('✅ Added click listener to lobby canvas');

    // Create HTML overlay buttons
    createInteractiveElements();
    setupAssetSearchFocusHandling();

    function renderCreateMap() {
        if (window.gameState.isInLobby && window.gameState.showCreateMap) {
            const time = Date.now() * 0.001;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // If in map creator, show blank screen
            if (isInMapCreator) {
                renderBlankMapCreator(ctx, canvas, time);
                createMapAnimationId = requestAnimationFrame(renderCreateMap);
                return;
            }

            // Modern gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, 'rgba(5, 10, 25, 0.98)');
            gradient.addColorStop(0.5, 'rgba(10, 15, 35, 0.98)');
            gradient.addColorStop(1, 'rgba(15, 20, 40, 0.98)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Animated grid pattern
            ctx.strokeStyle = 'rgba(0, 247, 255, 0.08)';
            ctx.lineWidth = 1;
            const gridSize = 50;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Animated accent lines
            for (let i = 0; i < 3; i++) {
                const x = (canvas.width * (i * 0.33 + time * 0.015)) % canvas.width;
                ctx.strokeStyle = `rgba(0, 247, 255, ${0.15 + Math.sin(time * 2 + i) * 0.1})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            if (typeof window.drawCloseButton === 'function') {
                window.drawCloseButton(ctx, canvas);
            }

            // Header section with title
            ctx.font = 'bold 48px Arial';
            ctx.fillStyle = '#00f7ff';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(0, 247, 255, 0.5)';
            ctx.fillText('Map Gallery', canvas.width / 2, 70);
            ctx.shadowBlur = 0;

            // Subtitle
            ctx.font = '18px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('Browse and Explore Custom Battle Arenas', canvas.width / 2, 105);

            // Tab navigation bar
            const tabBarY = 150;
            const tabWidth = 220;
            const tabHeight = 60;
            const tabGap = 20;
            const totalTabWidth = (tabWidth * MAP_BUTTONS.length) + (tabGap * (MAP_BUTTONS.length - 1));
            const tabStartX = (canvas.width - totalTabWidth) / 2;

            if (!window.createMapClickAreas) window.createMapClickAreas = {};

            MAP_BUTTONS.forEach((button, i) => {
                const isSelected = selectedButton === button.id;

                const currentTabWidth = isSelected ? tabWidth + 20 : tabWidth;
                const currentTabHeight = isSelected ? tabHeight + 10 : tabHeight;

                const x = tabStartX + i * (tabWidth + tabGap) - (isSelected ? 10 : 0);
                const y = tabBarY - (isSelected ? 5 : 0);

                const mouseOver = window.gameState.mouse &&
                    window.gameState.mouse.x >= x && window.gameState.mouse.x <= x + currentTabWidth &&
                    window.gameState.mouse.y >= y && window.gameState.mouse.y <= y + currentTabHeight;

                ctx.save();

                // Animated glow pulse
                const glowIntensity = isSelected ? Math.sin(time * 2) * 0.3 + 0.7 : 1;

                // Tab shadow for depth
                if (isSelected) {
                    ctx.shadowBlur = 30 * glowIntensity;
                    ctx.shadowColor = button.color + '80';
                    ctx.shadowOffsetY = 10;
                }

                // Tab background with gradient
                if (isSelected) {
                    const tabGradient = ctx.createLinearGradient(x, y, x, y + currentTabHeight);
                    tabGradient.addColorStop(0, `${button.color}40`);
                    tabGradient.addColorStop(1, `${button.color}20`);
                    ctx.fillStyle = tabGradient;
                } else if (mouseOver) {
                    const hoverGradient = ctx.createLinearGradient(x, y, x, y + currentTabHeight);
                    hoverGradient.addColorStop(0, 'rgba(40, 60, 90, 0.9)');
                    hoverGradient.addColorStop(1, 'rgba(30, 50, 70, 0.8)');
                    ctx.fillStyle = hoverGradient;
                } else {
                    ctx.fillStyle = 'rgba(20, 30, 50, 0.7)';
                }

                // Rounded rectangle for tab
                const radius = 12;
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + currentTabWidth - radius, y);
                ctx.quadraticCurveTo(x + currentTabWidth, y, x + currentTabWidth, y + radius);
                ctx.lineTo(x + currentTabWidth, y + currentTabHeight - radius);
                ctx.quadraticCurveTo(x + currentTabWidth, y + currentTabHeight, x + currentTabWidth - radius, y + currentTabHeight);
                ctx.lineTo(x + radius, y + currentTabHeight);
                ctx.quadraticCurveTo(x, y + currentTabHeight, x, y + currentTabHeight - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;

                // Tab border with animated glow
                ctx.strokeStyle = isSelected ? button.color : (mouseOver ? 'rgba(100, 150, 200, 0.6)' : 'rgba(80, 100, 130, 0.4)');
                ctx.lineWidth = isSelected ? 3 : 2;
                if (isSelected || mouseOver) {
                    ctx.shadowBlur = 15 * glowIntensity;
                    ctx.shadowColor = button.color;
                }
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Animated tab indicator
                if (isSelected) {
                    const indicatorY = y + currentTabHeight + 8;
                    const indicatorSize = 6 + Math.sin(time * 3) * 2;

                    ctx.fillStyle = button.color;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = button.color;
                    ctx.beginPath();
                    ctx.arc(x + currentTabWidth / 2, indicatorY, indicatorSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                // Tab icon
                ctx.font = '24px Arial';
                ctx.fillStyle = isSelected ? button.color : 'rgba(200, 220, 240, 0.8)';
                ctx.textAlign = 'center';
                ctx.fillText(button.icon, x + 30, y + currentTabHeight / 2 + 8);

                // Tab text
                ctx.font = isSelected ? 'bold 22px Arial' : 'bold 18px Arial';
                ctx.fillStyle = isSelected ? button.color : 'rgba(200, 220, 240, 0.8)';
                ctx.textAlign = 'center';
                if (isSelected) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = button.color;
                }
                ctx.fillText(button.name, x + currentTabWidth / 2 + 15, y + currentTabHeight / 2 + 7);
                ctx.shadowBlur = 0;

                ctx.restore();

                // Store click area
                window.createMapClickAreas[`tab_${button.id}`] = {
                    x, y, width: currentTabWidth, height: currentTabHeight,
                    action: () => { selectedButton = button.id; }
                };
            });

            // Content area separator line
            const separatorY = tabBarY + tabHeight + 30;
            ctx.strokeStyle = 'rgba(0, 247, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(100, separatorY);
            ctx.lineTo(canvas.width - 100, separatorY);
            ctx.stroke();

            // Render content based on selected tab
            if (selectedButton === 'created-map') {
                renderCreatedMapsView(ctx, canvas, time, separatorY + 40);
            } else if (selectedButton === 'analyze') {
                renderAnalyzeView(ctx, canvas, time, separatorY + 40);
            }

            createMapAnimationId = requestAnimationFrame(renderCreateMap);
        } else {
            createMapAnimationId = null;
        }
    }

    renderCreateMap();
}

function renderCreatedMapsView(ctx, canvas, time, startY) {
    const contentY = startY;
    const mapBoxWidth = 300;
    const mapBoxHeight = 200;
    const gap = 40;
    const columns = 3;

    // Section title
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#00f7ff';
    ctx.textAlign = 'center';
    ctx.fillText('Custom Battle Arenas', canvas.width / 2, contentY - 10);

    // Map count badge
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'rgba(0, 247, 255, 0.8)';
    const badgeText = `${createdMaps.length} ${createdMaps.length === 1 ? 'Map' : 'Maps'} Available`;
    ctx.fillText(badgeText, canvas.width / 2, contentY + 15);

    if (!window.createMapClickAreas) window.createMapClickAreas = {};

    // Initialize animations for new maps
    while (mapCardAnimations.length < createdMaps.length) {
        mapCardAnimations.push({
            floatOffset: Math.random() * Math.PI * 2,
            scale: 1,
            targetScale: 1
        });
    }

    // Position Create New button on the left
    const startX = 100;

    // Render existing maps with floating animation
    createdMaps.forEach((map, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const baseX = startX + col * (mapBoxWidth + gap);
        const baseY = contentY + 50 + row * (mapBoxHeight + gap);

        // Floating animation
        const anim = mapCardAnimations[index];
        anim.floatOffset += 0.02;
        const floatY = Math.sin(anim.floatOffset) * 8;

        const x = baseX;
        const y = baseY + floatY;

        const mouseOver = window.gameState.mouse &&
            window.gameState.mouse.x >= baseX && window.gameState.mouse.x <= baseX + mapBoxWidth &&
            window.gameState.mouse.y >= baseY && window.gameState.mouse.y <= baseY + mapBoxHeight;

        // Update hover state
        if (mouseOver) {
            hoveredMapIndex = index;
            anim.targetScale = 1.05;
        } else if (hoveredMapIndex === index && !mouseOver) {
            hoveredMapIndex = -1;
            anim.targetScale = 1;
        }

        // Smooth scale transition
        anim.scale += (anim.targetScale - anim.scale) * 0.1;

        ctx.save();

        // Apply scale transform
        ctx.translate(x + mapBoxWidth / 2, y + mapBoxHeight / 2);
        ctx.scale(anim.scale, anim.scale);
        ctx.translate(-(x + mapBoxWidth / 2), -(y + mapBoxHeight / 2));

        // Enhanced shadow with glow
        if (mouseOver) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = 'rgba(0, 247, 255, 0.6)';
            ctx.shadowOffsetY = 12;
        } else {
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowOffsetY = 5;
        }

        // Animated gradient background
        const gradientOffset = Math.sin(time + index * 0.5) * 0.1;
        const cardGradient = ctx.createLinearGradient(x, y, x, y + mapBoxHeight);
        cardGradient.addColorStop(0, mouseOver ? `rgba(0, 80, 120, ${0.95 + gradientOffset})` : 'rgba(20, 35, 60, 0.9)');
        cardGradient.addColorStop(1, mouseOver ? `rgba(0, 60, 100, ${0.85 + gradientOffset})` : 'rgba(15, 25, 45, 0.9)');
        ctx.fillStyle = cardGradient;

        const cardRadius = 12;
        ctx.beginPath();
        ctx.moveTo(x + cardRadius, y);
        ctx.lineTo(x + mapBoxWidth - cardRadius, y);
        ctx.quadraticCurveTo(x + mapBoxWidth, y, x + mapBoxWidth, y + cardRadius);
        ctx.lineTo(x + mapBoxWidth, y + mapBoxHeight - cardRadius);
        ctx.quadraticCurveTo(x + mapBoxWidth, y + mapBoxHeight, x + mapBoxWidth - cardRadius, y + mapBoxHeight);
        ctx.lineTo(x + cardRadius, y + mapBoxHeight);
        ctx.quadraticCurveTo(x, y + mapBoxHeight, x, y + mapBoxHeight - cardRadius);
        ctx.lineTo(x, y + cardRadius);
        ctx.quadraticCurveTo(x, y, x + cardRadius, y);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Animated border
        const borderPulse = Math.sin(time * 2 + index) * 0.2 + 0.8;
        ctx.strokeStyle = mouseOver ? '#00f7ff' : `rgba(0, 247, 255, ${0.4 * borderPulse})`;
        ctx.lineWidth = mouseOver ? 3 : 2;
        if (mouseOver) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00f7ff';
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Map header bar with shine effect
        const headerGradient = ctx.createLinearGradient(x, y, x + mapBoxWidth, y + 45);
        headerGradient.addColorStop(0, 'rgba(0, 247, 255, 0.15)');
        headerGradient.addColorStop(0.5, 'rgba(0, 247, 255, 0.25)');
        headerGradient.addColorStop(1, 'rgba(0, 247, 255, 0.15)');
        ctx.fillStyle = headerGradient;
        ctx.fillRect(x + 2, y + 2, mapBoxWidth - 4, 45);

        // Map icon
        ctx.font = '24px Arial';
        ctx.fillStyle = '#00f7ff';
        ctx.textAlign = 'left';
        ctx.fillText('🗺️', x + 15, y + 32);

        // Map name with glow
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#00f7ff';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 247, 255, 0.5)';
        ctx.fillText(map.name, x + mapBoxWidth / 2 + 10, y + 32);
        ctx.shadowBlur = 0;

        // Stats section with icons
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';

        // Players stat with pulse
        const playersPulse = Math.sin(time * 3) * 0.1 + 0.9;
        ctx.globalAlpha = playersPulse;
        ctx.fillText('👥 ' + map.players + ' playing', x + 20, y + 80);
        ctx.globalAlpha = 1;

        // Likes stat
        ctx.fillText('❤️ ' + map.likes + ' likes', x + 20, y + 110);

        // Creation date
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText('📅 ' + map.created, x + 20, y + 140);

        // Play button
        const playBtnY = y + mapBoxHeight - 45;
        const playBtnHeight = 35;
        const btnShine = Math.sin(time * 2 + index * 0.5) * 0.2 + 0.8;
        const playBtnGradient = ctx.createLinearGradient(x + 10, playBtnY, x + 10, playBtnY + playBtnHeight);
        playBtnGradient.addColorStop(0, `rgba(0, 247, 255, ${0.4 * btnShine})`);
        playBtnGradient.addColorStop(1, `rgba(0, 200, 220, ${0.3 * btnShine})`);
        ctx.fillStyle = playBtnGradient;

        const btnRadius = 8;
        ctx.beginPath();
        ctx.moveTo(x + 10 + btnRadius, playBtnY);
        ctx.lineTo(x + mapBoxWidth - 10 - btnRadius, playBtnY);
        ctx.quadraticCurveTo(x + mapBoxWidth - 10, playBtnY, x + mapBoxWidth - 10, playBtnY + btnRadius);
        ctx.lineTo(x + mapBoxWidth - 10, playBtnY + playBtnHeight - btnRadius);
        ctx.quadraticCurveTo(x + mapBoxWidth - 10, playBtnY + playBtnHeight, x + mapBoxWidth - 10 - btnRadius, playBtnY + playBtnHeight);
        ctx.lineTo(x + 10 + btnRadius, playBtnY + playBtnHeight);
        ctx.quadraticCurveTo(x + 10, playBtnY + playBtnHeight, x + 10, playBtnY + playBtnHeight - btnRadius);
        ctx.lineTo(x + 10, playBtnY + btnRadius);
        ctx.quadraticCurveTo(x + 10, playBtnY, x + 10 + btnRadius, playBtnY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = mouseOver ? '#00f7ff' : 'rgba(0, 247, 255, 0.6)';
        ctx.lineWidth = 2;
        if (mouseOver) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00f7ff';
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#00f7ff';
        ctx.textAlign = 'center';
        ctx.fillText('▶ PLAY MAP', x + mapBoxWidth / 2, playBtnY + 22);

        ctx.restore();

        // Store click area for play button
        window.createMapClickAreas[`play_map_${index}`] = {
            x: baseX + 10, y: baseY + mapBoxHeight - 45,
            width: mapBoxWidth - 20, height: 35,
            action: () => { console.log('Play map:', map.name); }
        };
    });

    // HTML button is used instead of canvas drawing
}

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

function setupAssetSearchFocusHandling() {
    const searchInput = document.getElementById('assetSearchInput');
    const canvas = document.getElementById('mapCreatorCanvas');
    const assetsPanel = document.getElementById('assetsPanel');
    
    const enableCapture = () => { 
        editorInputCaptured = true;
        console.log('🔒 Editor input captured - WASD disabled');
    };
    const disableCapture = () => { 
        editorInputCaptured = false;
        console.log('🔓 Editor input released - WASD enabled');
    };

    // Disable movement when clicking anywhere in the editor panel
    if (assetsPanel) {
        assetsPanel.addEventListener('mousedown', (e) => {
            enableCapture();
            e.stopPropagation();
        });
    }

    // Re-enable movement when clicking the canvas
    if (canvas) {
        canvas.addEventListener('mousedown', () => {
            disableCapture();
            if (searchInput) searchInput.blur();
        });
    }
    
    // Also handle focus/blur for search input
    if (searchInput) {
        searchInput.addEventListener('focus', enableCapture);
        searchInput.addEventListener('blur', disableCapture);
    }
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
let editorInputCaptured = false;

// Placed objects on the map
let placedObjects = [];

// Ground tile customization - store custom ground textures per tile
let customGroundTiles = new Map(); // key: "x,y", value: texture type

// Grid snapping for clean object placement
const TANK_GRID_SIZE = 32;
let tankGridSnapEnabled = true;

// Snap position to grid
function tankSnapToGrid(x, y, gridSize) {
    if (!tankGridSnapEnabled) return { x, y };
    return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
    };
}

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

// Show tank map name input (called when clicking CREATE from lobby with no maps)
function showTankMapNameInput() {
    console.log('Opening tank map name input...');

    const modal = document.createElement('div');
    modal.id = 'tankMapNameModal';
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
        border: 3px solid #0088ff;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 0 30px rgba(0, 136, 255, 0.3);
    `;

    container.innerHTML = `
        <h2 style="color: #0088ff; margin-bottom: 10px;">🚗 TANK MAP CREATOR</h2>
        <p style="color: #ccc; margin-bottom: 20px;">Create a tank battle arena</p>
        <input 
            type="text" 
            id="tankMapNameInput" 
            placeholder="Enter map name..." 
            maxlength="30"
            style="
                width: 100%;
                padding: 12px;
                font-size: 16px;
                border: 2px solid #0088ff;
                border-radius: 8px;
                background: #0a0a1a;
                color: white;
                margin-bottom: 20px;
                outline: none;
            "
        />
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="tankCancelBtn" style="
                padding: 10px 20px;
                background: #666;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Cancel</button>
            <button id="tankCreateBtn" style="
                padding: 10px 20px;
                background: #0088ff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">Create Tank Map</button>
        </div>
    `;

    modal.appendChild(container);
    document.body.appendChild(modal);

    const input = document.getElementById('tankMapNameInput');
    input.focus();

    document.getElementById('tankCancelBtn').onclick = () => modal.remove();

    document.getElementById('tankCreateBtn').onclick = () => {
        const mapName = input.value.trim();
        if (!mapName) {
            alert('Please enter a map name!');
            return;
        }
        
        console.log('🔧 Creating tank map:', mapName);
        
        // Clear previous map data
        window.currentMapId = null;
        if (typeof placedObjects !== 'undefined') {
            placedObjects = [];
        }
        if (typeof customGroundTiles !== 'undefined') {
            customGroundTiles.clear();
        }
        
        window.currentMapName = mapName;
        window.currentMapVehicleType = 'tank';
        modal.remove();
        
        // Try to start the editor
        try {
            startMapEditor('tank');
        } catch (error) {
            console.error('❌ Error starting map editor:', error);
            
            // Fallback: directly show the editor without complex loading
            console.log('🔧 Trying fallback editor initialization...');
            showMapEditorDirectly();
        }
    };

    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            document.getElementById('tankCreateBtn').click();
        }
    };
}

// Fallback function to directly show map editor
function showMapEditorDirectly() {
    console.log('🔧 Direct editor initialization...');
    
    // Hide lobby screen
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen) {
        lobbyScreen.classList.add('hidden');
        console.log('✅ Hidden lobby screen');
    }
    
    // Show createMapScreen
    const createMapScreen = document.getElementById('createMapScreen');
    if (createMapScreen) {
        createMapScreen.classList.remove('hidden');
        console.log('✅ Shown createMapScreen');
    }
    
    // Get and show blankMapCreator
    const blankCreator = document.getElementById('blankMapCreator');
    if (blankCreator) {
        // Move to body and show
        document.body.appendChild(blankCreator);
        blankCreator.classList.remove('hidden');
        blankCreator.style.display = 'block';
        blankCreator.style.position = 'fixed';
        blankCreator.style.top = '0';
        blankCreator.style.left = '0';
        blankCreator.style.width = '100vw';
        blankCreator.style.height = '100vh';
        blankCreator.style.zIndex = '9999';
        blankCreator.style.background = '#1a1a2e';
        
        console.log('✅ Shown blankMapCreator');
        
        // Hide top-bar when map creator opens
        document.body.classList.add('in-editor');
        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            topBar.style.display = 'none';
        }
        
        // Initialize canvas
        const canvas = document.getElementById('mapCreatorCanvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            console.log('✅ Canvas initialized');
        }
        
        // Show success message
        setTimeout(() => {
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Map editor opened for: ${window.currentMapName}`, 'success');
            } else {
                alert(`Map editor opened for: ${window.currentMapName}`);
            }
        }, 500);
        
    } else {
        console.error('❌ blankMapCreator element not found!');
        alert('Error: Map editor not found. Please refresh the page and try again.');
    }
}

// Make showTankMapNameInput globally available
window.showTankMapNameInput = showTankMapNameInput;

function openBlankMapCreator() {
    alert('openBlankMapCreator called!'); // Simple test
    console.log('Opening blank map creator...');
    
    // Skip all the complex logic and go straight to vehicle selection
    console.log('Going directly to vehicle selection...');
    showVehicleTypeSelection();
}

function showVehicleTypeSelection() {
    console.log('🚗 Showing vehicle type selection modal...');
    
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

    // Create selection container
    const container = document.createElement('div');
    container.style.cssText = `
        background: #1a2a3a;
        border: 3px solid #00f7ff;
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 500px;
        width: 90%;
    `;

    container.innerHTML = `
        <h2 style="color: #00f7ff; margin-bottom: 30px;">🚀 Select Vehicle Type</h2>
        <p style="color: #ccc; margin-bottom: 30px;">Choose the vehicle type for your map:</p>
        
        <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 30px;">
            <button class="vehicle-type-btn" data-vehicle="tank" style="
                padding: 20px;
                background: #0066cc;
                color: white;
                border: 3px solid #0088ff;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
                font-size: 16px;
                min-width: 120px;
                transition: all 0.3s ease;
            ">
                🚗 TANK
            </button>
            
            <button class="vehicle-type-btn" data-vehicle="jet" style="
                padding: 20px;
                background: #cc6600;
                color: white;
                border: 3px solid #ff8800;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
                font-size: 16px;
                min-width: 120px;
                transition: all 0.3s ease;
            ">
                ✈️ JET
            </button>
            
            <button class="vehicle-type-btn" data-vehicle="race" style="
                padding: 20px;
                background: #cc0066;
                color: white;
                border: 3px solid #ff0088;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
                font-size: 16px;
                min-width: 120px;
                transition: all 0.3s ease;
            ">
                🏎️ RACE
            </button>
        </div>
        
        <button id="cancelVehicleBtn" style="
            padding: 10px 20px;
            background: #666;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Cancel</button>
    `;

    modal.appendChild(container);
    document.body.appendChild(modal);

    // Add hover effects
    const vehicleBtns = container.querySelectorAll('.vehicle-type-btn');
    vehicleBtns.forEach(btn => {
        btn.onmouseenter = () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 0 20px rgba(0, 247, 255, 0.5)';
        };
        btn.onmouseleave = () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = 'none';
        };
        
        btn.onclick = () => {
            const vehicleType = btn.dataset.vehicle;
            window.selectedMapVehicleType = vehicleType;
            modal.remove();
            
            // Call the appropriate map creator based on vehicle type
            if (vehicleType === 'tank') {
                showMapNameInput(vehicleType);
            } else if (vehicleType === 'jet') {
                // Call jet map creator
                if (typeof showJetMapNameInput === 'function') {
                    showJetMapNameInput();
                } else {
                    alert('Jet map creator not loaded!');
                }
            } else if (vehicleType === 'race') {
                // Call race map creator
                if (typeof showRaceMapNameInput === 'function') {
                    showRaceMapNameInput();
                } else {
                    alert('Race map creator not loaded!');
                }
            }
        };
    });

    // Handle cancel
    document.getElementById('cancelVehicleBtn').onclick = () => {
        modal.remove();
    };
}

function showMapNameInput(vehicleType) {
    console.log('📝 Opening map name input for vehicle type:', vehicleType);

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

    const vehicleEmoji = vehicleType === 'tank' ? '🚗' : vehicleType === 'jet' ? '✈️' : '🏎️';
    const vehicleName = vehicleType.toUpperCase();

    container.innerHTML = `
        <h2 style="color: #00f7ff; margin-bottom: 10px;">🗺️ Name Your ${vehicleName} Map</h2>
        <p style="color: #ccc; margin-bottom: 20px;">${vehicleEmoji} Creating map for ${vehicleName} vehicles</p>
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
            <button id="backBtn" style="
                padding: 10px 20px;
                background: #666;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Back</button>
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

    // Wait for DOM to be ready, then attach event listeners
    setTimeout(() => {
        // Focus the input
        const input = document.getElementById('mapNameInput');
        if (input) {
            input.focus();
            console.log('✅ Input focused');
        } else {
            console.error('❌ Input not found');
        }

        // Handle back
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.onclick = () => {
                console.log('🔙 Back button clicked');
                modal.remove();
                showVehicleTypeSelection();
            };
            console.log('✅ Back button handler attached');
        } else {
            console.error('❌ Back button not found');
        }

        // Handle create
        const createBtn = document.getElementById('createBtn');
        if (createBtn) {
            createBtn.onclick = () => {
                console.log('🚀 Create button clicked!');
                const mapName = input.value.trim();
                console.log('📝 Map name:', mapName);
                
                if (!mapName) {
                    alert('Please enter a map name!');
                    return;
                }

                // Clear previous map data - IMPORTANT: prevents editing wrong map
                window.currentMapId = null; // New map gets new ID when saved
                if (typeof placedObjects !== 'undefined') placedObjects = []; // Clear placed objects from previous map
                if (typeof customGroundTiles !== 'undefined') customGroundTiles.clear(); // Clear custom ground tiles from previous map

                // Store map name and vehicle type, then open editor
                window.currentMapName = mapName;
                window.selectedMapVehicleType = vehicleType;
                console.log('💾 Stored:', mapName, vehicleType);
                
                modal.remove();
                console.log('🗑️ Modal removed');
                
                console.log('🚀 About to start map editor for:', mapName, vehicleType);
                
                // Add a small delay to ensure modal is removed
                setTimeout(() => {
                    console.log('⏰ Starting map editor...');
                    startMapEditor(vehicleType);
                }, 100);
            };
            console.log('✅ Create button handler attached');
        } else {
            console.error('❌ Create button not found');
        }

        // Handle Enter key
        if (input) {
            input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    console.log('⌨️ Enter key pressed');
                    const createBtn = document.getElementById('createBtn');
                    if (createBtn) {
                        createBtn.click();
                    }
                }
            };
            console.log('✅ Enter key handler attached');
        }
    }, 50); // Small delay to ensure DOM is ready
}

// Show map creator loading screen
function showMapCreatorLoading() {
    let loadingScreen = document.getElementById('mapCreatorLoadingScreen');
    if (!loadingScreen) {
        loadingScreen = document.createElement('div');
        loadingScreen.id = 'mapCreatorLoadingScreen';
        loadingScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        `;
        loadingScreen.innerHTML = `
            <div class="map-creator-loader" style="
                width: fit-content;
                font-size: 50px;
                font-family: monospace;
                font-weight: bold;
                text-transform: uppercase;
                color: transparent;
                -webkit-text-stroke: 2px #00f7ff;
                background: conic-gradient(#00f7ff 0 0) no-repeat text;
                background-size: 0% 100%;
                animation: mapLoadText 2s linear infinite;
            ">Loading Map</div>
            <div style="
                margin-top: 20px;
                font-size: 40px;
                color: #00f7ff;
                animation: dotPulse 1.5s ease-in-out infinite;
            ">...</div>
            <div class="map-creator-progress" style="
                width: 300px;
                height: 16px;
                margin-top: 30px;
                background: #333;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(0, 247, 255, 0.3);
            ">
                <div id="mapLoadProgress" style="
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(90deg, #00f7ff, #0088ff, #00f7ff);
                    background-size: 200% 100%;
                    animation: progressShine 1s linear infinite;
                    transition: width 0.3s ease;
                "></div>
            </div>
            <div id="mapLoadStatus" style="
                margin-top: 15px;
                color: #888;
                font-size: 14px;
            ">Initializing...</div>
        `;
        
        // Add keyframe animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes mapLoadText {
                0% { background-size: 0% 100%; }
                50% { background-size: 100% 100%; }
                100% { background-size: 0% 100%; }
            }
            @keyframes dotPulse {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            @keyframes progressShine {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(loadingScreen);
    }
    loadingScreen.style.display = 'flex';
}

// Update loading progress
function updateMapCreatorLoadingProgress(percent, status) {
    const progressBar = document.getElementById('mapLoadProgress');
    const statusText = document.getElementById('mapLoadStatus');
    if (progressBar) progressBar.style.width = percent + '%';
    if (statusText) statusText.textContent = status;
}

// Hide map creator loading screen
function hideMapCreatorLoading() {
    const loadingScreen = document.getElementById('mapCreatorLoadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.style.opacity = '1';
        }, 500);
    }
}

function startMapEditor(vehicleType = 'tank') {
    console.log('Starting map editor for:', window.currentMapName, 'Vehicle type:', vehicleType);

    // Show loading screen
    showMapCreatorLoading();
    updateMapCreatorLoadingProgress(10, 'Initializing editor...');

    // Store the vehicle type for the map
    window.currentMapVehicleType = vehicleType;

    // Hide the lobby top bar while the editor is active
    document.body.classList.add('in-editor');
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.style.display = 'none';
        topBar.style.visibility = 'hidden';
    }

    // Route to the correct editor based on vehicle type
    if (vehicleType === 'jet') {
        hideMapCreatorLoading();
        if (typeof window.startJetMapEditor === 'function') {
            window.currentJetMapName = window.currentMapName;
            window.startJetMapEditor();
            return;
        }
    } else if (vehicleType === 'race') {
        hideMapCreatorLoading();
        if (typeof window.startRaceMapEditor === 'function') {
            window.currentRaceMapName = window.currentMapName;
            window.startRaceMapEditor();
            return;
        }
    }

    updateMapCreatorLoadingProgress(20, 'Setting up canvas...');

    // Default: Tank editor
    // Hide lobby screen first
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen) {
        lobbyScreen.classList.add('hidden');
    }
    
    // Show createMapScreen (contains blankMapCreator)
    const createMapScreen = document.getElementById('createMapScreen');
    if (createMapScreen) {
        createMapScreen.classList.remove('hidden');
        // Hide the tabs and other content, only show blankMapCreator
        const tabsContainer = createMapScreen.querySelector('.tabs-container');
        if (tabsContainer) tabsContainer.style.display = 'none';
        const createdMapTab = document.getElementById('createdMapTab');
        if (createdMapTab) createdMapTab.classList.add('hidden');
        const analyzeTab = document.getElementById('analyzeTab');
        if (analyzeTab) analyzeTab.classList.add('hidden');
    }
    
    // Show blank creator - move it to body to avoid parent visibility issues
    const blankCreator = document.getElementById('blankMapCreator');
    if (blankCreator) {
        console.log('📦 Found blankMapCreator element:', blankCreator);
        console.log('   Current parent:', blankCreator.parentElement?.id);
        console.log('   Current classes:', blankCreator.className);
        console.log('   Current display:', window.getComputedStyle(blankCreator).display);
        
        // Move blankMapCreator to body so it's not affected by parent visibility
        document.body.appendChild(blankCreator);
        console.log('📦 Moved blankMapCreator to body');
        
        // Force remove all hiding classes and styles
        blankCreator.classList.remove('hidden');
        blankCreator.className = blankCreator.className.replace(/hidden/g, '');
        blankCreator.style.cssText = `
            display: block !important;
            visibility: visible !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 99999 !important;
            background: #1a1a2e !important;
            opacity: 1 !important;
        `;
        console.log('✅ blankMapCreator styled and shown');
        console.log('   New display:', window.getComputedStyle(blankCreator).display);
        console.log('   New visibility:', window.getComputedStyle(blankCreator).visibility);
        
        // Hide the createMapScreen close button when in editor
        const createMapCloseBtn = document.getElementById('createMapCloseBtn');
        if (createMapCloseBtn) {
            createMapCloseBtn.style.display = 'none';
        }
        
        // Update the title to show vehicle type
        updateMapCreatorTitle(vehicleType);
        
        // Force canvas to be visible too
        const canvas = document.getElementById('mapCreatorCanvas');
        if (canvas) {
            console.log('🎨 Found canvas element:', canvas);
            console.log('   Canvas parent:', canvas.parentElement?.id);
            console.log('   Canvas current display:', window.getComputedStyle(canvas).display);
            
            canvas.style.cssText = `
                display: block !important;
                visibility: visible !important;
                position: relative !important;
                z-index: 1 !important;
                width: 100% !important;
                height: 100% !important;
            `;
            
            // Create plus cursor overlay
            createPlusCursorOverlay();
            
            console.log('✅ Canvas forced visible');
            console.log('   Canvas new display:', window.getComputedStyle(canvas).display);
            console.log('   Canvas dimensions:', canvas.offsetWidth, 'x', canvas.offsetHeight);
        } else {
            console.error('❌ mapCreatorCanvas not found inside blankMapCreator!');
        }
    } else {
        console.error('❌ blankMapCreator element not found!');
    }

    // Hide game minimap if it exists
    const gameMinimap = document.getElementById('minimap');
    if (gameMinimap) {
        gameMinimap.style.display = 'none';
    }

    // Reset zoom to start
    canvasZoom = 0.5;
    targetCanvasZoom = 0.5;
    window.canvasZoom = 0.5;

    // Load ground textures first, then continue
    updateMapCreatorLoadingProgress(25, 'Loading ground textures...');
    
    loadCustomGroundTexture().then(() => {
        updateMapCreatorLoadingProgress(60, 'Initializing canvas...');
        
        try {
            // Initialize map creator canvas
            initMapCreatorCanvas();
            
            setTimeout(() => {
                updateMapCreatorLoadingProgress(70, 'Loading building assets...');
                
                try {
                    // Create zoom slider
                    createZoomSlider();
                    
                    setTimeout(() => {
                        updateMapCreatorLoadingProgress(80, 'Loading assets...');
                        
                        try {
                            // Load initial assets
                            loadAssetsForVehicleType(vehicleType);
                            
                            setTimeout(() => {
                                updateMapCreatorLoadingProgress(90, 'Setting up controls...');
                                
                                try {
                                    // Setup draggable editor panel
                                    setupTankEditorDrag();
                                    
                                    setTimeout(() => {
                                        updateMapCreatorLoadingProgress(100, 'Ready!');
                                        
                                        // Hide loading screen after a brief moment
                                        setTimeout(() => {
                                            hideMapCreatorLoading();
                                            console.log('✅ Map creator fully loaded and ready!');
                                        }, 300);
                                    }, 100);
                                } catch (e) {
                                    console.error('❌ Error setting up controls:', e);
                                    hideMapCreatorLoading();
                                }
                            }, 100);
                        } catch (e) {
                            console.error('❌ Error loading assets:', e);
                            hideMapCreatorLoading();
                        }
                    }, 100);
                } catch (e) {
                    console.error('❌ Error creating zoom slider:', e);
                    hideMapCreatorLoading();
                }
            }, 100);
        } catch (e) {
            console.error('❌ Error initializing canvas:', e);
            hideMapCreatorLoading();
        }
    }).catch((e) => {
        console.error('❌ Error loading ground textures:', e);
        hideMapCreatorLoading();
    });
}

function updateMapCreatorTitle(vehicleType) {
    // Find the title element in the map creator
    const titleElement = document.querySelector('#blankMapCreator h2, #blankMapCreator .map-creator-title');
    if (titleElement) {
        const vehicleEmoji = vehicleType === 'tank' ? '🚗' : vehicleType === 'jet' ? '✈️' : '🏎️';
        const vehicleName = vehicleType.toUpperCase();
        titleElement.textContent = `${vehicleEmoji} ${vehicleName} Map Creator - ${window.currentMapName}`;
        titleElement.style.color = vehicleType === 'tank' ? '#0088ff' : vehicleType === 'jet' ? '#ff8800' : '#ff0088';
    }
}

function loadAssetsForVehicleType(vehicleType) {
    console.log('Loading assets for vehicle type:', vehicleType);
    
    // For now, all vehicle types use the same assets (buildings and grounds)
    // In the future, you could customize assets per vehicle type
    loadAssets(currentAssetCategory);
    
    // Add vehicle type indicator to the interface
    addVehicleTypeIndicator(vehicleType);
}

function addVehicleTypeIndicator(vehicleType) {
    // Remove existing indicator if any
    const existingIndicator = document.getElementById('vehicleTypeIndicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Get the current map name
    const mapName = window.currentMapName || 'Untitled Map';
    
    // Create new indicator - positioned at bottom center
    const indicator = document.createElement('div');
    indicator.id = 'vehicleTypeIndicator';
    indicator.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${vehicleType === 'tank' ? '#0066cc' : vehicleType === 'jet' ? '#cc6600' : '#cc0066'};
        color: white;
        padding: 12px 25px;
        border-radius: 10px;
        font-weight: bold;
        font-size: 16px;
        z-index: 1000;
        border: 2px solid ${vehicleType === 'tank' ? '#0088ff' : vehicleType === 'jet' ? '#ff8800' : '#ff0088'};
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const vehicleEmoji = vehicleType === 'tank' ? '🚗' : vehicleType === 'jet' ? '✈️' : '🏎️';
    indicator.innerHTML = `${vehicleEmoji} <span id="mapNameDisplay">${mapName}</span> <span style="opacity: 0.6; font-size: 12px;">✏️ click to rename</span>`;
    
    // Add hover effect
    indicator.onmouseenter = () => {
        indicator.style.background = vehicleType === 'tank' ? '#0077dd' : vehicleType === 'jet' ? '#dd7700' : '#dd0077';
        indicator.style.transform = 'translateX(-50%) scale(1.05)';
    };
    indicator.onmouseleave = () => {
        indicator.style.background = vehicleType === 'tank' ? '#0066cc' : vehicleType === 'jet' ? '#cc6600' : '#cc0066';
        indicator.style.transform = 'translateX(-50%) scale(1)';
    };
    
    // Add click handler to rename map
    indicator.onclick = () => {
        showRenameMapDialog(vehicleType);
    };
    
    document.body.appendChild(indicator);
}

// Function to show rename map dialog
function showRenameMapDialog(vehicleType) {
    const currentName = window.currentMapName || 'Untitled Map';
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'renameMapModal';
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
    
    const container = document.createElement('div');
    container.style.cssText = `
        background: #1a2a3a;
        border: 3px solid ${vehicleType === 'tank' ? '#0088ff' : vehicleType === 'jet' ? '#ff8800' : '#ff0088'};
        border-radius: 15px;
        padding: 30px;
        text-align: center;
        max-width: 400px;
        width: 90%;
    `;
    
    container.innerHTML = `
        <h2 style="color: ${vehicleType === 'tank' ? '#0088ff' : vehicleType === 'jet' ? '#ff8800' : '#ff0088'}; margin-bottom: 20px;">✏️ Rename Map</h2>
        <input 
            type="text" 
            id="renameMapInput" 
            value="${currentName}"
            placeholder="Enter new map name..." 
            maxlength="30"
            style="
                width: 100%;
                padding: 15px;
                font-size: 18px;
                border: 2px solid #333;
                border-radius: 8px;
                background: #0a1520;
                color: white;
                margin-bottom: 20px;
                box-sizing: border-box;
            "
        />
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="cancelRenameBtn" style="
                padding: 12px 30px;
                background: #444;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
            ">Cancel</button>
            <button id="confirmRenameBtn" style="
                padding: 12px 30px;
                background: ${vehicleType === 'tank' ? '#0066cc' : vehicleType === 'jet' ? '#cc6600' : '#cc0066'};
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
            ">Rename</button>
        </div>
    `;
    
    modal.appendChild(container);
    document.body.appendChild(modal);
    
    // Focus input and select all text
    const input = document.getElementById('renameMapInput');
    input.focus();
    input.select();
    
    // Handle Enter key
    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            confirmRename();
        } else if (e.key === 'Escape') {
            modal.remove();
        }
    };
    
    // Cancel button
    document.getElementById('cancelRenameBtn').onclick = () => {
        modal.remove();
    };
    
    // Confirm button
    document.getElementById('confirmRenameBtn').onclick = confirmRename;
    
    function confirmRename() {
        const newName = input.value.trim();
        if (!newName) {
            alert('Please enter a map name!');
            return;
        }
        
        // Update the map name
        window.currentMapName = newName;
        
        // Update the indicator display
        const mapNameDisplay = document.getElementById('mapNameDisplay');
        if (mapNameDisplay) {
            mapNameDisplay.textContent = newName;
        }
        
        console.log('✅ Map renamed to:', newName);
        modal.remove();
    }
    
    // Close on background click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Create zoom slider dynamically
function createZoomSlider() {
    // Check if slider already exists
    if (document.getElementById('mapCreatorZoomSlider')) {
        console.log('Zoom slider already exists');
        return;
    }

    console.log('Creating zoom slider...');

    // Create the slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.id = 'mapCreatorZoomSlider';
    sliderContainer.className = 'map-creator-zoom-slider';
    sliderContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;
        pointer-events: auto;
    `;

    // Create the track
    const track = document.createElement('div');
    track.className = 'map-zoom-slider-track';
    track.style.cssText = `
        position: relative;
        width: 250px;
        height: 10px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 0;
        border: 3px solid rgba(100, 150, 255, 0.8);
    `;

    // Create the fill
    const fill = document.createElement('div');
    fill.id = 'mapZoomSliderFill';
    fill.className = 'map-zoom-slider-fill';
    fill.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #6496ff, #5080dc);
        border-radius: 0;
        pointer-events: none;
        z-index: 2;
    `;

    // Create the input
    const input = document.createElement('input');
    input.type = 'range';
    input.id = 'mapZoomSlider';
    input.className = 'map-zoom-slider';
    input.min = '0.3';
    input.max = '4';
    input.step = '0.1';
    input.value = '0.5';
    input.style.cssText = `
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
    `;

    // Create the thumb
    const thumb = document.createElement('div');
    thumb.id = 'mapZoomSliderThumb';
    thumb.className = 'map-zoom-slider-thumb';
    thumb.style.cssText = `
        position: absolute;
        top: 50%;
        left: 0%;
        transform: translate(-50%, -50%);
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #6496ff, #5080dc);
        border: 4px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 25px rgba(100, 150, 255, 1), 0 4px 10px rgba(0, 0, 0, 0.7);
        pointer-events: none;
        z-index: 3;
        transition: left 0.1s ease;
    `;

    // Assemble the slider
    track.appendChild(fill);
    track.appendChild(input);
    track.appendChild(thumb);
    sliderContainer.appendChild(track);

    // Add to body (not to blankMapCreator to avoid z-index issues)
    document.body.appendChild(sliderContainer);

    console.log('✅ Zoom slider created and added to body!');

    // Set initial zoom display to 50%
    const zoomDisplay = document.getElementById('zoomDisplay');
    if (zoomDisplay) {
        zoomDisplay.textContent = '50%';
    }

    // Add event listener for slider input
    input.addEventListener('input', function (e) {
        const zoomValue = parseFloat(e.target.value);

        // Update target zoom for smooth interpolation
        targetCanvasZoom = zoomValue;

        // Update slider visuals
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const percentage = ((zoomValue - min) / (max - min)) * 100;

        fill.style.width = percentage + '%';
        thumb.style.left = percentage + '%';

        // Update zoom display
        if (zoomDisplay) {
            zoomDisplay.textContent = Math.round(zoomValue * 100) + '%';
        }

        console.log('Zoom target changed to:', zoomValue);
    });

    console.log('✅ Zoom slider event listener attached!');

    // Create minimap viewer
    createMinimapViewer();
}

// Create minimap viewer dynamically
function createMinimapViewer() {
    // Check if minimap already exists
    if (document.getElementById('mapCreatorMinimap')) {
        console.log('Minimap already exists');
        return;
    }

    console.log('Creating minimap viewer...');

    // Create the minimap container
    const minimapContainer = document.createElement('div');
    minimapContainer.id = 'mapCreatorMinimap';
    minimapContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        width: 180px;
        height: 180px;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(15px);
        border-radius: 50%;
        border: 4px solid rgba(100, 150, 255, 0.6);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(100, 150, 255, 0.3);
        z-index: 99999;
        pointer-events: auto;
        overflow: hidden;
    `;

    // Create minimap canvas
    const minimapCanvas = document.createElement('canvas');
    minimapCanvas.id = 'mapCreatorMinimapCanvas';
    minimapCanvas.width = 180;
    minimapCanvas.height = 180;
    minimapCanvas.style.cssText = `
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 50%;
    `;

    // Assemble minimap
    minimapContainer.appendChild(minimapCanvas);

    // Add to body
    document.body.appendChild(minimapContainer);

    console.log('✅ Minimap viewer created!');

    // Start updating minimap
    updateMinimapViewer();

    // Create help button
    createHelpButton();
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

// Update minimap viewer
function updateMinimapViewer() {
    const canvas = document.getElementById('mapCreatorMinimapCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Draw ground tiles background - matching main canvas with circular boundary
    const mapRadiusPixels = 2500; // Same as main canvas map boundary
    const outerRadiusPixels = 2900; // Extended boundary for LightSand (40% smaller than before)
    const scale = width / (outerRadiusPixels * 2); // Scale to show full sand area
    const worldTileWidth = 120;
    const worldTileHeight = 30;
    const minimapTileWidth = worldTileWidth * scale;
    const minimapTileHeight = worldTileHeight * scale;

    // Calculate where screen center points to in world coordinates
    const mainCanvas = document.getElementById('mapCreatorCanvas');
    const screenCenterWorldX = mainCanvas ? (mainCanvas.width / 2 - canvasOffsetX) / canvasZoom : 0;
    const screenCenterWorldY = mainCanvas ? (mainCanvas.height / 2 - canvasOffsetY) / canvasZoom : 0;

    // Draw black background first (outside map area)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw ground PNG textures (textures should be loaded before map opens)
    // Calculate visible tile range around screen center (use outer radius for full sand area)
    const maxGridRange = Math.ceil(outerRadiusPixels / worldTileHeight);
    const startRow = Math.max(-maxGridRange, Math.floor((screenCenterWorldY - radius / scale) / worldTileHeight));
    const endRow = Math.min(maxGridRange, Math.ceil((screenCenterWorldY + radius / scale) / worldTileHeight));
    const startCol = Math.max(-maxGridRange, Math.floor((screenCenterWorldX - radius / scale) / worldTileWidth));
    const endCol = Math.min(maxGridRange, Math.ceil((screenCenterWorldX + radius / scale) / worldTileWidth));

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            // Calculate isometric position (same as main canvas)
            const isoX = col * worldTileWidth + (row % 2) * (worldTileWidth / 2);
            const isoY = row * worldTileHeight;

            // Check if within extended map boundary (world coordinates)
            const distFromMapCenter = Math.sqrt(isoX * isoX + isoY * isoY);
            if (distFromMapCenter > outerRadiusPixels) continue;

            // Convert world position to minimap position - tiles move relative to fixed center
            const minimapX = centerX + (isoX - screenCenterWorldX) * scale;
            const minimapY = centerY + (isoY - screenCenterWorldY) * scale;

            // Check if tile is within minimap circle
            const dist = Math.sqrt((minimapX - centerX) ** 2 + (minimapY - centerY) ** 2);
            if (dist < radius) {
                // Check if user placed custom ground tile
                const tileKey = `${col},${row}`;
                let groundType;

                if (typeof customGroundTiles !== 'undefined' && customGroundTiles.has(tileKey)) {
                    // Use custom ground tile placed by user
                    const customTile = customGroundTiles.get(tileKey);
                    groundType = customTile.type;
                } else {
                    // Use LightSand at edges, GreenGrass in center
                    if (distFromMapCenter > mapRadiusPixels * 0.85) {
                        groundType = 'LightSand';
                    } else {
                        groundType = 'GreenGrass';
                    }
                }

                const groundImg = groundTextureImages.get(groundType);
                if (groundImg && groundImg.complete) {
                    ctx.drawImage(groundImg, minimapX, minimapY, minimapTileWidth, minimapTileWidth * 0.6);
                }
            }
        }
    }

    // Draw placed objects on minimap - relative to screen center
    if (typeof placedObjects !== 'undefined') {
        placedObjects.forEach(obj => {
            if (obj.image && obj.image.complete && obj.image.naturalWidth > 0) {
                const objX = centerX + (obj.x - screenCenterWorldX) * scale;
                const objY = centerY + (obj.y - screenCenterWorldY) * scale;

                // Calculate scaled size for minimap (small version of building)
                const imgWidth = obj.image.naturalWidth * scale * 0.5; // 50% of actual scale
                const imgHeight = obj.image.naturalHeight * scale * 0.5;

                // Draw the building image on minimap
                ctx.save();
                ctx.globalAlpha = 0.8;
                ctx.drawImage(
                    obj.image,
                    objX - imgWidth / 2,
                    objY - imgHeight / 2,
                    imgWidth,
                    imgHeight
                );
                ctx.restore();
            }
        });
    }

    // Draw FIXED cyan crosshair in center of minimap (matches screen center)
    // Crosshair stays fixed, ground tiles move around it
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(0, 247, 255, 0.5)';
    ctx.beginPath();
    // Horizontal line
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    // Vertical line
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();

    // Draw cyan center dot
    ctx.fillStyle = 'rgba(0, 247, 255, 1)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();

    // Request next frame
    requestAnimationFrame(updateMinimapViewer);
}

function closeBlankMapCreator() {
    console.log('Closing blank map creator...');

    // Hide blank creator
    const blankCreator = document.getElementById('blankMapCreator');
    if (blankCreator) {
        blankCreator.classList.add('hidden');
        blankCreator.style.display = 'none';
    }

    // Show top-bar again when map creator closes
    document.body.classList.remove('in-editor');
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.style.display = '';
    }

    // Show the lobby screen
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen) {
        lobbyScreen.classList.remove('hidden');
    }

    // Show the create map screen
    const createMapScreen = document.getElementById('createMapScreen');
    if (createMapScreen) {
        createMapScreen.classList.remove('hidden');
        // Restore tabs visibility
        const tabsContainer = createMapScreen.querySelector('.feature-tabs');
        if (tabsContainer) tabsContainer.style.display = '';
        const createdMapTab = document.getElementById('createdMapTab');
        if (createdMapTab) createdMapTab.classList.remove('hidden');
    }
    
    // Show the createMapScreen close button again
    const createMapCloseBtn = document.getElementById('createMapCloseBtn');
    if (createMapCloseBtn) {
        createMapCloseBtn.style.display = '';
    }

    // Refresh the saved maps display
    loadSavedMaps();

    // Remove zoom slider
    const slider = document.getElementById('mapCreatorZoomSlider');
    if (slider) {
        slider.remove();
    }

    // Remove minimap
    const minimap = document.getElementById('mapCreatorMinimap');
    if (minimap) {
        minimap.remove();
    }

    // Remove vehicle type indicator
    const vehicleIndicator = document.getElementById('vehicleTypeIndicator');
    if (vehicleIndicator) {
        vehicleIndicator.remove();
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

    // Show the create new map button again
    createInteractiveElements();
    
    console.log('✅ Returned to createMapScreen');
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

// Setup draggable editor panel for tank
function setupTankEditorDrag() {
    const panel = document.getElementById('assetsPanel');
    const header = document.getElementById('tankEditorHeader');
    if (!panel || !header) {
        console.warn('Assets panel or header not found for dragging setup');
        return;
    }

    // Ensure panel is positioned absolutely for dragging
    panel.style.position = 'fixed';
    
    let isDragging = false;
    let startX, startY, initialX, initialY;

    header.addEventListener('mousedown', (e) => {
        // Don't drag if clicking the minimize button
        if (e.target.classList.contains('minimize-btn') || e.target.classList.contains('editor-toggle-btn')) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = panel.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        // Clear any existing transforms and positioning
        panel.style.transform = 'none';
        panel.style.transition = 'none';
        header.style.cursor = 'grabbing';
        
        // Add dragging class
        panel.classList.add('dragging');
        
        // Prevent text selection during drag
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        const newX = initialX + dx;
        const newY = initialY + dy;
        
        // Keep panel within viewport bounds
        const maxX = window.innerWidth - panel.offsetWidth;
        const maxY = window.innerHeight - panel.offsetHeight;
        
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        
        // Use transform for smoother dragging
        panel.style.transform = 'none';
        panel.style.left = clampedX + 'px';
        panel.style.top = clampedY + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
        
        e.preventDefault();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            panel.style.transition = '';
            panel.classList.remove('dragging');
            header.style.cursor = 'move';
        }
    });
    
    console.log('✅ Tank editor drag setup complete');
}

// Create plus cursor overlay for map center
function createPlusCursorOverlay() {
    // Remove existing overlay if any
    const existingOverlay = document.getElementById('mapCreatorPlusOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const canvas = document.getElementById('mapCreatorCanvas');
    if (!canvas) return;
    
    // Create overlay container with FontAwesome plus icon
    const overlay = document.createElement('div');
    overlay.id = 'mapCreatorPlusOverlay';
    overlay.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 1000;
        font-size: 20px;
    `;
    
    // Create FontAwesome plus icon
    overlay.innerHTML = '<i class="fa-sharp fa-light fa-plus" style="color: #74C0FC;"></i>';
    
    // Add to canvas parent
    const canvasParent = canvas.parentElement;
    if (canvasParent) {
        canvasParent.style.position = 'relative';
        canvasParent.appendChild(overlay);
        console.log('✅ Plus cursor overlay created with FontAwesome icon');
    }
}

function switchAssetCategory(category) {
    currentAssetCategory = category;

    // Update button states
    document.querySelectorAll('.editor-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
            // Update button styling based on category
            if (category === 'ground') {
                btn.style.background = 'rgba(139, 69, 19, 0.5)';
                btn.style.borderColor = 'rgba(139, 69, 19, 0.8)';
                btn.style.color = '#d2691e';
            } else if (category === 'players') {
                btn.style.background = 'rgba(255, 100, 100, 0.5)';
                btn.style.borderColor = 'rgba(255, 100, 100, 0.8)';
                btn.style.color = '#ff6464';
            } else {
                btn.style.background = 'rgba(0, 247, 255, 0.3)';
                btn.style.borderColor = '#00f7ff';
                btn.style.color = '#00f7ff';
            }
        } else {
            // Reset inactive button styling
            if (btn.dataset.category === 'ground') {
                btn.style.background = 'rgba(139, 69, 19, 0.3)';
                btn.style.borderColor = 'rgba(139, 69, 19, 0.6)';
                btn.style.color = 'rgba(255, 255, 255, 0.8)';
            } else if (btn.dataset.category === 'players') {
                btn.style.background = 'rgba(255, 100, 100, 0.3)';
                btn.style.borderColor = 'rgba(255, 100, 100, 0.6)';
                btn.style.color = 'rgba(255, 255, 255, 0.8)';
            } else {
                btn.style.background = 'rgba(0, 247, 255, 0.2)';
                btn.style.borderColor = 'rgba(0, 247, 255, 0.6)';
                btn.style.color = 'rgba(255, 255, 255, 0.8)';
            }
        }
    });

    // Show/hide panels based on category
    const assetsGrid = document.getElementById('assetsGrid');
    const playersPanel = document.getElementById('playersPanel');
    const textEditorContainer = document.getElementById('textEditorContainer');

    if (textEditorContainer) textEditorContainer.style.display = 'none';

    if (category === 'script') {
        if (assetsGrid) assetsGrid.style.display = 'none';
        if (playersPanel) playersPanel.style.display = 'none';
        if (textEditorContainer) textEditorContainer.style.display = 'block';
        return;
    }
    
    if (category === 'players') {
        if (assetsGrid) assetsGrid.style.display = 'none';
        if (playersPanel) playersPanel.style.display = 'block';
    } else {
        if (assetsGrid) assetsGrid.style.display = 'grid';
        if (playersPanel) playersPanel.style.display = 'none';
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
    if (!assetsGrid) return;
    assetsGrid.innerHTML = '';
    
    // Apply appropriate grid class based on category
    assetsGrid.className = 'assets-grid';
    if (category === 'ground') {
        assetsGrid.classList.add('ground-assets');
    }

    // If we're viewing a specific object's files, show those
    if (currentObjectFolder) {
        loadObjectFiles(currentObjectFolder);
        return;
    }

    // Ground PNG textures - all ground tiles with descriptive names
    const groundTextures = [
        { name: 'Water', type: 'water', file: 'tank/Grounds/water.png' },
        { name: 'Water Blue', type: 'waterblue', file: 'tank/Grounds/WaterBlue.png' },
        { name: 'Blue Grass', type: 'bluegrass', file: 'tank/Grounds/BlueGrass.png' },
        { name: 'Brown Cobblestone', type: 'BrownCobblestone', file: 'tank/Grounds/BrownCobblestone.png' },
        { name: 'Brown Grass', type: 'BrownGrass', file: 'tank/Grounds/BrownGrass.png' },
        { name: 'Gold Cobblestone', type: 'Goldcobblestone', file: 'tank/Grounds/Goldcobblestone.png' },
        { name: 'Golden Cobblestone', type: 'GoldenCobblestone', file: 'tank/Grounds/GoldenCobblestone.png' },
        { name: 'Gray Ground', type: 'GrayGround', file: 'tank/Grounds/GrayGround.png' },
        { name: 'Green Grass', type: 'GreenGrass', file: 'tank/Grounds/GreenGrass.png' },
        { name: 'Grey Cobblestone', type: 'GreyCobblestone', file: 'tank/Grounds/Grey Cobblestone.png' },
        { name: 'Light Brown Cobblestone', type: 'LightBrownCobblestone', file: 'tank/Grounds/LightBrownCobblestone.png' },
        { name: 'Light Grey Cobblestone', type: 'LightGreyCobblestone', file: 'tank/Grounds/LightGreyCobblestone.png' },
        { name: 'Light Grey Ground', type: 'LightGreyGround', file: 'tank/Grounds/LightGreyGround.png' },
        { name: 'Light Sand', type: 'LightSand', file: 'tank/Grounds/LightSand.png' },
        { name: 'Purple Cobblestone', type: 'PurpleCobblestone', file: 'tank/Grounds/PurpleCobblestone.png' },
        { name: 'Red Cobblestone', type: 'RedCobblestone', file: 'tank/Grounds/RedCobblestone.png' },
        { name: 'Sand', type: 'Sand', file: 'tank/Grounds/Sand.png' },
        { name: 'Wooden Planks', type: 'WoodenPlanks', file: 'tank/Grounds/WoodenPlanks.png' },
        { name: 'Wooden Tile', type: 'WoodenTile', file: 'tank/Grounds/WoodenTile.png' },
        { name: 'Yellow Grass', type: 'YellowGrass', file: 'tank/Grounds/YellowGrass.png' }
    ];

    // Show only ground textures if ground category is selected
    if (category === 'ground') {
        groundTextures.forEach(ground => {
            const assetItem = document.createElement('div');
            assetItem.className = 'asset-item-list';

            const asset = {
                name: ground.name,
                folder: null,
                fileName: ground.file,
                viewFolder: null,
                image: `/assets/${ground.file}`,
                isFolder: false,
                isGround: true,
                groundType: ground.type,
                groundFile: ground.file
            };

            assetItem.onclick = () => selectAsset(asset, assetItem);

            assetItem.innerHTML = `
                <div style="width: 50px; height: 50px; background: rgba(20, 30, 50, 0.5); border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid rgba(255,255,255,0.2);">
                    <img src="/assets/${ground.file}" alt="${asset.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                    <div style="color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 500;">${asset.name}</div>
                    <div style="color: rgba(255, 255, 255, 0.4); font-size: 11px;">Click to paint</div>
                </div>
            `;

            assetsGrid.appendChild(assetItem);
        });

        // Add info message
        const infoMsg = document.createElement('div');
        infoMsg.style.cssText = 'padding: 15px; margin-top: 10px; background: rgba(0, 247, 255, 0.1); border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 8px; color: rgba(255, 255, 255, 0.7); font-size: 12px; line-height: 1.5;';
        infoMsg.innerHTML = `
            <div style="font-weight: 600; color: #00f7ff; margin-bottom: 5px;">🎨 Ground Texture Painting</div>
            Select a ground texture and click on the map to paint tiles!<br>
            Use these textures to create varied and realistic terrain.
        `;
        assetsGrid.appendChild(infoMsg);

        return;
    }

    // Show buildings category
    if (category === 'buildings') {
        // Use Buildings folder - actual path is /assets/tank/Buildings/
        const viewFolder = 'Buildings';

        // List of all objects in the view folders
        const objects = Object.keys(objectFileNameMap[viewFolder]);

        // Create asset items for each object (list style)
        objects.forEach(objName => {
            const assetItem = document.createElement('div');
            assetItem.className = 'asset-item-list';

            // Get the correct file name pattern for this view
            const fileName = objectFileNameMap[viewFolder][objName];
            const viewFolderName = 'top_down_view'; // Files use this prefix

            // Use front view as default preview
            let frontName = 'front';
            if (viewFolder === 'Isometric View' && objName === 'Farm_House_01') {
                frontName = 'font'; // Typo in actual file
            }

            const imagePath = `/assets/tank/${viewFolder}/${objName}/spr_${viewFolderName}_${fileName}_${frontName}.png`;

            const asset = {
                name: objName.replace(/_/g, ' '),
                folder: objName,
                fileName: fileName,
                viewFolder: viewFolder,
                image: imagePath,
                isFolder: true
            };

            assetItem.onclick = () => openObjectFolder(asset);

            assetItem.innerHTML = `
                <div style="width: 50px; height: 50px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <img src="${imagePath}" alt="${asset.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.style.display='none'">
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                    <div style="color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 500;">${asset.name}</div>
                    <div style="color: rgba(255, 255, 255, 0.4); font-size: 11px;">Click to expand</div>
                </div>
                <div style="color: rgba(255, 255, 255, 0.3); font-size: 16px;">›</div>
            `;

            assetsGrid.appendChild(assetItem);
        });

        return;
    }

    // Self category placeholder content
    if (category === 'self') {
        const info = document.createElement('div');
        info.className = 'asset-item-list';
        info.innerHTML = `
            <div style="width: 50px; height: 50px; background: rgba(0, 247, 255, 0.15); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #00f7ff; font-size: 24px;">🧩</div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                <div style="color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 600;">Personal Assets</div>
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 11px;">Custom props and logic coming soon. Use Script tab for behaviors.</div>
            </div>
        `;
        assetsGrid.appendChild(info);

        const tip = document.createElement('div');
        tip.style.cssText = 'padding: 12px; margin-top: 10px; background: rgba(0, 247, 255, 0.08); border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 8px; color: rgba(255, 255, 255, 0.75); font-size: 12px; line-height: 1.5;';
        tip.innerHTML = 'Tip: Define custom rules in the Script tab, then place buildings/grounds to match your logic.';
        assetsGrid.appendChild(tip);

        return;
    }
}

function openObjectFolder(asset) {
    currentObjectFolder = asset;

    // Load the individual files
    loadObjectFiles(asset);
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
        item.style.background = 'transparent';
        item.style.borderColor = 'transparent';
    });
    element.style.background = 'rgba(100, 150, 255, 0.15)';
    element.style.borderColor = 'rgba(100, 150, 255, 0.4)';

    console.log('Selected asset:', asset.name);
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
        x: obj.x,
        y: obj.y,
        width: obj.image.naturalWidth,
        height: obj.image.naturalHeight
    }));

    // Generate ALL ground tiles for the map (including defaults)
    // Match the exact rendering logic from drawGroundSamples()
    const TILE_WIDTH = 120;
    const TILE_HEIGHT = 30;
    const MAP_RADIUS = 2500;
    const OUTER_RADIUS = 4000; // Extended boundary for LightSand edges
    const DRAW_HEIGHT = 70;

    const serializedGroundTiles = [];
    const maxGridRange = Math.ceil(OUTER_RADIUS / TILE_HEIGHT);

    // Generate tiles covering extended boundary with correct textures
    for (let row = -maxGridRange; row <= maxGridRange; row++) {
        for (let col = -maxGridRange; col <= maxGridRange; col++) {
            // Calculate isometric position (same as editor rendering)
            const isoX = col * TILE_WIDTH + (row % 2) * (TILE_WIDTH / 2);
            const isoY = row * TILE_HEIGHT;
            
            // Check if tile is within extended boundary
            const distFromMapCenter = Math.sqrt(isoX * isoX + isoY * isoY);
            if (distFromMapCenter > OUTER_RADIUS) continue;

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
                // LightSand outside green grass area, GreenGrass in center
                let groundType, groundImage;
                if (distFromMapCenter > MAP_RADIUS * 0.85) {
                    groundType = 'LightSand';  // LightSand at outer edges (extends beyond map)
                    groundImage = '/assets/tank/Grounds/LightSand.png';
                } else {
                    groundType = 'GreenGrass'; // Default green ground in center
                    groundImage = '/assets/tank/Grounds/GreenGrass.png';
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

    // Serialize AI bots for the map
    const serializedAIBots = mapAIBots.map(bot => ({
        id: bot.id,
        name: bot.name,
        team: bot.team,
        target: bot.target,
        behavior: bot.behavior,
        difficulty: bot.difficulty,
        health: bot.health,
        fireRate: bot.fireRate,
        damage: bot.damage,
        speed: bot.speed,
        accuracy: bot.accuracy,
        vehicleType: bot.vehicleType || 'tank'
    }));

    const mapData = {
        id: mapId,
        name: mapName,
        created: new Date().toISOString(),
        objects: serializedObjects,
        groundTiles: serializedGroundTiles,
        aiBots: serializedAIBots, // Save AI bots with the map
        version: '1.0',
        isUserCreated: true,
        vehicleType: window.currentMapVehicleType || 'tank', // Store the vehicle type
        settings: {
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_HEIGHT,
            tileDrawHeight: DRAW_HEIGHT,
            mapRadius: MAP_RADIUS
        }
    };

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

    // Refresh the map display
    loadSavedMaps();
}

function loadMap(mapData) {
    // Clear existing map
    placedObjects = [];
    customGroundTiles.clear();

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
                placedObjects.push({
                    asset: {
                        name: objData.name,
                        folder: objData.folder,
                        fileName: objData.fileName,
                        viewFolder: objData.viewFolder,
                        direction: objData.direction,
                        image: objData.image
                    },
                    x: objData.x,
                    y: objData.y,
                    image: img
                });

                renderMapCreatorCanvas();
            };
        });
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
    
    console.log('✅ Canvas element found:', canvas);
    console.log('   Parent:', canvas.parentElement?.id);
    console.log('   Canvas visible:', canvas.offsetParent !== null);
    console.log('   Canvas computed style:', window.getComputedStyle(canvas).display);
    console.log('   Canvas dimensions:', canvas.offsetWidth, 'x', canvas.offsetHeight);

    // Set canvas dimensions - use fallback if window dimensions are 0
    const canvasWidth = window.innerWidth || 1920;
    const canvasHeight = window.innerHeight || 1080;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Force canvas to be visible with important styles
    canvas.style.cssText = `
        display: block !important;
        visibility: visible !important;
        width: ${canvasWidth}px !important;
        height: ${canvasHeight}px !important;
        position: relative !important;
        z-index: 1 !important;
    `;
    
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

    // Test render to make sure canvas is working


    // Load custom ground texture
    loadCustomGroundTexture();

    // Add event listeners for interaction
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('wheel', handleCanvasWheel);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('mouseleave', handleCanvasMouseUp);

    // Add keyboard controls for panning
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    console.log('✅ Map creator canvas initialized');
    console.log('Controls: Mouse wheel to zoom, Right-click/Middle-click to pan, Arrow keys or WASD to scroll');

    // Start animation loop for smooth keyboard panning
    startPanningLoop();
    
    // Setup search input focus handling
    setTimeout(() => setupAssetSearchFocusHandling(), 500);
    
    // Force initial render with a simple test
    setTimeout(() => {
        try {
            // First, draw a simple test pattern to verify canvas is working
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear with background color
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw a test grid to show the canvas is working
                ctx.strokeStyle = '#00f7ff';
                ctx.lineWidth = 1;
                for (let x = 0; x < canvas.width; x += 100) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, canvas.height);
                    ctx.stroke();
                }
                for (let y = 0; y < canvas.height; y += 100) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(canvas.width, y);
                    ctx.stroke();
                }
                
                // Draw center crosshair
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(canvas.width/2 - 50, canvas.height/2);
                ctx.lineTo(canvas.width/2 + 50, canvas.height/2);
                ctx.moveTo(canvas.width/2, canvas.height/2 - 50);
                ctx.lineTo(canvas.width/2, canvas.height/2 + 50);
                ctx.stroke();
                
                // Draw text
                ctx.fillStyle = '#00f7ff';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('MAP CREATOR CANVAS - READY!', canvas.width/2, canvas.height/2 + 100);
                
                console.log('✅ Test pattern rendered - canvas is working!');
            }
            
            // Then try the normal render
            renderMapCreatorCanvas();
            console.log('✅ Initial render triggered');
        } catch (e) {
            console.error('❌ Error in initial render:', e);
            // Fallback: just clear the canvas with a background color
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ff0000';
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('CANVAS ERROR - CHECK CONSOLE', canvas.width/2, canvas.height/2);
                console.log('✅ Error fallback render applied');
            }
        }
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

    // Clear canvas with background color
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        drawIsometricWater(ctx, camera, canvas.width / canvasZoom, canvas.height / canvasZoom);
    } catch (error) {
        console.error('❌ Error drawing water:', error);
        // Fallback: draw simple blue background
        ctx.fillStyle = '#4a9ad8';
        ctx.fillRect(-5000, -5000, 10000, 10000);
    }

    // Draw ground texture samples on the map
    try {
        drawGroundSamples(ctx, camera, canvas.width / canvasZoom, canvas.height / canvasZoom);
    } catch (error) {
        console.error('❌ Error drawing ground samples:', error);
    }

    // Render custom painted ground tiles on top
    renderCustomGroundTiles(ctx, camera, canvas.width / canvasZoom, canvas.height / canvasZoom);

    // Update and render preview AI tanks
    if (previewAITanks && previewAITanks.length > 0) {
        updatePreviewAITanks();
        renderPreviewAITanks(ctx);
        
        // Debug: show AI count
        ctx.save();
        ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`AI Bots: ${previewAITanks.length}`, 10, canvas.height - 10);
        ctx.restore();
    }

    // Draw placed objects
    placedObjects.forEach((obj, index) => {
        if (obj.image && obj.image.complete && obj.image.naturalWidth > 0) {
            const width = obj.image.naturalWidth;
            const height = obj.image.naturalHeight;

            // Draw the object
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
        }
    });

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
            // Preview building/object - use cached image from asset
            // Load image if not already loaded
            if (!selectedAsset.previewImage) {
                selectedAsset.previewImage = new Image();
                selectedAsset.previewImage.src = selectedAsset.image;
            }

            const previewImg = selectedAsset.previewImage;
            if (previewImg.complete && previewImg.naturalWidth > 0) {
                const width = previewImg.naturalWidth;
                const height = previewImg.naturalHeight;

                // Position at cursor
                const posX = hoverWorldX - width / 2;
                const posY = hoverWorldY - height / 2;

                ctx.save();
                // Draw semi-transparent building preview
                ctx.globalAlpha = 0.6;
                ctx.drawImage(previewImg, posX, posY, width, height);

                // Draw outline
                ctx.globalAlpha = 1.0;
                ctx.strokeStyle = '#00f7ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(posX, posY, width, height);
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
    // Only handle left clicks (button 0)
    if (e.button !== 0) return;

    // Check if this was a drag (mouse moved more than 5 pixels or took more than 300ms)
    const mouseMoveDistance = Math.sqrt(
        Math.pow(e.clientX - mouseDownX, 2) +
        Math.pow(e.clientY - mouseDownY, 2)
    );
    const clickDuration = Date.now() - mouseDownTime;

    if (isDragging || mouseMoveDistance > 5 || clickDuration > 300) return;
    if (!selectedAsset) return;

    const canvas = document.getElementById('mapCreatorCanvas');
    const rect = canvas.getBoundingClientRect();

    // Get mouse position in canvas space
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert to world space (accounting for zoom and pan) - simple direct conversion
    let worldX = (mouseX - canvasOffsetX) / canvasZoom;
    let worldY = (mouseY - canvasOffsetY) / canvasZoom;

    // Snap to grid for clean placement (buildings only, not ground tiles)
    if (!selectedAsset.isGround) {
        const snapped = tankSnapToGrid(worldX, worldY, TANK_GRID_SIZE);
        worldX = snapped.x;
        worldY = snapped.y;
    }

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

        // Store the ground type for this tile
        customGroundTiles.set(tileKey, {
            type: selectedAsset.groundType,
            image: selectedAsset.image
        });

        renderMapCreatorCanvas();
        return;
    }

    // Place building/object

    const img = new Image();
    img.src = selectedAsset.image;

    img.onload = () => {
        // Only place if image loaded successfully
        if (img.naturalWidth > 0) {
            placedObjects.push({
                asset: selectedAsset,
                x: worldX,
                y: worldY,
                image: img
            });

            renderMapCreatorCanvas();
        }
    };

    img.onerror = () => {
        console.error('❌ Failed to load image:', selectedAsset.image);
        alert('Failed to load asset image. Please check the file path.');
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

    // Zoom toward screen center for straight zoom
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate world position at screen center before zoom
    const worldX = (centerX - canvasOffsetX) / canvasZoom;
    const worldY = (centerY - canvasOffsetY) / canvasZoom;

    // Calculate new zoom target with smooth animation (larger steps)
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(4, targetCanvasZoom * zoomDelta));

    // Update target zoom for smooth animation
    targetCanvasZoom = newZoom;

    // Adjust target offset to keep screen center stable
    targetCanvasOffsetX = centerX - worldX * newZoom;
    targetCanvasOffsetY = centerY - worldY * newZoom;

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

function handleCanvasMouseDown(e) {
    // Store mouse down position and time for click detection
    mouseDownX = e.clientX;
    mouseDownY = e.clientY;
    mouseDownTime = Date.now();

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
    hoverWorldX = (lastMouseX - canvasOffsetX) / canvasZoom;
    hoverWorldY = (lastMouseY - canvasOffsetY) / canvasZoom;
    
    // Snap hover preview to grid for buildings (not ground tiles)
    if (selectedAsset && !selectedAsset.isGround) {
        const snapped = tankSnapToGrid(hoverWorldX, hoverWorldY, TANK_GRID_SIZE);
        hoverWorldX = snapped.x;
        hoverWorldY = snapped.y;
    }
    isHovering = true;

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
}

// Keyboard controls for panning
function handleKeyDown(e) {
    // Block movement if editor panel has focus
    if (editorInputCaptured) {
        return; // Don't process any keys
    }

    // Block movement if any input/textarea is focused
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return; // Don't process any keys
    }

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
    // Block if editor panel has focus
    if (editorInputCaptured) {
        return;
    }

    // Block if any input/textarea is focused
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
    }
    
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
    
    const tileWidth = 120;
    const tileHeight = 30;
    const drawHeight = 70;

    // OPTIMIZATION: Calculate visible viewport bounds in world coordinates
    const viewLeft = camera.x;
    const viewTop = camera.y;
    const viewRight = camera.x + viewWidth;
    const viewBottom = camera.y + viewHeight;

    // Add generous padding to ensure full screen coverage
    // Use drawHeight for Y padding since tiles are taller than their spacing
    const paddingX = tileWidth * 4;
    const paddingY = drawHeight * 6; // Extra padding for tile overlap

    // Calculate tile range - only visible tiles
    const startCol = Math.floor((viewLeft - paddingX) / tileWidth);
    const endCol = Math.ceil((viewRight + paddingX) / tileWidth);
    const startRow = Math.floor((viewTop - paddingY) / tileHeight);
    const endRow = Math.ceil((viewBottom + paddingY) / tileHeight);

    // Draw water tiles
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            // Calculate isometric position
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
            const isoY = row * tileHeight;

            // Draw water tile with isometric shape
            drawWaterTile(ctx, isoX, isoY, tileWidth, drawHeight);
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
    } catch (error) {
        console.error('❌ Error drawing water tile:', error);
        // Fallback: draw a simple blue rectangle
        ctx.fillStyle = '#4a9ad8';
        ctx.fillRect(x, y, width, height);
    }
}

// NOTE: This function is overridden by the drawGroundSamples function defined later in the file
// The later function uses correct texture names (GreenGrass, LightSand) and is the one actually used

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
    const canvas = document.getElementById('tankLobbyBackground');
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
    window.clearAllObjects = clearAllObjects;
    window.saveMap = saveMap;
    window.publishMap = publishMap;
    window.getPublishedMaps = getPublishedMaps;
    window.getMostPlayedMap = getMostPlayedMap;
    window.testMap = testMap;
    window.toggleGroupsMode = toggleGroupsMode;
    window.addAIBot = addAIBot;
    window.openAIBotConfig = openAIBotConfig;
    window.closeAIConfigModal = closeAIConfigModal;
    window.saveAIBotConfig = saveAIBotConfig;
    window.deleteAIBot = deleteAIBot;
}

// ========== MAP TEST SYSTEM ==========

// Test the current map with a vehicle
function testMap() {
    const vehicleType = window.currentVehicleType || 'tank';
    
    // Save the current map first
    saveMap();
    
    // Create test mode overlay
    const testOverlay = document.createElement('div');
    testOverlay.id = 'mapTestOverlay';
    testOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `;
    
    // Create test canvas
    const testCanvas = document.createElement('canvas');
    testCanvas.id = 'mapTestCanvas';
    testCanvas.width = window.innerWidth;
    testCanvas.height = window.innerHeight;
    testCanvas.style.cssText = 'position: absolute; top: 0; left: 0;';
    testOverlay.appendChild(testCanvas);
    
    // Create exit button
    const exitBtn = document.createElement('button');
    exitBtn.textContent = 'EXIT TEST';
    exitBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 30px;
        background: linear-gradient(180deg, #ff4444, #cc0000);
        border: 2px solid #ff6666;
        border-radius: 8px;
        color: white;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10001;
    `;
    exitBtn.onclick = () => {
        stopMapTest();
        testOverlay.remove();
    };
    testOverlay.appendChild(exitBtn);
    
    // Create controls info
    const controlsInfo = document.createElement('div');
    controlsInfo.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        z-index: 10001;
    `;
    controlsInfo.innerHTML = 'WASD or Arrow Keys to move | Mouse to aim | Click to shoot';
    testOverlay.appendChild(controlsInfo);
    
    document.body.appendChild(testOverlay);
    
    // Start test mode
    startMapTest(testCanvas, vehicleType);
}

// Test mode state
let testModeActive = false;
let testPlayer = null;
let testAnimationId = null;
let testKeys = { w: false, a: false, s: false, d: false };
let testMouseX = 0;
let testMouseY = 0;

function startMapTest(canvas, vehicleType) {
    testModeActive = true;
    const ctx = canvas.getContext('2d');
    
    // Initialize test player at center
    testPlayer = {
        x: 0,
        y: 0,
        angle: 0,
        speed: 0,
        maxSpeed: vehicleType === 'jet' ? 8 : vehicleType === 'race' ? 10 : 5,
        vehicleType: vehicleType,
        color: 'blue',
        body: 'body_halftrack',
        weapon: 'turret_01_mk1',
        jetType: 'ship1',
        raceType: 'endurance'
    };
    
    // Set up controls
    const handleKeyDown = (e) => {
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') testKeys.w = true;
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') testKeys.a = true;
        if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') testKeys.s = true;
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') testKeys.d = true;
        if (e.key === 'Escape') {
            stopMapTest();
            document.getElementById('mapTestOverlay')?.remove();
        }
    };
    
    const handleKeyUp = (e) => {
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') testKeys.w = false;
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') testKeys.a = false;
        if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') testKeys.s = false;
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') testKeys.d = false;
    };
    
    const handleMouseMove = (e) => {
        testMouseX = e.clientX;
        testMouseY = e.clientY;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Store handlers for cleanup
    canvas._testHandlers = { handleKeyDown, handleKeyUp, handleMouseMove };
    
    // Start render loop
    function renderTestMode() {
        if (!testModeActive) return;
        
        // Update player position
        let dx = 0, dy = 0;
        if (testKeys.w) dy -= 1;
        if (testKeys.s) dy += 1;
        if (testKeys.a) dx -= 1;
        if (testKeys.d) dx += 1;
        
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
            testPlayer.x += dx * testPlayer.maxSpeed;
            testPlayer.y += dy * testPlayer.maxSpeed;
        }
        
        // Calculate angle to mouse
        const screenCenterX = canvas.width / 2;
        const screenCenterY = canvas.height / 2;
        testPlayer.angle = Math.atan2(testMouseY - screenCenterY, testMouseX - screenCenterX);
        
        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw ground tiles (centered on player)
        const camera = {
            x: testPlayer.x - canvas.width / 2,
            y: testPlayer.y - canvas.height / 2
        };
        
        drawGroundSamples(ctx, camera, canvas.width, canvas.height);
        
        // Draw placed objects
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        placedObjects.forEach(obj => {
            if (obj.image && obj.image.complete) {
                const scale = obj.scale || 1;
                const w = obj.image.width * scale;
                const h = obj.image.height * scale;
                ctx.drawImage(obj.image, obj.x - w / 2, obj.y - h / 2, w, h);
            }
        });
        ctx.restore();
        
        // Draw player vehicle at center
        if (vehicleType === 'tank') {
            const tankImg = window.lobbyTankImages?.[testPlayer.color]?.[testPlayer.body];
            const weaponImg = window.lobbyWeaponImages?.[testPlayer.color]?.[testPlayer.weapon];
            
            // Calculate body angle based on movement direction
            if (dx !== 0 || dy !== 0) {
                testPlayer.bodyAngle = Math.atan2(dy, dx);
            }
            const bodyAngle = testPlayer.bodyAngle || 0;
            
            // Draw tank body (rotates with movement)
            if (tankImg && tankImg.complete) {
                ctx.save();
                ctx.translate(screenCenterX, screenCenterY);
                ctx.rotate(bodyAngle + Math.PI / 2);
                const scale = 0.5;
                ctx.drawImage(tankImg, -tankImg.width * scale / 2, -tankImg.height * scale / 2, tankImg.width * scale, tankImg.height * scale);
                ctx.restore();
            }
            
            // Draw weapon/turret (rotates to follow mouse)
            if (weaponImg && weaponImg.complete) {
                ctx.save();
                ctx.translate(screenCenterX, screenCenterY);
                ctx.rotate(testPlayer.angle + Math.PI / 2);
                const scale = 0.45;
                ctx.drawImage(weaponImg, -weaponImg.width * scale / 2, -weaponImg.height * scale / 2, weaponImg.width * scale, weaponImg.height * scale);
                ctx.restore();
            }
        } else if (vehicleType === 'jet') {
            ctx.save();
            ctx.translate(screenCenterX, screenCenterY);
            ctx.rotate(testPlayer.angle + Math.PI / 2);
            const imagePath = `/assets/jet/spr_${testPlayer.jetType}_${testPlayer.color}.png`;
            if (window.jetImageCache && window.jetImageCache[imagePath]?.complete) {
                const img = window.jetImageCache[imagePath];
                const scale = 0.8;
                ctx.drawImage(img, -img.width * scale / 2, -img.height * scale / 2, img.width * scale, img.height * scale);
            }
            ctx.restore();
        } else if (vehicleType === 'race') {
            ctx.save();
            ctx.translate(screenCenterX, screenCenterY);
            ctx.rotate(testPlayer.angle + Math.PI / 2);
            const imagePath = `/assets/race/sprites/cars/${testPlayer.raceType}_${testPlayer.color}.png`;
            if (window.raceImageCache && window.raceImageCache[imagePath]?.complete) {
                const img = window.raceImageCache[imagePath];
                const scale = 0.6;
                ctx.drawImage(img, -img.width * scale / 2, -img.height * scale / 2, img.width * scale, img.height * scale);
            }
            ctx.restore();
        }
        
        // Draw position info
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`Position: ${Math.round(testPlayer.x)}, ${Math.round(testPlayer.y)}`, 20, 30);
        ctx.fillText(`Vehicle: ${vehicleType}`, 20, 50);
        
        testAnimationId = requestAnimationFrame(renderTestMode);
    }
    
    renderTestMode();
}

function stopMapTest() {
    testModeActive = false;
    
    if (testAnimationId) {
        cancelAnimationFrame(testAnimationId);
        testAnimationId = null;
    }
    
    // Remove event listeners
    const canvas = document.getElementById('mapTestCanvas');
    if (canvas && canvas._testHandlers) {
        window.removeEventListener('keydown', canvas._testHandlers.handleKeyDown);
        window.removeEventListener('keyup', canvas._testHandlers.handleKeyUp);
        window.removeEventListener('mousemove', canvas._testHandlers.handleMouseMove);
    }
    
    testKeys = { w: false, a: false, s: false, d: false };
}

// ========== AI BOT SYSTEM ==========

// Store AI bots and spawn points for the current map
let mapAIBots = [];
let mapSpawnPoints = [];
let currentEditingBotIndex = -1;

// Toggle groups/teams mode
function toggleGroupsMode() {
    const toggle = document.getElementById('groupsToggle');
    const teamsOptions = document.getElementById('teamsOptions');
    const isEnabled = toggle ? toggle.checked : false;
    
    if (teamsOptions) {
        teamsOptions.style.display = isEnabled ? 'block' : 'none';
    }
}

// Add spawn point (placeholder - will be placed on map click)
function addSpawnPoint() {
    alert('Click on the map to place a spawn point');
    window.placingSpawnPoint = true;
}

// Add AI preset (quick add multiple bots)
function addAIPreset(difficulty, count) {
    const vehicleType = window.currentVehicleType || 'tank';
    
    for (let i = 0; i < count; i++) {
        const botNumber = mapAIBots.length + 1;
        const difficultyStats = {
            easy: { health: 80, fireRate: 70, damage: 70, speed: 80, accuracy: 40 },
            medium: { health: 100, fireRate: 100, damage: 100, speed: 100, accuracy: 70 },
            hard: { health: 130, fireRate: 130, damage: 130, speed: 110, accuracy: 90 }
        };
        const stats = difficultyStats[difficulty] || difficultyStats.medium;
        
        const newBot = {
            id: Date.now() + i,
            name: `AI ${botNumber}`,
            team: 'none',
            target: 'nearest',
            behavior: difficulty === 'hard' ? 'aggressive' : 'patrol',
            difficulty: difficulty,
            ...stats,
            vehicleType: vehicleType
        };
        
        mapAIBots.push(newBot);
        
        // Create preview tank with slight delay for spread positioning
        setTimeout(() => {
            const previewTank = createPreviewAITank(newBot);
            if (previewTank) {
                // Offset spawn position for each bot
                previewTank.x += (i - count/2) * 100;
                previewAITanks.push(previewTank);
            }
        }, i * 100);
    }
    
    renderAIBotsList();
}

// Export new functions
window.addSpawnPoint = addSpawnPoint;
window.addAIPreset = addAIPreset;

// ========== AI PREVIEW TANKS ON MAP ==========
// Store preview AI tanks that move around the map
let previewAITanks = [];
const MAP_RADIUS = 2500; // Match the ground samples radius
const AI_SAFE_RADIUS = MAP_RADIUS * 0.8; // Keep AI within 80% of map

// Create a preview AI tank on the map - spawns near current screen/camera position
function createPreviewAITank(bot) {
    // Get current camera/screen center position in world coordinates
    const zoom = canvasZoom || 1;
    const offsetX = canvasOffsetX || 0;
    const offsetY = canvasOffsetY || 0;
    
    // Calculate the center of the current view in world coordinates
    const canvas = document.getElementById('mapCreatorCanvas');
    const canvasWidth = canvas ? canvas.width : window.innerWidth;
    const canvasHeight = canvas ? canvas.height : window.innerHeight;
    
    // Screen center in world coordinates
    const screenCenterWorldX = (canvasWidth / 2 - offsetX) / zoom;
    const screenCenterWorldY = (canvasHeight / 2 - offsetY) / zoom;
    
    // Spawn near the current screen position with some random offset
    const randomAngle = Math.random() * Math.PI * 2;
    const randomDist = 100 + Math.random() * 300; // Spawn within 100-400 units of screen center
    
    const spawnX = screenCenterWorldX + Math.cos(randomAngle) * randomDist;
    const spawnY = screenCenterWorldY + Math.sin(randomAngle) * randomDist;
    
    // Random target near spawn position
    const targetAngle = Math.random() * Math.PI * 2;
    const targetDist = Math.random() * 400;
    
    console.log('✅ Creating AI tank:', bot.name, 'at:', Math.round(spawnX), Math.round(spawnY), 'color:', getTeamColorForTank(bot.team), 'screen center:', Math.round(screenCenterWorldX), Math.round(screenCenterWorldY));
    
    return {
        id: bot.id,
        name: bot.name,
        x: spawnX,
        y: spawnY,
        // Smooth position for interpolation
        displayX: spawnX,
        displayY: spawnY,
        targetX: spawnX + Math.cos(targetAngle) * targetDist,
        targetY: spawnY + Math.sin(targetAngle) * targetDist,
        angle: Math.random() * Math.PI * 2,
        displayAngle: Math.random() * Math.PI * 2, // Smooth angle for rendering
        speed: (bot.speed / 100) * 2.5, // Base speed 2.5, modified by bot stats
        color: getTeamColorForTank(bot.team),
        difficulty: bot.difficulty,
        lastTargetChange: Date.now(),
        // Animation properties
        trackOffset: 0, // For track animation
        turretAngle: 0, // Independent turret rotation
        enginePulse: 0 // For engine idle animation
    };
}

// Get tank color based on team
function getTeamColorForTank(team) {
    const colors = {
        'none': 'blue',
        'red': 'red',
        'blue': 'blue',
        'green': 'green',
        'yellow': 'yellow'
    };
    return colors[team] || 'blue';
}

// Update AI tank positions - AI tanks roam around the map with smooth movement
function updatePreviewAITanks() {
    const now = Date.now();
    
    previewAITanks.forEach(tank => {
        // Calculate distance to target
        const dx = tank.targetX - tank.x;
        const dy = tank.targetY - tank.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If close to target or time to change, pick new target near current position
        if (dist < 50 || now - tank.lastTargetChange > 5000) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 200 + Math.random() * 400; // Move 200-600 units
            tank.targetX = tank.x + Math.cos(angle) * distance;
            tank.targetY = tank.y + Math.sin(angle) * distance;
            tank.lastTargetChange = now;
        }
        
        // Move towards target with smooth acceleration
        if (dist > 5) {
            const moveAngle = Math.atan2(dy, dx);
            
            // Smooth angle rotation (tank turns gradually)
            let angleDiff = moveAngle - tank.angle;
            // Normalize angle difference to [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // Smooth rotation (0.08 = rotation speed)
            tank.angle += angleDiff * 0.08;
            
            // Only move forward if roughly facing the target
            if (Math.abs(angleDiff) < Math.PI / 2) {
                // Smooth acceleration based on distance
                const speedFactor = Math.min(1, dist / 100);
                tank.x += Math.cos(tank.angle) * tank.speed * speedFactor;
                tank.y += Math.sin(tank.angle) * tank.speed * speedFactor;
                
                // Animate tracks when moving
                tank.trackOffset = (tank.trackOffset + tank.speed * 0.1) % 10;
            }
            
            // Keep within map safe radius (from world center 0,0)
            const distFromCenter = Math.sqrt(tank.x * tank.x + tank.y * tank.y);
            if (distFromCenter > AI_SAFE_RADIUS) {
                const clampAngle = Math.atan2(tank.y, tank.x);
                tank.x = Math.cos(clampAngle) * AI_SAFE_RADIUS;
                tank.y = Math.sin(clampAngle) * AI_SAFE_RADIUS;
                // Pick new target towards center
                tank.targetX = 0;
                tank.targetY = 0;
            }
        }
        
        // Smooth display position interpolation (for ultra-smooth rendering)
        tank.displayX += (tank.x - tank.displayX) * 0.15;
        tank.displayY += (tank.y - tank.displayY) * 0.15;
        
        // Smooth display angle interpolation
        let displayAngleDiff = tank.angle - tank.displayAngle;
        while (displayAngleDiff > Math.PI) displayAngleDiff -= Math.PI * 2;
        while (displayAngleDiff < -Math.PI) displayAngleDiff += Math.PI * 2;
        tank.displayAngle += displayAngleDiff * 0.2;
        
        // Turret slowly rotates independently (looking around)
        tank.turretAngle += Math.sin(now * 0.001 + tank.id) * 0.02;
        
        // Engine idle pulse animation
        tank.enginePulse = Math.sin(now * 0.005) * 0.03;
    });
}

// Render preview AI tanks on the map creator canvas
// NOTE: This function is called AFTER ctx.translate/scale transformations are applied
// So we render in WORLD coordinates directly (tank.x, tank.y are world positions)
function renderPreviewAITanks(ctx) {
    if (!previewAITanks || previewAITanks.length === 0) return;
    
    const zoom = canvasZoom || 1;
    const offsetX = canvasOffsetX || 0;
    const offsetY = canvasOffsetY || 0;
    
    // Calculate visible viewport in world coordinates
    const canvas = ctx.canvas;
    const viewLeft = -offsetX / zoom - 300;
    const viewRight = (canvas.width - offsetX) / zoom + 300;
    const viewTop = -offsetY / zoom - 300;
    const viewBottom = (canvas.height - offsetY) / zoom + 300;
    
    previewAITanks.forEach(tank => {
        // Use smooth display position for rendering
        const worldX = tank.displayX !== undefined ? tank.displayX : tank.x;
        const worldY = tank.displayY !== undefined ? tank.displayY : tank.y;
        const displayAngle = tank.displayAngle !== undefined ? tank.displayAngle : tank.angle;
        
        // Skip if off screen (check in world coordinates)
        if (worldX < viewLeft || worldX > viewRight ||
            worldY < viewTop || worldY > viewBottom) return;
        
        // Scale for tank size - 2X BIGGER (0.8 instead of 0.4)
        const scale = 0.8;
        const size = 100; // 2x bigger base size
        
        // Try to use actual GIF images from global window object
        const tankImg = window.lobbyTankImages?.[tank.color]?.['body_halftrack'];
        const weaponImg = window.lobbyWeaponImages?.[tank.color]?.['turret_01_mk1'];
        
        // Draw shadow first
        ctx.save();
        ctx.translate(worldX + 8, worldY + 8);
        ctx.rotate(displayAngle + Math.PI / 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.45, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Draw tank body at world position (context transform handles screen conversion)
        ctx.save();
        ctx.translate(worldX, worldY);
        
        // Apply engine pulse for idle animation
        const pulseScale = 1 + (tank.enginePulse || 0);
        ctx.scale(pulseScale, pulseScale);
        
        ctx.rotate(displayAngle + Math.PI / 2);
        
        if (tankImg && tankImg.complete) {
            const w = tankImg.width * scale;
            const h = tankImg.height * scale;
            ctx.drawImage(tankImg, -w / 2, -h / 2, w, h);
        } else {
            // Fallback: draw a detailed tank shape
            // Tank body
            ctx.fillStyle = getTankBodyColor(tank.color);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            
            // Main body rectangle
            ctx.beginPath();
            ctx.roundRect(-size * 0.35, -size * 0.5, size * 0.7, size, 8);
            ctx.fill();
            ctx.stroke();
            
            // Track details (left)
            ctx.fillStyle = '#333';
            ctx.fillRect(-size * 0.4, -size * 0.45, size * 0.12, size * 0.9);
            // Track details (right)
            ctx.fillRect(size * 0.28, -size * 0.45, size * 0.12, size * 0.9);
            
            // Track pattern
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            const trackOffset = tank.trackOffset || 0;
            for (let i = 0; i < 6; i++) {
                const y = -size * 0.4 + (i * size * 0.15) + (trackOffset % (size * 0.15));
                ctx.beginPath();
                ctx.moveTo(-size * 0.4, y);
                ctx.lineTo(-size * 0.28, y);
                ctx.moveTo(size * 0.28, y);
                ctx.lineTo(size * 0.4, y);
                ctx.stroke();
            }
            
            // Body highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(-size * 0.25, -size * 0.4, size * 0.5, size * 0.3);
        }
        
        // Draw weapon/turret on top with independent rotation
        ctx.rotate(tank.turretAngle || 0);
        
        if (weaponImg && weaponImg.complete) {
            const w = weaponImg.width * scale * 0.9;
            const h = weaponImg.height * scale * 0.9;
            ctx.drawImage(weaponImg, -w / 2, -h / 2, w, h);
        } else {
            // Fallback: detailed turret
            // Turret base
            ctx.fillStyle = getTankTurretColor(tank.color);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Barrel
            ctx.fillStyle = '#444';
            ctx.fillRect(-size * 0.06, -size * 0.55, size * 0.12, size * 0.4);
            ctx.strokeRect(-size * 0.06, -size * 0.55, size * 0.12, size * 0.4);
            
            // Barrel tip
            ctx.fillStyle = '#222';
            ctx.fillRect(-size * 0.04, -size * 0.58, size * 0.08, size * 0.08);
            
            // Turret highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(-size * 0.05, -size * 0.05, size * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Draw name tag (not rotated) - at world position
        ctx.save();
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const tagWidth = Math.max(ctx.measureText(tank.name).width + 30, 80);
        const tagHeight = 26;
        const tagY = worldY - size * 0.6 - 20;
        
        // Tag background with gradient
        const gradient = ctx.createLinearGradient(worldX - tagWidth/2, tagY, worldX + tagWidth/2, tagY);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        gradient.addColorStop(0.5, 'rgba(30, 30, 30, 0.9)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(worldX - tagWidth/2, tagY - tagHeight/2, tagWidth, tagHeight, 6);
        ctx.fill();
        
        // Tag border with team color
        ctx.strokeStyle = getTankBodyColor(tank.color);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // AI icon
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('🤖', worldX - tagWidth/2 + 15, tagY);
        
        // Name text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Arial';
        ctx.fillText(tank.name, worldX + 10, tagY);
        
        // Difficulty indicator
        const diffColors = { easy: '#4CAF50', medium: '#FF9800', hard: '#f44336', expert: '#9C27B0' };
        ctx.fillStyle = diffColors[tank.difficulty] || '#888';
        ctx.beginPath();
        ctx.arc(worldX + tagWidth/2 - 12, tagY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

function getTankBodyColor(color) {
    const colors = {
        'blue': '#2196F3',
        'red': '#f44336',
        'green': '#4CAF50',
        'yellow': '#FFEB3B'
    };
    return colors[color] || colors.blue;
}

function getTankTurretColor(color) {
    const colors = {
        'blue': '#1565C0',
        'red': '#c62828',
        'green': '#2E7D32',
        'yellow': '#F9A825'
    };
    return colors[color] || colors.blue;
}

// Sync preview tanks with mapAIBots
function syncPreviewAITanks() {
    // Remove tanks that no longer exist in mapAIBots
    previewAITanks = previewAITanks.filter(tank => 
        mapAIBots.some(bot => bot.id === tank.id)
    );
    
    // Add new tanks for bots that don't have preview tanks
    mapAIBots.forEach(bot => {
        if (!previewAITanks.some(tank => tank.id === bot.id)) {
            const newTank = createPreviewAITank(bot);
            if (newTank) previewAITanks.push(newTank);
        }
    });
}

// Add a new AI bot
function addAIBot() {
    const vehicleType = window.currentVehicleType || 'tank';
    const botNumber = mapAIBots.length + 1;
    
    const newBot = {
        id: Date.now(),
        name: `AI ${botNumber}`,
        team: 'none',
        target: 'nearest',
        behavior: 'aggressive',
        difficulty: 'medium',
        health: 100,
        fireRate: 100,
        damage: 100,
        speed: 100,
        accuracy: 70,
        vehicleType: vehicleType
    };
    
    mapAIBots.push(newBot);
    
    // Create preview tank on map
    const previewTank = createPreviewAITank(newBot);
    if (previewTank) previewAITanks.push(previewTank);
    
    renderAIBotsList();
    
    // Open config for the new bot
    currentEditingBotIndex = mapAIBots.length - 1;
    openAIBotConfig(currentEditingBotIndex);
}

// Render the AI bots list
function renderAIBotsList() {
    const container = document.getElementById('aiBotsListContainer');
    if (!container) return;
    
    if (mapAIBots.length === 0) {
        container.innerHTML = '<p class="empty-list-msg">No AI bots added yet</p>';
        return;
    }
    
    const difficultyColors = {
        easy: '#4CAF50',
        medium: '#FF9800',
        hard: '#f44336',
        expert: '#9C27B0'
    };
    
    container.innerHTML = mapAIBots.map((bot, index) => `
        <div class="ai-bot-item" onclick="openAIBotConfig(${index})">
            <div class="ai-bot-info">
                <span class="ai-bot-name">🤖 ${bot.name}</span>
                <span class="ai-bot-difficulty" style="color: ${difficultyColors[bot.difficulty] || '#888'}">${bot.difficulty}</span>
            </div>
            <div class="ai-bot-badges">
                <span class="ai-bot-team" style="background: ${getTeamColor(bot.team)}20; color: ${getTeamColor(bot.team)}; border: 1px solid ${getTeamColor(bot.team)}50">${bot.team === 'none' ? 'FFA' : bot.team}</span>
            </div>
        </div>
    `).join('');
}

// Get team color
function getTeamColor(team) {
    const colors = {
        'none': '#888',
        'red': '#ff4444',
        'blue': '#4444ff',
        'green': '#44ff44',
        'yellow': '#ffff44'
    };
    return colors[team] || '#888';
}

// Open AI bot configuration modal
function openAIBotConfig(index) {
    currentEditingBotIndex = index;
    const bot = mapAIBots[index];
    if (!bot) return;
    
    // Populate form fields
    document.getElementById('aiBotName').value = bot.name;
    document.getElementById('aiBotTeam').value = bot.team;
    document.getElementById('aiBotTarget').value = bot.target;
    document.getElementById('aiBotBehavior').value = bot.behavior;
    document.getElementById('aiBotDifficulty').value = bot.difficulty;
    
    // Stats sliders
    document.getElementById('aiBotHealth').value = bot.health;
    document.getElementById('aiBotHealthValue').textContent = bot.health;
    document.getElementById('aiBotFireRate').value = bot.fireRate;
    document.getElementById('aiBotFireRateValue').textContent = bot.fireRate + '%';
    document.getElementById('aiBotDamage').value = bot.damage;
    document.getElementById('aiBotDamageValue').textContent = bot.damage + '%';
    document.getElementById('aiBotSpeed').value = bot.speed;
    document.getElementById('aiBotSpeedValue').textContent = bot.speed + '%';
    document.getElementById('aiBotAccuracy').value = bot.accuracy;
    document.getElementById('aiBotAccuracyValue').textContent = bot.accuracy + '%';
    
    // Add slider event listeners
    setupSliderListeners();
    
    // Show modal
    document.getElementById('aiBotConfigModal').classList.remove('hidden');
}

// Setup slider event listeners
function setupSliderListeners() {
    const sliders = [
        { id: 'aiBotHealth', valueId: 'aiBotHealthValue', suffix: '' },
        { id: 'aiBotFireRate', valueId: 'aiBotFireRateValue', suffix: '%' },
        { id: 'aiBotDamage', valueId: 'aiBotDamageValue', suffix: '%' },
        { id: 'aiBotSpeed', valueId: 'aiBotSpeedValue', suffix: '%' },
        { id: 'aiBotAccuracy', valueId: 'aiBotAccuracyValue', suffix: '%' }
    ];
    
    sliders.forEach(slider => {
        const el = document.getElementById(slider.id);
        if (el) {
            el.oninput = () => {
                document.getElementById(slider.valueId).textContent = el.value + slider.suffix;
            };
        }
    });
}

// Close AI config modal
function closeAIConfigModal() {
    document.getElementById('aiBotConfigModal').classList.add('hidden');
    currentEditingBotIndex = -1;
}

// Save AI bot configuration
function saveAIBotConfig() {
    if (currentEditingBotIndex < 0 || !mapAIBots[currentEditingBotIndex]) return;
    
    const bot = mapAIBots[currentEditingBotIndex];
    
    bot.name = document.getElementById('aiBotName').value || `AI ${currentEditingBotIndex + 1}`;
    bot.team = document.getElementById('aiBotTeam').value;
    bot.target = document.getElementById('aiBotTarget').value;
    bot.behavior = document.getElementById('aiBotBehavior').value;
    bot.difficulty = document.getElementById('aiBotDifficulty').value;
    bot.health = parseInt(document.getElementById('aiBotHealth').value);
    bot.fireRate = parseInt(document.getElementById('aiBotFireRate').value);
    bot.damage = parseInt(document.getElementById('aiBotDamage').value);
    bot.speed = parseInt(document.getElementById('aiBotSpeed').value);
    bot.accuracy = parseInt(document.getElementById('aiBotAccuracy').value);
    
    renderAIBotsList();
    closeAIConfigModal();
}

// Delete AI bot
function deleteAIBot() {
    if (currentEditingBotIndex < 0) return;
    
    const botId = mapAIBots[currentEditingBotIndex]?.id;
    mapAIBots.splice(currentEditingBotIndex, 1);
    
    // Remove preview tank from map
    previewAITanks = previewAITanks.filter(tank => tank.id !== botId);
    
    renderAIBotsList();
    closeAIConfigModal();
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

            if (customTile && groundTexturesLoaded && groundTextureImages.has(customTile.type)) {
                // Calculate isometric position
                // Offset every other row by half tile width for diamond pattern
                const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
                const isoY = row * tileHeight;

                const groundImg = groundTextureImages.get(customTile.type);

                // OPTIMIZATION: Only draw if image is loaded
                if (groundImg && groundImg.complete && groundImg.naturalWidth > 0) {
                    // Draw directly instead of using helper function
                    ctx.drawImage(groundImg, isoX, isoY, tileWidth, drawHeight);
                    customTilesRendered++;
                }
            }
        }
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

// Load all ground PNG textures
let groundTextureImages = new Map();
let groundTexturesLoaded = false;

// Load ground textures and return a Promise
function loadCustomGroundTexture() {
    return new Promise((resolve) => {
        // If already loaded, resolve immediately
        if (groundTexturesLoaded && groundTextureImages.size > 0) {
            resolve();
            return;
        }

        // Load all ground PNG textures with descriptive names
        const groundFiles = [
            { file: 'tank/Grounds/water.png', type: 'water' },
            { file: 'tank/Grounds/WaterBlue.png', type: 'waterblue' },
            { file: 'tank/Grounds/BlueGrass.png', type: 'bluegrass' },
            { file: 'tank/Grounds/BrownCobblestone.png', type: 'BrownCobblestone' },
            { file: 'tank/Grounds/BrownGrass.png', type: 'BrownGrass' },
            { file: 'tank/Grounds/Goldcobblestone.png', type: 'Goldcobblestone' },
            { file: 'tank/Grounds/GoldenCobblestone.png', type: 'GoldenCobblestone' },
            { file: 'tank/Grounds/GrayGround.png', type: 'GrayGround' },
            { file: 'tank/Grounds/GreenGrass.png', type: 'GreenGrass' },
            { file: 'tank/Grounds/Grey Cobblestone.png', type: 'GreyCobblestone' },
            { file: 'tank/Grounds/LightBrownCobblestone.png', type: 'LightBrownCobblestone' },
            { file: 'tank/Grounds/LightGreyCobblestone.png', type: 'LightGreyCobblestone' },
            { file: 'tank/Grounds/LightGreyGround.png', type: 'LightGreyGround' },
            { file: 'tank/Grounds/LightSand.png', type: 'LightSand' },
            { file: 'tank/Grounds/PurpleCobblestone.png', type: 'PurpleCobblestone' },
            { file: 'tank/Grounds/RedCobblestone.png', type: 'RedCobblestone' },
            { file: 'tank/Grounds/Sand.png', type: 'Sand' },
            { file: 'tank/Grounds/WoodenPlanks.png', type: 'WoodenPlanks' },
            { file: 'tank/Grounds/WoodenTile.png', type: 'WoodenTile' },
            { file: 'tank/Grounds/YellowGrass.png', type: 'YellowGrass' }
        ];

        let loadedCount = 0;
        const totalFiles = groundFiles.length;

        groundFiles.forEach((ground) => {
            const img = new Image();
            const groundType = ground.type;

            img.onload = () => {
                groundTextureImages.set(groundType, img);
                groundTextureImages.set(ground.file, img);
                loadedCount++;

                // Update loading progress
                if (typeof updateMapCreatorLoadingProgress === 'function') {
                    const percent = 30 + Math.floor((loadedCount / totalFiles) * 30);
                    updateMapCreatorLoadingProgress(percent, `Loading textures... ${loadedCount}/${totalFiles}`);
                }

                if (loadedCount === totalFiles) {
                    groundTexturesLoaded = true;
                    console.log(`✓ All ${totalFiles} ground textures loaded`);
                    resolve();
                }
            };

            img.onerror = () => {
                console.warn(`Failed to load ground texture: ${ground.file}`);
                loadedCount++;

                if (loadedCount === totalFiles) {
                    groundTexturesLoaded = true;
                    resolve();
                }
            };

            img.src = `/assets/${ground.file}`;
        });
    });
}

// Draw LightSand at edges and beyond (outside the green grass area)
function drawIsometricWater(ctx, camera, viewWidth, viewHeight) {
    const tileWidth = 120;
    const tileHeight = 30;
    const drawHeight = 70;
    const mapRadius = 2500;
    const outerRadius = 4000; // Extended outer boundary for LightSand

    const paddingX = tileWidth * 4;
    const paddingY = drawHeight * 6;

    const startCol = Math.floor((camera.x - paddingX) / tileWidth);
    const endCol = Math.ceil((camera.x + viewWidth + paddingX) / tileWidth);
    const startRow = Math.floor((camera.y - paddingY) / tileHeight);
    const endRow = Math.ceil((camera.y + viewHeight + paddingY) / tileHeight);

    const maxGridRange = Math.ceil(outerRadius / tileHeight);

    // Draw LightSand outside the green grass area (extends beyond map boundary)
    const edgeImg = groundTextureImages.get('LightSand');
    
    for (let row = Math.max(-maxGridRange, startRow); row <= Math.min(maxGridRange, endRow); row++) {
        for (let col = Math.max(-maxGridRange, startCol); col <= Math.min(maxGridRange, endCol); col++) {
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
            const isoY = row * tileHeight;

            const distFromCenter = Math.sqrt(isoX * isoX + isoY * isoY);
            
            // Skip if too far out
            if (distFromCenter > outerRadius) continue;
            
            // Only draw OUTSIDE the green grass area (beyond 85% of mapRadius)
            if (distFromCenter > mapRadius * 0.85) {
                if (edgeImg && edgeImg.complete && edgeImg.naturalWidth > 0) {
                    ctx.drawImage(edgeImg, isoX, isoY, tileWidth, drawHeight);
                } else {
                    // Fallback to beige color for LightSand
                    ctx.fillStyle = '#e8d4a0';
                    ctx.beginPath();
                    ctx.moveTo(isoX + tileWidth / 2, isoY);
                    ctx.lineTo(isoX + tileWidth, isoY + drawHeight / 2);
                    ctx.lineTo(isoX + tileWidth / 2, isoY + drawHeight);
                    ctx.lineTo(isoX, isoY + drawHeight / 2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }
}

// Draw default ground samples (LightSand at edges, GreenGrass in center)
function drawGroundSamples(ctx, camera, viewWidth, viewHeight) {
    const tileWidth = 120;
    const tileHeight = 30;
    const drawHeight = 70;
    const mapRadius = 2500;
    const outerRadius = 2900; // Extended boundary for LightSand (40% smaller)

    const paddingX = tileWidth * 2;
    const paddingY = drawHeight * 3;

    const startCol = Math.floor((camera.x - paddingX) / tileWidth);
    const endCol = Math.ceil((camera.x + viewWidth + paddingX) / tileWidth);
    const startRow = Math.floor((camera.y - paddingY) / tileHeight);
    const endRow = Math.ceil((camera.y + viewHeight + paddingY) / tileHeight);

    const maxGridRange = Math.ceil(outerRadius / tileHeight);

    // Get ground textures
    const greenGrassImg = groundTextureImages.get('GreenGrass');
    const lightSandImg = groundTextureImages.get('LightSand');
    
    for (let row = Math.max(-maxGridRange, startRow); row <= Math.min(maxGridRange, endRow); row++) {
        for (let col = Math.max(-maxGridRange, startCol); col <= Math.min(maxGridRange, endCol); col++) {
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
            const isoY = row * tileHeight;

            const distFromCenter = Math.sqrt(isoX * isoX + isoY * isoY);
            if (distFromCenter > outerRadius) continue;

            // Draw LightSand at edges (outside 85% of map radius)
            if (distFromCenter > mapRadius * 0.85) {
                if (lightSandImg && lightSandImg.complete && lightSandImg.naturalWidth > 0) {
                    ctx.drawImage(lightSandImg, isoX, isoY, tileWidth, drawHeight);
                } else {
                    // Fallback to sand color
                    ctx.fillStyle = '#d4c4a8';
                    ctx.beginPath();
                    ctx.moveTo(isoX + tileWidth / 2, isoY);
                    ctx.lineTo(isoX + tileWidth, isoY + drawHeight / 2);
                    ctx.lineTo(isoX + tileWidth / 2, isoY + drawHeight);
                    ctx.lineTo(isoX, isoY + drawHeight / 2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
            // Draw GreenGrass in center (inner 85%)
            else {
                if (greenGrassImg && greenGrassImg.complete && greenGrassImg.naturalWidth > 0) {
                    ctx.drawImage(greenGrassImg, isoX, isoY, tileWidth, drawHeight);
                } else {
                    // Fallback to green color
                    ctx.fillStyle = '#7cbc4a';
                    ctx.beginPath();
                    ctx.moveTo(isoX + tileWidth / 2, isoY);
                    ctx.lineTo(isoX + tileWidth, isoY + drawHeight / 2);
                    ctx.lineTo(isoX + tileWidth / 2, isoY + drawHeight);
                    ctx.lineTo(isoX, isoY + drawHeight / 2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }
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
    let needsRender = false;
    
    // Smoothly interpolate zoom - faster easing for snappier feel
    const zoomDiff = targetCanvasZoom - canvasZoom;
    if (Math.abs(zoomDiff) > 0.002) {
        canvasZoom += zoomDiff * 0.15; // Direct lerp, faster
        window.canvasZoom = canvasZoom;
        needsRender = true;
    } else if (Math.abs(zoomDiff) > 0) {
        canvasZoom = targetCanvasZoom; // Snap to target
        window.canvasZoom = canvasZoom;
        needsRender = true;
    }

    // Smoothly interpolate position - faster easing
    const offsetXDiff = targetCanvasOffsetX - canvasOffsetX;
    const offsetYDiff = targetCanvasOffsetY - canvasOffsetY;

    if (Math.abs(offsetXDiff) > 1 || Math.abs(offsetYDiff) > 1) {
        canvasOffsetX += offsetXDiff * 0.15; // Direct lerp, faster
        canvasOffsetY += offsetYDiff * 0.15;
        needsRender = true;
    } else if (Math.abs(offsetXDiff) > 0 || Math.abs(offsetYDiff) > 0) {
        canvasOffsetX = targetCanvasOffsetX; // Snap to target
        canvasOffsetY = targetCanvasOffsetY;
        needsRender = true;
    }

    // Update hover position when camera changes
    if (needsRender && isHovering && typeof lastMouseX !== 'undefined' && typeof lastMouseY !== 'undefined') {
        updateHoverPosition();
    }

    // Trigger render only if camera changed
    if (needsRender && typeof actualRenderMapCreatorCanvas === 'function') {
        actualRenderMapCreatorCanvas(); // Call directly, skip throttle for smooth animation
    }

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
        // Zoom toward screen center instead of mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate world position at screen center before zoom
        const worldX = (centerX - canvasOffsetX) / canvasZoom;
        const worldY = (centerY - canvasOffsetY) / canvasZoom;

        // Update zoom target smoothly (larger steps for faster zoom)
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.3, Math.min(4, targetCanvasZoom * zoomDelta));
        targetCanvasZoom = newZoom;

        // Adjust offset target to keep screen center stable
        targetCanvasOffsetX = centerX - worldX * newZoom;
        targetCanvasOffsetY = centerY - worldY * newZoom;

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

// Update zoom slider visuals
function updateZoomSlider(zoomValue) {
    const slider = document.getElementById('mapZoomSlider');
    const fill = document.getElementById('mapZoomSliderFill');
    const thumb = document.getElementById('mapZoomSliderThumb');

    if (!slider || !fill || !thumb) return;

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
window.zoomOut = zoomOut;// 

// Export function to global scope
window.openBlankMapCreator = openBlankMapCreator;

// Load and display saved maps
function loadSavedMaps() {
    const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    displayMapCards(maps);
}

function displayMapCards(maps) {
    const mapsGrid = document.querySelector('.maps-grid');
    if (!mapsGrid) return;

    // Remove existing map cards (keep CREATE NEW button)
    const existingCards = mapsGrid.querySelectorAll('.map-card, .map-card-meta');
    existingCards.forEach(el => el.remove());

    // If there are no maps, nothing to show
    if (!maps || maps.length === 0) return;

    // Only show the first map as a single visual card
    const map = maps[0];
    const card = document.createElement('div');
    card.className = 'map-card';

    // Map thumbnail (box should contain only visual content)
    const thumbnail = document.createElement('div');
    thumbnail.className = 'map-card-thumbnail';

    // Create canvas to render the actual map
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    thumbnail.appendChild(canvas);

    // Render the map on the canvas
    renderMapThumbnail(canvas, map);

    // Card contains only the visual thumbnail (no text/buttons inside)
    card.appendChild(thumbnail);

    // Create meta area OUTSIDE the box: map name and action buttons
    const meta = document.createElement('div');
    meta.className = 'map-card-meta';

    const title = document.createElement('h3');
    title.className = 'map-card-title';
    title.textContent = map.name;

    const actions = document.createElement('div');
    actions.className = 'map-card-actions';
    actions.innerHTML = `
        <button class="map-card-btn" onclick="editMap('${map.id}')">✏️ Edit</button>
        <button class="map-card-btn analyze-btn" onclick="analyzeMap('${map.id}')">🔍 Analyze</button>
        <button class="map-card-btn delete-btn" onclick="deleteMap('${map.id}')">🗑️ Delete</button>
    `;

    meta.appendChild(title);
    meta.appendChild(actions);

    // Insert before CREATE NEW button
    const createNewBtn = mapsGrid.querySelector('.create-new-map-btn');
    mapsGrid.insertBefore(card, createNewBtn);
    mapsGrid.insertBefore(meta, createNewBtn);

    // Clicking the visual card opens a modal popup with actions
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        showMapActionsModal(map.id, map.name);
    });
}

// Modal popup for map actions (Edit / Analyze / Delete)
function showMapActionsModal(mapId, mapName) {
    // If modal exists, remove
    const existing = document.getElementById('mapActionsModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mapActionsModal';
    overlay.className = 'map-actions-modal';
    overlay.innerHTML = `
        <div class="map-actions-card">
            <h3>${mapName}</h3>
            <div class="map-actions-buttons">
                <button class="map-card-btn" onclick="editMap('${mapId}'); removeMapActionsModal();">✏️ Edit</button>
                <button class="map-card-btn" onclick="analyzeMap('${mapId}'); removeMapActionsModal();">🔍 Analyze</button>
                <button class="map-card-btn delete-btn" onclick="deleteMap('${mapId}'); removeMapActionsModal();">🗑️ Delete</button>
                <button class="map-card-btn close-btn" onclick="removeMapActionsModal();">✖ Close</button>
            </div>
        </div>
    `;

    overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) removeMapActionsModal();
    });

    document.body.appendChild(overlay);
}

function removeMapActionsModal() {
    const existing = document.getElementById('mapActionsModal');
    if (existing) existing.remove();
}

// Edit map function
function editMap(mapId) {
    const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    const map = maps.find(m => String(m.id) === String(mapId));

    if (!map) {
        alert('Map not found!');
        return;
    }

    const vehicleType = map.vehicleType || 'tank';

    // Set current map info
    window.currentMapName = map.name;
    window.currentMapId = mapId;
    window.currentMapVehicleType = vehicleType;

    console.log('Loading map for editing:', map.name, 'Vehicle type:', vehicleType);

    // Route to correct editor and load map data
    if (vehicleType === 'jet') {
        window.currentJetMapName = map.name;
        window.currentJetMapData = map;
        if (typeof window.startJetMapEditor === 'function') {
            window.startJetMapEditor();
        }
    } else if (vehicleType === 'race') {
        window.currentRaceMapName = map.name;
        window.currentRaceMapData = map;
        if (typeof window.startRaceMapEditor === 'function') {
            window.startRaceMapEditor();
        }
    } else {
        // Tank editor - show loading and load map data
        showMapCreatorLoading();
        updateMapCreatorLoadingProgress(10, 'Loading map data...');
        
        setTimeout(() => {
            updateMapCreatorLoadingProgress(30, 'Loading ground tiles...');
            loadMap(map);
            
            setTimeout(() => {
                updateMapCreatorLoadingProgress(60, 'Loading buildings...');
                startMapEditorWithoutLoading('tank');
            }, 200);
        }, 100);
    }
}

// Start map editor without showing loading (used when editMap already shows it)
function startMapEditorWithoutLoading(vehicleType) {
    window.currentMapVehicleType = vehicleType;

    // Ensure the lobby top bar stays hidden while editing
    document.body.classList.add('in-editor');
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.style.display = 'none';
        topBar.style.visibility = 'hidden';
    }

    const blankCreator = document.getElementById('blankMapCreator');
    if (blankCreator) {
        blankCreator.classList.remove('hidden');
        const createMapCloseBtn = document.getElementById('createMapCloseBtn');
        if (createMapCloseBtn) createMapCloseBtn.style.display = 'none';
        updateMapCreatorTitle(vehicleType);
    }

    const gameMinimap = document.getElementById('minimap');
    if (gameMinimap) gameMinimap.style.display = 'none';

    canvasZoom = 0.5;
    targetCanvasZoom = 0.5;
    window.canvasZoom = 0.5;

    // Load ground textures first
    updateMapCreatorLoadingProgress(65, 'Loading ground textures...');
    
    loadCustomGroundTexture().then(() => {
        updateMapCreatorLoadingProgress(75, 'Initializing canvas...');
        initMapCreatorCanvas();
        createZoomSlider();
        
        setTimeout(() => {
            updateMapCreatorLoadingProgress(85, 'Loading assets...');
            loadAssetsForVehicleType(vehicleType);
            setupTankEditorDrag();
            
            setTimeout(() => {
                updateMapCreatorLoadingProgress(100, 'Ready!');
                setTimeout(() => hideMapCreatorLoading(), 300);
            }, 100);
        }, 100);
    });
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

// Export functions
window.loadSavedMaps = loadSavedMaps;
window.editMap = editMap;
window.analyzeMap = analyzeMap;
window.deleteMap = deleteMap; window.de
leteMap = deleteMap;
window.openBlankMapCreator = openBlankMapCreator;
// Render map thumbnail on canvas (like tankLobbyBackground)
function renderMapThumbnail(canvas, mapData) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dark background gradient (like lobby)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(5, 10, 25, 1)');
    gradient.addColorStop(0.5, 'rgba(10, 15, 35, 1)');
    gradient.addColorStop(1, 'rgba(15, 20, 40, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const TILE_WIDTH = mapData.settings?.tileWidth || 120;
    const TILE_HEIGHT = mapData.settings?.tileHeight || 30;
    const TILE_DRAW_HEIGHT = mapData.settings?.tileDrawHeight || 70;
    
    // Calculate scale to fit entire map
    const scale = 0.15; // Zoom out more to show full map
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Load and render ground tiles with actual images
    if (mapData.groundTiles && mapData.groundTiles.length > 0) {
        mapData.groundTiles.forEach(tile => {
            if (!tile.key) return;
            const [colStr, rowStr] = tile.key.split(',');
            const col = parseInt(colStr, 10);
            const row = parseInt(rowStr, 10);
            
            // Calculate isometric position
            const isoX = col * TILE_WIDTH + (row % 2) * (TILE_WIDTH / 2);
            const isoY = row * TILE_HEIGHT;
            
            const x = centerX + isoX * scale;
            const y = centerY + isoY * scale;
            const w = TILE_WIDTH * scale;
            const h = TILE_DRAW_HEIGHT * scale;
            
            // Draw tile with image if available
            if (tile.image) {
                const img = new Image();
                img.src = tile.image;
                img.onload = () => {
                    ctx.drawImage(img, x, y, w, h);
                };
                // Fallback color while image loads
                ctx.fillStyle = tile.type === 'LightSand' ? 'rgba(255, 235, 180, 0.3)' : 'rgba(180, 180, 180, 0.3)';
                ctx.fillRect(x, y, w, h);
            } else {
                ctx.fillStyle = tile.type === 'LightSand' ? 'rgba(255, 235, 180, 0.3)' : 'rgba(180, 180, 180, 0.3)';
                ctx.fillRect(x, y, w, h);
            }
        });
    }
    
    // Render objects with their actual images
    if (mapData.objects && mapData.objects.length > 0) {
        mapData.objects.forEach(obj => {
            const x = centerX + obj.x * scale;
            const y = centerY + obj.y * scale;
            const w = (obj.width || 50) * scale;
            const h = (obj.height || 50) * scale;
            
            if (obj.image) {
                const img = new Image();
                img.src = obj.image;
                img.onload = () => {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.drawImage(img, -w/2, -h/2, w, h);
                    ctx.restore();
                };
                // Fallback while image loads
                ctx.fillStyle = 'rgba(0, 247, 255, 0.3)';
                ctx.fillRect(x - w/2, y - h/2, w, h);
            } else {
                ctx.fillStyle = 'rgba(0, 247, 255, 0.6)';
                ctx.fillRect(x - w/2, y - h/2, w, h);
                ctx.strokeStyle = 'rgba(0, 247, 255, 0.9)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x - w/2, y - h/2, w, h);
            }
        });
    }
}
window.renderMapThumbnail = renderMapThumbnail;
