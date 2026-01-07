// Map Creator Initialization - Ensures functions are available
(function() {
    'use strict';
    
    console.log('🚛 Map Creator Initialization starting...');
    
    // Function to check if required functions exist
    function checkMapCreatorFunctions() {
        const requiredFunctions = [
            'startCreateMapRendering',
            'loadSavedMaps',
            'stopCreateMapRendering',
            'handleMapCreatorClick',
            'openBlankMapCreator',
            'closeBlankMapCreator'
        ];
        
        const missing = [];
        const available = [];
        
        requiredFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                available.push(funcName);
            } else {
                missing.push(funcName);
            }
        });
        
        console.log('✅ Available functions:', available);
        if (missing.length > 0) {
            console.warn('⚠️ Missing functions:', missing);
            return false;
        }
        
        return true;
    }
    
    // Fallback functions if main functions are not available
    function createFallbackFunctions() {
        console.log('🔧 Creating fallback functions...');
        
        if (typeof window.startCreateMapRendering !== 'function') {
            window.startCreateMapRendering = function() {
                console.log('🚛 Fallback: startCreateMapRendering called');
                // Try to initialize basic map creator UI
                const canvas = document.getElementById('tankLobbyBackground');
                if (canvas) {
                    console.log('✅ Canvas found, map creator can initialize');
                } else {
                    console.warn('⚠️ No canvas found for map creator');
                }
            };
        }
        
        if (typeof window.loadSavedMaps !== 'function') {
            window.loadSavedMaps = function() {
                console.log('🗺️ Fallback: loadSavedMaps called');
                // Try to load maps from localStorage
                try {
                    const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
                    console.log(`📊 Found ${maps.length} saved maps`);
                    
                    // Try to display them if there's a maps grid
                    const mapsGrid = document.querySelector('.maps-grid');
                    if (mapsGrid) {
                        console.log('✅ Maps grid found, can display maps');
                    } else {
                        console.log('ℹ️ No maps grid found yet');
                    }
                } catch (error) {
                    console.error('❌ Error loading saved maps:', error);
                }
            };
        }
        
        if (typeof window.stopCreateMapRendering !== 'function') {
            window.stopCreateMapRendering = function() {
                console.log('🛑 Fallback: stopCreateMapRendering called');
            };
        }
        
        if (typeof window.handleMapCreatorClick !== 'function') {
            window.handleMapCreatorClick = function(event) {
                console.log('🖱️ Fallback: handleMapCreatorClick called', event);
            };
        }
        
        if (typeof window.openBlankMapCreator !== 'function') {
            window.openBlankMapCreator = function() {
                console.log('🆕 Fallback: openBlankMapCreator called');
                // Try to launch enhanced map creator if available
                if (typeof window.launchEnhancedMapCreator === 'function') {
                    console.log('🚀 Launching enhanced map creator...');
                    window.launchEnhancedMapCreator();
                } else {
                    alert('🚛 Map Creator is loading... Please try again in a moment.');
                }
            };
        }
        
        if (typeof window.closeBlankMapCreator !== 'function') {
            window.closeBlankMapCreator = function() {
                console.log('❌ Fallback: closeBlankMapCreator called');
            };
        }
    }
    
    // Initialize map creator functions
    function initializeMapCreator() {
        console.log('🔄 Checking map creator functions...');
        
        if (checkMapCreatorFunctions()) {
            console.log('✅ All map creator functions are available!');
            
            // Dispatch ready event
            if (typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('mapCreatorReady', {
                    detail: { status: 'ready', timestamp: Date.now() }
                }));
            }
        } else {
            console.log('⚠️ Some functions missing, creating fallbacks...');
            createFallbackFunctions();
            
            // Dispatch fallback ready event
            if (typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('mapCreatorReady', {
                    detail: { status: 'fallback', timestamp: Date.now() }
                }));
            }
        }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMapCreator);
    } else {
        initializeMapCreator();
    }
    
    // Also try after a short delay to catch late-loading scripts
    setTimeout(initializeMapCreator, 500);
    
    // Expose initialization function globally
    window.initializeMapCreator = initializeMapCreator;
    window.checkMapCreatorFunctions = checkMapCreatorFunctions;
    
    console.log('🚛 Map Creator Initialization script loaded');
})();