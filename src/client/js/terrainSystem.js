// Terrain and Ground Types System for TheFortz Map Builder

const TerrainSystem = {
  // Ground type definitions with gameplay effects
  groundTypes: {
    grass: {
      id: 'grass',
      name: 'Grass',
      icon: '🟩',
      color: '#4a7c4e',
      pattern: null, // Will be loaded
      speedModifier: 1.0, // Normal speed
      tractionModifier: 1.0, // Normal traction
      camouflageBonus: 0.1, // 10% harder to spot
      description: 'Basic natural terrain - balanced movement'
    },
    sand: {
      id: 'sand',
      name: 'Sand',
      icon: '🏜️',
      color: '#d4a76a',
      pattern: null,
      speedModifier: 0.75, // 25% slower
      tractionModifier: 0.8, // Slightly slippery
      camouflageBonus: 0,
      description: 'Desert terrain - reduced speed'
    },
    mud: {
      id: 'mud',
      name: 'Mud',
      icon: '💩',
      color: '#5a4a3a',
      pattern: null,
      speedModifier: 0.6, // 40% slower
      tractionModifier: 0.65, // Very slippery
      camouflageBonus: 0,
      leavesTrackMarks: true, // Visual effect
      description: 'Muddy swamp - very slow movement with tire tracks'
    },
    concrete: {
      id: 'concrete',
      name: 'Concrete',
      icon: '🏢',
      color: '#808080',
      pattern: null,
      speedModifier: 1.1, // 10% faster
      tractionModifier: 1.1, // Better traction
      camouflageBonus: 0,
      description: 'Urban pavement - increased speed and control'
    },
    snow: {
      id: 'snow',
      name: 'Snow',
      icon: '❄️',
      color: '#e8f4f8',
      pattern: null,
      speedModifier: 0.8, // 20% slower
      tractionModifier: 0.6, // Very slippery
      camouflageBonus: 0.15, // 15% harder to spot (winter camo)
      description: 'Snowy terrain - slippery with low visibility'
    },
    rock: {
      id: 'rock',
      name: 'Rock / Gravel',
      icon: '🪨',
      color: '#6b6b6b',
      pattern: null,
      speedModifier: 0.85, // 15% slower
      tractionModifier: 0.9, // Slightly rough
      camouflageBonus: 0.05,
      description: 'Rocky ground - rough but stable'
    },
    water: {
      id: 'water',
      name: 'Water / Swamp',
      icon: '💧',
      color: '#4a90e2',
      pattern: null,
      speedModifier: 0.4, // 60% slower
      tractionModifier: 0.5, // Very difficult
      camouflageBonus: 0,
      damage: 5, // Damage per second in water
      description: 'Water hazard - extreme slowdown and damage'
    }
  },

  // Natural props configuration
  naturalProps: {
    tree: {
      id: 'tree',
      name: 'Tree',
      icon: '🌲',
      sizes: [
      { name: 'small', width: 60, height: 80, collision: true },
      { name: 'medium', width: 80, height: 120, collision: true },
      { name: 'large', width: 120, height: 160, collision: true }],

      providesCover: true,
      blocksShooting: true,
      health: 200,
      color: '#2d5016'
    },
    bush: {
      id: 'bush',
      name: 'Bush',
      icon: '🌿',
      sizes: [
      { name: 'small', width: 40, height: 30, collision: false },
      { name: 'medium', width: 60, height: 40, collision: false }],

      providesCover: false,
      providesConcealment: true, // Hides player visually
      blocksShooting: false,
      health: 50,
      color: '#3a6b35'
    },
    rock: {
      id: 'rock',
      name: 'Rock / Boulder',
      icon: '🪨',
      sizes: [
      { name: 'small', width: 50, height: 50, collision: true },
      { name: 'medium', width: 80, height: 80, collision: true },
      { name: 'large', width: 120, height: 120, collision: true }],

      providesCover: true,
      blocksShooting: true,
      health: 500, // Very durable
      color: '#6b6b6b'
    },
    flower: {
      id: 'flower',
      name: 'Flowers',
      icon: '🌸',
      sizes: [
      { name: 'patch', width: 40, height: 40, collision: false }],

      providesCover: false,
      providesConcealment: false,
      blocksShooting: false,
      health: 10,
      color: '#ff69b4',
      decorativeOnly: true
    }
  },

  // Man-made structures
  structures: {
    building: {
      id: 'building',
      name: 'Building',
      icon: '🏢',
      sizes: [
      { name: 'small', width: 150, height: 150 },
      { name: 'large', width: 250, height: 250 }],

      collision: true,
      health: 1000,
      color: '#8b7355'
    },
    fence: {
      id: 'fence',
      name: 'Fence',
      icon: '🚧',
      sizes: [
      { name: 'short', width: 100, height: 20 },
      { name: 'long', width: 200, height: 20 }],

      collision: true,
      health: 100,
      blocksShooting: false,
      color: '#8b4513'
    },
    barrel: {
      id: 'barrel',
      name: 'Barrel',
      icon: '🛢️',
      sizes: [
      { name: 'standard', width: 40, height: 50 }],

      collision: true,
      health: 75,
      explosive: true, // Explodes when destroyed
      explosionRadius: 120,
      explosionDamage: 50,
      color: '#cd7f32'
    },
    crate: {
      id: 'crate',
      name: 'Crate',
      icon: '📦',
      sizes: [
      { name: 'small', width: 50, height: 50 },
      { name: 'large', width: 80, height: 80 }],

      collision: true,
      health: 100,
      canContainLoot: true,
      color: '#8b6914'
    }
  },

  // Interactive gameplay objects
  interactiveObjects: {
    repairStation: {
      id: 'repair-station',
      name: 'Repair Station',
      icon: '🔧',
      size: { width: 80, height: 80 },
      healRate: 10, // HP per second
      cooldown: 30000, // 30 seconds between uses
      color: '#00ff88',
      glowColor: '#00ff88'
    },
    ammoDepot: {
      id: 'ammo-depot',
      name: 'Ammo Depot',
      icon: '🎯',
      size: { width: 80, height: 80 },
      refillAmount: 100, // Percentage
      cooldown: 20000,
      color: '#ffd700',
      glowColor: '#ffd700'
    },
    shieldGenerator: {
      id: 'shield-gen',
      name: 'Shield Generator',
      icon: '🛡️',
      size: { width: 100, height: 100 },
      shieldAmount: 50,
      radius: 150, // Area of effect
      cooldown: 40000,
      color: '#4a90e2',
      glowColor: '#4a90e2'
    },
    turret: {
      id: 'neutral-turret',
      name: 'Neutral Turret',
      icon: '🔫',
      size: { width: 60, height: 60 },
      damage: 15,
      fireRate: 1000, // 1 shot per second
      range: 300,
      health: 200,
      canBeCaptured: true,
      color: '#ff6b6b'
    },
    mine: {
      id: 'mine',
      name: 'Mine',
      icon: '💣',
      size: { width: 30, height: 30 },
      damage: 75,
      triggerRadius: 50,
      explosionRadius: 100,
      color: '#ff4444',
      hidden: true // Not visible until triggered
    },
    buffZone: {
      id: 'buff-zone',
      name: 'Power-Up Zone',
      icon: '⭐',
      size: { width: 120, height: 120 },
      buffTypes: ['damage', 'speed', 'shield', 'reload'],
      duration: 15000, // 15 seconds
      cooldown: 60000,
      color: '#ff00ff',
      glowColor: '#ff00ff'
    }
  },

  // Biome presets
  biomes: {
    forest: {
      id: 'forest',
      name: 'Forest',
      icon: '🌲',
      description: 'Dense woodland with trees and natural cover',
      defaultTerrain: 'grass',
      props: [
      { type: 'tree', density: 'high' },
      { type: 'bush', density: 'medium' },
      { type: 'rock', density: 'low' },
      { type: 'flower', density: 'medium' }],

      weatherEffects: ['rain', 'fog'],
      ambientColor: '#2d5016',
      backgroundColor: '#1a3010'
    },
    desert: {
      id: 'desert',
      name: 'Desert',
      icon: '🏜️',
      description: 'Arid wasteland with cacti and ruins',
      defaultTerrain: 'sand',
      props: [
      { type: 'rock', density: 'medium' }],

      structures: [
      { type: 'building', density: 'low', ruined: true },
      { type: 'barrel', density: 'low' },
      { type: 'crate', density: 'low' }],

      weatherEffects: ['sandstorm'],
      ambientColor: '#d4a76a',
      backgroundColor: '#8b7355'
    },
    snow: {
      id: 'snow',
      name: 'Snow / Arctic',
      icon: '❄️',
      description: 'Frozen tundra with pine trees and ice',
      defaultTerrain: 'snow',
      props: [
      { type: 'tree', density: 'medium', variant: 'pine' },
      { type: 'rock', density: 'low', variant: 'ice' }],

      weatherEffects: ['snow', 'blizzard'],
      ambientColor: '#e8f4f8',
      backgroundColor: '#b8d4e8'
    },
    urban: {
      id: 'urban',
      name: 'Urban / City',
      icon: '🏢',
      description: 'Concrete jungle with buildings and streets',
      defaultTerrain: 'concrete',
      structures: [
      { type: 'building', density: 'high' },
      { type: 'fence', density: 'medium' },
      { type: 'barrel', density: 'medium' },
      { type: 'crate', density: 'high' }],

      props: [
      { type: 'tree', density: 'low', variant: 'city' }],

      weatherEffects: ['rain'],
      ambientColor: '#808080',
      backgroundColor: '#404040'
    }
  },

  // Helper function to get terrain effect
  getTerrainEffect(terrainType, effectType) {
    const terrain = this.groundTypes[terrainType];
    if (!terrain) return null;

    switch (effectType) {
      case 'speed':
        return terrain.speedModifier;
      case 'traction':
        return terrain.tractionModifier;
      case 'camouflage':
        return terrain.camouflageBonus;
      case 'damage':
        return terrain.damage || 0;
      default:
        return null;
    }
  },

  // Apply terrain effects to player
  // NOTE: This returns modifiers that should be applied to player's MAX SPEED and acceleration
  // Do NOT multiply existing velocity - that causes exponential slow-down
  applyTerrainEffects(player, terrainType) {
    const terrain = this.groundTypes[terrainType];
    if (!terrain) return null;

    // Apply damage if hazardous (this is per-frame damage)
    if (terrain.damage && player.health) {
      player.health -= terrain.damage / 60; // Per frame at 60fps
    }

    // Return modifiers to be applied to player's max speed/acceleration
    // The game engine should apply these to max speed, not current velocity
    return {
      speedModifier: terrain.speedModifier, // Apply to maxSpeed
      tractionModifier: terrain.tractionModifier, // Apply to acceleration
      camouflageBonus: terrain.camouflageBonus, // Stealth bonus
      damage: terrain.damage || 0 // Damage per frame
    };
  },

  // Generate biome preset
  generateBiomeMap(biomeId, mapWidth, mapHeight) {
    const biome = this.biomes[biomeId];
    if (!biome) return null;

    const mapData = {
      biome: biomeId,
      terrain: [],
      props: [],
      structures: [],
      walls: [],
      size: { width: mapWidth, height: mapHeight }
    };

    // Set default terrain
    mapData.defaultTerrain = biome.defaultTerrain;

    // Generate props based on density
    if (biome.props) {
      biome.props.forEach((propConfig) => {
        const propType = this.naturalProps[propConfig.type];
        if (!propType) return;

        const densityMap = { low: 0.3, medium: 0.6, high: 0.9 };
        const density = densityMap[propConfig.density] || 0.5;
        const count = Math.floor(mapWidth * mapHeight / 50000 * density);

        for (let i = 0; i < count; i++) {
          const size = propType.sizes[Math.floor(Math.random() * propType.sizes.length)];
          mapData.props.push({
            type: propConfig.type,
            x: Math.random() * (mapWidth - size.width) + size.width / 2,
            y: Math.random() * (mapHeight - size.height) + size.height / 2,
            size: size.name,
            width: size.width,
            height: size.height,
            collision: size.collision,
            health: propType.health
          });
        }
      });
    }

    // Generate structures
    if (biome.structures) {
      biome.structures.forEach((structConfig) => {
        const structType = this.structures[structConfig.type];
        if (!structType) return;

        const densityMap = { low: 0.2, medium: 0.5, high: 0.8 };
        const density = densityMap[structConfig.density] || 0.3;
        const count = Math.floor(mapWidth * mapHeight / 100000 * density);

        for (let i = 0; i < count; i++) {
          const size = structType.sizes[Math.floor(Math.random() * structType.sizes.length)];
          mapData.structures.push({
            type: structConfig.type,
            x: Math.random() * (mapWidth - size.width) + size.width / 2,
            y: Math.random() * (mapHeight - size.height) + size.height / 2,
            size: size.name,
            width: size.width,
            height: size.height,
            collision: structType.collision,
            health: structType.health,
            ruined: structConfig.ruined || false
          });
        }
      });
    }

    return mapData;
  }
};

// Export for use in map editor
if (typeof window !== 'undefined') {
  window.TerrainSystem = TerrainSystem;
}