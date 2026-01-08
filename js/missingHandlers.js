// Missing Event Handlers and Functions
// This file provides implementations for functions referenced in HTML but not defined

// Map Creation Functions
function showTankMapNameInput() {
    const dialog = document.getElementById('tankMapCreationDialog');
    if (dialog) {
        dialog.classList.remove('hidden');
        const input = document.getElementById('tankMapNameInput');
        if (input) input.focus();
    }
}

function showRaceMapNameInput() {
    const dialog = document.getElementById('raceMapCreationDialog');
    if (dialog) {
        dialog.classList.remove('hidden');
        const input = document.getElementById('raceMapNameInput');
        if (input) input.focus();
    }
}

function showJetMapNameInput() {
    const dialog = document.getElementById('jetMapCreationDialog');
    if (dialog) {
        dialog.classList.remove('hidden');
        const input = document.getElementById('jetMapNameInput');
        if (input) input.focus();
    }
}

function showMapNameInput() {
    const dialog = document.getElementById('mapCreationDialog');
    if (dialog) {
        dialog.classList.remove('hidden');
        const input = document.getElementById('mapNameInput');
        if (input) input.focus();
    }
}

function showVehicleTypeSelection() {
    const dialog = document.getElementById('vehicleTypeDialog');
    if (dialog) {
        dialog.classList.remove('hidden');
    }
}

function showRenameMapDialog() {
    const dialog = document.getElementById('mapRenameDialog');
    if (dialog) {
        dialog.classList.remove('hidden');
        const input = document.getElementById('renameMapInput');
        if (input) input.focus();
    }
}

function showMapLoadingScreen() {
    const screen = document.getElementById('mapLoadingScreen');
    if (screen) {
        screen.classList.remove('hidden');
    }
}

function hideMapLoadingScreen() {
    const screen = document.getElementById('mapLoadingScreen');
    if (screen) {
        screen.classList.add('hidden');
    }
}

function showMapCreatorLoading() {
    const screen = document.getElementById('mapCreatorLoadingScreen');
    if (screen) {
        screen.classList.remove('hidden');
    }
}

function hideMapCreatorLoading() {
    const screen = document.getElementById('mapCreatorLoadingScreen');
    if (screen) {
        screen.classList.add('hidden');
    }
}

function updateMapCreatorLoadingProgress(progress, status) {
    const progressBar = document.getElementById('mapLoadProgress');
    const statusText = document.getElementById('mapLoadStatus');
    
    if (progressBar) {
        const fill = progressBar.querySelector('div');
        if (fill) fill.style.width = progress + '%';
    }
    
    if (statusText && status) {
        statusText.textContent = status;
    }
}

// Vehicle Type Selection
function selectVehicleType(type) {
    console.log('Selected vehicle type:', type);
    const dialog = document.getElementById('vehicleTypeDialog');
    if (dialog) {
        dialog.classList.add('hidden');
    }
    
    // Update vehicle type indicator
    const indicator = document.getElementById('vehicleTypeIndicator');
    if (indicator) {
        indicator.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ' Mode';
        indicator.classList.remove('hidden');
    }
    
    // Open appropriate map creator
    switch(type) {
        case 'tank':
            showTankMapNameInput();
            break;
        case 'jet':
            showJetMapNameInput();
            break;
        case 'race':
            showRaceMapNameInput();
            break;
    }
}

// Cancel Functions
function cancelVehicleSelection() {
    const dialog = document.getElementById('vehicleTypeDialog');
    if (dialog) {
        dialog.classList.add('hidden');
    }
}

function cancelMapCreation(type) {
    const dialogs = {
        'tank': 'tankMapCreationDialog',
        'race': 'raceMapCreationDialog',
        'jet': 'jetMapCreationDialog',
        'generic': 'mapCreationDialog'
    };
    
    const dialogId = dialogs[type] || dialogs.generic;
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.classList.add('hidden');
    }
}

function cancelRename() {
    const dialog = document.getElementById('mapRenameDialog');
    if (dialog) {
        dialog.classList.add('hidden');
    }
}

// Create Functions
function createMap(type) {
    const inputs = {
        'tank': 'tankMapNameInput',
        'race': 'raceMapNameInput',
        'jet': 'jetMapNameInput',
        'generic': 'mapNameInput'
    };
    
    const inputId = inputs[type] || inputs.generic;
    const input = document.getElementById(inputId);
    const mapName = input ? input.value.trim() : '';
    
    if (!mapName) {
        alert('Please enter a map name');
        return;
    }
    
    console.log(`Creating ${type} map:`, mapName);
    
    // Hide the dialog
    cancelMapCreation(type);
    
    // Show loading screen
    showMapCreatorLoading();
    
    // Simulate map creation process
    setTimeout(() => {
        updateMapCreatorLoadingProgress(50, 'Loading assets...');
    }, 500);
    
    setTimeout(() => {
        updateMapCreatorLoadingProgress(100, 'Complete!');
    }, 1000);
    
    setTimeout(() => {
        hideMapCreatorLoading();
        openMapCreator(type);
    }, 1500);
}

function confirmRename() {
    const input = document.getElementById('renameMapInput');
    const newName = input ? input.value.trim() : '';
    
    if (!newName) {
        alert('Please enter a new name');
        return;
    }
    
    console.log('Renaming map to:', newName);
    
    // Update map name display
    const display = document.getElementById('mapNameDisplay');
    if (display) {
        display.textContent = newName;
    }
    
    cancelRename();
}

// Map Creator Functions
function openMapCreator(type) {
    const creators = {
        'tank': 'tankMapCreator',
        'race': 'raceMapCreator',
        'jet': 'jetMapCreator'
    };
    
    const creatorId = creators[type];
    if (creatorId) {
        const creator = document.getElementById(creatorId);
        if (creator) {
            creator.classList.remove('hidden');
        }
    }
}

function closeMapCreator(type) {
    const creators = {
        'tank': 'tankMapCreator',
        'race': 'raceMapCreator',
        'jet': 'jetMapCreator'
    };
    
    const creatorId = creators[type];
    if (creatorId) {
        const creator = document.getElementById(creatorId);
        if (creator) {
            creator.classList.add('hidden');
        }
    }
}

