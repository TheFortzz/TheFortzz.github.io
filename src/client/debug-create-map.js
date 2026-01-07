// Debug script to force show create map screen
function forceShowCreateMapScreen() {
    console.log('🔍 Debugging create map screen...');
    
    // Find the screen element
    const screen = document.getElementById('createMapScreen');
    console.log('📝 createMapScreen element:', screen);
    
    if (screen) {
        console.log('📝 Current classes:', screen.className);
        console.log('📝 Current display:', screen.style.display);
        console.log('📝 Current visibility:', screen.style.visibility);
        console.log('📝 Has hidden class:', screen.classList.contains('hidden'));
        
        // Force show the screen
        screen.classList.remove('hidden');
        screen.style.display = 'block';
        screen.style.visibility = 'visible';
        screen.style.zIndex = '99999';
        screen.style.position = 'fixed';
        screen.style.top = '0';
        screen.style.left = '0';
        screen.style.width = '100%';
        screen.style.height = '100%';
        screen.style.background = 'rgba(0, 0, 0, 0.9)';
        
        console.log('✅ Forced screen to show');
        console.log('📝 New classes:', screen.className);
        console.log('📝 New display:', screen.style.display);
        
        // Also check if the create new button exists
        const createBtn = document.querySelector('.create-new-map-btn');
        console.log('📝 Create new button:', createBtn);
        
        if (createBtn) {
            createBtn.style.display = 'block';
            createBtn.style.visibility = 'visible';
            console.log('✅ Create button made visible');
        }
        
        return true;
    } else {
        console.error('❌ createMapScreen element not found!');
        return false;
    }
}

// Also create a function to test the openFeature directly
function testOpenFeature() {
    console.log('🧪 Testing openFeature function...');
    
    if (typeof window.openFeature === 'function') {
        console.log('✅ openFeature function exists');
        window.openFeature('create-map');
    } else {
        console.error('❌ openFeature function not found');
    }
}

// Make functions available globally
window.forceShowCreateMapScreen = forceShowCreateMapScreen;
window.testOpenFeature = testOpenFeature;

console.log('🔧 Debug functions loaded. Run forceShowCreateMapScreen() or testOpenFeature() in console.');