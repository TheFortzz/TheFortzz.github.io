// Map Script Engine - Lua-like scripting for maps
class MapScriptEngine {
    constructor() {
        this.scripts = new Map();
        this.eventHandlers = new Map();
        this.gameObjects = new Map();
        this.timers = [];
        this.isRunning = false;
        
        // Safe API functions that scripts can use
        this.scriptAPI = {
            // Player functions
            showMessage: (message) => this.showMessage(message),
            getPlayerPosition: (playerId) => this.getPlayerPosition(playerId),
            teleportPlayer: (playerId, x, y) => this.teleportPlayer(playerId, x, y),
            
            // Object functions
            getObject: (objectId) => this.getObject(objectId),
            getObjectPosition: (objectId) => this.getObjectPosition(objectId),
            moveObject: (objectId, x, y, duration) => this.moveObject(objectId, x, y, duration),
            destroyObject: (objectId) => this.destroyObject(objectId),
            spawnObject: (type, x, y) => this.spawnObject(type, x, y),
            
            // Game functions
            endGame: (result) => this.endGame(result),
            playSound: (soundFile) => this.playSound(soundFile),
            spawnExplosion: (x, y) => this.spawnExplosion(x, y),
            spawnPowerUp: (type, x, y) => this.spawnPowerUp(type, x, y),
            
            // Utility functions
            randomPosition: () => this.randomPosition(),
            getPlayersInArea: (areaName) => this.getPlayersInArea(areaName),
            setTimer: (callback, delay) => this.setTimer(callback, delay),
            
            // Math helpers
            distance: (x1, y1, x2, y2) => Math.sqrt((x2-x1)**2 + (y2-y1)**2),
            random: (min, max) => Math.random() * (max - min) + min
        };
    }

    // Load and parse a script
    loadScript(scriptCode, mapName) {
        try {
            // Simple Lua-like parser (basic implementation)
            const parsedScript = this.parseScript(scriptCode);
            this.scripts.set(mapName, parsedScript);
            console.log('✅ Script loaded for map:', mapName);
            return true;
        } catch (error) {
            console.error('❌ Script parsing error:', error);
            return false;
        }
    }

    // Basic Lua-like script parser
    parseScript(code) {
        const functions = new Map();
        const events = new Map();
        
        // Extract function definitions
        const functionRegex = /function\s+(\w+)\s*\((.*?)\)\s*(.*?)end/gs;
        let match;
        
        while ((match = functionRegex.exec(code)) !== null) {
            const [, funcName, params, body] = match;
            functions.set(funcName, {
                params: params.split(',').map(p => p.trim()).filter(p => p),
                body: body.trim()
            });
        }
        
        return { functions, events };
    }

    // Execute a script function
    executeFunction(mapName, functionName, ...args) {
        const script = this.scripts.get(mapName);
        if (!script || !script.functions.has(functionName)) {
            return;
        }

        const func = script.functions.get(functionName);
        try {
            // Create a safe execution context
            const context = { ...this.scriptAPI };
            
            // Add parameters to context
            func.params.forEach((param, index) => {
                context[param] = args[index];
            });

            // Execute the function body (simplified)
            this.executeCode(func.body, context);
        } catch (error) {
            console.error('Script execution error:', error);
        }
    }

    // Simple code execution (very basic interpreter)
    executeCode(code, context) {
        // This is a simplified interpreter - in production you'd want a proper Lua VM
        const lines = code.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('--')) continue;
            