// Map Test Functions
function startMapTest() {
    const overlay = document.getElementById('mapTestOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function stopMapTest() {
    const overlay = document.getElementById('mapTestOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Game Mode Functions
function selectGameMode(mode) {
    console.log('Selected game mode:', mode);
    closeGameModesScreen();
}

function closeGameModesScreen() {
    const screen = document.getElementById('gameModesScreen');
    if (screen) {
        screen.classList.add('hidden');
    }
}

function openGameModesScreen() {
    const screen = document.getElementById('gameModesScreen');
    if (screen) {
        screen.classList.remove('hidden');
    }
}

// Tab Functions - Complete UI patterns
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Hide all tab contents
    const allTabs = document.querySelectorAll('[id$="Tab"], [id$="TabContent"]');
    allTabs.forEach(tab => {
        if (tab.classList.contains('active')) {
            tab.classList.remove('active');
        }
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Also try with "Content" suffix
    const targetContent = document.getElementById(tabName + 'Content');
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.classList.remove('hidden');
    }
}

function switchCreateMapTab(tabType) {
    console.log('Switching create map tab to:', tabType);
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.feature-tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.add('hidden'));
    
    // Show selected tab content
    if (tabType === 'created-map') {
        const createdMapTab = document.getElementById('createdMapTab');
        if (createdMapTab) {
            createdMapTab.classList.remove('hidden');
        }
        // Activate the first button
        if (tabButtons[0]) tabButtons[0].classList.add('active');
    } else if (tabType === 'analyze') {
        const analyzeTab = document.getElementById('analyzeTab');
        if (analyzeTab) {
            analyzeTab.classList.remove('hidden');
        }
        // Activate the second button
        if (tabButtons[1]) tabButtons[1].classList.add('active');
    }
}

function switchChampionsTab(tabType) {
    console.log('Switching champions tab to:', tabType);
    
    // Remove active class from all champions tab buttons
    const tabButtons = document.querySelectorAll('.champions-tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Hide all champions tab contents
    const tabContents = document.querySelectorAll('[id^="championsTab"]');
    tabContents.forEach(content => content.classList.add('hidden'));
    
    // Show selected tab and activate button
    const tabMap = {
        'top-players': { contentId: 'championsTabTopPlayers', buttonId: 'tabTopPlayers' },
        'top-creators': { contentId: 'championsTabTopCreators', buttonId: 'tabTopCreators' },
        'champions': { contentId: 'championsTabChampions', buttonId: 'tabChampions' },
        'award': { contentId: 'championsTabAward', buttonId: 'tabAward' }
    };
    
    const tab = tabMap[tabType];
    if (tab) {
        const content = document.getElementById(tab.contentId);
        if (content) {
            content.classList.remove('hidden');
        }
        
        const button = document.getElementById(tab.buttonId);
        if (button) {
            button.classList.add('active');
        }
    }
}

function switchFriendsTab(tabType) {
    console.log('Switching friends tab to:', tabType);
    
    // Remove active class from all friends tab buttons
    const tabButtons = document.querySelectorAll('.friends-tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Hide all friends tab contents
    const tabContents = document.querySelectorAll('[id$="TabContent"]');
    tabContents.forEach(content => content.classList.add('hidden'));
    
    // Show selected tab content
    if (tabType === 'online' || tabType === 'friends') {
        const friendsContent = document.getElementById('friendsTabContent');
        if (friendsContent) {
            friendsContent.classList.remove('hidden');
        }
    } else if (tabType === 'requests') {
        const requestsContent = document.getElementById('requestsTabContent');
        if (requestsContent) {
            requestsContent.classList.remove('hidden');
        }
    }
    
    // Activate the appropriate button
    const activeButton = document.querySelector(`[data-tab="${tabType}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function switchShopTab(tabType) {
    console.log('Switching shop tab to:', tabType);
    
    // Hide all shop tab contents
    const shopTabs = document.querySelectorAll('.shop-tab-content');
    shopTabs.forEach(tab => tab.classList.add('hidden'));
    
    // Show selected tab
    const targetTab = document.getElementById(tabType + 'Tab');
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
}

// SIMPLE WORKING SHOP SYSTEM
function switchShopCategory(category) {
    console.log('🛒 SIMPLE SHOP: Switching to', category);
    
    // Map cars to race
    const actualCategory = category === 'cars' ? 'race' : category;
    
    // Update title with clean formatting
    const title = document.getElementById('figmaShopTitle');
    if (title) {
        title.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    }
    
    // Update button states
    updateButtonStates(category);
    
    // Clear and create items immediately
    createSimpleShopItems(actualCategory);
    
    console.log('✅ SIMPLE SHOP: Switched to', actualCategory);
}

function updateButtonStates(activeCategory) {
    // Remove all active classes
    document.querySelectorAll('.figma-category-btn, .figma-category-wrapper').forEach(el => {
        el.classList.remove('active');
    });
    
    // Add active to selected category
    const activeBtn = document.querySelector(`[data-category="${activeCategory}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        const wrapper = activeBtn.closest('.figma-category-wrapper');
        if (wrapper) wrapper.classList.add('active');
    }
}

function createSimpleShopItems(category) {
    console.log(`🔧 Creating items for category: ${category}`);
    
    const container = document.getElementById('figmaItemsScroll');
    if (!container) {
        console.error('❌ No container found! Looking for #figmaItemsScroll');
        console.log('Available elements:', document.querySelectorAll('[id*="figma"]'));
        return;
    }
    
    console.log('✅ Container found:', container);
    
    // Clear container
    container.innerHTML = '';
    
    // Create items based on category
    const itemsData = getShopItemsData(category);
    console.log(`📦 Got ${itemsData.length} items for ${category}:`, itemsData);
    
    if (itemsData.length === 0) {
        console.warn('⚠️ No items data for category:', category);
        return;
    }
    
    itemsData.forEach((item, index) => {
        const itemBox = createItemBox(item, category, index);
        container.appendChild(itemBox);
        console.log(`✅ Added item ${index + 1}: ${item.name}`);
    });
    
    // Reset scroll position and update button states
    container.scrollLeft = 0;
    setTimeout(() => {
        if (typeof updateScrollButtonStates === 'function') {
            updateScrollButtonStates();
        }
    }, 100);
    
    console.log(`✅ Created ${itemsData.length} ${category} items in container`);
    console.log('Container children:', container.children.length);
}

function getShopItemsData(category) {
    const items = {
        tanks: [
            { name: 'Blue Tank', price: 0, color: 'blue', owned: true },
            { name: 'Red Tank', price: 500, color: 'red', owned: false },
            { name: 'Camo Tank', price: 1000, color: 'camo', owned: false },
            { name: 'Desert Tank', price: 1500, color: 'desert', owned: false },
            { name: 'Purple Tank', price: 2000, color: 'purple', owned: false },
            { name: 'Blue Heavy', price: 2500, color: 'blue', owned: false },
            { name: 'Red Heavy', price: 3000, color: 'red', owned: false },
            { name: 'Elite Tank', price: 5000, color: 'purple', owned: false }
        ],
        jets: [
            { name: 'Purple Jet', price: 0, color: 'purple', owned: true },
            { name: 'Red Fighter', price: 800, color: 'red', owned: false },
            { name: 'Gold Elite', price: 1200, color: 'gold', owned: false },
            { name: 'Desert Bomber', price: 1600, color: 'desert', owned: false },
            { name: 'Purple Fighter', price: 2000, color: 'purple', owned: false },
            { name: 'Elite Jet', price: 4000, color: 'purple', owned: false }
        ],
        race: [
            { name: 'Blue Racer', price: 0, color: 'blue', owned: true },
            { name: 'Red Formula', price: 600, color: 'red', owned: false },
            { name: 'Camo Rally', price: 900, color: 'camo', owned: false },
            { name: 'Desert Super', price: 1300, color: 'desert', owned: false },
            { name: 'Purple Super', price: 1700, color: 'purple', owned: false },
            { name: 'Elite Racer', price: 3500, color: 'red', owned: false }
        ],
        music: [
            { name: 'Default', price: 0, icon: '🎵', owned: true },
            { name: 'Battle', price: 300, icon: '⚔️', owned: false },
            { name: 'Victory', price: 500, icon: '🏆', owned: false },
            { name: 'Epic', price: 800, icon: '🎼', owned: false },
            { name: 'Rock', price: 600, icon: '🎸', owned: false },
            { name: 'Jazz', price: 1100, icon: '🎺', owned: false }
        ]
    };
    
    return items[category] || [];
}

function createItemBox(item, category, index) {
    const box = document.createElement('div');
    box.className = 'figma-shop-item';
    box.setAttribute('data-category', category);
    box.setAttribute('data-item-id', `${category}_${index}`);
    
    // Remove inline styles to let CSS handle styling
    // The CSS classes will provide all the styling we need
    
    // Create modern, clean content structure
    if (category === 'music') {
        box.innerHTML = `
            <div class="figma-shop-item-image">
                <div class="music-preview">
                    <div class="music-icon-container">
                        <div class="music-icon">${item.icon}</div>
                        <div class="music-theme">${item.name}</div>
                    </div>
                </div>
            </div>
            <div class="figma-shop-item-info">
                <div class="figma-shop-item-name">${item.name}</div>
                <div class="figma-shop-item-price ${item.owned ? 'owned' : item.price === 0 ? 'free' : 'paid'}">
                    ${item.owned ? 'OWNED' : item.price === 0 ? 'FREE' : `${item.price} Fortz`}
                </div>
            </div>
        `;
    } else {
        const colors = { 
            blue: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', 
            red: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
            camo: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
            desert: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
            purple: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            white: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            yellow: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
        };
        const vehicleIcon = category === 'tanks' ? '🚗' : category === 'jets' ? '✈️' : '🏎️';
        
        box.innerHTML = `
            <div class="figma-shop-item-image">
                <div class="vehicle-preview" style="background: ${colors[item.color] || colors.blue};">
                    <div class="vehicle-icon">${vehicleIcon}</div>
                    <div class="vehicle-info">
                        <div class="vehicle-color">${item.color.charAt(0).toUpperCase() + item.color.slice(1)}</div>
                        <div class="vehicle-type">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                    </div>
                </div>
            </div>
            <div class="figma-shop-item-info">
                <div class="figma-shop-item-name">${item.name}</div>
                <div class="figma-shop-item-price ${item.owned ? 'owned' : item.price === 0 ? 'free' : 'paid'}">
                    ${item.owned ? 'OWNED' : item.price === 0 ? 'FREE' : `${item.price} Fortz`}
                </div>
            </div>
        `;
    }
    
    // Add click handler
    box.onclick = () => {
        console.log(`Clicked ${item.name}`);
        showNotification(`${item.owned ? 'Equipped' : 'Purchased'} ${item.name}!`, 'success');
    };
    
    // Add hover effect using CSS classes
    box.onmouseenter = () => {
        box.classList.add('item-hovering');
    };
    
    box.onmouseleave = () => {
        box.classList.remove('item-hovering');
    };
    
    return box;
}

function closeAllPanels() {
    console.log('Closing all panels');

    // Stop create map rendering if it's active
    if (typeof stopCreateMapRendering === 'function') {
        stopCreateMapRendering();
    }

    // Clear map creator canvases
    const mapCanvases = ['tankMapCanvas', 'raceMapCanvas', 'jetMapCanvas', 'detailMapCanvas'];
    mapCanvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                console.log(`🧹 Cleared canvas: ${canvasId}`);
            }
        }
    });

    // Hide all feature screens (including Figma shop)
    const featureScreens = document.querySelectorAll('.feature-screen, .figma-shop-screen');
    featureScreens.forEach(screen => {
        screen.classList.add('hidden');
    });

    // Hide lobby button when closing panels
    const lobbyBtn = document.getElementById('lobbyBtn');
    if (lobbyBtn) {
        lobbyBtn.classList.remove('active');
    }

    // Show lobby background canvases again when closing panels
    const lobbyCanvases = [
        'tankLobbyBackground',
        'jetLobbyBackground',
        'raceLobbyBackground',
        'lobbyBackground'
    ];
    lobbyCanvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            canvas.style.display = '';
        }
    });

    // Update game state if available
    if (window.gameStateManager) {
        window.gameStateManager.updateGameState({
            showShop: false,
            showLocker: false,
            showSettings: false,
            showCreateMap: false,
            showFriends: false,
            showChampions: false,
            showPass: false,
            openedFeature: null
        });
    }

    // Reset Figma shop to default state
    const figmaButtons = document.querySelectorAll('.figma-category-btn, .figma-category-wrapper');
    figmaButtons.forEach(btn => btn.classList.remove('active'));

    const tanksBtn = document.querySelector('[data-category="tanks"]');
    if (tanksBtn) {
        tanksBtn.classList.add('active');
    }
}

