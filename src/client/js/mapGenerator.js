/**
 * Procedural Map Generator for TheFortz
 * Generate diverse, balanced maps with different themes and layouts
 */

const MapGenerator = {
  themes: {
    DESERT: {
      name: 'Desert',
      groundColor: '#D2B48C',
      wallColor: '#8B7355',
      skyColor: '#FFE4B5',
      obstacles: ['rock', 'cactus', 'dune'],
      powerUpDensity: 0.7
    },
    FOREST: {
      name: 'Forest',
      groundColor: '#228B22',
      wallColor: '#654321',
      skyColor: '#87CEEB',
      obstacles: ['tree', 'bush', 'log'],
      powerUpDensity: 1.0
    },
    SNOW: {
      name: 'Snow',
      groundColor: '#FFFAFA',
      wallColor: '#B0C4DE',
      skyColor: '#E0FFFF',
      obstacles: ['snowman', 'ice', 'tree'],
      powerUpDensity: 0.8
    },
    URBAN: {
      name: 'Urban',
      groundColor: '#696969',
      wallColor: '#2F4F4F',
      skyColor: '#778899',
      obstacles: ['building', 'car', 'crate'],
      powerUpDensity: 1.2
    },
    LAVA: {
      name: 'Lava',
      groundColor: '#8B0000',
      wallColor: '#000000',
      skyColor: '#FF4500',
      obstacles: ['rock', 'lava_pool', 'volcano'],
      powerUpDensity: 0.5
    },
    SPACE: {
      name: 'Space',
      groundColor: '#191970',
      wallColor: '#4B0082',
      skyColor: '#000000',
      obstacles: ['asteroid', 'satellite', 'crater'],
      powerUpDensity: 0.9
    }
  },

  layouts: {
    OPEN: {
      name: 'Open Arena',
      obstacleDensity: 0.1,
      clustered: false,
      symmetrical: false
    },
    MAZE: {
      name: 'Maze',
      obstacleDensity: 0.4,
      clustered: true,
      symmetrical: false
    },
    SYMMETRICAL: {
      name: 'Symmetrical',
      obstacleDensity: 0.2,
      clustered: true,
      symmetrical: true
    },
    SCATTERED: {
      name: 'Scattered',
      obstacleDensity: 0.25,
      clustered: false,
      symmetrical: false
    },
    FORTRESS: {
      name: 'Fortress',
      obstacleDensity: 0.35,
      clustered: true,
      symmetrical: true,
      centralStructure: true
    }
  },

  // Generate a complete map
  generateMap(config = {}) {
    const theme = config.theme || this.getRandomTheme();
    const layout = config.layout || this.getRandomLayout();
    const size = config.size || { width: 7500, height: 7500 };
    const name = config.name || this.generateMapName(theme, layout);

    const map = {
      id: `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      theme: theme,
      layout: layout,
      size: size,
      obstacles: [],
      powerUps: [],
      spawnPoints: [],
      metadata: {
        createdAt: Date.now(),
        difficulty: this.calculateDifficulty(layout),
        recommendedPlayers: this.getRecommendedPlayers(size, layout)
      }
    };

    // Generate obstacles
    map.obstacles = this.generateObstacles(map);

    // Generate spawn points
    map.spawnPoints = this.generateSpawnPoints(map);

    // Generate power-ups
    map.powerUps = this.generatePowerUpLocations(map);

    return map;
  },

  // Generate obstacles based on layout
  generateObstacles(map) {
    const obstacles = [];
    const layoutConfig = this.layouts[map.layout];
    const themeConfig = this.themes[map.theme];

    const obstacleCount = Math.floor(
      map.size.width * map.size.height / 10000 * layoutConfig.obstacleDensity
    );

    if (layoutConfig.symmetrical) {
      // Generate symmetrical obstacles
      for (let i = 0; i < obstacleCount / 2; i++) {
        const obstacle = this.createObstacle(map, themeConfig);
        obstacles.push(obstacle);

        // Mirror obstacle
        const mirrored = {
          ...obstacle,
          id: `obstacle_${Date.now()}_${Math.random()}`,
          x: map.size.width - obstacle.x,
          y: map.size.height - obstacle.y
        };
        obstacles.push(mirrored);
      }
    } else if (layoutConfig.clustered) {
      // Generate clustered obstacles
      const clusterCount = Math.floor(obstacleCount / 10);

      for (let c = 0; c < clusterCount; c++) {
        const clusterX = Math.random() * map.size.width;
        const clusterY = Math.random() * map.size.height;
        const clusterSize = 5 + Math.floor(Math.random() * 10);

        for (let i = 0; i < clusterSize; i++) {
          const obstacle = this.createObstacle(map, themeConfig);
          obstacle.x = clusterX + (Math.random() - 0.5) * 500;
          obstacle.y = clusterY + (Math.random() - 0.5) * 500;
          obstacles.push(obstacle);
        }
      }
    } else {
      // Generate scattered obstacles
      for (let i = 0; i < obstacleCount; i++) {
        obstacles.push(this.createObstacle(map, themeConfig));
      }
    }

    // Add central structure if needed
    if (layoutConfig.centralStructure) {
      obstacles.push(...this.createCentralStructure(map));
    }

    return obstacles;
  },

  createObstacle(map, themeConfig) {
    const obstacleType = themeConfig.obstacles[
    Math.floor(Math.random() * themeConfig.obstacles.length)];


    return {
      id: `obstacle_${Date.now()}_${Math.random()}`,
      type: obstacleType,
      x: 200 + Math.random() * (map.size.width - 400),
      y: 200 + Math.random() * (map.size.height - 400),
      radius: 30 + Math.random() * 40,
      health: 100,
      destructible: Math.random() > 0.7
    };
  },

  createCentralStructure(map) {
    const structure = [];
    const centerX = map.size.width / 2;
    const centerY = map.size.height / 2;
    const radius = 300;

    // Create circular fortress
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      structure.push({
        id: `structure_${Date.now()}_${Math.random()}`,
        type: 'wall',
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 50,
        health: 200,
        destructible: true
      });
    }

    return structure;
  },

  // Generate spawn points
  generateSpawnPoints(map) {
    const spawnPoints = [];
    const spawnCount = 8;
    const margin = 300;

    for (let i = 0; i < spawnCount; i++) {
      let validSpawn = false;
      let attempts = 0;
      let spawn;

      while (!validSpawn && attempts < 50) {
        spawn = {
          x: margin + Math.random() * (map.size.width - margin * 2),
          y: margin + Math.random() * (map.size.height - margin * 2)
        };

        // Check if spawn is far enough from obstacles
        validSpawn = !map.obstacles.some((obstacle) => {
          const dx = spawn.x - obstacle.x;
          const dy = spawn.y - obstacle.y;
          return Math.sqrt(dx * dx + dy * dy) < 200;
        });

        attempts++;
      }

      if (validSpawn) {
        spawnPoints.push(spawn);
      }
    }

    return spawnPoints;
  },

  // Generate power-up locations
  generatePowerUpLocations(map) {
    const powerUps = [];
    const themeConfig = this.themes[map.theme];
    const baseCount = Math.floor(map.size.width * map.size.height / 50000);
    const count = Math.floor(baseCount * themeConfig.powerUpDensity);

    for (let i = 0; i < count; i++) {
      let validLocation = false;
      let attempts = 0;
      let location;

      while (!validLocation && attempts < 30) {
        location = {
          x: 200 + Math.random() * (map.size.width - 400),
          y: 200 + Math.random() * (map.size.height - 400)
        };

        // Check if location is far enough from obstacles
        validLocation = !map.obstacles.some((obstacle) => {
          const dx = location.x - obstacle.x;
          const dy = location.y - obstacle.y;
          return Math.sqrt(dx * dx + dy * dy) < 150;
        });

        attempts++;
      }

      if (validLocation) {
        powerUps.push(location);
      }
    }

    return powerUps;
  },

  // Utility functions
  getRandomTheme() {
    const themes = Object.keys(this.themes);
    return themes[Math.floor(Math.random() * themes.length)];
  },

  getRandomLayout() {
    const layouts = Object.keys(this.layouts);
    return layouts[Math.floor(Math.random() * layouts.length)];
  },

  generateMapName(theme, layout) {
    const adjectives = ['Ancient', 'Forgotten', 'Sacred', 'Cursed', 'Hidden', 'Lost', 'Mystic', 'Dark'];
    const nouns = ['Arena', 'Battlefield', 'Grounds', 'Wasteland', 'Territory', 'Zone', 'Domain'];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj} ${this.themes[theme].name} ${noun}`;
  },

  calculateDifficulty(layout) {
    const layoutConfig = this.layouts[layout];
    const difficulty = layoutConfig.obstacleDensity * 10;

    if (difficulty < 2) return 'Easy';
    if (difficulty < 4) return 'Medium';
    if (difficulty < 6) return 'Hard';
    return 'Expert';
  },

  getRecommendedPlayers(size, layout) {
    const area = size.width * size.height;
    const layoutConfig = this.layouts[layout];

    const baseCapacity = area / 500000; // 1 player per 500k pixels
    const adjusted = baseCapacity * (1 - layoutConfig.obstacleDensity * 0.3);

    return `${Math.floor(adjusted * 0.5)}-${Math.ceil(adjusted)}`;
  },

  // Save/Load maps
  saveMap(map) {
    const maps = JSON.parse(localStorage.getItem('customMaps') || '[]');
    maps.push(map);
    localStorage.setItem('customMaps', JSON.stringify(maps));
  },

  loadMaps() {
    return JSON.parse(localStorage.getItem('customMaps') || '[]');
  },

  deleteMap(mapId) {
    const maps = this.loadMaps();
    const filtered = maps.filter((m) => m.id !== mapId);
    localStorage.setItem('customMaps', JSON.stringify(filtered));
  }
};

// Export
if (typeof window !== 'undefined') {
  window.MapGenerator = MapGenerator;
}