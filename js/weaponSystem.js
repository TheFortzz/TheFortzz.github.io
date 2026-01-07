/**
 * Advanced Weapon System for TheFortz
 * Multiple weapon types with unique behaviors and effects
 */

const WeaponSystem = {
  weapons: {
    // Standard weapons
    BASIC_CANNON: {
      id: 'basic_cannon',
      name: 'Basic Cannon',
      damage: 10,
      fireRate: 300,
      bulletSpeed: 10,
      bulletSize: 8,
      spread: 0,
      bulletCount: 1,
      color: '#FFD700',
      sound: 'shoot',
      unlockLevel: 1,
      cost: 0
    },

    MACHINE_GUN: {
      id: 'machine_gun',
      name: 'Machine Gun',
      damage: 5,
      fireRate: 100,
      bulletSpeed: 12,
      bulletSize: 5,
      spread: 0.1,
      bulletCount: 1,
      color: '#FF6B00',
      sound: 'machinegun',
      unlockLevel: 3,
      cost: 500
    },

    SHOTGUN: {
      id: 'shotgun',
      name: 'Shotgun',
      damage: 6,
      fireRate: 800,
      bulletSpeed: 8,
      bulletSize: 6,
      spread: 0.3,
      bulletCount: 5,
      color: '#FF0000',
      sound: 'shotgun',
      unlockLevel: 5,
      cost: 750
    },

    SNIPER: {
      id: 'sniper',
      name: 'Sniper Cannon',
      damage: 35,
      fireRate: 1500,
      bulletSpeed: 20,
      bulletSize: 10,
      spread: 0,
      bulletCount: 1,
      color: '#00FFFF',
      piercing: true,
      sound: 'sniper',
      unlockLevel: 7,
      cost: 1000
    },

    PLASMA_GUN: {
      id: 'plasma_gun',
      name: 'Plasma Gun',
      damage: 15,
      fireRate: 400,
      bulletSpeed: 9,
      bulletSize: 12,
      spread: 0,
      bulletCount: 1,
      color: '#00FF00',
      explosive: true,
      explosionRadius: 50,
      sound: 'plasma',
      unlockLevel: 10,
      cost: 1500
    },

    ROCKET_LAUNCHER: {
      id: 'rocket_launcher',
      name: 'Rocket Launcher',
      damage: 25,
      fireRate: 1200,
      bulletSpeed: 6,
      bulletSize: 15,
      spread: 0,
      bulletCount: 1,
      color: '#FF00FF',
      explosive: true,
      explosionRadius: 100,
      homing: false,
      sound: 'rocket',
      unlockLevel: 12,
      cost: 2000
    },

    LASER_BEAM: {
      id: 'laser_beam',
      name: 'Laser Beam',
      damage: 20,
      fireRate: 50,
      bulletSpeed: 30,
      bulletSize: 4,
      spread: 0,
      bulletCount: 1,
      color: '#FF0000',
      piercing: true,
      instant: true,
      sound: 'laser',
      unlockLevel: 15,
      cost: 2500
    },

    FLAMETHROWER: {
      id: 'flamethrower',
      name: 'Flamethrower',
      damage: 3,
      fireRate: 50,
      bulletSpeed: 5,
      bulletSize: 8,
      spread: 0.2,
      bulletCount: 3,
      color: '#FF6600',
      lifetime: 800,
      dot: true, // Damage over time
      dotDamage: 2,
      dotDuration: 3000,
      sound: 'flame',
      unlockLevel: 8,
      cost: 1200
    },

    RAILGUN: {
      id: 'railgun',
      name: 'Railgun',
      damage: 50,
      fireRate: 2000,
      bulletSpeed: 40,
      bulletSize: 8,
      spread: 0,
      bulletCount: 1,
      color: '#FFFFFF',
      piercing: true,
      instant: true,
      chargeTime: 1000,
      sound: 'railgun',
      unlockLevel: 20,
      cost: 3000
    },

    GRENADE_LAUNCHER: {
      id: 'grenade_launcher',
      name: 'Grenade Launcher',
      damage: 20,
      fireRate: 1000,
      bulletSpeed: 7,
      bulletSize: 12,
      spread: 0,
      bulletCount: 1,
      color: '#808080',
      explosive: true,
      explosionRadius: 120,
      bounces: 2,
      gravity: 0.2,
      sound: 'grenade',
      unlockLevel: 14,
      cost: 1800
    }
  },

  // Player weapon loadouts
  playerWeapons: {},

  // Initialize player weapon
  initPlayerWeapon(playerId, weaponId = 'basic_cannon') {
    this.playerWeapons[playerId] = {
      currentWeapon: weaponId,
      lastShot: 0,
      chargeStart: 0,
      isCharging: false,
      ammo: {}
    };
  },

  // Get weapon data
  getWeapon(weaponId) {
    return this.weapons[weaponId.toUpperCase()] || this.weapons.BASIC_CANNON;
  },

  // Check if player can shoot
  canShoot(playerId) {
    const playerWeapon = this.playerWeapons[playerId];
    if (!playerWeapon) return false;

    const weapon = this.getWeapon(playerWeapon.currentWeapon);
    const now = Date.now();

    return now - playerWeapon.lastShot >= weapon.fireRate;
  },

  // Create bullets for weapon
  createBullets(playerId, x, y, angle) {
    const playerWeapon = this.playerWeapons[playerId];
    if (!playerWeapon) return [];

    const weapon = this.getWeapon(playerWeapon.currentWeapon);
    const bullets = [];
    const now = Date.now();

    // Check charge weapons
    if (weapon.chargeTime && playerWeapon.isCharging) {
      const chargeTime = now - playerWeapon.chargeStart;
      if (chargeTime < weapon.chargeTime) {
        return []; // Not fully charged
      }
    }

    playerWeapon.lastShot = now;
    playerWeapon.isCharging = false;

    // Create bullets based on weapon type
    for (let i = 0; i < weapon.bulletCount; i++) {
      const spreadAngle = weapon.spread * (Math.random() - 0.5);
      const bulletAngle = angle + spreadAngle;

      const bullet = {
        id: `bullet_${now}_${i}_${Math.random()}`,
        playerId: playerId,
        x: x,
        y: y,
        vx: Math.cos(bulletAngle) * weapon.bulletSpeed,
        vy: Math.sin(bulletAngle) * weapon.bulletSpeed,
        angle: bulletAngle,
        damage: weapon.damage,
        size: weapon.bulletSize,
        color: weapon.color,
        createdAt: now,
        lifetime: weapon.lifetime || 10000,

        // Special properties
        piercing: weapon.piercing || false,
        explosive: weapon.explosive || false,
        explosionRadius: weapon.explosionRadius || 0,
        homing: weapon.homing || false,
        instant: weapon.instant || false,
        bounces: weapon.bounces || 0,
        bouncesLeft: weapon.bounces || 0,
        gravity: weapon.gravity || 0,
        dot: weapon.dot || false,
        dotDamage: weapon.dotDamage || 0,
        dotDuration: weapon.dotDuration || 0,

        weaponType: weapon.id
      };

      bullets.push(bullet);
    }

    return bullets;
  },

  // Start charging weapon
  startCharge(playerId) {
    const playerWeapon = this.playerWeapons[playerId];
    if (!playerWeapon) return;

    const weapon = this.getWeapon(playerWeapon.currentWeapon);
    if (weapon.chargeTime) {
      playerWeapon.isCharging = true;
      playerWeapon.chargeStart = Date.now();
    }
  },

  // Get charge progress (0-1)
  getChargeProgress(playerId) {
    const playerWeapon = this.playerWeapons[playerId];
    if (!playerWeapon || !playerWeapon.isCharging) return 0;

    const weapon = this.getWeapon(playerWeapon.currentWeapon);
    if (!weapon.chargeTime) return 1;

    const chargeTime = Date.now() - playerWeapon.chargeStart;
    return Math.min(1, chargeTime / weapon.chargeTime);
  },

  // Switch weapon
  switchWeapon(playerId, weaponId) {
    const playerWeapon = this.playerWeapons[playerId];
    if (!playerWeapon) return false;

    if (this.weapons[weaponId.toUpperCase()]) {
      playerWeapon.currentWeapon = weaponId;
      playerWeapon.isCharging = false;
      return true;
    }
    return false;
  },

  // Get current weapon
  getCurrentWeapon(playerId) {
    const playerWeapon = this.playerWeapons[playerId];
    if (!playerWeapon) return null;
    return this.getWeapon(playerWeapon.currentWeapon);
  },

  // Get all unlocked weapons for player
  getUnlockedWeapons(playerLevel) {
    return Object.values(this.weapons).filter((weapon) =>
    weapon.unlockLevel <= playerLevel
    );
  },

  // Update bullet physics
  updateBullet(bullet, deltaTime) {
    // Apply gravity
    if (bullet.gravity) {
      bullet.vy += bullet.gravity * deltaTime;
    }

    // Update position
    bullet.x += bullet.vx * deltaTime / 16;
    bullet.y += bullet.vy * deltaTime / 16;

    // Update angle for visual
    bullet.angle = Math.atan2(bullet.vy, bullet.vx);

    return bullet;
  },

  // Handle bullet collision
  handleBulletHit(bullet, target, gameState) {
    const results = {
      damage: bullet.damage,
      effects: [],
      shouldRemoveBullet: true
    };

    // Explosive damage
    if (bullet.explosive) {
      results.effects.push({
        type: 'explosion',
        x: bullet.x,
        y: bullet.y,
        radius: bullet.explosionRadius,
        damage: bullet.damage * 0.5 // Splash damage
      });
    }

    // Piercing bullets don't get removed
    if (bullet.piercing) {
      results.shouldRemoveBullet = false;
    }

    // Bouncing bullets
    if (bullet.bouncesLeft > 0) {
      bullet.bouncesLeft--;
      results.shouldRemoveBullet = false;
      // Reverse direction
      bullet.vx *= -0.8;
      bullet.vy *= -0.8;
    }

    // Damage over time
    if (bullet.dot) {
      results.effects.push({
        type: 'dot',
        targetId: target.id,
        damage: bullet.dotDamage,
        duration: bullet.dotDuration,
        interval: 500
      });
    }

    return results;
  },

  // Clean up player data
  removePlayer(playerId) {
    delete this.playerWeapons[playerId];
  }
};

// Export for use in game
if (typeof window !== 'undefined') {
  window.WeaponSystem = WeaponSystem;
}