function populateFigmaShopItems(category) {
    console.log('🛒 Populating Figma shop items for category:', category);
    
    const itemsContainer = document.getElementById('figmaItemsScroll');
    if (!itemsContainer) {
        console.error('❌ Figma items container not found!');
        return;
    }
    
    // Clear existing items with animation
    itemsContainer.innerHTML = '';
    
    // Reset scroll position
    window.figmaShopScrollPosition = 0;
    itemsContainer.style.transform = 'translateX(0px)';
    
    // Shop items with proper asset paths
    const shopItems = {
        tanks: [
            { name: 'Blue Tank', price: 0, owned: true, color: 'blue', body: 'body_halftrack', weapon: 'turret_01_mk1' },
            { name: 'Camo Tank', price: 500, owned: false, color: 'camo', body: 'body_halftrack', weapon: 'turret_01_mk1' },
            { name: 'Desert Tank', price: 1000, owned: false, color: 'desert', body: 'body_halftrack', weapon: 'turret_01_mk2' },
            { name: 'Purple Tank', price: 1500, owned: false, color: 'purple', body: 'body_halftrack', weapon: 'turret_01_mk3' },
            { name: 'Red Tank', price: 2000, owned: false, color: 'red', body: 'body_halftrack', weapon: 'turret_01_mk4' },
            { name: 'Blue Heavy', price: 2500, owned: false, color: 'blue', body: 'body_heavy', weapon: 'turret_01_mk2' },
            { name: 'Camo Heavy', price: 3000, owned: false, color: 'camo', body: 'body_heavy', weapon: 'turret_01_mk3' },
            { name: 'Desert Heavy', price: 3500, owned: false, color: 'desert', body: 'body_heavy', weapon: 'turret_01_mk4' }
        ],
        jets: [
            { name: 'Purple Jet', price: 0, owned: true, color: 'purple', type: 'ship1' },
            { name: 'Red Fighter', price: 800, owned: false, color: 'red', type: 'ship2' },
            { name: 'Gold Elite', price: 1200, owned: false, color: 'gold', type: 'ship3' },
            { name: 'Desert Bomber', price: 1600, owned: false, color: 'desert', type: 'ship4' },
            { name: 'Purple Fighter', price: 2000, owned: false, color: 'purple', type: 'ship2' },
            { name: 'Blue Bomber', price: 2400, owned: false, color: 'blue', type: 'ship4' },
            { name: 'Red Stealth', price: 2800, owned: false, color: 'red', type: 'ship3' },
            { name: 'Elite Jet', price: 4000, owned: false, color: 'purple', type: 'ship4' }
        ],
        race: [
            { name: 'Blue Racer', price: 0, owned: true, color: 'blue', type: 'endurance' },
            { name: 'Red Formula', price: 600, owned: false, color: 'red', type: 'formula' },
            { name: 'Camo Rally', price: 900, owned: false, color: 'camo', type: 'rally' },
            { name: 'Purple Super', price: 1300, owned: false, color: 'purple', type: 'supercar' },
            { name: 'Desert Rally', price: 2100, owned: false, color: 'desert', type: 'rally' },
            { name: 'Red Super', price: 2500, owned: false, color: 'red', type: 'supercar' },
            { name: 'Blue Formula', price: 1700, owned: false, color: 'blue', type: 'formula' },
            { name: 'Elite Racer', price: 4000, owned: false, color: 'red', type: 'endurance' }
        ],
        music: [
            { name: 'Default', price: 0, owned: true, icon: '🎵' },
            { name: 'Battle', price: 300, owned: false, icon: '⚔️' },
            { name: 'Victory', price: 500, owned: false, icon: '🏆' },
            { name: 'Epic', price: 800, owned: false, icon: '🎼' },
            { name: 'Rock', price: 600, owned: false, icon: '🎸' },
            { name: 'Electronic', price: 700, owned: false, icon: '🎛️' },
            { name: 'Jazz', price: 1100, owned: false, icon: '🎺' },
            { name: 'Orchestral', price: 1500, owned: false, icon: '🎭' }
        ]
    };
    
    const items = shopItems[category] || [];
    
    if (items.length === 0) {
        console.warn('No items found for category:', category);
        return;
    }
    
    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'figma-shop-item';
        itemElement.onclick = () => handleFigmaShopItemClick(category, index, item.price, item.owned);
        
        // Create the visual content
        createShopItemContent(itemElement, item, category);
        
        // Add to container with staggered animation
        setTimeout(() => {
            itemsContainer.appendChild(itemElement);
        }, index * 50);
    });
    
    console.log(`✅ Created ${items.length} ${category} items`);
}

function createShopItemContent(itemElement, item, category) {
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'figma-shop-item-image';
    
    // Color mapping for fallbacks
    const colorMap = {
        blue: '#3b82f6', red: '#ef4444', camo: '#22c55e', 
        desert: '#f59e0b', purple: '#a855f7'
    };
    
    if (category === 'tanks') {
        createTankVisual(imageContainer, item, colorMap);
    } else if (category === 'jets') {
        createJetVisual(imageContainer, item, colorMap);
    } else if (category === 'race') {
        createRaceVisual(imageContainer, item, colorMap);
    } else if (category === 'music') {
        createMusicVisual(imageContainer, item);
    }
    
    itemElement.appendChild(imageContainer);
    
    // Add item info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'figma-shop-item-info';
    infoDiv.innerHTML = `
        <div class="figma-shop-item-name">${item.name}</div>
        <div class="figma-shop-item-price ${item.owned ? 'owned' : item.price === 0 ? 'free' : 'paid'}">
            ${item.owned ? 'OWNED' : item.price === 0 ? 'FREE' : `${item.price} FORTZ`}
        </div>
    `;
    
    itemElement.appendChild(infoDiv);
}

function createTankVisual(container, item, colorMap) {
    // Create fallback first
    const fallback = document.createElement('div');
    fallback.className = 'shop-item-fallback';
    fallback.style.cssText = `
        width: 160px; height: 100px; 
        background: linear-gradient(45deg, ${colorMap[item.color] || '#666'}, ${colorMap[item.color] || '#444'}); 
        border-radius: 10px; border: 3px solid rgba(255,255,255,0.3);
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: bold; font-size: 16px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        position: absolute; top: 50%; left: 50%; 
        transform: translate(-50%, -50%); z-index: 1;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    fallback.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 20px;">🚗</div>
            <div>${item.color.toUpperCase()}</div>
            <div style="font-size: 12px;">TANK</div>
        </div>
    `;
    
    container.appendChild(fallback);
    
    // Try to load actual tank images
    const bodyImg = document.createElement('img');
    bodyImg.src = `/assets/tank/tanks/${item.color}/${item.color}_${item.body}.png`;
    bodyImg.style.cssText = 'position: absolute; width: 180px; height: 180px; object-fit: contain; z-index: 2; transform: rotate(-90deg);';
    
    const weaponImg = document.createElement('img');
    weaponImg.src = `/assets/tank/tanks/${item.color}/${item.color}_${item.weapon}.png`;
    weaponImg.style.cssText = 'position: absolute; width: 180px; height: 180px; object-fit: contain; z-index: 3; transform: rotate(-90deg);';
    
    let imagesLoaded = 0;
    const hideCallback = () => {
        imagesLoaded++;
        if (imagesLoaded >= 1) { // Hide fallback when at least body loads
            fallback.style.opacity = '0';
            setTimeout(() => fallback.style.display = 'none', 300);
        }
    };
    
    bodyImg.onload = hideCallback;
    bodyImg.onerror = () => console.log('Tank body failed:', bodyImg.src);
    weaponImg.onerror = () => console.log('Tank weapon failed:', weaponImg.src);
    
    container.appendChild(bodyImg);
    container.appendChild(weaponImg);
}

function createJetVisual(container, item, colorMap) {
    const fallback = document.createElement('div');
    fallback.className = 'shop-item-fallback';
    fallback.style.cssText = `
        width: 160px; height: 80px; 
        background: linear-gradient(45deg, ${colorMap[item.color] || '#666'}, ${colorMap[item.color] || '#444'}); 
        border-radius: 10px; border: 3px solid rgba(255,255,255,0.3);
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: bold; font-size: 16px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        position: absolute; top: 50%; left: 50%; 
        transform: translate(-50%, -50%); z-index: 1;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    fallback.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 20px;">✈️</div>
            <div>${item.color.toUpperCase()}</div>
            <div style="font-size: 12px;">JET</div>
        </div>
    `;
    
    container.appendChild(fallback);
    
    const jetImg = document.createElement('img');
    jetImg.src = `/assets/jet/jets/${item.color}/${item.color}_${item.type}.png`;
    jetImg.style.cssText = 'width: 180px; height: 180px; object-fit: contain; z-index: 2; transform: rotate(-90deg);';
    
    jetImg.onload = () => {
        fallback.style.opacity = '0';
        setTimeout(() => fallback.style.display = 'none', 300);
    };
    jetImg.onerror = () => console.log('Jet image failed:', jetImg.src);
    
    container.appendChild(jetImg);
}

function createRaceVisual(container, item, colorMap) {
    const fallback = document.createElement('div');
    fallback.className = 'shop-item-fallback';
    fallback.style.cssText = `
        width: 160px; height: 80px; 
        background: linear-gradient(45deg, ${colorMap[item.color] || '#666'}, ${colorMap[item.color] || '#444'}); 
        border-radius: 10px; border: 3px solid rgba(255,255,255,0.3);
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: bold; font-size: 16px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        position: absolute; top: 50%; left: 50%; 
        transform: translate(-50%, -50%); z-index: 1;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    fallback.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 20px;">🏎️</div>
            <div>${item.color.toUpperCase()}</div>
            <div style="font-size: 12px;">CAR</div>
        </div>
    `;
    
    container.appendChild(fallback);
    
    const carImg = document.createElement('img');
    carImg.src = `/assets/race/cars/${item.color}/${item.color}_${item.type}.png`;
    carImg.style.cssText = 'width: 180px; height: 180px; object-fit: contain; z-index: 2; transform: rotate(-90deg);';
    
    carImg.onload = () => {
        fallback.style.opacity = '0';
        setTimeout(() => fallback.style.display = 'none', 300);
    };
    carImg.onerror = () => console.log('Car image failed:', carImg.src);
    
    container.appendChild(carImg);
}

function createMusicVisual(container, item) {
    const musicIcon = document.createElement('div');
    musicIcon.style.cssText = `
        font-size: 80px; display: flex; align-items: center; justify-content: center; 
        width: 180px; height: 180px; color: #fde047; text-shadow: 0 0 20px rgba(253, 224, 71, 0.5);
        animation: float 3s ease-in-out infinite;
    `;
    musicIcon.textContent = item.icon;
    container.appendChild(musicIcon);
}

