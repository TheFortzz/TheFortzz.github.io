// Default Map Generator - DISABLED - Only use player-created maps
(function() {
    function ensureDefaultMapExists() {
        try {
            let maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
            
            // Remove any default Battle Arena maps
            maps = maps.filter(m => m.isUserCreated !== false && m.name !== 'Battle Arena');
            localStorage.setItem('thefortz.customMaps', JSON.stringify(maps));
            
            if (maps.length === 0) {
                console.log('ℹ️ No player-created maps found. Please create a map in Create Map section.');
                return null;
            }
            
            return maps[0];
        } catch (error) {
            console.error('Error loading maps:', error);
            return null;
        }
    }

    // Expose globally
    window.ensureDefaultMapExists = ensureDefaultMapExists;

    // Auto-initialize on load to clean up default maps
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureDefaultMapExists);
    } else {
        ensureDefaultMapExists();
    }
})();
