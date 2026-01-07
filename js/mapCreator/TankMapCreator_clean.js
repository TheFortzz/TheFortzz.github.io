// Clean export section - to be appended to TankMapCreator.js
// Remove all duplicate exports and add this single clean export section

// Export all required functions globally for MapCreatorInit.js
if (typeof window !== 'undefined') {
    // Core map creator functions
    window.startCreateMapRendering = startCreateMapRendering;
    window.stopCreateMapRendering = stopCreateMapRendering;
    window.handleMapCreatorClick = handleMapCreatorClick;
    window.openBlankMapCreator = openBlankMapCreator;
    window.closeBlankMapCreator = closeBlankMapCreator;
    window.loadSavedMaps = loadSavedMaps;
    window.startMapEditor = startMapEditor;
    
    // Additional functions if they exist
    if (typeof editMap !== 'undefined') {
        window.editMap = editMap;
    }
    if (typeof deleteMap !== 'undefined') {
        window.deleteMap = deleteMap;
    }
    
    console.log('✅ All TankMapCreator functions exported successfully');
    
    // Verify all required functions are available
    const requiredFunctions = [
        'startCreateMapRendering',
        'stopCreateMapRendering', 
        'handleMapCreatorClick',
        'openBlankMapCreator',
        'closeBlankMapCreator',
        'loadSavedMaps'
    ];
    
    const missing = requiredFunctions.filter(func => typeof window[func] !== 'function');
    
    if (missing.length === 0) {
        console.log('✅ All required functions verified and available');
    } else {
        console.error('❌ Missing functions:', missing);
    }
}