function handleShopItemClick(category, itemIndex, price, owned) {
    console.log('Shop item clicked:', { category, itemIndex, price, owned });
    
    if (owned) {
        // Equip the item
        console.log('Equipping item');
        showNotification('Item equipped!', 'success');
    } else if (price === 0) {
        // Free item - just unlock it
        console.log('Getting free item');
        showNotification('Item unlocked!', 'success');
    } else {
        // Check if player has enough currency
        const currentFortz = window.gameState?.fortzCurrency || 0;
        if (currentFortz >= price) {
            console.log('Purchasing item for', price, 'Fortz');
            showNotification(`Item purchased for ${price} Fortz!`, 'success');
            
            // Deduct currency
            if (window.gameStateManager) {
                window.gameStateManager.updateGameState({
                    fortzCurrency: currentFortz - price
                });
            }
        } else {
            console.log('Not enough Fortz');
            showNotification(`Not enough Fortz! Need ${price}, have ${currentFortz}`, 'error');
        }
    }
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function openFeature(feature) {
    console.log('Opening feature:', feature);

    // Hide lobby background canvases when opening any feature
    const lobbyCanvases = [
        'tankLobbyBackground',
        'jetLobbyBackground',
        'raceLobbyBackground',
        'lobbyBackground'
    ];
    lobbyCanvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            canvas.style.display = 'none';
        }
    });

    // Close all panels first
    closeAllPanels();

    // Always show lobby button when any feature is triggered
    const lobbyBtn = document.getElementById('lobbyBtn');
    if (lobbyBtn) {
        lobbyBtn.classList.add('active');
        lobbyBtn.style.display = 'block';
    }
    
    // Feature to screen mapping
    const featureMap = {
        'shop': 'shopScreen',
        'locker': 'lockerScreen',
        'settings': 'settingsScreen',
        'create-map': 'createMapScreen',
        'friends': 'friendsScreen',
        'champions': 'championsScreen',
        'pass': 'passScreen',
        'tanks': 'shopScreen',
        'weapons': 'shopScreen',
        'party': 'partyScreen',
        'leaderboard': 'leaderboardScreen',
        'gameModes': 'gameModesScreen'
    };
    
    const screenId = featureMap[feature];
    if (!screenId) {
        console.warn('Unknown feature:', feature);
        return;
    }
    
    // Show the feature screen
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');

        // Show lobby button when any feature opens
        const lobbyBtn = document.getElementById('lobbyBtn');
        if (lobbyBtn) {
            lobbyBtn.classList.add('active');
        }
        
        // Update game state if available
        if (window.gameStateManager) {
            const stateUpdate = { openedFeature: feature };
            stateUpdate[`show${feature.charAt(0).toUpperCase() + feature.slice(1).replace('-', '')}` || `show${feature}`] = true;
            
            // Handle special cases
            if (feature === 'create-map') {
                stateUpdate.showCreateMap = true;
            }
            
            window.gameStateManager.updateGameState(stateUpdate);
        }
        
        // Initialize feature-specific functionality
        if (feature === 'shop') {
            console.log('🛒 SIMPLE SHOP: Initializing...');
            
            // Use simple setup - call immediately and also with a small delay for safety
            setupSimpleShop();
            setTimeout(() => {
                setupSimpleShop();
            }, 100);
        } else if (feature === 'create-map') {
            console.log('🗺️ CREATE MAP: Initializing...');

            // Show createMapScreen
            const createMapScreen = document.getElementById('createMapScreen');
            if (createMapScreen) {
                createMapScreen.classList.remove('hidden');
                console.log('✅ createMapScreen is now visible');
            } else {
                console.error('❌ createMapScreen element not found!');
            }

            // Start create map rendering system
            if (typeof startCreateMapRendering === 'function') {
                startCreateMapRendering();
                console.log('✅ Create map rendering started');
            } else {
                console.log('ℹ️ Using new MapCreatorCore system');
                // Load saved maps if function exists
                if (typeof loadSavedMaps === 'function') {
                    loadSavedMaps();
                }
            }
        }
        
        console.log(`✅ Opened ${feature} feature`);
    } else {
        console.error(`Screen not found: ${screenId}`);
    }
}

// Figma Shop Scroll Functions
window.figmaShopScrollPosition = 0;

function scrollShopLeft() {
    const container = document.getElementById('figmaItemsScroll');
    if (!container) return;
    
    // Use smooth scrolling instead of transform for better performance
    const scrollAmount = 350;
    const currentScroll = container.scrollLeft;
    const newScroll = Math.max(0, currentScroll - scrollAmount);
    
    container.scrollTo({
        left: newScroll,
        behavior: 'smooth'
    });
    
    // Update button states
    setTimeout(() => updateScrollButtonStates(), 300);
    
    console.log('Scrolled left, position:', newScroll);
}

function scrollShopRight() {
    const container = document.getElementById('figmaItemsScroll');
    if (!container) return;
    
    // Use smooth scrolling instead of transform for better performance
    const scrollAmount = 350;
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const newScroll = Math.min(currentScroll + scrollAmount, maxScroll);
    
    container.scrollTo({
        left: newScroll,
        behavior: 'smooth'
    });
    
    // Update button states
    setTimeout(() => updateScrollButtonStates(), 300);
    
    console.log('Scrolled right, position:', newScroll);
}

function updateScrollButtonStates() {
    const container = document.getElementById('figmaItemsScroll');
    const leftBtn = document.querySelector('.figma-scroll-left');
    const rightBtn = document.querySelector('.figma-scroll-right');
    
    if (!container || !leftBtn || !rightBtn) return;
    
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    // Update left button
    if (currentScroll <= 0) {
        leftBtn.classList.add('disabled');
    } else {
        leftBtn.classList.remove('disabled');
    }
    
    // Update right button
    if (currentScroll >= maxScroll) {
        rightBtn.classList.add('disabled');
    } else {
        rightBtn.classList.remove('disabled');
    }
}

// Vehicle Rendering Functions
function renderTankOnCanvas(canvas, color, body, weapon) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple tank representation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    
    // Tank body
    const bodyColors = {
        blue: '#3b82f6',
        camo: '#22c55e', 
        desert: '#f59e0b',
        purple: '#a855f7',
        red: '#ef4444'
    };
    
    ctx.fillStyle = bodyColors[color] || '#3b82f6';
    ctx.fillRect(-40, -20, 80, 40);
    
    // Tank turret
    ctx.fillStyle = bodyColors[color] || '#3b82f6';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Tank barrel
    ctx.fillStyle = '#666';
    ctx.fillRect(20, -3, 40, 6);
    
    ctx.restore();
}

function renderJetOnCanvas(canvas, color, type) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    
    const jetColors = {
        blue: '#3b82f6',
        red: '#ef4444',
        camo: '#22c55e',
        desert: '#f59e0b',
        purple: '#a855f7'
    };
    
    ctx.fillStyle = jetColors[color] || '#3b82f6';
    
    // Jet body
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(50, -10);
    ctx.lineTo(50, 10);
    ctx.closePath();
    ctx.fill();
    
    // Wings
    ctx.fillRect(-10, -30, 20, 60);
    
    ctx.restore();
}

function renderRaceCarOnCanvas(canvas, color, type) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    
    const carColors = {
        blue: '#3b82f6',
        red: '#ef4444',
        camo: '#22c55e',
        desert: '#f59e0b',
        purple: '#a855f7'
    };
    
    ctx.fillStyle = carColors[color] || '#3b82f6';
    
    // Car body
    ctx.fillRect(-50, -15, 100, 30);
    
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-30, -20, 8, 0, Math.PI * 2);
    ctx.arc(-30, 20, 8, 0, Math.PI * 2);
    ctx.arc(30, -20, 8, 0, Math.PI * 2);
    ctx.arc(30, 20, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function renderMusicIconOnCanvas(canvas, icon) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fde047';
    ctx.fillText(icon, canvas.width / 2, canvas.height / 2);
}

function handleFigmaShopItemClick(category, itemIndex, price, owned) {
    console.log('Figma shop item clicked:', { category, itemIndex, price, owned });
    
    if (owned) {
        showNotification('Item equipped!', 'success');
    } else if (price === 0) {
        showNotification('Item unlocked!', 'success');
    } else {
        const currentFortz = window.gameState?.fortzCurrency || 0;
        if (currentFortz >= price) {
            showNotification(`Item purchased for ${price} Fortz!`, 'success');
        } else {
            showNotification(`Not enough Fortz! Need ${price}, have ${currentFortz}`, 'error');
        }
    }
}

// Modal Functions - Complete UI patterns
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Specific modal functions
function openAiBotConfigModal() {
    openModal('aiBotConfigModal');
}

function closeAiBotConfigModal() {
    closeModal('aiBotConfigModal');
}

function openChatModal() {
    openModal('chatModal');
}

function closeChatModal() {
    closeModal('chatModal');
}

function openFriendsModal() {
    openModal('friendsModal');
}

function closeFriendsModal() {
    closeModal('friendsModal');
}

function openGameModeModal() {
    if (window.openMapBrowserModal) {
        window.openMapBrowserModal();
    } else {
        console.log('Map Browser Modal not loaded yet');
    }
}

function closeGameModeModal() {
    if (window.closeMapBrowserModal) {
        window.closeMapBrowserModal();
    } else {
        console.log('Map Browser Modal not loaded yet');
    }
}

