// Demo Map Generator - Creates sample maps for testing the map browser modal
(function() {
    function createDemoMaps() {
        try {
            let maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
            
            // Only create demo maps if no maps exist
            if (maps.length === 0) {
                console.log('🎨 Creating demo maps for map browser testing...');
                
                const demoMaps = [
                    // Default demo maps removed as requested
                ];
                
                localStorage.setItem('thefortz.customMaps', JSON.stringify(demoMaps));
                console.log(`✅ Created ${demoMaps.length} demo maps`);
                return demoMaps;
            }
            
            return maps;
        } catch (error) {
            console.error('Error creating demo maps:', error);
            return [];
        }
    }
    
    function generateDesertTiles() {
        const tiles = [];
        const hexSize = 60;
        const hexWidth = hexSize * Math.sqrt(3);
        const hexHeight = hexSize * 2;
        const vertSpacing = hexHeight * 0.75;
        
        // Create a grid of sand tiles with some variety
        for (let row = 0; row < 80; row++) {
            for (let col = 0; col < 80; col++) {
                const y = row * vertSpacing;
                const offsetX = (row % 2 === 0) ? 0 : hexWidth / 2;
                const x = col * hexWidth + offsetX;
                
                if (x >= 0 && x <= 7500 && y >= 0 && y <= 7500) {
                    let tileType = 'sand';
                    
                    // Add some grass patches randomly
                    if (Math.random() < 0.1) {
                        tileType = 'grass';
                    }
                    
                    tiles.push({
                        x: x,
                        y: y,
                        type: tileType
                    });
                }
            }
        }
        
        return tiles;
    }
    
    function generateDesertObjects() {
        const objects = [];
        
        // Add some rocks scattered around
        for (let i = 0; i < 30; i++) {
            objects.push({
                type: 'rock',
                x: Math.random() * 7000 + 250,
                y: Math.random() * 7000 + 250,
                radius: 20 + Math.random() * 20,
                rotation: Math.random() * Math.PI * 2
            });
        }
        
        // Add some walls
        for (let i = 0; i < 15; i++) {
            objects.push({
                type: 'wall',
                x: Math.random() * 6000 + 750,
                y: Math.random() * 6000 + 750,
                width: 100 + Math.random() * 100,
                height: 50 + Math.random() * 50,
                rotation: Math.random() * Math.PI * 2
            });
        }
        
        return objects;
    }
    
    function generateForestTiles() {
        const tiles = [];
        const hexSize = 60;
        const hexWidth = hexSize * Math.sqrt(3);
        const hexHeight = hexSize * 2;
        const vertSpacing = hexHeight * 0.75;
        
        // Create mostly grass tiles
        for (let row = 0; row < 80; row++) {
            for (let col = 0; col < 80; col++) {
                const y = row * vertSpacing;
                const offsetX = (row % 2 === 0) ? 0 : hexWidth / 2;
                const x = col * hexWidth + offsetX;
                
                if (x >= 0 && x <= 7500 && y >= 0 && y <= 7500) {
                    tiles.push({
                        x: x,
                        y: y,
                        type: 'grass'
                    });
                }
            }
        }
        
        return tiles;
    }
    
    function generateForestObjects() {
        const objects = [];
        
        // Add many trees
        for (let i = 0; i < 50; i++) {
            objects.push({
                type: 'tree',
                x: Math.random() * 7000 + 250,
                y: Math.random() * 7000 + 250,
                radius: 25 + Math.random() * 15,
                rotation: 0
            });
        }
        
        // Add some rocks
        for (let i = 0; i < 20; i++) {
            objects.push({
                type: 'rock',
                x: Math.random() * 7000 + 250,
                y: Math.random() * 7000 + 250,
                radius: 15 + Math.random() * 15,
                rotation: Math.random() * Math.PI * 2
            });
        }
        
        return objects;
    }
    
    function generateLavaTiles() {
        const tiles = [];
        const hexSize = 60;
        const hexWidth = hexSize * Math.sqrt(3);
        const hexHeight = hexSize * 2;
        const vertSpacing = hexHeight * 0.75;
        
        // Create a mix of stone and lava tiles
        for (let row = 0; row < 80; row++) {
            for (let col = 0; col < 80; col++) {
                const y = row * vertSpacing;
                const offsetX = (row % 2 === 0) ? 0 : hexWidth / 2;
                const x = col * hexWidth + offsetX;
                
                if (x >= 0 && x <= 7500 && y >= 0 && y <= 7500) {
                    let tileType = 'stone';
                    
                    // Add lava rivers/pools
                    const centerX = 3750;
                    const centerY = 3750;
                    const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    
                    if (distanceFromCenter < 1000 && Math.random() < 0.3) {
                        tileType = 'lava';
                    } else if (Math.random() < 0.1) {
                        tileType = 'lava';
                    }
                    
                    tiles.push({
                        x: x,
                        y: y,
                        type: tileType
                    });
                }
            }
        }
        
        return tiles;
    }
    
    function generateLavaObjects() {
        const objects = [];
        
        // Add rocks around lava areas
        for (let i = 0; i < 40; i++) {
            objects.push({
                type: 'rock',
                x: Math.random() * 7000 + 250,
                y: Math.random() * 7000 + 250,
                radius: 20 + Math.random() * 25,
                rotation: Math.random() * Math.PI * 2
            });
        }
        
        // Add some walls/barriers
        for (let i = 0; i < 10; i++) {
            objects.push({
                type: 'wall',
                x: Math.random() * 6000 + 750,
                y: Math.random() * 6000 + 750,
                width: 80 + Math.random() * 80,
                height: 40 + Math.random() * 40,
                rotation: Math.random() * Math.PI * 2
            });
        }
        
        return objects;
    }
    
    // Expose globally
    window.createDemoMaps = createDemoMaps;
    
    // Auto-create demo maps on load if needed
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createDemoMaps);
    } else {
        createDemoMaps();
    }
})();