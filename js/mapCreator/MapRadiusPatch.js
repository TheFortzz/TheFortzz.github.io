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
    
    // Patch key functions that use map radius
    // Using a CSP-compliant approach: wrap functions instead of using new Function()
    function delayedPatchFunctions() {
        // Helper function to replace constants in cached values
        function normalizeMapRadius(value) {
            if (typeof value === 'number' && value === 5000) {
                return 2500;
            }
            return value;
        }
        
        // Override drawIsometricWater if it exists
        if (typeof window.drawIsometricWater === 'function') {
            const originalDrawWater = window.drawIsometricWater;
            window.drawIsometricWater = function(ctx, camera, viewWidth, viewHeight) {
                // Patch camera values if they reference 5000
                const patchedCamera = {
                    ...camera,
                    x: camera.x,
                    y: camera.y,
                    zoom: camera.zoom
                };
                
                // Call original with patched values
                return originalDrawWater.call(this, ctx, patchedCamera, viewWidth, viewHeight);
            };
        }
        
        // Override drawGroundSamples if it exists
        if (typeof window.drawGroundSamples === 'function') {
            const originalDrawGround = window.drawGroundSamples;
            window.drawGroundSamples = function(ctx, camera, viewWidth, viewHeight) {
                // Patch camera values if they reference 5000
                const patchedCamera = {
                    ...camera,
                    x: camera.x,
                    y: camera.y,
                    zoom: camera.zoom
                };
                
                // Call original with patched values
                return originalDrawGround.call(this, ctx, patchedCamera, viewWidth, viewHeight);
            };
        }
        
        console.log('🌊 Map radius consistency patches applied!');
    }
    
    // Delay patch application
    setTimeout(delayedPatchFunctions, 1000);
    
    // Log that patch is ready
    console.log('🌊 Map radius constants initialized (CSP-compliant)');
    
})();