// creatmap.backup.js neutralized
// The legacy create-map backup has been consolidated into
// /src/client/js/mapCreator/TankMapCreator.js. This file is
// intentionally left as a stub to avoid duplicate implementations.
console.warn('creatmap.backup.js stub active — use TankMapCreator.js');

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

    // Create HTML overlay buttons
    createInteractiveElements();

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

// Placed objects on the map
let placedObjects = [];

// Ground tile customization - store custom ground textures per tile
let customGroundTiles = new Map(); // key: "x,y", value: texture type

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
    console.log('Opening map name input...');

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
        <h2 style="color: #00f7ff; margin-bottom: 20px;">🗺️ Name Your Map</h2>
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
                color: black;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">Create Map</button>
        </div>
    `;

    modal.appendChild(container);
    document.body.appendChild(modal);

    // Focus the input
    const input = document.getElementById('mapNameInput');
    input.focus();

    // Handle cancel
    document.getElementById('cancelBtn').onclick = () => {
        modal.remove();
    };

    // Handle create
    document.getElementById('createBtn').onclick = () => {
        const mapName = input.value.trim();
        if (!mapName) {
            alert('Please enter a map name!');
            return;
        }

        // Store map name and open editor
        window.currentMapName = mapName;
        modal.remove();
        startMapEditor();
    };

    // Handle Enter key
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            document.getElementById('createBtn').click();
        }
    };
}

function startMapEditor() {
    console.log('Starting map editor for:', window.currentMapName);

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
    }, 100);
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
    input.min = '0.5';
    input.max = '3';
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
    const scale = width / (mapRadiusPixels * 2);
    const worldTileWidth = 120;
    const worldTileHeight = 30;
    const minimapTileWidth = worldTileWidth * scale;
    const minimapTileHeight = worldTileHeight * scale;

    // Calculate where screen center points to in world coordinates
    const mainCanvas = document.getElementById('mapCreatorCanvas');
    const screenCenterWorldX = mainCanvas ? (mainCanvas.width / 2 - canvasOffsetX) / canvasZoom : 0;
    const screenCenterWorldY = mainCanvas ? (mainCanvas.height / 2 - canvasOffsetY) / canvasZoom : 0;

    // Draw water background first with enhanced color
    ctx.fillStyle = '#2a7ab8';
    ctx.fillRect(0, 0, width, height);

    // Draw ground PNG textures if available
    if (typeof groundTextureImages !== 'undefined' && groundTextureImages.size > 0) {
        const groundTypes = Array.from(groundTextureImages.keys());

        // Calculate visible tile range around screen center
        const maxGridRange = Math.ceil(mapRadiusPixels / worldTileHeight);
        const startRow = Math.max(-maxGridRange, Math.floor((screenCenterWorldY - radius / scale) / worldTileHeight));
        const endRow = Math.min(maxGridRange, Math.ceil((screenCenterWorldY + radius / scale) / worldTileHeight));
        const startCol = Math.max(-maxGridRange, Math.floor((screenCenterWorldX - radius / scale) / worldTileWidth));
        const endCol = Math.min(maxGridRange, Math.ceil((screenCenterWorldX + radius / scale) / worldTileWidth));

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                // Calculate isometric position (same as main canvas)
                const isoX = col * worldTileWidth + (row % 2) * (worldTileWidth / 2);
                const isoY = row * worldTileHeight;

                // Check if within circular map boundary (world coordinates)
                const distFromMapCenter = Math.sqrt(isoX * isoX + isoY * isoY);
                if (distFromMapCenter > mapRadiusPixels) continue;

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
                        groundType = customTile.type; // Extract the type from the object
                    } else {
                        // Use ground12 as default (same as main canvas)
                        groundType = 'ground12';
                    }

                    const groundImg = groundTextureImages.get(groundType);
                    if (groundImg && groundImg.complete) {
                        ctx.drawImage(groundImg, minimapX, minimapY, minimapTileWidth, minimapTileWidth * 0.6);
                    }
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
    document.getElementById('blankMapCreator').classList.add('hidden');

    // Show the create map screen again
    const createMapScreen = document.getElementById('createMapScreen');
    if (createMapScreen) {
        createMapScreen.classList.remove('hidden');
    }

    // Refresh the saved maps display
    loadSavedMaps();

    // Remove zoom slider
    const slider = document.getElementById('mapCreatorZoomSlider');
    if (slider) {
        slider.remove();
        console.log('Zoom slider removed');
    }

    // Remove minimap
    const minimap = document.getElementById('mapCreatorMinimap');
    if (minimap) {
        minimap.remove();
        console.log('Minimap removed');
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

    // Update button states
    document.querySelectorAll('.asset-category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
            // Update button styling
            if (category === 'ground') {
                btn.style.background = 'rgba(139, 69, 19, 0.5)';
                btn.style.borderColor = 'rgba(139, 69, 19, 0.8)';
                btn.style.color = '#d2691e';
            } else if (category === 'asteroids') {
                btn.style.background = 'rgba(255, 165, 0, 0.4)';
                btn.style.borderColor = 'rgba(255, 165, 0, 0.8)';
                btn.style.color = '#ffa500';
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
            } else if (btn.dataset.category === 'asteroids') {
                btn.style.background = 'rgba(255, 165, 0, 0.2)';
                btn.style.borderColor = 'rgba(255, 165, 0, 0.6)';
                btn.style.color = 'rgba(255, 255, 255, 0.8)';
            } else {
                btn.style.background = 'rgba(0, 247, 255, 0.2)';
                btn.style.borderColor = 'rgba(0, 247, 255, 0.6)';
                btn.style.color = 'rgba(255, 255, 255, 0.8)';
            }
        }
    });

    // Load assets for this category
    loadAssets(category);
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
    assetsGrid.innerHTML = '';

    // If we're viewing a specific object's files, show those
    if (currentObjectFolder) {
        loadObjectFiles(currentObjectFolder);
        return;
    }

    // Ground PNG textures - all 18 ground tiles
    const groundTextures = [
        { name: 'Ground 1', type: 'ground1', file: 'Grounds/_Group_.png' },
        { name: 'Ground 2', type: 'ground2', file: 'Grounds/_Group_ (1).png' },
        { name: 'Ground 3', type: 'ground3', file: 'Grounds/_Group_ (2).png' },
        { name: 'Ground 4', type: 'ground4', file: 'Grounds/_Group_ (3).png' },
        { name: 'Ground 5', type: 'ground5', file: 'Grounds/_Group_ (4).png' },
        { name: 'Ground 6', type: 'ground6', file: 'Grounds/_Group_ (5).png' },
        { name: 'Ground 7', type: 'ground7', file: 'Grounds/_Group_ (6).png' },
        { name: 'Ground 8', type: 'ground8', file: 'Grounds/_Group_ (7).png' },
        { name: 'Ground 9', type: 'ground9', file: 'Grounds/_Group_ (8).png' },
        { name: 'Ground 10', type: 'ground10', file: 'Grounds/_Group_ (9).png' },
        { name: 'Ground 11', type: 'ground11', file: 'Grounds/_Group_ (10).png' },
        { name: 'Ground 12', type: 'ground12', file: 'Grounds/_Group_ (11).png' },
        { name: 'Ground 13', type: 'ground13', file: 'Grounds/_Group_ (12).png' },
        { name: 'Ground 14', type: 'ground14', file: 'Grounds/_Group_ (13).png' },
        { name: 'Ground 15', type: 'ground15', file: 'Grounds/_Group_ (14).png' },
        { name: 'Ground 16', type: 'ground16', file: 'Grounds/_Group_ (15).png' },
        { name: 'Ground 17', type: 'ground17', file: 'Grounds/_Group_ (16).png' },
        { name: 'Ground 18', type: 'ground18', file: 'Grounds/_Group_ (17).png' }
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

    // Show asteroids category
    if (category === 'asteroids') {
        const asteroidSizes = ['Large 1', 'Large 2', 'Medium 1', 'Medium 2', 'Small 1', 'Small 2'];
        const asteroidTypes = ['Rock', 'Ice', 'Gold'];

        asteroidSizes.forEach(size => {
            asteroidTypes.forEach(type => {
                const assetItem = document.createElement('div');
                assetItem.className = 'asset-item-list';

                // Use first frame of asteroid animation
                const imagePath = `/assets/Asteroids/Asteroid ${size}/${type}/spr_asteroids_${size.toLowerCase().replace(' ', '')}_${type.toLowerCase()}_01.png`;

                const asset = {
                    name: `${size} ${type} Asteroid`,
                    folder: 'Asteroids',
                    fileName: `spr_asteroids_${size.toLowerCase().replace(' ', '')}_${type.toLowerCase()}_01.png`,
                    image: imagePath,
                    isFolder: false,
                    asteroidSize: size,
                    asteroidType: type
                };

                assetItem.onclick = () => selectAsset(asset, assetItem);

                assetItem.innerHTML = `
                    <div style="width: 50px; height: 50px; background: rgba(20, 30, 50, 0.5); border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid rgba(255,165,0,0.2);">
                        <img src="${imagePath}" alt="${asset.name}" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                        <div style="color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 500;">${asset.name}</div>
                        <div style="color: rgba(255, 165, 0, 0.6); font-size: 11px;">Click to place</div>
                    </div>
                `;

                assetsGrid.appendChild(assetItem);
            });
        });

        // Add info message
        const infoMsg = document.createElement('div');
        infoMsg.style.cssText = 'padding: 15px; margin-top: 10px; background: rgba(255, 165, 0, 0.1); border: 1px solid rgba(255, 165, 0, 0.3); border-radius: 8px; color: rgba(255, 255, 255, 0.7); font-size: 12px; line-height: 1.5;';
        infoMsg.innerHTML = `
            <div style="font-weight: 600; color: #ffa500; margin-bottom: 5px;">🌌 Asteroid Placement</div>
            Select an asteroid and click on the map to place it!<br>
            Asteroids add visual interest and obstacles to your battle arena.
        `;
        assetsGrid.appendChild(infoMsg);

        return;
    }

    // Show buildings category
    if (category === 'buildings') {
        // Use Buildings folder
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

            const imagePath = `/assets/${viewFolder}/${objName}/spr_${viewFolderName}_${fileName}_${frontName}.png`;

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

        const imagePath = `/assets/${asset.viewFolder}/${asset.folder}/spr_${viewFolderName}_${fileName}_${directionSuffix}.png`;

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
                if (distFromMapCenter > MAP_RADIUS * 0.85) {
                    groundType = 'ground1';  // Water at outer edges
                    groundImage = '/assets/Grounds/_Group_.png';
                } else {
                    groundType = 'ground13'; // Default ground in center
                    groundImage = '/assets/Grounds/_Group_ (12).png';
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

    // Test render to make sure canvas is working
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 100, 100);
    console.log('✅ Test render completed');

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
    
    // Add a test pattern to make sure canvas is working
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(50, 50, 100, 100);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(200, 50, 100, 100);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(350, 50, 100, 100);
    
    console.log('✅ Test pattern drawn at canvas top');

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
    console.log('=== CANVAS CLICK EVENT ===');
    console.log('Button:', e.button, 'isDragging:', isDragging);

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

    // Convert to world space (accounting for zoom and pan)
    const worldX = (mouseX - canvasOffsetX) / canvasZoom;
    const worldY = (mouseY - canvasOffsetY) / canvasZoom;

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

        // Store the ground type for this tile
        customGroundTiles.set(tileKey, {
            type: selectedAsset.groundType,
            image: selectedAsset.image
        });

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
            placedObjects.push({
                asset: selectedAsset,
                x: worldX,
                y: worldY,
                image: img
            });

            console.log('✓✓✓ Successfully placed object at:', worldX, worldY);
            console.log('Total objects:', placedObjects.length);
            renderMapCreatorCanvas();
        } else {
            console.error('❌ Image loaded but has no dimensions');
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

    // Calculate world position for hover preview
    hoverWorldX = (lastMouseX - canvasOffsetX) / canvasZoom;
    hoverWorldY = (lastMouseY - canvasOffsetY) / canvasZoom;
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
    console.log('🌊 Drawing water tiles...', { camera, viewWidth, viewHeight });
    
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

    console.log('🌊 Water tile range:', { startCol, endCol, startRow, endRow });

    let tilesDrawn = 0;
    // Draw water tiles
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            // Calculate isometric position
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
            const isoY = row * tileHeight;

            // Draw water tile with isometric shape
            drawWaterTile(ctx, isoX, isoY, tileWidth, drawHeight);
            tilesDrawn++;
        }
    }
    
    console.log('🌊 Drew', tilesDrawn, 'water tiles');
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

// Draw ground textures randomly scattered in a circular map
function drawGroundSamples(ctx, camera, viewWidth, viewHeight) {
    if (!groundTexturesLoaded) {
        console.warn('⚠️ Ground textures not loaded yet');
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

            // Use water (ground1) at edges, ground13 in center
            let groundType;
            if (distFromMapCenter > mapRadiusPixels * 0.85) {
                groundType = 'ground1'; // Water at outer edges
            } else {
                groundType = 'ground13'; // Default ground in center
            }

            if (!groundTextureImages.has(groundType)) continue;

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

    if (customTilesRendered > 0) {
        console.log('✅ Rendered', customTilesRendered, 'custom ground tiles');
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

function loadCustomGroundTexture() {
    // Load all 18 ground PNG textures
    const groundFiles = [
        'Grounds/_Group_.png',
        'Grounds/_Group_ (1).png',
        'Grounds/_Group_ (2).png',
        'Grounds/_Group_ (3).png',
        'Grounds/_Group_ (4).png',
        'Grounds/_Group_ (5).png',
        'Grounds/_Group_ (6).png',
        'Grounds/_Group_ (7).png',
        'Grounds/_Group_ (8).png',
        'Grounds/_Group_ (9).png',
        'Grounds/_Group_ (10).png',
        'Grounds/_Group_ (11).png',
        'Grounds/_Group_ (12).png',
        'Grounds/_Group_ (13).png',
        'Grounds/_Group_ (14).png',
        'Grounds/_Group_ (15).png',
        'Grounds/_Group_ (16).png',
        'Grounds/_Group_ (17).png'
    ];

    let loadedCount = 0;

    groundFiles.forEach((file, index) => {
        const img = new Image();
        const groundType = `ground${index + 1}`;

        img.onload = () => {
            groundTextureImages.set(groundType, img);
            groundTextureImages.set(file, img); // Also store by filename
            loadedCount++;

            if (loadedCount === groundFiles.length) {
                groundTexturesLoaded = true;
                console.log(`✓ All ${groundFiles.length} ground textures loaded`);
            }
        };

        img.onerror = () => {
            console.warn(`Failed to load ground texture: ${file}`);
            loadedCount++;

            if (loadedCount === groundFiles.length) {
                groundTexturesLoaded = true;
            }
        };

        img.src = `/assets/${file}`;
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
    if (Math.abs(zoomDiff) > 0.001) {
        // Calculate easing factor based on distance (closer = slower)
        const distance = Math.abs(zoomDiff);
        const normalizedDistance = Math.min(distance / 2, 1); // Normalize to 0-1
        const easedFactor = easeOutCubic(normalizedDistance) * smoothingFactor + 0.05;

        canvasZoom += zoomDiff * easedFactor;
        window.canvasZoom = canvasZoom;
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

    // Load the map data (you'll need to implement loadMap function)
    console.log('Loading map for editing:', map.name);

    // Open the editor
    startMapEditor();
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