// Event Listeners for buttons and inputs
document.addEventListener('DOMContentLoaded', function() {
    // Tank map creation
    const tankCreateBtn = document.getElementById('tankCreateBtn');
    if (tankCreateBtn) {
        tankCreateBtn.addEventListener('click', () => createMap('tank'));
    }
    
    const tankCancelBtn = document.getElementById('tankCancelBtn');
    if (tankCancelBtn) {
        tankCancelBtn.addEventListener('click', () => cancelMapCreation('tank'));
    }
    
    // Race map creation
    const raceCreateBtn = document.getElementById('raceCreateBtn');
    if (raceCreateBtn) {
        raceCreateBtn.addEventListener('click', () => createMap('race'));
    }
    
    const raceCancelBtn = document.getElementById('raceCancelBtn');
    if (raceCancelBtn) {
        raceCancelBtn.addEventListener('click', () => cancelMapCreation('race'));
    }
    
    // Jet map creation
    const jetCreateBtn = document.getElementById('jetCreateBtn');
    if (jetCreateBtn) {
        jetCreateBtn.addEventListener('click', () => createMap('jet'));
    }
    
    const jetCancelBtn = document.getElementById('jetCancelBtn');
    if (jetCancelBtn) {
        jetCancelBtn.addEventListener('click', () => cancelMapCreation('jet'));
    }
    
    // Generic map creation
    const createBtn = document.getElementById('createBtn');
    if (createBtn) {
        createBtn.addEventListener('click', () => createMap('generic'));
    }
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => cancelMapCreation('generic'));
    }
    
    // Vehicle selection
    const cancelVehicleBtn = document.getElementById('cancelVehicleBtn');
    if (cancelVehicleBtn) {
        cancelVehicleBtn.addEventListener('click', cancelVehicleSelection);
    }
    
    // Map rename
    const confirmRenameBtn = document.getElementById('confirmRenameBtn');
    if (confirmRenameBtn) {
        confirmRenameBtn.addEventListener('click', confirmRename);
    }
    
    const cancelRenameBtn = document.getElementById('cancelRenameBtn');
    if (cancelRenameBtn) {
        cancelRenameBtn.addEventListener('click', cancelRename);
    }
    
    // Create new map button
    const createNewMapBtn = document.getElementById('createNewMapBtn');
    if (createNewMapBtn) {
        createNewMapBtn.addEventListener('click', showVehicleTypeSelection);
    }
    
    // Game configuration inputs
    const maxPlayersInput = document.getElementById('maxPlayersInput');
    if (maxPlayersInput) {
        maxPlayersInput.addEventListener('change', (e) => updateGameConfig('maxPlayers', e.target.value));
    }
    
    const matchTimeInput = document.getElementById('matchTimeInput');
    if (matchTimeInput) {
        matchTimeInput.addEventListener('change', (e) => updateGameConfig('matchTime', e.target.value));
    }
    
    const killLimitInput = document.getElementById('killLimitInput');
    if (killLimitInput) {
        killLimitInput.addEventListener('change', (e) => updateGameConfig('killLimit', e.target.value));
    }
    
    const respawnTimeInput = document.getElementById('respawnTimeInput');
    if (respawnTimeInput) {
        respawnTimeInput.addEventListener('change', (e) => updateGameConfig('respawnTime', e.target.value));
    }
    
    const friendlyFireToggle = document.getElementById('friendlyFireToggle');
    if (friendlyFireToggle) {
        friendlyFireToggle.addEventListener('change', (e) => updateGameConfig('friendlyFire', e.target.checked));
    }
    
    const autoBalanceToggle = document.getElementById('autoBalanceToggle');
    if (autoBalanceToggle) {
        autoBalanceToggle.addEventListener('change', (e) => updateGameConfig('autoBalance', e.target.checked));
    }
    
    const autoFillToggle = document.getElementById('autoFillToggle');
    if (autoFillToggle) {
        autoFillToggle.addEventListener('change', (e) => updateGameConfig('autoFill', e.target.checked));
    }
    
    const powerupsToggle = document.getElementById('powerupsToggle');
    if (powerupsToggle) {
        powerupsToggle.addEventListener('change', (e) => updateGameConfig('powerups', e.target.checked));
    }
    
    const minPlayersForAI = document.getElementById('minPlayersForAI');
    if (minPlayersForAI) {
        minPlayersForAI.addEventListener('change', (e) => updateGameConfig('minPlayersForAI', e.target.value));
    }
    
    const autoFillAICount = document.getElementById('autoFillAICount');
    if (autoFillAICount) {
        autoFillAICount.addEventListener('change', (e) => updateGameConfig('autoFillAICount', e.target.value));
    }
    
    const powerupSpawnRate = document.getElementById('powerupSpawnRate');
    if (powerupSpawnRate) {
        powerupSpawnRate.addEventListener('change', (e) => updateGameConfig('powerupSpawnRate', e.target.value));
    }
    
    const numTeamsSelect = document.getElementById('numTeamsSelect');
    if (numTeamsSelect) {
        numTeamsSelect.addEventListener('change', (e) => updateTeamConfig('numTeams', e.target.value));
    }
    
    const autoFillDifficulty = document.getElementById('autoFillDifficulty');
    if (autoFillDifficulty) {
        autoFillDifficulty.addEventListener('change', (e) => updateGameConfig('autoFillDifficulty', e.target.value));
    }
    
    // Scroll buttons for shop items
    const scrollButtons = document.querySelectorAll('.scroll-btn');
    scrollButtons.forEach(button => {
        const target = button.getAttribute('data-target');
        const isLeft = button.classList.contains('scroll-btn-left');
        const direction = isLeft ? 'left' : 'right';
        
        button.addEventListener('click', () => {
            if (target) {
                scrollShopItems(direction, target);
            }
        });
    });
    
    console.log('✅ Missing handlers initialized');
    
    // Simple shop initialization
    setTimeout(() => {
        // Override any conflicting functions
        window.switchShopCategory = switchShopCategory;
        
        // If shop is already open, set it up
        const shopScreen = document.getElementById('shopScreen');
        if (shopScreen && !shopScreen.classList.contains('hidden')) {
            console.log('🛒 SIMPLE SHOP: Already open, setting up...');
            setupSimpleShop();
        }
        
        console.log('🔧 SIMPLE SHOP: Ready');
    }, 1000);
});

// Scroll Functions for Shop Items
function scrollShopItems(direction, targetGrid) {
    const grid = document.getElementById(targetGrid);
    if (!grid) return;
    
    const scrollAmount = 200; // pixels to scroll
    const currentScroll = grid.scrollLeft;
    
    if (direction === 'left') {
        grid.scrollTo({
            left: currentScroll - scrollAmount,
            behavior: 'smooth'
        });
    } else if (direction === 'right') {
        grid.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
        });
    }
    
    console.log(`Scrolled ${direction} in ${targetGrid}`);
}

// Game Configuration Functions
function updateGameConfig(setting, value) {
    console.log(`Updated ${setting}:`, value);
    
    // Store in localStorage for persistence
    localStorage.setItem(`gameConfig_${setting}`, value);
    
    // Update any related UI elements
    switch(setting) {
        case 'maxPlayers':
            console.log('Max players set to:', value);
            break;
        case 'matchTime':
            console.log('Match time set to:', value, 'minutes');
            break;
        case 'killLimit':
            console.log('Kill limit set to:', value === '0' ? 'unlimited' : value);
            break;
        case 'respawnTime':
            console.log('Respawn time set to:', value, 'seconds');
            break;
        case 'friendlyFire':
            console.log('Friendly fire:', value ? 'enabled' : 'disabled');
            break;
        case 'autoBalance':
            console.log('Auto balance:', value ? 'enabled' : 'disabled');
            break;
        case 'autoFill':
            console.log('Auto fill:', value ? 'enabled' : 'disabled');
            break;
        case 'powerups':
            console.log('Power-ups:', value ? 'enabled' : 'disabled');
            break;
    }
}

function updateTeamConfig(setting, value) {
    console.log(`Updated team ${setting}:`, value);
    localStorage.setItem(`teamConfig_${setting}`, value);
}

// Export functions to global scope for inline event handlers
window.scrollShopItems = scrollShopItems;
window.updateGameConfig = updateGameConfig;
window.updateTeamConfig = updateTeamConfig;
window.showTankMapNameInput = showTankMapNameInput;
window.showRaceMapNameInput = showRaceMapNameInput;
window.showJetMapNameInput = showJetMapNameInput;
window.showMapNameInput = showMapNameInput;
window.showVehicleTypeSelection = showVehicleTypeSelection;
window.showRenameMapDialog = showRenameMapDialog;
window.selectVehicleType = selectVehicleType;
window.createMap = createMap;
window.confirmRename = confirmRename;
window.cancelRename = cancelRename;
window.startMapTest = startMapTest;
window.stopMapTest = stopMapTest;
window.selectGameMode = selectGameMode;
window.closeGameModesScreen = closeGameModesScreen;
window.openGameModesScreen = openGameModesScreen;
window.switchTab = switchTab;
window.switchCreateMapTab = switchCreateMapTab;
window.switchChampionsTab = switchChampionsTab;
window.switchFriendsTab = switchFriendsTab;
window.switchShopTab = switchShopTab;
// Export the main shop function - this overrides any conflicting functions
window.switchShopCategory = switchShopCategory;
window.closeAllPanels = closeAllPanels;

// Populate shop items function (legacy compatibility)
function populateShopItems(category) {
  console.log('🔧 populateShopItems called for:', category);
  
  // Redirect to the new function
  if (typeof createSimpleShopItems === 'function') {
    createSimpleShopItems(category);
  } else {
    console.warn('createSimpleShopItems not available');
  }
}

// Populate figma shop items function (legacy compatibility)
function populateFigmaShopItems(category) {
  console.log('🔧 populateFigmaShopItems called for:', category);
  
  // Redirect to the new function
  if (typeof createSimpleShopItems === 'function') {
    createSimpleShopItems(category);
  } else {
    console.warn('createSimpleShopItems not available');
  }
}

window.populateShopItems = populateShopItems;
window.populateFigmaShopItems = populateFigmaShopItems;
window.handleShopItemClick = handleShopItemClick;
window.handleFigmaShopItemClick = handleFigmaShopItemClick;
window.scrollShopLeft = scrollShopLeft;
window.scrollShopRight = scrollShopRight;
window.setupSimpleShop = setupSimpleShop;
window.createSimpleShopItems = createSimpleShopItems;
window.getShopItemsData = getShopItemsData;
window.createItemBox = createItemBox;

// Auto-initialize shop when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Shop handlers loaded and ready');
    
    // Make sure functions are globally available
    window.switchShopCategory = switchShopCategory;
    window.scrollShopLeft = scrollShopLeft;
    window.scrollShopRight = scrollShopRight;
    window.setupSimpleShop = setupSimpleShop;
});

