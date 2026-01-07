/**
 * StorageUtils - localStorage management utilities
 * Extracted from various modules as part of the refactoring
 * 
 * Provides safe localStorage operations with error handling
 * **Validates: Requirements 2.2, 1.1**
 */

// Storage keys - defined locally to avoid dependency on core modules
const STORAGE_KEYS = {
    RACE_MAPS: 'raceMaps',
    TANK_MAPS: 'tankMaps',
    USER_SETTINGS: 'userSettings',
    PLAYER_PROGRESS: 'playerProgress'
};

export class StorageUtils {
    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    static isAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('[StorageUtils] localStorage is not available:', error);
            return false;
        }
    }

    /**
     * Get an item from localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist or error occurs
     * @returns {*} Stored value or default value
     */
    static getItem(key, defaultValue = null) {
        if (!this.isAvailable()) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            return item !== null ? item : defaultValue;
        } catch (error) {
            console.error(`[StorageUtils] Error getting item "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Get a JSON item from localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist or error occurs
     * @returns {*} Parsed JSON value or default value
     */
    static getJSON(key, defaultValue = null) {
        if (!this.isAvailable()) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            console.error(`[StorageUtils] Error parsing JSON for "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Set an item in localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} True if successful, false otherwise
     */
    static setItem(key, value) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error(`[StorageUtils] Error setting item "${key}":`, error);
            if (error.name === 'QuotaExceededError') {
                console.warn('[StorageUtils] localStorage quota exceeded');
            }
            return false;
        }
    }

    /**
     * Set a JSON item in localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} value - Value to store (will be JSON stringified)
     * @returns {boolean} True if successful, false otherwise
     */
    static setJSON(key, value) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            const jsonString = JSON.stringify(value);
            localStorage.setItem(key, jsonString);
            return true;
        } catch (error) {
            console.error(`[StorageUtils] Error setting JSON for "${key}":`, error);
            if (error.name === 'QuotaExceededError') {
                console.warn('[StorageUtils] localStorage quota exceeded');
            }
            return false;
        }
    }

    /**
     * Remove an item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful, false otherwise
     */
    static removeItem(key) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`[StorageUtils] Error removing item "${key}":`, error);
            return false;
        }
    }

    /**
     * Clear all items from localStorage
     * @returns {boolean} True if successful, false otherwise
     */
    static clear() {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('[StorageUtils] Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * Check if a key exists in localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if key exists
     */
    static hasItem(key) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            return localStorage.getItem(key) !== null;
        } catch (error) {
            console.error(`[StorageUtils] Error checking item "${key}":`, error);
            return false;
        }
    }

    /**
     * Get all keys from localStorage
     * @returns {string[]} Array of all keys
     */
    static getAllKeys() {
        if (!this.isAvailable()) {
            return [];
        }

        try {
            return Object.keys(localStorage);
        } catch (error) {
            console.error('[StorageUtils] Error getting all keys:', error);
            return [];
        }
    }

    /**
     * Get the size of localStorage in bytes (approximate)
     * @returns {number} Size in bytes
     */
    static getSize() {
        if (!this.isAvailable()) {
            return 0;
        }

        try {
            let size = 0;
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    size += key.length + localStorage.getItem(key).length;
                }
            }
            return size;
        } catch (error) {
            console.error('[StorageUtils] Error calculating size:', error);
            return 0;
        }
    }

    /**
     * Get race maps from localStorage
     * @returns {Array} Array of race maps
     */
    static getRaceMaps() {
        return this.getJSON(STORAGE_KEYS.RACE_MAPS, []);
    }

    /**
     * Set race maps in localStorage
     * @param {Array} maps - Array of race maps
     * @returns {boolean} True if successful
     */
    static setRaceMaps(maps) {
        return this.setJSON(STORAGE_KEYS.RACE_MAPS, maps);
    }

    /**
     * Get tank maps from localStorage
     * @returns {Array} Array of tank maps
     */
    static getTankMaps() {
        return this.getJSON(STORAGE_KEYS.TANK_MAPS, []);
    }

    /**
     * Set tank maps in localStorage
     * @param {Array} maps - Array of tank maps
     * @returns {boolean} True if successful
     */
    static setTankMaps(maps) {
        return this.setJSON(STORAGE_KEYS.TANK_MAPS, maps);
    }

    /**
     * Get user settings from localStorage
     * @returns {Object} User settings object
     */
    static getUserSettings() {
        return this.getJSON(STORAGE_KEYS.USER_SETTINGS, {});
    }

    /**
     * Set user settings in localStorage
     * @param {Object} settings - User settings object
     * @returns {boolean} True if successful
     */
    static setUserSettings(settings) {
        return this.setJSON(STORAGE_KEYS.USER_SETTINGS, settings);
    }

    /**
     * Get player progress from localStorage
     * @returns {Object} Player progress object
     */
    static getPlayerProgress() {
        return this.getJSON(STORAGE_KEYS.PLAYER_PROGRESS, {});
    }

    /**
     * Set player progress in localStorage
     * @param {Object} progress - Player progress object
     * @returns {boolean} True if successful
     */
    static setPlayerProgress(progress) {
        return this.setJSON(STORAGE_KEYS.PLAYER_PROGRESS, progress);
    }

    /**
     * Backup all game data to a JSON string
     * @returns {string|null} JSON string of all game data or null on error
     */
    static backupGameData() {
        if (!this.isAvailable()) {
            return null;
        }

        try {
            const backup = {
                raceMaps: this.getRaceMaps(),
                tankMaps: this.getTankMaps(),
                userSettings: this.getUserSettings(),
                playerProgress: this.getPlayerProgress(),
                timestamp: Date.now()
            };
            return JSON.stringify(backup);
        } catch (error) {
            console.error('[StorageUtils] Error creating backup:', error);
            return null;
        }
    }

    /**
     * Restore game data from a backup JSON string
     * @param {string} backupString - JSON string from backupGameData()
     * @returns {boolean} True if successful
     */
    static restoreGameData(backupString) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            const backup = JSON.parse(backupString);
            
            if (backup.raceMaps) this.setRaceMaps(backup.raceMaps);
            if (backup.tankMaps) this.setTankMaps(backup.tankMaps);
            if (backup.userSettings) this.setUserSettings(backup.userSettings);
            if (backup.playerProgress) this.setPlayerProgress(backup.playerProgress);
            
            console.log('[StorageUtils] Game data restored successfully');
            return true;
        } catch (error) {
            console.error('[StorageUtils] Error restoring backup:', error);
            return false;
        }
    }

    /**
     * Clean up old or corrupted data
     * @param {string} key - Storage key to clean
     * @returns {boolean} True if successful
     */
    static cleanupCorruptedData(key) {
        try {
            const data = this.getJSON(key, null);
            if (data === null) {
                // Data is corrupted or doesn't exist
                this.removeItem(key);
                console.warn(`[StorageUtils] Cleaned up corrupted data for "${key}"`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`[StorageUtils] Error cleaning up "${key}":`, error);
            return false;
        }
    }
}

export default StorageUtils;
