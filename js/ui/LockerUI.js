/**
 * LockerUI.js - Locker/customization system
 * Handles vehicle customization, item equipping, and locker preview rendering
 */

import gameStateManager from '../core/GameState.js';
import imageLoader from '../assets/ImageLoader.js';

// Locker customization state
let lockerCustomizationState = {
    currentType: null,
    currentIndex: 0,
    items: []
};

// Available items for customization
const LOCKER_ITEMS = {
    tank: {
        weapon: ['turret_01_mk1', 'turret_01_mk2', 'turret_01_mk3', 'turret_01_mk4'],
        body: ['body_halftrack', 'body_tracks'],
        color: ['blue', 'camo', 'desert', 'purple', 'red']
    },
    jet: {
        type: ['ship1', 'ship2', 'ship3'],
        color: ['purple', 'red', 'gold']
    },
    race: {
        type: ['endurance', 'sport', 'muscle'],
        color: ['blue', 'red', 'yellow', 'green']
    }
};

/**
 * LockerUI class - manages all locker/customization functionality
 */
class LockerUI {
    constructor() {
        this.lockerPreviewAnimationId = null;
        this.lockerState = gameStateManager.getLockerState();
    }

    /**
     * Load locker items for a category
     */
    loadLockerItems(category) {
        let grid, items;

        if (category === 'colors') {
            grid = document.getElementById('colorsItemsGrid');
            items = [
                { id: 'blue', name: 'Blue', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk1.png' },
                { id: 'camo', name: 'Camo', bodyImage: 'camo_body_halftrack.png', turretImage: 'camo_turret_01_mk1.png' },
                { id: 'desert', name: 'Desert', bodyImage: 'desert_body_halftrack.png', turretImage: 'desert_turret_01_mk1.png' },
                { id: 'purple', name: 'Purple', bodyImage: 'purple_body_halftrack.png', turretImage: 'purple_turret_01_mk1.png' },
                { id: 'red', name: 'Red', bodyImage: 'red_body_halftrack.png', turretImage: 'red_turret_01_mk1.png' }
            ];
        } else if (category === 'bodies') {
            grid = document.getElementById('bodiesItemsGrid');
            items = [
                { id: 'body_halftrack', name: 'Halftrack', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk1.png' },
                { id: 'body_tracks', name: 'Full Tracks', bodyImage: 'body_tracks.png', turretImage: 'blue_turret_01_mk1.png' }
            ];
        } else if (category === 'weapons') {
            grid = document.getElementById('weaponsItemsGrid');
            items = [
                { id: 'turret_01_mk1', name: 'Basic Turret', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk1.png' },
                { id: 'turret_01_mk2', name: 'Turret MK2', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk2.png' },
                { id: 'turret_01_mk3', name: 'Turret MK3', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk3.png' },
                { id: 'turret_01_mk4', name: 'Turret MK4', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk4.png' },
                { id: 'turret_02_mk1', name: 'Light Cannon', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk1.png' },
                { id: 'turret_02_mk2', name: 'Heavy Cannon', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk2.png' },
                { id: 'turret_02_mk3', name: 'Plasma Cannon', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk3.png' },
                { id: 'turret_02_mk4', name: 'Ultimate Cannon', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk4.png' }
            ];
        }

        if (!grid) return;
        grid.innerHTML = '';

        items.forEach(item => {
            this.createLockerItemCard(item, grid, category);
        });
    }

    /**
     * Create locker item card
     */
    createLockerItemCard(item, container, category) {
        const card = document.createElement('div');
        const isOwned = this.checkIfItemOwned(item, category);
        const isEquipped = this.checkIfItemEquipped(item, category);

        card.className = 'locker-item-card';
        if (isEquipped) card.className += ' equipped';
        if (!isOwned) card.className += ' locked';

        // Preview
        const preview = document.createElement('div');
        preview.className = 'locker-item-preview';

        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        preview.appendChild(canvas);

        // Render tank on canvas
        if (isOwned) {
            this.renderLockerTankPreview(canvas, item, category);
        } else {
            // Show locked icon
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', canvas.width / 2, canvas.height / 2);
        }

        // Info
        const info = document.createElement('div');
        info.className = 'locker-item-info';

        const name = document.createElement('div');
        name.className = 'locker-item-name';
        name.textContent = item.name;

        const status = document.createElement('div');
        status.className = 'locker-item-status';
        if (isEquipped) {
            status.textContent = '✓ Equipped';
        } else if (!isOwned) {
            status.textContent = '🔒 Locked - Purchase in Shop';
        } else {
            status.textContent = 'Click to equip';
        }

        const equipBtn = document.createElement('button');
        equipBtn.className = 'locker-equip-btn';

        if (isEquipped) {
            equipBtn.textContent = 'EQUIPPED';
            equipBtn.disabled = true;
        } else if (!isOwned) {
            equipBtn.textContent = 'LOCKED';
            equipBtn.disabled = true;
        } else {
            equipBtn.textContent = 'EQUIP';
            equipBtn.onclick = () => this.equipLockerItem(item, category);
        }

        info.appendChild(name);
        info.appendChild(status);
        info.appendChild(equipBtn);

        card.appendChild(preview);
        card.appendChild(info);
        container.appendChild(card);
    }

    /**
     * Check if item is owned
     */
    checkIfItemOwned(item, category) {
        const gameState = gameStateManager.getGameState();
        if (category === 'colors') {
            return gameState.ownedItems?.colors?.includes(item.id);
        } else if (category === 'bodies') {
            return gameState.ownedItems?.bodies?.includes(item.id);
        } else if (category === 'weapons') {
            return gameState.ownedItems?.weapons?.includes(item.id);
        }
        return false;
    }

    /**
     * Check if item is equipped
     */
    checkIfItemEquipped(item, category) {
        const gameState = gameStateManager.getGameState();
        if (category === 'colors') {
            return gameState.selectedTank?.color === item.id;
        } else if (category === 'bodies') {
            return gameState.selectedTank?.body === item.id;
        } else if (category === 'weapons') {
            return gameState.selectedTank?.weapon === item.id;
        }
        return false;
    }

    /**
     * Equip locker item
     */
    equipLockerItem(item, category) {
        const gameState = gameStateManager.getGameState();
        const selectedTank = { ...gameState.selectedTank };

        if (category === 'colors') {
            selectedTank.color = item.id;
            const currentColorEl = document.getElementById('currentColor');
            if (currentColorEl) currentColorEl.textContent = item.name;
        } else if (category === 'bodies') {
            selectedTank.body = item.id;
            const currentBodyEl = document.getElementById('currentBody');
            if (currentBodyEl) currentBodyEl.textContent = item.name;
        } else if (category === 'weapons') {
            selectedTank.weapon = item.id;
            const currentWeaponEl = document.getElementById('currentWeapon');
            if (currentWeaponEl) currentWeaponEl.textContent = item.name;
        }

        gameStateManager.updateGameState({ selectedTank });

        // Save to storage
        if (window.savePlayerProgress) {
            window.savePlayerProgress();
        }

        // Show notification
        if (window.showNotification) {
            window.showNotification(`Equipped ${item.name}!`, '#FFD700', 24);
        }

        // Update locker preview
        this.updateLockerPreview();

        // Reload items to update UI
        this.loadLockerItems(category);

        // Update party tank preview if it exists
        if (typeof window.updatePlayerTankPreview === 'function') {
            window.updatePlayerTankPreview();
        }
    }

    /**
     * Render tank preview in locker
     */
    renderLockerTankPreview(canvas, item, category) {
        const gameState = gameStateManager.getGameState();
        let colorFolder = gameState.selectedTank?.color || 'blue';
        
        // Adjust color based on category
        if (category === 'colors') {
            colorFolder = item.id;
        }

        // Extract body and weapon from item
        let body = gameState.selectedTank?.body || 'body_halftrack';
        let weapon = gameState.selectedTank?.weapon || 'turret_01_mk1';
        
        if (category === 'bodies') {
            body = item.id;
        } else if (category === 'weapons') {
            weapon = item.id;
        }

        const tankConfig = { color: colorFolder, body, weapon };
        
        // Use consolidated ImageLoader function
        imageLoader.renderTankOnCanvas(canvas.id, tankConfig, { 
            scale: 0.4, 
            rotation: -Math.PI / 2 
        });
    }

    /**
     * Render weapon only in locker (for weapon preview)
     */
    renderLockerTankWeaponOnly(canvas, color, weapon) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const weaponImg = imageLoader.lobbyWeaponImages[color]?.[weapon];
        
        if (weaponImg && weaponImg.complete) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(-Math.PI / 2);
            
            const scale = 0.4;
            const w = weaponImg.width * scale;
            const h = weaponImg.height * scale;
            ctx.drawImage(weaponImg, -w / 2, -h / 2, w, h);
            
            ctx.restore();
        }
    }

    /**
     * Update locker preview (main loadout display)
     */
    updateLockerPreview() {
        const canvas = document.getElementById('lockerTankPreview');
        if (!canvas) return;

        const gameState = gameStateManager.getGameState();
        
        // Use consolidated ImageLoader function
        imageLoader.renderTankOnCanvas('lockerTankPreview', gameState.selectedTank, { 
            scale: 0.5, 
            rotation: -Math.PI / 2 
        });

        // Update text labels
        const colorNames = { blue: 'Blue', camo: 'Camo', desert: 'Desert', purple: 'Purple', red: 'Red' };
        const bodyNames = { body_halftrack: 'Halftrack', body_tracks: 'Full Tracks' };
        const weaponNames = {
            turret_01_mk1: 'Basic Turret', turret_01_mk2: 'Turret MK2', turret_01_mk3: 'Turret MK3', turret_01_mk4: 'Turret MK4',
            turret_02_mk1: 'Light Cannon', turret_02_mk2: 'Heavy Cannon', turret_02_mk3: 'Plasma Cannon', turret_02_mk4: 'Ultimate Cannon'
        };

        const currentColorEl = document.getElementById('currentColor');
        const currentBodyEl = document.getElementById('currentBody');
        const currentWeaponEl = document.getElementById('currentWeapon');

        if (currentColorEl) currentColorEl.textContent = colorNames[gameState.selectedTank?.color] || gameState.selectedTank?.color;
        if (currentBodyEl) currentBodyEl.textContent = bodyNames[gameState.selectedTank?.body] || gameState.selectedTank?.body;
        if (currentWeaponEl) currentWeaponEl.textContent = weaponNames[gameState.selectedTank?.weapon] || gameState.selectedTank?.weapon;
    }

    /**
     * Update locker vehicle buttons
     */
    updateLockerVehicleButtons(selectedVehicle) {
        const vehicles = ['jet', 'tank', 'race'];
        const buttons = document.querySelectorAll('.locker-vehicle-btn');
        
        const getVehicleIndex = (vehicle) => vehicles.indexOf(vehicle);
        
        const getButtonPosition = (vehicle) => {
            const currentIndex = getVehicleIndex(selectedVehicle);
            const vehicleIndex = getVehicleIndex(vehicle);
            const diff = vehicleIndex - currentIndex;
            
            if (diff === 0) return 'center';
            if (diff === -1 || diff === 2) return 'left';
            if (diff === 1 || diff === -2) return 'right';
            return 'center';
        };
        
        buttons.forEach(btn => {
            const vehicle = btn.dataset.vehicle;
            const position = getButtonPosition(vehicle);
            
            btn.classList.remove('active');
            btn.removeAttribute('data-position');
            btn.setAttribute('data-position', position);
            
            if (vehicle === selectedVehicle) {
                btn.classList.add('active');
            }
            
            const textSpan = btn.querySelector('.locker-vehicle-text');
            if (textSpan) {
                textSpan.style.opacity = vehicle === selectedVehicle ? '1' : '0.7';
            }
        });
        
        const label = document.getElementById('lockerSelectedVehicle');
        if (label) {
            label.textContent = selectedVehicle.toUpperCase();
        }
    }

    /**
     * Update locker customization options
     */
    updateLockerCustomizationOptions(vehicle) {
        const container = document.getElementById('lockerCustomizationOptions');
        if (!container) return;
        
        const customizationOptions = {
            tank: [
                { label: 'WEAPON', type: 'weapon' },
                { label: 'BODY', type: 'body' },
                { label: 'COLOR', type: 'color' }
            ],
            jet: [
                { label: 'JET TYPE', type: 'type' },
                { label: 'COLOR', type: 'color' }
            ],
            race: [
                { label: 'CAR TYPE', type: 'type' },
                { label: 'COLOR', type: 'color' }
            ]
        };
        
        const options = customizationOptions[vehicle] || [];
        
        container.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'locker-option-btn';
            button.dataset.type = option.type;
            button.onclick = () => this.openCustomizationPanel(option.type);
            
            const span = document.createElement('span');
            span.className = 'fortnite-text locker-option-text';
            span.textContent = option.label;
            
            button.appendChild(span);
            container.appendChild(button);
        });
        
        // Reset customization state when vehicle changes
        lockerCustomizationState.currentType = null;
        lockerCustomizationState.currentIndex = 0;
        lockerCustomizationState.items = [];
    }

    /**
     * Update locker vehicle preview
     */
    updateLockerVehiclePreview(vehicle) {
        // Cancel any existing animation
        if (this.lockerPreviewAnimationId) {
            cancelAnimationFrame(this.lockerPreviewAnimationId);
            this.lockerPreviewAnimationId = null;
        }
        
        // Update stats display
        this.updateLockerStats(vehicle);
        
        // Start animation loop for locker preview
        this.animateLockerPreview(vehicle);
    }

    /**
     * Update locker stats display
     */
    updateLockerStats(vehicle) {
        let stats = { damage: 10, health: 100, fireRate: 1.0 };
        
        if (vehicle === 'tank') {
            const gameState = gameStateManager.getGameState();
            const selectedTank = gameState.selectedTank || { color: 'blue', weapon: 'turret_01_mk1' };
            if (window.getTankStats) {
                stats = window.getTankStats(selectedTank.weapon, selectedTank.color);
            }
        }
        
        const damageEl = document.getElementById('lockerStatDamage');
        const healthEl = document.getElementById('lockerStatHealth');
        const fireRateEl = document.getElementById('lockerStatFireRate');
        
        if (damageEl) damageEl.textContent = stats.damage;
        if (healthEl) healthEl.textContent = stats.health;
        if (fireRateEl) fireRateEl.textContent = stats.fireRate;
    }

    /**
     * Animate locker preview
     */
    animateLockerPreview(vehicle) {
        const canvas = document.getElementById('lockerVehiclePreview');
        if (!canvas) return;
        
        const lockerScreen = document.getElementById('lockerScreen');
        if (!lockerScreen || lockerScreen.classList.contains('hidden')) {
            this.lockerPreviewAnimationId = null;
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        if (vehicle === 'tank') {
            const gameState = gameStateManager.getGameState();
            const selectedTank = gameState.selectedTank || { color: 'blue', body: 'body_halftrack', weapon: 'turret_01_mk1' };
            this.renderLockerTank(ctx, centerX, centerY, selectedTank);
        }
        
        this.lockerPreviewAnimationId = requestAnimationFrame(() => this.animateLockerPreview(vehicle));
    }

    /**
     * Stop locker preview animation
     */
    stopLockerPreviewAnimation() {
        if (this.lockerPreviewAnimationId) {
            cancelAnimationFrame(this.lockerPreviewAnimationId);
            this.lockerPreviewAnimationId = null;
        }
    }

    /**
     * Render locker tank
     */
    renderLockerTank(ctx, centerX, centerY, tank) {
        const { color, body, weapon } = tank;
        
        const tankImg = imageLoader.lobbyTankImages[color]?.[body];
        const weaponImg = imageLoader.lobbyWeaponImages[color]?.[weapon];
        
        if (!tankImg || !weaponImg || !tankImg.complete || !weaponImg.complete) {
            return;
        }
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.save();
        ctx.translate(centerX, centerY);
        
        const rotation = (Date.now() * 0.00005) % (Math.PI * 2);
        ctx.rotate(rotation);
        
        const size = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.7;
        const tankScale = size / Math.max(tankImg.width, tankImg.height);
        ctx.drawImage(
            tankImg,
            -tankImg.width * tankScale / 2,
            -tankImg.height * tankScale / 2,
            tankImg.width * tankScale,
            tankImg.height * tankScale
        );
        
        const weaponScale = size / Math.max(weaponImg.width, weaponImg.height);
        ctx.drawImage(
            weaponImg,
            -weaponImg.width * weaponScale / 2,
            -weaponImg.height * weaponScale / 2,
            weaponImg.width * weaponScale,
            weaponImg.height * weaponScale
        );
        
        ctx.restore();
    }

    /**
     * Open customization panel
     */
    openCustomizationPanel(type) {
        const vehicle = this.lockerState.selectedVehicle;
        
        const buttons = document.querySelectorAll('.locker-option-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            }
        });
        
        let items = [];
        if (vehicle === 'tank') {
            items = LOCKER_ITEMS.tank[type] || [];
        } else if (vehicle === 'jet') {
            items = LOCKER_ITEMS.jet[type] || [];
        } else if (vehicle === 'race') {
            items = LOCKER_ITEMS.race[type] || [];
        }
        
        lockerCustomizationState.currentType = type;
        lockerCustomizationState.items = items;
    }

    /**
     * Select locker vehicle
     */
    selectLockerVehicle(vehicle) {
        if (vehicle !== this.lockerState.selectedVehicle && !this.lockerState.isAnimating) {
            this.lockerState.isAnimating = true;
            this.lockerState.selectedVehicle = vehicle;
            
            this.updateLockerVehicleButtons(vehicle);
            this.updateLockerCustomizationOptions(vehicle);
            this.updateLockerVehiclePreview(vehicle);
            
            const statusEl = document.getElementById('lockerItemStatus');
            if (statusEl) {
                statusEl.textContent = '';
                statusEl.className = 'locker-item-status';
            }
            
            setTimeout(() => {
                this.lockerState.isAnimating = false;
            }, 500);
        }
    }

    /**
     * Render locker jet
     */
    renderLockerJet(ctx, centerX, centerY, jet) {
        // Create a temporary canvas for the jet rendering
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 200;
        tempCanvas.height = 200;
        
        imageLoader.renderJetOnCanvas(tempCanvas, jet, {
            scale: 0.5,
            rotation: -Math.PI / 2
        });
        
        ctx.drawImage(tempCanvas, centerX - 100, centerY - 100);
    }

    /**
     * Render locker race car
     */
    renderLockerRace(ctx, centerX, centerY, race) {
        // Create a temporary canvas for the race car rendering
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 200;
        tempCanvas.height = 200;
        
        imageLoader.renderRaceOnCanvas(tempCanvas, race, {
            scale: 0.5,
            rotation: -Math.PI / 2
        });
        
        ctx.drawImage(tempCanvas, centerX - 100, centerY - 100);
    }

    /**
     * Update locker stats for current item
     */
    updateLockerStatsForCurrentItem() {
        const vehicle = this.lockerState.selectedVehicle;
        const type = lockerCustomizationState.currentType;
        
        if (!type || !vehicle) return;
        
        // Get current item
        const items = lockerCustomizationState.items;
        const currentIndex = lockerCustomizationState.currentIndex;
        const currentItem = items[currentIndex];
        
        if (!currentItem) return;
        
        // Update stats based on vehicle and item
        this.updateLockerStats(vehicle);
    }

    /**
     * Update preview based on current customization type
     */
    updateLockerPreviewForType() {
        const vehicle = this.lockerState.selectedVehicle;
        const type = lockerCustomizationState.currentType;
        
        if (!type || !vehicle) return;
        
        const canvas = document.getElementById('lockerVehiclePreview');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Get current item
        const items = lockerCustomizationState.items;
        const currentIndex = lockerCustomizationState.currentIndex;
        const currentItem = items[currentIndex];
        
        if (!currentItem) return;
        
        // Render based on vehicle type
        if (vehicle === 'tank') {
            const gameState = gameStateManager.getGameState();
            const selectedTank = { ...gameState.selectedTank };
            
            // Update the specific property being customized
            if (type === 'weapon') {
                selectedTank.weapon = currentItem;
            } else if (type === 'body') {
                selectedTank.body = currentItem;
            } else if (type === 'color') {
                selectedTank.color = currentItem;
            }
            
            this.renderLockerTank(ctx, centerX, centerY, selectedTank);
        }
    }

    /**
     * Render only tank body
     */
    renderLockerTankBodyOnly(ctx, centerX, centerY, tank) {
        const { color, body } = tank;
        const tankImg = imageLoader.lobbyTankImages[color]?.[body];
        
        if (!tankImg || !tankImg.complete) return;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.save();
        ctx.translate(centerX, centerY);
        
        const size = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.7;
        const tankScale = size / Math.max(tankImg.width, tankImg.height);
        ctx.drawImage(
            tankImg,
            -tankImg.width * tankScale / 2,
            -tankImg.height * tankScale / 2,
            tankImg.width * tankScale,
            tankImg.height * tankScale
        );
        
        ctx.restore();
    }

    /**
     * Update item status (owned/selected/locked)
     */
    updateLockerItemStatus() {
        const statusEl = document.getElementById('lockerItemStatus');
        const selectBtn = document.getElementById('lockerSelectBtn');
        
        if (!statusEl || !selectBtn) return;
        
        const vehicle = this.lockerState.selectedVehicle;
        const type = lockerCustomizationState.currentType;
        
        if (!type || !vehicle) {
            statusEl.textContent = '';
            selectBtn.style.display = 'none';
            return;
        }
        
        const items = lockerCustomizationState.items;
        const currentIndex = lockerCustomizationState.currentIndex;
        const currentItem = items[currentIndex];
        
        if (!currentItem) {
            statusEl.textContent = '';
            selectBtn.style.display = 'none';
            return;
        }
        
        // Check if item is owned and selected
        const gameState = gameStateManager.getGameState();
        const isOwned = true; // For now, assume all items are owned
        const isSelected = vehicle === 'tank' && gameState.selectedTank?.[type] === currentItem;
        
        if (isSelected) {
            statusEl.textContent = 'EQUIPPED';
            statusEl.className = 'locker-item-status equipped';
            selectBtn.style.display = 'none';
        } else if (isOwned) {
            statusEl.textContent = 'OWNED';
            statusEl.className = 'locker-item-status owned';
            selectBtn.style.display = 'block';
            selectBtn.textContent = 'EQUIP';
        } else {
            statusEl.textContent = 'LOCKED';
            statusEl.className = 'locker-item-status locked';
            selectBtn.style.display = 'none';
        }
    }
}

// Create singleton instance
const lockerUI = new LockerUI();

// Export for module usage
export default lockerUI;

// Expose globally for backward compatibility
if (typeof window !== 'undefined') {
    window.lockerUI = lockerUI;
    window.loadLockerItems = (category) => lockerUI.loadLockerItems(category);
    window.equipLockerItem = (item, category) => lockerUI.equipLockerItem(item, category);
    window.updateLockerPreview = () => lockerUI.updateLockerPreview();
    window.renderLockerTankWeaponOnly = (canvas, color, weapon) => lockerUI.renderLockerTankWeaponOnly(canvas, color, weapon);
    window.updateLockerVehicleButtons = (vehicle) => lockerUI.updateLockerVehicleButtons(vehicle);
    window.updateLockerCustomizationOptions = (vehicle) => lockerUI.updateLockerCustomizationOptions(vehicle);
    window.updateLockerVehiclePreview = (vehicle) => lockerUI.updateLockerVehiclePreview(vehicle);
    window.stopLockerPreviewAnimation = () => lockerUI.stopLockerPreviewAnimation();
    window.selectLockerVehicle = (vehicle) => lockerUI.selectLockerVehicle(vehicle);
    window.updateLockerStats = (vehicle) => lockerUI.updateLockerStats(vehicle);
    window.animateLockerPreview = (vehicle) => lockerUI.animateLockerPreview(vehicle);
    window.renderLockerTank = (ctx, centerX, centerY, tank) => lockerUI.renderLockerTank(ctx, centerX, centerY, tank);
    window.renderLockerJet = (ctx, centerX, centerY, jet) => lockerUI.renderLockerJet(ctx, centerX, centerY, jet);
    window.renderLockerRace = (ctx, centerX, centerY, race) => lockerUI.renderLockerRace(ctx, centerX, centerY, race);
    window.updateLockerStatsForCurrentItem = () => lockerUI.updateLockerStatsForCurrentItem();
    window.updateLockerPreviewForType = () => lockerUI.updateLockerPreviewForType();
    window.renderLockerTankBodyOnly = (ctx, centerX, centerY, tank) => lockerUI.renderLockerTankBodyOnly(ctx, centerX, centerY, tank);
    window.updateLockerItemStatus = () => lockerUI.updateLockerItemStatus();
}
