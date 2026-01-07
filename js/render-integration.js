// Render Integration - Hooks into main game rendering to include map renderer
(function() {
    // Wait for main game to be available
    const waitForMainGame = () => {
        if (typeof window.gameLoop !== 'undefined' || typeof window.render !== 'undefined') {
            integrateRendering();
        } else {
            setTimeout(waitForMainGame, 100);
        }
    };
    
    function integrateRendering() {
        // Hook into the main game rendering if it exists
        if (typeof window.render === 'function') {
            const originalRender = window.render;
            
            window.render = function(...args) {
                // Call original render first
                const result = originalRender.apply(this, args);
                
                // Then call our integrated rendering
                if (window.GameIntegration && window.GameIntegration.render) {
                    try {
                        const canvas = document.getElementById('gameCanvas');
                        const ctx = canvas ? canvas.getContext('2d') : null;
                        const camera = window.camera || { x: 0, y: 0 };
                        
                        if (ctx && canvas) {
                            window.GameIntegration.render(ctx, canvas, camera);
                        }
                    } catch (error) {
                        console.warn('Integrated rendering error:', error);
                    }
                }
                
                return result;
            };
            
            console.log('🔗 Render integration hooked into main game');
        }
        
        // Also try to hook into game loop if it exists
        if (typeof window.gameLoop === 'function') {
            const originalGameLoop = window.gameLoop;
            
            window.gameLoop = function(...args) {
                // Call original game loop
                const result = originalGameLoop.apply(this, args);
                
                // Update our systems
                if (window.GameIntegration && window.GameIntegration.update) {
                    try {
                        const deltaTime = 1/60; // Approximate delta time
                        window.GameIntegration.update(deltaTime);
                    } catch (error) {
                        console.warn('Integrated update error:', error);
                    }
                }
                
                return result;
            };
            
            console.log('🔗 Game loop integration hooked');
        }
    }
    
    // Start waiting for main game
    waitForMainGame();
    
    // Also try to integrate when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(integrateRendering, 1000);
        });
    } else {
        setTimeout(integrateRendering, 1000);
    }
})();