            // Handle function calls
            const callMatch = trimmed.match(/(\w+)\s*\((.*?)\)/);
            if (callMatch) {
                const [, funcName, argsStr] = callMatch;
                if (context[funcName]) {
                    const args = argsStr ? argsStr.split(',').map(arg => {
                        arg = arg.trim();
                        // Handle string literals
                        if (arg.startsWith('"') && arg.endsWith('"')) {
                            return arg.slice(1, -1);
                        }
                        // Handle numbers
                        if (!isNaN(arg)) {
                            return parseFloat(arg);
                        }
                        // Handle variables
                        return context[arg] || arg;
                    }) : [];
                    
                    context[funcName](...args);
                }
            }
        }
    }

    // API Implementation
    showMessage(message) {
        // Show message to all players
        if (window.gameState && window.gameState.showNotification) {
            window.gameState.showNotification(message);
        } else {
            console.log('📢 Script Message:', message);
        }
    }

    getPlayerPosition(playerId) {
        // Get player position from game state
        if (window.gameState && window.gameState.players) {
            const player = window.gameState.players.find(p => p.id === playerId);
            return player ? { x: player.x, y: player.y } : null;
        }
        return null;
    }

    teleportPlayer(playerId, x, y) {
        console.log(`🚀 Teleporting player ${playerId} to (${x}, ${y})`);
        // Implementation would depend on your game engine
    }

    getObject(objectId) {
        return this.gameObjects.get(objectId);
    }

    getObjectPosition(objectId) {
        const obj = this.gameObjects.get(objectId);
        return obj ? { x: obj.x, y: obj.y } : null;
    }

    moveObject(objectId, x, y, duration = 1000) {
        console.log(`📦 Moving object ${objectId} to (${x}, ${y}) over ${duration}ms`);
        // Implementation would animate the object
    }

    destroyObject(objectId) {
        console.log(`💥 Destroying object ${objectId}`);
        this.gameObjects.delete(objectId);
    }

    spawnObject(type, x, y) {
        const objectId = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.gameObjects.set(objectId, { type, x, y, id: objectId });
        console.log(`✨ Spawned ${type} at (${x}, ${y}) with ID ${objectId}`);
        return objectId;
    }

    endGame(result) {
        console.log(`🏁 Game ended with result: ${result}`);
        // Implementation would end the current game
    }

    playSound(soundFile) {
        console.log(`🔊 Playing sound: ${soundFile}`);
        // Implementation would play the sound
    }

    spawnExplosion(x, y) {
        console.log(`💥 Explosion at (${x}, ${y})`);
        // Implementation would create explosion effect
    }

    spawnPowerUp(type, x, y) {
        const powerUpId = this.spawnObject(`powerup_${type}`, x, y);
        console.log(`⚡ Spawned ${type} power-up at (${x}, ${y})`);
        return powerUpId;
    }

    randomPosition() {
        // Return random position within map bounds
        return {
            x: Math.random() * 800, // Adjust based on your map size
            y: Math.random() * 600
        };
    }

    getPlayersInArea(areaName) {
        // Implementation would check which players are in the specified area
        console.log(`🔍 Checking players in area: ${areaName}`);
        return []; // Return array of player IDs
    }

    setTimer(callback, delay) {
        const timerId = setTimeout(() => {
            if (typeof callback === 'function') {
                callback();
            }
        }, delay);
        
        this.timers.push(timerId);
        return timerId;
    }

    // Event system
    triggerEvent(eventName, ...args) {
        if (this.eventHandlers.has(eventName)) {
            const handlers = this.eventHandlers.get(eventName);
            handlers.forEach(handler => {
                try {
                    handler(...args);
                } catch (error) {
                    console.error('Event handler error:', error);
                }
            });
        }
    }

    // Register common game events
    registerGameEvents() {
        // These would be called by your game engine
        this.eventHandlers.set('playerSpawn', []);
        this.eventHandlers.set('playerDeath', []);
        this.eventHandlers.set('gameStart', []);
        this.eventHandlers.set('gameEnd', []);
        this.eventHandlers.set('objectDestroy', []);
    }

    // Start the script engine
    start() {
        this.isRunning = true;
        this.registerGameEvents();
        console.log('🚀 Map Script Engine started');
    }

    // Stop the script engine
    stop() {
        this.isRunning = false;
        this.timers.forEach(timerId => clearTimeout(timerId));
        this.timers = [];
        console.log('🛑 Map Script Engine stopped');
    }
}

// Global script engine instance
window.mapScriptEngine = new MapScriptEngine();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapScriptEngine;
}