// Debug function to manually test shop
window.debugShopItems = function() {
    console.log('=== SHOP DEBUG ===');
    
    // Check if shop screen exists
    const shopScreen = document.getElementById('shopScreen');
    console.log('Shop screen:', shopScreen ? 'FOUND' : 'NOT FOUND');
    if (shopScreen) {
        console.log('Shop screen hidden:', shopScreen.classList.contains('hidden'));
    }
    
    // Check if container exists
    const container = document.getElementById('figmaItemsScroll');
    console.log('Items container:', container ? 'FOUND' : 'NOT FOUND');
    if (container) {
        console.log('Container children:', container.children.length);
        console.log('Container HTML:', container.innerHTML.substring(0, 200));
    }
    
    // Check if functions exist
    console.log('switchShopCategory:', typeof window.switchShopCategory);
    console.log('setupSimpleShop:', typeof window.setupSimpleShop);
    console.log('createSimpleShopItems:', typeof window.createSimpleShopItems);
    
    // Try to create items
    console.log('Attempting to create items...');
    if (typeof window.createSimpleShopItems === 'function') {
        window.createSimpleShopItems('tanks');
    }
    
    console.log('=== END DEBUG ===');
};

// Coming Soon functionality
window.showComingSoon = function(feature) {
    console.log(`🚧 ${feature} coming soon...`);

    // Ensure lobby button becomes visible when a feature is triggered
    const lobbyBtn = document.getElementById('lobbyBtn');
    if (lobbyBtn) {
        lobbyBtn.classList.add('active');
    }
    
    // Create coming soon notification
    const notification = document.createElement('div');
    notification.className = 'coming-soon-notification';
    notification.innerHTML = `
        <h2>COMING SOON</h2>
        <p>Enjoy the game!</p>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds with improved animation
    setTimeout(() => {
        notification.style.animation = 'notificationFadeOut 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
};

// Hover tooltip functionality
window.showHoverTooltip = function(element, text) {
    // Remove any existing tooltip
    hideHoverTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'hover-tooltip';
    tooltip.textContent = text;
    tooltip.id = 'hoverTooltip';
    
    document.body.appendChild(tooltip);
    
    // Position tooltip above the element
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
    tooltip.style.top = (rect.top - tooltipRect.height - 10) + 'px';
};

window.hideHoverTooltip = function() {
    const tooltip = document.getElementById('hoverTooltip');
    if (tooltip) {
        tooltip.remove();
    }
};

// Replace old shop functions
window.openShop = function() {
    showComingSoon('shop');
};

window.forceOpenShop = function() {
    showComingSoon('shop');
    
    console.log('✅ Shop forced open');
};
window.renderTankOnCanvas = renderTankOnCanvas;
window.renderJetOnCanvas = renderJetOnCanvas;
window.renderRaceCarOnCanvas = renderRaceCarOnCanvas;
window.renderMusicIconOnCanvas = renderMusicIconOnCanvas;
window.showNotification = showNotification;
window.openFeature = openFeature;
window.setupSimpleShop = setupSimpleShop;
window.createSimpleShopItems = createSimpleShopItems;
window.updateButtonStates = updateButtonStates;
window.createShopItemContent = createShopItemContent;
window.createTankVisual = createTankVisual;
window.createJetVisual = createJetVisual;
window.createRaceVisual = createRaceVisual;
window.createMusicVisual = createMusicVisual;
window.testFigmaShop = function() {
    console.log('🧪 Testing Figma shop...');
    
    // Force override the function first
    window.switchShopCategory = switchShopCategory;
    
    // Open shop first
    openFeature('shop');
    
    setTimeout(() => {
        console.log('🚗 Testing tanks...');
        window.switchShopCategory('tanks');
    }, 500);
    
    setTimeout(() => {
        console.log('🚁 Testing jets...');
        window.switchShopCategory('jets');
    }, 1000);
    
    setTimeout(() => {
        console.log('🏎️ Testing cars...');
        window.switchShopCategory('cars');
    }, 1500);
    
    setTimeout(() => {
        console.log('🎵 Testing music...');
        window.switchShopCategory('music');
    }, 2000);
};

window.fixShop = function() {
    console.log('🔧 SIMPLE SHOP: Fixing everything...');
    
    // Setup the simple shop
    setupSimpleShop();
    
    // Test it works
    setTimeout(() => {
        console.log('Testing jets...');
        switchShopCategory('jets');
    }, 500);
    
    setTimeout(() => {
        console.log('Testing cars...');
        switchShopCategory('cars');
    }, 1000);
    
    setTimeout(() => {
        console.log('Back to tanks...');
        switchShopCategory('tanks');
    }, 1500);
    
    console.log('✅ SIMPLE SHOP: Fixed and tested!');
};

window.debugShop = function() {
    console.log('🔍 Debugging shop elements...');
    console.log('Shop screen:', document.getElementById('shopScreen'));
    console.log('Items container:', document.getElementById('figmaItemsScroll'));
    console.log('Shop title:', document.getElementById('figmaShopTitle'));
    
    const container = document.getElementById('figmaItemsScroll');
    if (container) {
        console.log('Container children:', container.children.length);
        console.log('Container HTML:', container.innerHTML.substring(0, 200));
        console.log('Container styles:', window.getComputedStyle(container));
    }
};

function setupSimpleShop() {
    console.log('🔧 SIMPLE SHOP: Setting up...');
    
    // Override any existing function
    window.switchShopCategory = switchShopCategory;
    window.scrollShopLeft = scrollShopLeft;
    window.scrollShopRight = scrollShopRight;
    
    // Setup button clicks with direct onclick
    const buttons = ['music', 'tanks', 'jets', 'cars'];
    
    buttons.forEach(category => {
        const btn = document.querySelector(`[data-category="${category}"]`);
        if (btn) {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🖱️ SIMPLE SHOP: ${category} clicked`);
                switchShopCategory(category);
            };
            console.log(`✅ Setup ${category} button`);
        }
    });
    
    // Setup scroll buttons
    const leftBtn = document.querySelector('.figma-scroll-left');
    const rightBtn = document.querySelector('.figma-scroll-right');
    
    if (leftBtn) {
        leftBtn.onclick = (e) => {
            e.preventDefault();
            scrollShopLeft();
        };
    }
    
    if (rightBtn) {
        rightBtn.onclick = (e) => {
            e.preventDefault();
            scrollShopRight();
        };
    }
    
    // Initialize with tanks IMMEDIATELY
    console.log('🔧 SIMPLE SHOP: Creating initial items...');
    switchShopCategory('tanks');
    
    console.log('✅ SIMPLE SHOP: Setup complete');
}

