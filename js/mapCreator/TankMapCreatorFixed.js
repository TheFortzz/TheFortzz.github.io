// Fixed Tank Map Creator - Clean version without syntax errors

// Launch Enhanced Map Creator
function launchEnhancedMapCreator() {
    console.log('🚛 Launching Enhanced Tank Map Creator...');
    
    // Hide existing map creator if open
    const existingCreator = document.getElementById('enhancedMapCreator');
    if (existingCreator) {
        existingCreator.remove();
    }
    
    // Check if TankMapCreatorEnhanced class exists
    if (typeof TankMapCreatorEnhanced === 'undefined') {
        console.error('❌ TankMapCreatorEnhanced class not found!');
        alert('Enhanced Map Creator not loaded. Please refresh the page.');
        return;
    }
    
    try {
        // Create and launch enhanced map creator
        const enhancedCreator = new TankMapCreatorEnhanced();
        enhancedCreator.init();
        console.log('✅ Enhanced Tank Map Creator launched successfully!');
    } catch (error) {
        console.error('❌ Error launching Enhanced Map Creator:', error);
        alert('Error launching Enhanced Map Creator. Check console for details.');
    }
}

// Initialize syntax highlighting for script editor
function initializeSyntaxHighlighter() {
    if (typeof ScriptSyntaxHighlighter === 'undefined') {
        console.warn('⚠️ ScriptSyntaxHighlighter not loaded');
        return;
    }
    
    if (!window.scriptHighlighter) {
        window.scriptHighlighter = new ScriptSyntaxHighlighter();
    }
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        try {
            window.scriptHighlighter.setupEditor();
            console.log('✅ Syntax highlighter initialized');
        } catch (error) {
            console.error('❌ Error initializing syntax highlighter:', error);
        }
    }, 100);
}

// Test map script functionality (Coming Soon)
function testMapScript() {
    alert('📜 Script Editor - Coming Soon!\n\nThe script editor will allow you to create custom game modes and events for your tank maps.');
}

// Save map script (Coming Soon)
function saveMapScript() {
    alert('📜 Script Editor - Coming Soon!\n\nScript saving functionality will be available in a future update.');
}

// Clear map script (Coming Soon)
function clearMapScript() {
    alert('📜 Script Editor - Coming Soon!');
}

// Load map script when opening editor (Coming Soon)
function loadMapScript() {
    console.log('📜 Script loading - Coming Soon!');
}

// Show script help modal (Coming Soon)
function showScriptHelp() {
    alert('📜 Script Editor Help - Coming Soon!\n\nDetailed documentation and examples will be available when the script editor is released.');
}

// Test function to verify all map creator functions
function testMapCreatorFunctions() {
    console.log('🧪 Testing Tank Map Creator Functions:');
    
    const functions = {
        launchEnhancedMapCreator: typeof window.launchEnhancedMapCreator === 'function',
        testMapScript: typeof window.testMapScript === 'function',
        saveMapScript: typeof window.saveMapScript === 'function',
        loadMapScript: typeof window.loadMapScript === 'function',
        showScriptHelp: typeof window.showScriptHelp === 'function'
    };
    
    Object.entries(functions).forEach(([name, exists]) => {
        console.log(`  - ${name}: ${exists ? '✅' : '❌'}`);
    });
    
    // Test ground textures
    console.log('\n🌱 Ground Texture Status:');
    console.log(`  - groundTexturesLoaded: ${window.groundTexturesLoaded || false ? '✅' : '❌'}`);
    console.log(`  - groundTextureImages: ${window.groundTextureImages ? window.groundTextureImages.size : 0} textures`);
    
    return functions;
}

// Test ground texture loading
function testGroundTextures() {
    console.log('🌱 Testing Ground Texture System...');
    
    if (typeof window.loadCustomGroundTexture === 'function') {
        console.log('✅ loadCustomGroundTexture function available');
        window.loadCustomGroundTexture();
    } else {
        console.log('❌ loadCustomGroundTexture function not found');
    }
    
    setTimeout(() => {
        console.log('Ground texture status after 3 seconds:');
        console.log('  - Loaded:', window.groundTexturesLoaded || false);
        console.log('  - Count:', window.groundTextureImages ? window.groundTextureImages.size : 0);
    }, 3000);
}

// Make all functions globally available
window.launchEnhancedMapCreator = launchEnhancedMapCreator;
window.testMapScript = testMapScript;
window.saveMapScript = saveMapScript;
window.clearMapScript = clearMapScript;
window.loadMapScript = loadMapScript;
window.showScriptHelp = showScriptHelp;
window.testMapCreatorFunctions = testMapCreatorFunctions;
window.testGroundTextures = testGroundTextures;

console.log('✅ Tank Map Creator Fixed functions loaded successfully!');