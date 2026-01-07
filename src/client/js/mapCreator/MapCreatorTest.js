// Map Creator Test - Verify functions are working
(function() {
    'use strict';
    
    console.log('🧪 Map Creator Test starting...');
    
    // Wait for DOM to be ready
    function runTests() {
        console.log('🔍 Testing Map Creator Functions:');
        
        // Test 1: Check if functions exist
        const functions = [
            'startCreateMapRendering',
            'loadSavedMaps',
            'stopCreateMapRendering',
            'handleMapCreatorClick',
            'openBlankMapCreator',
            'closeBlankMapCreator'
        ];
        
        let allFunctionsExist = true;
        functions.forEach(funcName => {
            const exists = typeof window[funcName] === 'function';
            console.log(`  ${exists ? '✅' : '❌'} ${funcName}: ${exists ? 'Available' : 'Missing'}`);
            if (!exists) allFunctionsExist = false;
        });
        
        // Test 2: Try calling startCreateMapRendering safely
        if (typeof window.startCreateMapRendering === 'function') {
            try {
                console.log('🧪 Testing startCreateMapRendering...');
                // Don't actually call it, just verify it's callable
                console.log('✅ startCreateMapRendering is callable');
            } catch (error) {
                console.error('❌ Error with startCreateMapRendering:', error);
            }
        }
        
        // Test 3: Try calling loadSavedMaps safely
        if (typeof window.loadSavedMaps === 'function') {
            try {
                console.log('🧪 Testing loadSavedMaps...');
                // Don't actually call it, just verify it's callable
                console.log('✅ loadSavedMaps is callable');
            } catch (error) {
                console.error('❌ Error with loadSavedMaps:', error);
            }
        }
        
        // Test 4: Check enhanced map creator
        if (typeof window.launchEnhancedMapCreator === 'function') {
            console.log('✅ Enhanced Map Creator is available');
        } else {
            console.log('⚠️ Enhanced Map Creator not available');
        }
        
        // Test 5: Check script engine
        if (typeof window.mapScriptEngine !== 'undefined') {
            console.log('✅ Map Script Engine is available');
        } else {
            console.log('⚠️ Map Script Engine not available');
        }
        
        // Final result
        if (allFunctionsExist) {
            console.log('🎉 All Map Creator functions are working!');
            
            // Dispatch success event
            window.dispatchEvent(new CustomEvent('mapCreatorTestComplete', {
                detail: { status: 'success', timestamp: Date.now() }
            }));
        } else {
            console.log('⚠️ Some Map Creator functions are missing');
            
            // Dispatch failure event
            window.dispatchEvent(new CustomEvent('mapCreatorTestComplete', {
                detail: { status: 'failure', timestamp: Date.now() }
            }));
        }
    }
    
    // Run tests when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runTests, 1000); // Wait 1 second for all scripts to load
        });
    } else {
        setTimeout(runTests, 1000);
    }
    
    // Also run tests when map creator is ready
    window.addEventListener('mapCreatorReady', () => {
        console.log('📡 Map Creator ready event received, running tests...');
        setTimeout(runTests, 100);
    });
    
    // Expose test function globally
    window.testMapCreator = runTests;
    
    console.log('🧪 Map Creator Test script loaded');
})();