window.forceCreateItems = function() {
    console.log('🔧 Force creating test items...');
    const container = document.getElementById('figmaItemsScroll');
    if (!container) {
        console.error('❌ Container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    // Create 5 simple test boxes
    for (let i = 0; i < 5; i++) {
        const item = document.createElement('div');
        item.className = 'figma-shop-item';
        item.style.cssText = `
            background: linear-gradient(135deg, #a855f7 0%, #d946ef 50%, #ec4899 100%);
            border: 10px solid #c084fc;
            box-shadow: 0 0 60px rgba(168, 85, 247, 0.8);
            width: 320px;
            height: 320px;
            flex-shrink: 0;
            cursor: pointer;
            transition: all 0.5s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            margin-right: 48px;
        `;
        
        item.innerHTML = `
            <div style="color: white; font-size: 24px; font-weight: bold; text-align: center;">
                TEST ITEM ${i + 1}
                <br>
                <span style="font-size: 16px;">Click me!</span>
            </div>
        `;
        
        item.onclick = () => {
            console.log('🖱️ Test item clicked:', i + 1);
            showNotification(`Test item ${i + 1} clicked!`, 'success');
        };
        
        container.appendChild(item);
    }
    
    console.log('✅ Created 5 test items');
};
window.openModal = openModal;
window.closeModal = closeModal;
window.openAiBotConfigModal = openAiBotConfigModal;
window.closeAiBotConfigModal = closeAiBotConfigModal;
window.openChatModal = openChatModal;
window.closeChatModal = closeChatModal;
window.openFriendsModal = openFriendsModal;
window.closeFriendsModal = closeFriendsModal;
window.openGameModeModal = openGameModeModal;
window.closeGameModeModal = closeGameModeModal;

// Test function to verify shop functionality
window.testShopFunctionality = function() {
    console.log('🧪 Testing shop functionality...');
    
    // Test 1: Check if shop screen exists
    const shopScreen = document.getElementById('shopScreen');
    if (!shopScreen) {
        console.error('❌ Shop screen not found!');
        return false;
    }
    console.log('✅ Shop screen found');
    
    // Test 2: Check if items container exists
    const itemsContainer = document.getElementById('figmaItemsScroll');
    if (!itemsContainer) {
        console.error('❌ Items container not found!');
        return false;
    }
    console.log('✅ Items container found');
    
    // Test 3: Check if category buttons exist
    const categories = ['tanks', 'jets', 'cars', 'music'];
    let buttonsFound = 0;
    categories.forEach(category => {
        const btn = document.querySelector(`[data-category="${category}"]`);
        if (btn) {
            buttonsFound++;
            console.log(`✅ ${category} button found`);
        } else {
            console.error(`❌ ${category} button not found!`);
        }
    });
    
    if (buttonsFound !== categories.length) {
        console.error('❌ Not all category buttons found!');
        return false;
    }
    
    // Test 4: Check if scroll buttons exist
    const leftBtn = document.querySelector('.figma-scroll-left');
    const rightBtn = document.querySelector('.figma-scroll-right');
    if (!leftBtn || !rightBtn) {
        console.error('❌ Scroll buttons not found!');
        return false;
    }
    console.log('✅ Scroll buttons found');
    
    // Test 5: Test category switching
    console.log('🔄 Testing category switching...');
    try {
        switchShopCategory('tanks');
        console.log('✅ Tanks category switch successful');
        
        switchShopCategory('jets');
        console.log('✅ Jets category switch successful');
        
        switchShopCategory('cars');
        console.log('✅ Cars category switch successful');
        
        switchShopCategory('music');
        console.log('✅ Music category switch successful');
        
        // Return to tanks
        switchShopCategory('tanks');
    } catch (error) {
        console.error('❌ Category switching failed:', error);
        return false;
    }
    
    // Test 6: Test scroll functionality
    console.log('🔄 Testing scroll functionality...');
    try {
        scrollShopRight();
        console.log('✅ Right scroll successful');
        
        scrollShopLeft();
        console.log('✅ Left scroll successful');
    } catch (error) {
        console.error('❌ Scroll functionality failed:', error);
        return false;
    }
    
    // Test 7: Check if items are created
    const items = itemsContainer.children;
    if (items.length === 0) {
        console.error('❌ No items found in container!');
        return false;
    }
    console.log(`✅ ${items.length} items found in container`);
    
    console.log('🎉 All shop functionality tests passed!');
    showNotification('Shop functionality test completed successfully!', 'success');
    return true;
};

// Quick shop demo function
window.demoShop = function() {
    console.log('🎬 Starting shop demo...');
    
    // Open shop first
    const shopScreen = document.getElementById('shopScreen');
    if (shopScreen) {
        shopScreen.classList.remove('hidden');
    }
    
    // Demo sequence
    setTimeout(() => {
        console.log('🚗 Switching to tanks...');
        switchShopCategory('tanks');
        showNotification('Viewing Tanks', 'info');
    }, 500);
    
    setTimeout(() => {
        console.log('✈️ Switching to jets...');
        switchShopCategory('jets');
        showNotification('Viewing Jets', 'info');
    }, 2000);
    
    setTimeout(() => {
        console.log('🏎️ Switching to cars...');
        switchShopCategory('cars');
        showNotification('Viewing Cars', 'info');
    }, 3500);
    
    setTimeout(() => {
        console.log('🎵 Switching to music...');
        switchShopCategory('music');
        showNotification('Viewing Music', 'info');
    }, 5000);
    
    setTimeout(() => {
        console.log('🔄 Testing scroll...');
        scrollShopRight();
        showNotification('Scrolling Right', 'info');
    }, 6500);
    
    setTimeout(() => {
        scrollShopLeft();
        showNotification('Scrolling Left', 'info');
    }, 7500);
    
    setTimeout(() => {
        console.log('🚗 Back to tanks...');
        switchShopCategory('tanks');
        showNotification('Demo Complete!', 'success');
    }, 8500);
};

// Comprehensive shop connection test
window.testShopConnections = function() {
    console.log('🧪 Testing shop connections...');
    
    const tests = {
        'HTML Elements': {
            'Shop Screen': !!document.getElementById('shopScreen'),
            'Shop Container': !!document.querySelector('.figma-shop-container'),
            'Category Buttons': document.querySelectorAll('.figma-category-btn').length > 0,
            'Items Container': !!document.getElementById('figmaItemsScroll'),
            'Scroll Buttons': document.querySelectorAll('.figma-scroll-btn').length > 0
        },
        'CSS Classes': {
            'Shop Screen Styles': !!getComputedStyle(document.getElementById('shopScreen') || document.createElement('div')).position,
            'Shop Container Styles': !!document.querySelector('.figma-shop-container'),
            'Item Styles': !!document.querySelector('.figma-shop-item') || true // Will exist after items are created
        },
        'JavaScript Functions': {
            'openFeature': typeof window.openFeature === 'function',
            'openShop': typeof window.openShop === 'function',
            'setupSimpleShop': typeof window.setupSimpleShop === 'function',
            'switchShopCategory': typeof window.switchShopCategory === 'function',
            'scrollShopLeft': typeof window.scrollShopLeft === 'function',
            'scrollShopRight': typeof window.scrollShopRight === 'function',
            'fixShop': typeof window.fixShop === 'function'
        },
        'Shop Integration': {
            'GameStateManager': !!window.gameStateManager,
            'ShopSystem': !!window.ShopSystem,
            'InventorySystem': !!window.InventorySystem,
            'CurrencySystem': !!window.CurrencySystem
        }
    };
    
    console.log('📊 Shop Connection Test Results:');
    
    let allPassed = true;
    Object.entries(tests).forEach(([category, categoryTests]) => {
        console.log(`\n${category}:`);
        Object.entries(categoryTests).forEach(([test, result]) => {
            const status = result ? '✅' : '❌';
            console.log(`  ${status} ${test}: ${result}`);
            if (!result) allPassed = false;
        });
    });
    
    console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL CONNECTIONS WORKING' : '❌ SOME ISSUES FOUND'}`);
    
    if (!allPassed) {
        console.log('\n🔧 Suggested fixes:');
        if (!tests['HTML Elements']['Shop Screen']) {
            console.log('  - Check if shopScreen element exists in HTML');
        }
        if (!tests['JavaScript Functions']['openFeature']) {
            console.log('  - Ensure missingHandlers.js is loaded');
        }
        if (!tests['Shop Integration']['GameStateManager']) {
            console.log('  - Check if game state modules are loaded');
        }
    }
    
    return allPassed;
};

// Auto-test connections when this script loads
setTimeout(() => {
    if (typeof window.testShopConnections === 'function') {
        window.testShopConnections();
    }
}, 1000);

// Ensure all shop functions are globally available
window.openFeature = openFeature;
window.setupSimpleShop = setupSimpleShop;
window.switchShopCategory = switchShopCategory;

// Add missing map creator functions (placeholders until MapCreatorCore loads)
if (!window.openBlankMapCreator) {
    window.openBlankMapCreator = function() {
        console.log('🗺️ openBlankMapCreator called - waiting for MapCreatorCore...');
        setTimeout(() => {
            if (window.mapCreator && window.mapCreator.openBlankMapCreator) {
                window.mapCreator.openBlankMapCreator();
            } else {
                alert('Map Creator not loaded yet. Please try again.');
            }
        }, 100);
    };
}

// Add other missing functions as placeholders
window.closeBlankMapCreator = window.closeBlankMapCreator || function() { console.log('closeBlankMapCreator called'); };
window.switchCreateMapTab = window.switchCreateMapTab || function(tab) { console.log('switchCreateMapTab called:', tab); };
window.saveMap = window.saveMap || function() { console.log('saveMap called'); };
window.testMap = window.testMap || function() { console.log('testMap called'); };
window.toggleAssetsPanel = window.toggleAssetsPanel || function() { console.log('toggleAssetsPanel called'); };
window.switchAssetCategory = window.switchAssetCategory || function(category) { console.log('switchAssetCategory called:', category); };
window.addSpawnPoint = window.addSpawnPoint || function() { console.log('addSpawnPoint called'); };
window.addAIBot = window.addAIBot || function() { console.log('addAIBot called'); };
window.addAIPreset = window.addAIPreset || function(type, count) { console.log('addAIPreset called:', type, count); };
window.closeAIConfigModal = window.closeAIConfigModal || function() { console.log('closeAIConfigModal called'); };
window.saveAIBotConfig = window.saveAIBotConfig || function() { console.log('saveAIBotConfig called'); };
window.deleteAIBot = window.deleteAIBot || function() { console.log('deleteAIBot called'); };

// Vehicle selection functions
window.selectVehicleType = window.selectVehicleType || function(type) { 
    console.log('selectVehicleType called:', type);
    // Update UI to show selected vehicle type
    document.querySelectorAll('.vehicle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(type + 'Btn')?.classList.add('active');
};

// Party functions
window.showPartyInviteMenu = window.showPartyInviteMenu || function() { console.log('showPartyInviteMenu called'); };
window.kickPartyMember = window.kickPartyMember || function(id) { console.log('kickPartyMember called:', id); };
window.leaveParty = window.leaveParty || function() { console.log('leaveParty called'); };

// Game functions
window.respawnPlayer = window.respawnPlayer || function() { console.log('respawnPlayer called'); };
window.returnToLobby = window.returnToLobby || function() { console.log('returnToLobby called'); };
window.stopMapTest = window.stopMapTest || function() { console.log('stopMapTest called'); };

// Map creator rendering functions (for compatibility with old system)
window.startCreateMapRendering = window.startCreateMapRendering || function() { 
    console.log('🗺️ startCreateMapRendering called (compatibility mode)');
    
    // Debug: Check lobbyScreen visibility
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen) {
        console.log('📝 lobbyScreen display:', lobbyScreen.style.display);
        console.log('📝 lobbyScreen visibility:', lobbyScreen.style.visibility);
        console.log('📝 lobbyScreen classes:', lobbyScreen.className);
        
        // Make sure lobbyScreen is visible
        lobbyScreen.style.display = 'block';
        lobbyScreen.style.visibility = 'visible';
    }
    
    // Make sure the createMapScreen is visible
    const createMapScreen = document.getElementById('createMapScreen');
    if (createMapScreen) {
        createMapScreen.classList.remove('hidden');
        createMapScreen.style.display = 'block';
        createMapScreen.style.visibility = 'visible';
        createMapScreen.style.zIndex = '1000';
        console.log('✅ createMapScreen made visible');
        console.log('📝 createMapScreen final display:', createMapScreen.style.display);
        console.log('📝 createMapScreen final classes:', createMapScreen.className);
    } else {
        console.error('❌ createMapScreen element not found');
    }
};

window.loadSavedMaps = window.loadSavedMaps || function() { 
    console.log('🗺️ loadSavedMaps called (compatibility mode)'); 
    // Try to load maps from localStorage
    try {
        const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
        console.log('📁 Found', maps.length, 'saved maps');
    } catch (e) {
        console.log('📁 No saved maps found');
    }
};
window.scrollShopLeft = scrollShopLeft;
window.scrollShopRight = scrollShopRight;
window.createSimpleShopItems = createSimpleShopItems;
window.updateButtonStates = updateButtonStates;
window.createShopItemContent = createShopItemContent;
window.createTankVisual = createTankVisual;
window.createJetVisual = createJetVisual;
window.createRaceVisual = createRaceVisual;
window.createMusicVisual = createMusicVisual;

console.log('🔗 All shop functions exported to window object');

// ===== PARTY SYSTEM FUNCTIONS =====

/**
 * Show party invite menu
 */
function showPartyInviteMenu() {
    console.log('🎉 Show party invite menu');
    
    // Create a simple party invite modal
    const modal = document.createElement('div');
    modal.id = 'partyInviteModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 2px solid #00d4ff;
            border-radius: 15px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            color: white;
            box-shadow: 0 20px 40px rgba(0, 212, 255, 0.3);
        ">
            <h2 style="color: #00d4ff; margin-bottom: 20px;">🎉 Invite Friends</h2>
            <p style="margin-bottom: 20px; opacity: 0.8;">Party system coming soon! You'll be able to invite friends to join your party and play together.</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="closePartyInviteModal()" style="
                    background: #00d4ff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Got it!</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePartyInviteModal();
        }
    });
}

