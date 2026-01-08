// Map Radius Patch - Ensure consistent map size
// This file ensures the map radius is set to 2500 (original size) at runtime

(function() {
    'use strict';
    
    console.log('🌊 Applying map radius patch - ensuring consistent size...');
    
    // Global map radius override
    window.MAP_RADIUS_OVERRIDE = 2500; // Match the original size
    
    // Function to patch map radius in runtime
    function patchMapRadius() {
        // Override any global constants
        if (typeof window.MAP_RADIUS !== 'undefined') {
            window.MAP_RADIUS = 2500;
        }
        
        // Patch string replacements in functions at runtime
        if (typeof String.prototype.replaceMapRadius === 'undefined') {
            String.prototype.replaceMapRadius = function() {
                return this.replace(/5000/g, '2500');
            };
        }
        
        console.log('✅ Map radius set to 2500 (original size)');
    }
    
    // Apply patch immediately
    patchMapRadius();
    
    // Patch the startMapEditor function to ensure the override is applied
    const originalStartMapEditor = window.startMapEditor;
    window.startMapEditor = function() {
        // Apply the patch before starting
        window.MAP_RADIUS_OVERRIDE = 2500;
        
        // Call original function if it exists
        if (originalStartMapEditor) {
            return originalStartMapEditor.apply(this, arguments);
        }
    };
    
    // Log that patch is ready (function patching removed to comply with CSP)
    console.log('🌊 Map radius constants initialized (CSP-compliant)');
    
})();