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
    setTimeout(function() {
        // Override drawIsometricWater if it exists
        if (typeof window.drawIsometricWater === 'function') {
            const originalDrawWater = window.drawIsometricWater;
            window.drawIsometricWater = function(ctx, camera, viewWidth, viewHeight) {
                // Temporarily replace 5000 with 2500 in the function
                const funcStr = originalDrawWater.toString().replace(/5000/g, '2500');
                try {
                    const patchedFunc = new Function('ctx', 'camera', 'viewWidth', 'viewHeight', 
                        funcStr.substring(funcStr.indexOf('{') + 1, funcStr.lastIndexOf('}'))
                    );
                    return patchedFunc.call(this, ctx, camera, viewWidth, viewHeight);
                } catch (e) {
                    console.warn('Could not patch drawIsometricWater, using original');
                    return originalDrawWater.apply(this, arguments);
                }
            };
        }
        
        // Override drawGroundSamples if it exists
        if (typeof window.drawGroundSamples === 'function') {
            const originalDrawGround = window.drawGroundSamples;
            window.drawGroundSamples = function(ctx, camera, viewWidth, viewHeight) {
                // Temporarily replace 5000 with 2500 in the function
                const funcStr = originalDrawGround.toString().replace(/5000/g, '2500');
                try {
                    const patchedFunc = new Function('ctx', 'camera', 'viewWidth', 'viewHeight', 
                        funcStr.substring(funcStr.indexOf('{') + 1, funcStr.lastIndexOf('}'))
                    );
                    return patchedFunc.call(this, ctx, camera, viewWidth, viewHeight);
                } catch (e) {
                    console.warn('Could not patch drawGroundSamples, using original');
                    return originalDrawGround.apply(this, arguments);
                }
            };
        }
        
        console.log('🌊 Map radius consistency patches applied!');
    }, 1000);
    
})();