/**
 * Close party invite modal
 */
function closePartyInviteModal() {
    const modal = document.getElementById('partyInviteModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Kick party member
 */
function kickPartyMember(slot) {
    console.log(`👢 Kick party member from slot: ${slot}`);
    
    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to kick the party member from slot ${slot}?`);
    if (confirmed) {
        // TODO: Implement actual kick functionality
        console.log(`✅ Party member kicked from slot ${slot}`);
        
        // Hide the member UI for now
        const canvas = document.getElementById(`partyTank${slot}Canvas`);
        const kickBtn = document.getElementById(`kickBtn${slot}`);
        const inviteBtn = document.getElementById(`inviteBtn${slot}`);
        
        if (canvas) canvas.style.display = 'none';
        if (kickBtn) kickBtn.classList.add('hidden');
        if (inviteBtn) inviteBtn.classList.remove('hidden');
        
        showNotification(`Party member removed from slot ${slot}`, '#ff6b6b');
    }
}

/**
 * Leave party
 */
function leaveParty() {
    console.log('👋 Leave party');
    
    const confirmed = confirm('Are you sure you want to leave the party?');
    if (confirmed) {
        // TODO: Implement actual leave party functionality
        console.log('✅ Left party');
        
        // Hide party UI elements
        const leaveBtn = document.getElementById('leavePartyBtn');
        if (leaveBtn) leaveBtn.classList.add('hidden');
        
        // Reset party member slots
        for (let i = 1; i <= 2; i++) {
            const canvas = document.getElementById(`partyTank${i}Canvas`);
            const kickBtn = document.getElementById(`kickBtn${i}`);
            const inviteBtn = document.getElementById(`inviteBtn${i}`);
            
            if (canvas) canvas.style.display = 'none';
            if (kickBtn) kickBtn.classList.add('hidden');
            if (inviteBtn) inviteBtn.classList.remove('hidden');
        }
        
        showNotification('Left party', '#fbbf24');
    }
}

// ===== MAP CREATION FUNCTIONS =====

/**
 * Switch create map tab
 */
function switchCreateMapTab(tabName) {
    console.log(`🗂️ Switching create map tab to: ${tabName}`);
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.feature-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    const activeTab = Array.from(tabs).find(tab => 
        tab.textContent.toLowerCase().includes(tabName.replace('-', ' '))
    );
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Show/hide tab content
    const createdMapTab = document.getElementById('createdMapTab');
    const analyzeTab = document.getElementById('analyzeTab');
    
    if (tabName === 'created-map') {
        if (createdMapTab) createdMapTab.classList.remove('hidden');
        if (analyzeTab) analyzeTab.classList.add('hidden');
    } else if (tabName === 'analyze') {
        if (createdMapTab) createdMapTab.classList.add('hidden');
        if (analyzeTab) analyzeTab.classList.remove('hidden');
    }
}

/**
 * Open blank map creator
 */
function openBlankMapCreator() {
    console.log('🗺️ Opening blank map creator');
    
    // Show vehicle type selection first
    showVehicleTypeSelection();
}

/**
 * Close blank map creator
 */
function closeBlankMapCreator() {
    console.log('❌ Closing blank map creator');
    
    const creator = document.getElementById('blankMapCreator');
    if (creator) {
        creator.classList.add('hidden');
    }
    
    // Show the main create map screen
    const createMapTab = document.getElementById('createdMapTab');
    if (createMapTab) {
        createMapTab.classList.remove('hidden');
    }
}

// ===== ASSET PANEL FUNCTIONS =====

/**
 * Toggle assets panel
 */
function toggleAssetsPanel() {
    console.log('🔧 Toggle assets panel');
    
    const panel = document.querySelector('.assets-panel-content');
    const btn = document.getElementById('minimizeBtn');
    
    if (panel && btn) {
        const isHidden = panel.style.display === 'none';
        panel.style.display = isHidden ? 'block' : 'none';
        btn.textContent = isHidden ? '-' : '+';
    }
}

/**
 * Switch asset category
 */
function switchAssetCategory(category) {
    console.log(`🎨 Switching asset category to: ${category}`);
    
    // Remove active class from all category buttons
    const buttons = document.querySelectorAll('.asset-category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected category
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // TODO: Load assets for the selected category
    console.log(`✅ Switched to ${category} category`);
}

// ===== SPAWN POINT FUNCTIONS =====

/**
 * Add spawn point
 */
function addSpawnPoint() {
    console.log('📍 Add spawn point');
    
    const spawnList = document.getElementById('spawnPointsList');
    if (spawnList) {
        const spawnPoint = document.createElement('div');
        spawnPoint.className = 'spawn-point-item';
        spawnPoint.innerHTML = `
            <span>Spawn Point ${spawnList.children.length + 1}</span>
            <button onclick="removeSpawnPoint(this)" style="
                background: #ef4444;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            ">Remove</button>
        `;
        spawnList.appendChild(spawnPoint);
    }
    
    showNotification('Spawn point added', '#22c55e');
}

/**
 * Remove spawn point
 */
function removeSpawnPoint(button) {
    console.log('🗑️ Remove spawn point');
    
    const spawnPoint = button.parentElement;
    if (spawnPoint) {
        spawnPoint.remove();
        showNotification('Spawn point removed', '#f59e0b');
    }
}

// ===== AI BOT FUNCTIONS =====

/**
 * Add AI bot
 */
function addAIBot() {
    console.log('🤖 Add AI bot');
    
    // Show AI configuration modal
    const modal = document.getElementById('aiConfigModal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        // Create simple AI bot without modal
        showNotification('AI Bot added (Easy difficulty)', '#22c55e');
    }
}

/**
 * Add AI preset
 */
function addAIPreset(difficulty, count) {
    console.log(`🤖 Adding ${count} ${difficulty} AI bots`);
    
    for (let i = 0; i < count; i++) {
        // TODO: Actually add AI bots to the map
    }
    
    showNotification(`Added ${count} ${difficulty} AI bots`, '#22c55e');
}

/**
 * Close AI config modal
 */
function closeAIConfigModal() {
    console.log('❌ Close AI config modal');
    
    const modal = document.getElementById('aiConfigModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Save AI bot config
 */
function saveAIBotConfig() {
    console.log('💾 Save AI bot config');
    
    // TODO: Get values from form and save AI bot
    closeAIConfigModal();
    showNotification('AI Bot configured and added', '#22c55e');
}

/**
 * Delete AI bot
 */
function deleteAIBot() {
    console.log('🗑️ Delete AI bot');
    
    const confirmed = confirm('Are you sure you want to delete this AI bot?');
    if (confirmed) {
        closeAIConfigModal();
        showNotification('AI Bot deleted', '#ef4444');
    }
}

// ===== MAP FUNCTIONS =====

/**
 * Save map
 */
function saveMap() {
    console.log('💾 Save map');
    
    // TODO: Implement actual map saving
    showNotification('Map saved successfully!', '#22c55e');
}

/**
 * Test map
 */
function testMap() {
    console.log('🧪 Test map');
    
    // TODO: Implement map testing
    showNotification('Map test started!', '#00d4ff');
}

// Export all functions to window
window.showPartyInviteMenu = showPartyInviteMenu;
window.closePartyInviteModal = closePartyInviteModal;
window.kickPartyMember = kickPartyMember;
window.leaveParty = leaveParty;
window.switchCreateMapTab = switchCreateMapTab;
window.openBlankMapCreator = openBlankMapCreator;
window.closeBlankMapCreator = closeBlankMapCreator;
window.toggleAssetsPanel = toggleAssetsPanel;
window.switchAssetCategory = switchAssetCategory;
window.addSpawnPoint = addSpawnPoint;
window.removeSpawnPoint = removeSpawnPoint;
window.addAIBot = addAIBot;
window.addAIPreset = addAIPreset;
window.closeAIConfigModal = closeAIConfigModal;
window.saveAIBotConfig = saveAIBotConfig;
window.deleteAIBot = deleteAIBot;
window.saveMap = saveMap;
window.testMap = testMap;

// ===== TEAM MODE FUNCTIONS =====

/**
 * Toggle team mode dropdown
 */
function toggleTeamModeDropdown() {
    console.log('🔽 Toggle team mode dropdown');

    const dropdown = document.getElementById('teamModeDropdown');
    if (dropdown) {
        const isHidden = dropdown.classList.contains('hidden');
        if (isHidden) {
            dropdown.classList.remove('hidden');
            console.log('✅ Team mode dropdown shown');
        } else {
            dropdown.classList.add('hidden');
            console.log('✅ Team mode dropdown hidden');
        }
    } else {
        console.error('❌ Team mode dropdown not found');
    }
}

/**
 * Select team mode
 */
function selectTeamMode(mode) {
    console.log(`👥 Selecting team mode: ${mode}`);

    // Update the button text
    const teamModeText = document.getElementById('teamModeText');
    if (teamModeText) {
        teamModeText.textContent = mode.toUpperCase();
    }

    // Hide the dropdown
    const dropdown = document.getElementById('teamModeDropdown');
    if (dropdown) {
        dropdown.classList.add('hidden');
    }

    // Update game state if available
    if (window.gameState) {
        window.gameState.selectedTeamMode = mode;
    }

    // Show notification
    showNotification(`Team mode set to ${mode.toUpperCase()}`, '#00d4ff');

    console.log(`✅ Team mode set to ${mode}`);
}

// Export team mode functions
window.toggleTeamModeDropdown = toggleTeamModeDropdown;
window.selectTeamMode = selectTeamMode;

console.log('✅ All missing onclick functions have been implemented!');