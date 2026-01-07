// AI Opponents System - Smart Tank AI with Different Personalities
class AIOpponents {
  constructor() {
    this.aiTanks = new Map();
    this.aiPersonalities = new Map();
    this.pathfinding = new PathfindingSystem();
    this.behaviorTree = new BehaviorTree();

    this.settings = {
      maxAITanks: 8,
      difficultyLevel: 'medium', // easy, medium, hard, expert
      enableTeamAI: true,
      aiReactionTime: 0.2,
      aiAccuracy: 0.7
    };

    this.initializePersonalities();
  }

  initializePersonalities() {
    // Define different AI personalities
    this.aiPersonalities.set('aggressive', {
      name: 'Aggressive',
      description: 'Charges directly at enemies',
      behavior: {
        aggression: 0.9,
        caution: 0.2,
        teamwork: 0.4,
        accuracy: 0.8,
        reactionTime: 0.15,
        preferredRange: 200,
        retreatThreshold: 0.3
      },
      color: '#ff4444',
      weapons: ['heavy_cannon', 'rapid_fire'],
      tactics: ['charge', 'flank', 'suppress']
    });

    this.aiPersonalities.set('defensive', {
      name: 'Defensive',
      description: 'Holds positions and supports teammates',
      behavior: {
        aggression: 0.3,
        caution: 0.9,
        teamwork: 0.8,
        accuracy: 0.9,
        reactionTime: 0.25,
        preferredRange: 400,
        retreatThreshold: 0.6
      },
      color: '#4444ff',
      weapons: ['sniper_cannon', 'basic_turret'],
      tactics: ['hold_position', 'support', 'cover_fire']
    });

    this.aiPersonalities.set('sneaky', {
      name: 'Sneaky',
      description: 'Uses stealth and ambush tactics',
      behavior: {
        aggression: 0.6,
        caution: 0.7,
        teamwork: 0.5,
        accuracy: 0.85,
        reactionTime: 0.18,
        preferredRange: 300,
        retreatThreshold: 0.4
      },
      color: '#44ff44',
      weapons: ['stealth_cannon', 'silent_turret'],
      tactics: ['ambush', 'stealth', 'hit_and_run']
    });

    this.aiPersonalities.set('support', {
      name: 'Support',
      description: 'Focuses on team coordination and healing',
      behavior: {
        aggression: 0.4,
        caution: 0.6,
        teamwork: 0.95,
        accuracy: 0.7,
        reactionTime: 0.3,
        preferredRange: 350,
        retreatThreshold: 0.5
      },
      color: '#ffff44',
      weapons: ['repair_beam', 'shield_generator'],
      tactics: ['heal_allies', 'provide_cover', 'coordinate']
    });

    this.aiPersonalities.set('berserker', {
      name: 'Berserker',
      description: 'Becomes more dangerous when damaged',
      behavior: {
        aggression: 0.7,
        caution: 0.1,
        teamwork: 0.3,
        accuracy: 0.6,
        reactionTime: 0.12,
        preferredRange: 150,
        retreatThreshold: 0.1
      },
      color: '#ff44ff',
      weapons: ['dual_cannons', 'explosive_rounds'],
      tactics: ['rampage', 'close_combat', 'ignore_damage']
    });
  }

  // Create AI tank with specific personality
  createAITank(x, y, personalityType = 'aggressive', team = 'ai') {
    const personality = this.aiPersonalities.get(personalityType);
    if (!personality) {
      console.warn(`Unknown AI personality: ${personalityType}`);
      return null;
    }

    const aiTank = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x, y,
      angle: Math.random() * Math.PI * 2,
      turretAngle: Math.random() * Math.PI * 2,
      vx: 0, vy: 0,
      health: 100,
      maxHealth: 100,
      shield: 100,
      maxShield: 100,
      team,

      // AI specific properties
      personality: personalityType,
      behavior: { ...personality.behavior },
      color: personality.color,
      weapons: [...personality.weapons],
      tactics: [...personality.tactics],

      // AI state
      state: 'idle', // idle, patrol, engage, retreat, support
      target: null,
      lastSeen: null,
      path: [],
      currentWaypoint: 0,
      lastShot: 0,
      lastDecision: 0,
      memory: new Map(),

      // Combat state
      inCombat: false,
      combatStartTime: 0,
      lastDamageTime: 0,
      killCount: 0,

      // Movement
      speed: 3 + Math.random() * 2,
      turnSpeed: 0.05 + Math.random() * 0.02,

      // Timers
      thinkTimer: 0,
      actionTimer: 0,

      // Difficulty modifiers
      ...this.getDifficultyModifiers()
    };

    this.aiTanks.set(aiTank.id, aiTank);
    return aiTank;
  }

  getDifficultyModifiers() {
    const modifiers = {
      easy: {
        accuracyMod: 0.5,
        reactionMod: 2.0,
        aggressionMod: 0.7,
        healthMod: 0.8
      },
      medium: {
        accuracyMod: 1.0,
        reactionMod: 1.0,
        aggressionMod: 1.0,
        healthMod: 1.0
      },
      hard: {
        accuracyMod: 1.3,
        reactionMod: 0.7,
        aggressionMod: 1.2,
        healthMod: 1.2
      },
      expert: {
        accuracyMod: 1.5,
        reactionMod: 0.5,
        aggressionMod: 1.4,
        healthMod: 1.5
      }
    };

    return modifiers[this.settings.difficultyLevel] || modifiers.medium;
  }

  // Main AI update loop
  update(deltaTime, gameState) {
    this.aiTanks.forEach((aiTank) => {
      this.updateAITank(aiTank, deltaTime, gameState);
    });
  }

  updateAITank(aiTank, deltaTime, gameState) {
    // Update timers
    aiTank.thinkTimer += deltaTime;
    aiTank.actionTimer += deltaTime;

    // Think every few frames based on difficulty
    const thinkInterval = aiTank.behavior.reactionTime * aiTank.reactionMod;
    if (aiTank.thinkTimer >= thinkInterval) {
      this.thinkAI(aiTank, gameState);
      aiTank.thinkTimer = 0;
    }

    // Execute current action
    this.executeAction(aiTank, deltaTime, gameState);

    // Update combat state
    this.updateCombatState(aiTank, gameState);

    // Update memory
    this.updateMemory(aiTank, gameState);
  }

  thinkAI(aiTank, gameState) {
    // Scan for enemies and threats
    const threats = this.scanForThreats(aiTank, gameState);
    const allies = this.scanForAllies(aiTank, gameState);
    const powerUps = this.scanForPowerUps(aiTank, gameState);

    // Evaluate current situation
    const situation = this.evaluateSituation(aiTank, threats, allies, powerUps);

    // Make decision based on personality and situation
    const decision = this.makeDecision(aiTank, situation);

    // Update AI state
    aiTank.state = decision.state;
    aiTank.target = decision.target;
    aiTank.path = decision.path || [];
    aiTank.currentWaypoint = 0;

    aiTank.lastDecision = Date.now();
  }

  scanForThreats(aiTank, gameState) {
    const threats = [];
    const scanRange = 500;

    // Scan for enemy players
    Object.values(gameState.players || {}).forEach((player) => {
      if (player.team !== aiTank.team && player.health > 0) {
        const distance = this.getDistance(aiTank, player);
        if (distance <= scanRange) {
          const threat = {
            type: 'player',
            target: player,
            distance,
            angle: this.getAngle(aiTank, player),
            threatLevel: this.calculateThreatLevel(aiTank, player),
            lastSeen: Date.now()
          };
          threats.push(threat);
        }
      }
    });

    // Scan for enemy AI tanks
    this.aiTanks.forEach((otherAI) => {
      if (otherAI.team !== aiTank.team && otherAI.health > 0 && otherAI.id !== aiTank.id) {
        const distance = this.getDistance(aiTank, otherAI);
        if (distance <= scanRange) {
          const threat = {
            type: 'ai',
            target: otherAI,
            distance,
            angle: this.getAngle(aiTank, otherAI),
            threatLevel: this.calculateThreatLevel(aiTank, otherAI),
            lastSeen: Date.now()
          };
          threats.push(threat);
        }
      }
    });

    // Sort by threat level
    threats.sort((a, b) => b.threatLevel - a.threatLevel);

    return threats;
  }

  scanForAllies(aiTank, gameState) {
    const allies = [];
    const scanRange = 400;

    // Scan for allied AI tanks
    this.aiTanks.forEach((otherAI) => {
      if (otherAI.team === aiTank.team && otherAI.id !== aiTank.id && otherAI.health > 0) {
        const distance = this.getDistance(aiTank, otherAI);
        if (distance <= scanRange) {
          allies.push({
            type: 'ai',
            target: otherAI,
            distance,
            angle: this.getAngle(aiTank, otherAI),
            needsHelp: otherAI.health < 50 || otherAI.inCombat
          });
        }
      }
    });

    // Scan for allied players
    Object.values(gameState.players || {}).forEach((player) => {
      if (player.team === aiTank.team && player.health > 0) {
        const distance = this.getDistance(aiTank, player);
        if (distance <= scanRange) {
          allies.push({
            type: 'player',
            target: player,
            distance,
            angle: this.getAngle(aiTank, player),
            needsHelp: player.health < 50
          });
        }
      }
    });

    return allies;
  }

  scanForPowerUps(aiTank, gameState) {
    const powerUps = [];
    const scanRange = 300;

    (gameState.powerUps || []).forEach((powerUp) => {
      const distance = this.getDistance(aiTank, powerUp);
      if (distance <= scanRange) {
        powerUps.push({
          target: powerUp,
          distance,
          angle: this.getAngle(aiTank, powerUp),
          priority: this.getPowerUpPriority(aiTank, powerUp)
        });
      }
    });

    powerUps.sort((a, b) => b.priority - a.priority);
    return powerUps;
  }

  calculateThreatLevel(aiTank, enemy) {
    let threatLevel = 0;

    // Base threat from enemy health/damage potential
    threatLevel += (enemy.health || 100) / 100 * 30;

    // Distance factor (closer = more threatening)
    const distance = this.getDistance(aiTank, enemy);
    threatLevel += Math.max(0, 50 - distance / 10);

    // Weapon threat
    if (enemy.weapon) {
      threatLevel += this.getWeaponThreat(enemy.weapon);
    }

    // If enemy is targeting us
    if (enemy.target === aiTank.id) {
      threatLevel += 25;
    }

    // If we're low on health, everything is more threatening
    if (aiTank.health < 50) {
      threatLevel *= 1.5;
    }

    return threatLevel;
  }

  getWeaponThreat(weapon) {
    const weaponThreats = {
      'heavy_cannon': 40,
      'rapid_fire': 35,
      'sniper_cannon': 45,
      'basic_turret': 25,
      'dual_cannons': 50
    };

    return weaponThreats[weapon] || 25;
  }

  getPowerUpPriority(aiTank, powerUp) {
    let priority = 0;

    switch (powerUp.type) {
      case 'health':
        priority = (100 - aiTank.health) / 100 * 50;
        break;
      case 'shield':
        priority = (100 - aiTank.shield) / 100 * 40;
        break;
      case 'weapon_upgrade':
        priority = 30;
        break;
      case 'speed_boost':
        priority = aiTank.inCombat ? 35 : 20;
        break;
      case 'damage_boost':
        priority = aiTank.inCombat ? 40 : 25;
        break;
      default:
        priority = 15;
    }

    // Reduce priority based on distance
    const distance = this.getDistance(aiTank, powerUp);
    priority *= Math.max(0.2, 1 - distance / 500);

    return priority;
  }

  evaluateSituation(aiTank, threats, allies, powerUps) {
    return {
      threatLevel: threats.reduce((sum, threat) => sum + threat.threatLevel, 0),
      nearestThreat: threats[0] || null,
      alliesNearby: allies.length,
      alliesNeedingHelp: allies.filter((ally) => ally.needsHelp).length,
      bestPowerUp: powerUps[0] || null,
      healthPercentage: aiTank.health / aiTank.maxHealth,
      shieldPercentage: aiTank.shield / aiTank.maxShield,
      inCombat: aiTank.inCombat,
      ammoLow: false // TODO: implement ammo system
    };
  }

  makeDecision(aiTank, situation) {
    const personality = aiTank.behavior;
    let decision = { state: 'idle', target: null, path: [] };

    // Emergency retreat if health is critical
    if (situation.healthPercentage < personality.retreatThreshold) {
      return this.makeRetreatDecision(aiTank, situation);
    }

    // Support allies if we're a support type
    if (aiTank.personality === 'support' && situation.alliesNeedingHelp > 0) {
      return this.makeSupportDecision(aiTank, situation);
    }

    // Engage threats based on personality
    if (situation.nearestThreat) {
      const shouldEngage = this.shouldEngageThreat(aiTank, situation.nearestThreat);
      if (shouldEngage) {
        return this.makeEngageDecision(aiTank, situation.nearestThreat);
      }
    }

    // Collect power-ups if no immediate threats
    if (situation.bestPowerUp && situation.threatLevel < 30) {
      return this.makePowerUpDecision(aiTank, situation.bestPowerUp);
    }

    // Default patrol behavior
    return this.makePatrolDecision(aiTank, situation);
  }

  shouldEngageThreat(aiTank, threat) {
    const personality = aiTank.behavior;

    // Always engage if very aggressive
    if (personality.aggression > 0.8) return true;

    // Don't engage if very cautious and outnumbered
    if (personality.caution > 0.8 && threat.threatLevel > 60) return false;

    // Engage if we have advantage
    if (aiTank.health > threat.target.health) return true;

    // Engage if we have allies nearby
    if (personality.teamwork > 0.6 && this.hasAlliesNearby(aiTank)) return true;

    // Default based on aggression vs caution
    return personality.aggression > personality.caution;
  }

  makeEngageDecision(aiTank, threat) {
    const tactics = this.chooseTactic(aiTank, threat);

    return {
      state: 'engage',
      target: threat.target,
      path: this.planEngagementPath(aiTank, threat, tactics),
      tactic: tactics
    };
  }

  chooseTactic(aiTank, threat) {
    const availableTactics = aiTank.tactics;
    const distance = threat.distance;
    const personality = aiTank.behavior;

    // Choose tactic based on situation
    if (distance < 200 && personality.aggression > 0.7) {
      return 'charge';
    } else if (distance > 300 && availableTactics.includes('snipe')) {
      return 'snipe';
    } else if (personality.caution > 0.6) {
      return 'cover_fire';
    } else {
      return availableTactics[Math.floor(Math.random() * availableTactics.length)];
    }
  }

  planEngagementPath(aiTank, threat, tactic) {
    const target = threat.target;
    const path = [];

    switch (tactic) {
      case 'charge':
        // Direct path to target
        path.push({ x: target.x, y: target.y });
        break;

      case 'flank':
        // Path around target
        const flankAngle = threat.angle + Math.PI / 2;
        const flankDistance = 200;
        path.push({
          x: target.x + Math.cos(flankAngle) * flankDistance,
          y: target.y + Math.sin(flankAngle) * flankDistance
        });
        path.push({ x: target.x, y: target.y });
        break;

      case 'cover_fire':
        // Find cover position
        const coverPos = this.findCoverPosition(aiTank, target);
        if (coverPos) path.push(coverPos);
        break;

      default:
        // Default approach
        path.push({ x: target.x, y: target.y });
    }

    return path;
  }

  makeRetreatDecision(aiTank, situation) {
    const retreatPosition = this.findRetreatPosition(aiTank, situation);

    return {
      state: 'retreat',
      target: null,
      path: retreatPosition ? [retreatPosition] : []
    };
  }

  makeSupportDecision(aiTank, situation) {
    // Find ally that needs help most
    const allyNeedingHelp = situation.allies.
    filter((ally) => ally.needsHelp).
    sort((a, b) => a.distance - b.distance)[0];

    if (allyNeedingHelp) {
      return {
        state: 'support',
        target: allyNeedingHelp.target,
        path: [{ x: allyNeedingHelp.target.x, y: allyNeedingHelp.target.y }]
      };
    }

    return { state: 'patrol', target: null, path: [] };
  }

  makePowerUpDecision(aiTank, powerUp) {
    return {
      state: 'collect',
      target: powerUp.target,
      path: [{ x: powerUp.target.x, y: powerUp.target.y }]
    };
  }

  makePatrolDecision(aiTank, situation) {
    // Generate random patrol point
    const patrolRadius = 300;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * patrolRadius;

    const patrolPoint = {
      x: aiTank.x + Math.cos(angle) * distance,
      y: aiTank.y + Math.sin(angle) * distance
    };

    return {
      state: 'patrol',
      target: null,
      path: [patrolPoint]
    };
  }

  executeAction(aiTank, deltaTime, gameState) {
    switch (aiTank.state) {
      case 'engage':
        this.executeEngage(aiTank, deltaTime, gameState);
        break;
      case 'retreat':
        this.executeRetreat(aiTank, deltaTime, gameState);
        break;
      case 'support':
        this.executeSupport(aiTank, deltaTime, gameState);
        break;
      case 'collect':
        this.executeCollect(aiTank, deltaTime, gameState);
        break;
      case 'patrol':
        this.executePatrol(aiTank, deltaTime, gameState);
        break;
      default:
        this.executeIdle(aiTank, deltaTime, gameState);
    }
  }

  executeEngage(aiTank, deltaTime, gameState) {
    if (!aiTank.target || aiTank.target.health <= 0) {
      aiTank.state = 'idle';
      return;
    }

    const target = aiTank.target;
    const distance = this.getDistance(aiTank, target);
    const angle = this.getAngle(aiTank, target);

    // Move towards optimal range
    const optimalRange = aiTank.behavior.preferredRange;

    if (distance > optimalRange + 50) {
      // Move closer
      this.moveTowards(aiTank, target, deltaTime);
    } else if (distance < optimalRange - 50) {
      // Move away
      this.moveAway(aiTank, target, deltaTime);
    } else {
      // Strafe around target
      this.strafeAroundTarget(aiTank, target, deltaTime);
    }

    // Aim and shoot
    this.aimAtTarget(aiTank, target, deltaTime);
    this.attemptShoot(aiTank, target, gameState);
  }

  executeRetreat(aiTank, deltaTime, gameState) {
    if (aiTank.path.length > 0) {
      const retreatPoint = aiTank.path[0];
      this.moveTowards(aiTank, retreatPoint, deltaTime);

      // Check if reached retreat point
      if (this.getDistance(aiTank, retreatPoint) < 50) {
        aiTank.path.shift();
        if (aiTank.path.length === 0) {
          aiTank.state = 'idle';
        }
      }
    }
  }

  executeSupport(aiTank, deltaTime, gameState) {
    if (!aiTank.target) {
      aiTank.state = 'idle';
      return;
    }

    const ally = aiTank.target;
    const distance = this.getDistance(aiTank, ally);
    const supportRange = 150;

    if (distance > supportRange) {
      this.moveTowards(aiTank, ally, deltaTime);
    } else {
      // Provide support (healing, cover fire, etc.)
      this.provideSupportToAlly(aiTank, ally, gameState);
    }
  }

  executeCollect(aiTank, deltaTime, gameState) {
    if (!aiTank.target) {
      aiTank.state = 'idle';
      return;
    }

    this.moveTowards(aiTank, aiTank.target, deltaTime);

    // Check if collected
    if (this.getDistance(aiTank, aiTank.target) < 30) {
      aiTank.state = 'idle';
    }
  }

  executePatrol(aiTank, deltaTime, gameState) {
    if (aiTank.path.length > 0) {
      const waypoint = aiTank.path[aiTank.currentWaypoint];
      this.moveTowards(aiTank, waypoint, deltaTime);

      if (this.getDistance(aiTank, waypoint) < 50) {
        aiTank.currentWaypoint++;
        if (aiTank.currentWaypoint >= aiTank.path.length) {
          aiTank.state = 'idle';
        }
      }
    } else {
      aiTank.state = 'idle';
    }
  }

  executeIdle(aiTank, deltaTime, gameState) {
    // Slow rotation to look around
    aiTank.turretAngle += 0.01 * deltaTime * 60;

    // Occasionally move to new position
    if (Math.random() < 0.001) {
      aiTank.state = 'patrol';
    }
  }

  // Movement functions
  moveTowards(aiTank, target, deltaTime) {
    const angle = this.getAngle(aiTank, target);
    const angleDiff = this.normalizeAngle(angle - aiTank.angle);

    // Turn towards target
    if (Math.abs(angleDiff) > 0.1) {
      const turnDirection = angleDiff > 0 ? 1 : -1;
      aiTank.angle += turnDirection * aiTank.turnSpeed * deltaTime * 60;
    }

    // Move forward if facing roughly the right direction
    if (Math.abs(angleDiff) < Math.PI / 4) {
      aiTank.vx = Math.cos(aiTank.angle) * aiTank.speed;
      aiTank.vy = Math.sin(aiTank.angle) * aiTank.speed;
    }

    // Update position
    aiTank.x += aiTank.vx * deltaTime * 60;
    aiTank.y += aiTank.vy * deltaTime * 60;

    // Apply friction
    aiTank.vx *= 0.9;
    aiTank.vy *= 0.9;
  }

  moveAway(aiTank, target, deltaTime) {
    const angle = this.getAngle(aiTank, target) + Math.PI; // Opposite direction
    const angleDiff = this.normalizeAngle(angle - aiTank.angle);

    // Turn away from target
    if (Math.abs(angleDiff) > 0.1) {
      const turnDirection = angleDiff > 0 ? 1 : -1;
      aiTank.angle += turnDirection * aiTank.turnSpeed * deltaTime * 60;
    }

    // Move forward
    if (Math.abs(angleDiff) < Math.PI / 4) {
      aiTank.vx = Math.cos(aiTank.angle) * aiTank.speed;
      aiTank.vy = Math.sin(aiTank.angle) * aiTank.speed;
    }

    // Update position
    aiTank.x += aiTank.vx * deltaTime * 60;
    aiTank.y += aiTank.vy * deltaTime * 60;

    // Apply friction
    aiTank.vx *= 0.9;
    aiTank.vy *= 0.9;
  }

  strafeAroundTarget(aiTank, target, deltaTime) {
    const angle = this.getAngle(aiTank, target);
    const strafeAngle = angle + Math.PI / 2; // Perpendicular to target

    aiTank.vx = Math.cos(strafeAngle) * aiTank.speed * 0.7;
    aiTank.vy = Math.sin(strafeAngle) * aiTank.speed * 0.7;

    // Update position
    aiTank.x += aiTank.vx * deltaTime * 60;
    aiTank.y += aiTank.vy * deltaTime * 60;

    // Apply friction
    aiTank.vx *= 0.9;
    aiTank.vy *= 0.9;
  }

  aimAtTarget(aiTank, target, deltaTime) {
    // Predict target position
    const predictedPos = this.predictTargetPosition(aiTank, target);
    const aimAngle = this.getAngle(aiTank, predictedPos);

    // Add accuracy variation based on difficulty
    const accuracyError = (1 - aiTank.behavior.accuracy * aiTank.accuracyMod) * 0.5;
    const finalAimAngle = aimAngle + (Math.random() - 0.5) * accuracyError;

    // Smooth turret rotation
    const angleDiff = this.normalizeAngle(finalAimAngle - aiTank.turretAngle);
    aiTank.turretAngle += angleDiff * 0.1;
  }

  predictTargetPosition(aiTank, target) {
    // Simple prediction based on target velocity
    const bulletSpeed = 800; // Approximate bullet speed
    const distance = this.getDistance(aiTank, target);
    const timeToHit = distance / bulletSpeed;

    return {
      x: target.x + (target.vx || 0) * timeToHit,
      y: target.y + (target.vy || 0) * timeToHit
    };
  }

  attemptShoot(aiTank, target, gameState) {
    const now = Date.now();
    const fireRate = 1000; // 1 shot per second

    if (now - aiTank.lastShot < fireRate) return;

    // Check if target is in line of sight
    if (!this.hasLineOfSight(aiTank, target, gameState)) return;

    // Check if aimed well enough
    const targetAngle = this.getAngle(aiTank, target);
    const aimError = Math.abs(this.normalizeAngle(aiTank.turretAngle - targetAngle));

    if (aimError < 0.2) {// Within aiming tolerance
      this.fireWeapon(aiTank, gameState);
      aiTank.lastShot = now;
    }
  }

  fireWeapon(aiTank, gameState) {
    // Create bullet
    const bullet = {
      id: `bullet_${aiTank.id}_${Date.now()}`,
      x: aiTank.x + Math.cos(aiTank.turretAngle) * 50,
      y: aiTank.y + Math.sin(aiTank.turretAngle) * 50,
      vx: Math.cos(aiTank.turretAngle) * 800,
      vy: Math.sin(aiTank.turretAngle) * 800,
      owner: aiTank.id,
      team: aiTank.team,
      damage: 25,
      life: 3000 // 3 seconds
    };

    // Add to game state
    if (!gameState.bullets) gameState.bullets = [];
    gameState.bullets.push(bullet);

    // Play sound effect
    if (window.EnhancedAudio) {
      window.EnhancedAudio.playSound('shoot_basic', {
        position: { x: aiTank.x, y: aiTank.y },
        volume: 0.7
      });
    }

    // Create muzzle flash effect
    if (window.AdvancedGraphics) {
      window.AdvancedGraphics.createParticle({
        x: bullet.x,
        y: bullet.y,
        vx: Math.cos(aiTank.turretAngle) * 100,
        vy: Math.sin(aiTank.turretAngle) * 100,
        life: 0.1,
        maxLife: 0.1,
        size: 10,
        color: '#ffff00',
        type: 'spark'
      });
    }
  }

  // Utility functions
  getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getAngle(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  hasLineOfSight(from, to, gameState) {
    // Simple line of sight check (can be improved with actual collision detection)
    return true; // TODO: Implement proper line of sight with obstacles
  }

  hasAlliesNearby(aiTank) {
    let alliesNearby = 0;
    const checkRange = 200;

    this.aiTanks.forEach((otherAI) => {
      if (otherAI.team === aiTank.team && otherAI.id !== aiTank.id) {
        if (this.getDistance(aiTank, otherAI) <= checkRange) {
          alliesNearby++;
        }
      }
    });

    return alliesNearby > 0;
  }

  findCoverPosition(aiTank, threat) {
    // Find position behind cover (simplified)
    const angle = this.getAngle(threat, aiTank);
    const coverDistance = 200;

    return {
      x: aiTank.x + Math.cos(angle) * coverDistance,
      y: aiTank.y + Math.sin(angle) * coverDistance
    };
  }

  findRetreatPosition(aiTank, situation) {
    // Find safe position away from threats
    let retreatAngle = 0;
    let threatCount = 0;

    // Calculate average threat direction
    situation.threats?.forEach((threat) => {
      const angle = this.getAngle(threat.target, aiTank);
      retreatAngle += angle;
      threatCount++;
    });

    if (threatCount > 0) {
      retreatAngle /= threatCount;
    } else {
      retreatAngle = Math.random() * Math.PI * 2;
    }

    const retreatDistance = 400;
    return {
      x: aiTank.x + Math.cos(retreatAngle) * retreatDistance,
      y: aiTank.y + Math.sin(retreatAngle) * retreatDistance
    };
  }

  provideSupportToAlly(aiTank, ally, gameState) {
    // Different support actions based on AI personality
    if (aiTank.personality === 'support') {
      // Heal ally if possible
      if (ally.health < ally.maxHealth) {
        this.healAlly(aiTank, ally);
      }

      // Provide cover fire
      this.provideCoverFire(aiTank, ally, gameState);
    }
  }

  healAlly(aiTank, ally) {
    // TODO: Implement healing mechanics
    console.log(`${aiTank.id} healing ${ally.id}`);
  }

  provideCoverFire(aiTank, ally, gameState) {
    // Look for threats near ally
    const threats = this.scanForThreats(ally, gameState);
    if (threats.length > 0) {
      aiTank.target = threats[0].target;
      aiTank.state = 'engage';
    }
  }

  updateCombatState(aiTank, gameState) {
    const now = Date.now();

    // Check if in combat
    const wasInCombat = aiTank.inCombat;
    aiTank.inCombat = this.isInCombat(aiTank, gameState);

    if (aiTank.inCombat && !wasInCombat) {
      aiTank.combatStartTime = now;
    }

    // Update berserker rage
    if (aiTank.personality === 'berserker' && aiTank.health < 50) {
      aiTank.behavior.aggression = Math.min(1.0, aiTank.behavior.aggression + 0.1);
      aiTank.behavior.accuracy *= 0.9; // Less accurate when raging
      aiTank.speed *= 1.1; // Faster when raging
    }
  }

  isInCombat(aiTank, gameState) {
    const combatRange = 400;
    const now = Date.now();

    // Check if recently took damage
    if (now - aiTank.lastDamageTime < 5000) return true;

    // Check if enemies nearby
    const threats = this.scanForThreats(aiTank, gameState);
    return threats.length > 0 && threats[0].distance < combatRange;
  }

  updateMemory(aiTank, gameState) {
    // Store information about seen enemies
    const threats = this.scanForThreats(aiTank, gameState);

    threats.forEach((threat) => {
      const key = threat.target.id || `${threat.target.x}_${threat.target.y}`;
      aiTank.memory.set(key, {
        position: { x: threat.target.x, y: threat.target.y },
        lastSeen: Date.now(),
        threatLevel: threat.threatLevel,
        health: threat.target.health
      });
    });

    // Clean old memories
    const memoryTimeout = 30000; // 30 seconds
    const now = Date.now();

    for (const [key, memory] of aiTank.memory.entries()) {
      if (now - memory.lastSeen > memoryTimeout) {
        aiTank.memory.delete(key);
      }
    }
  }

  // Public API
  addAITank(x, y, personality = 'aggressive', team = 'ai') {
    return this.createAITank(x, y, personality, team);
  }

  removeAITank(id) {
    return this.aiTanks.delete(id);
  }

  getAITank(id) {
    return this.aiTanks.get(id);
  }

  getAllAITanks() {
    return Array.from(this.aiTanks.values());
  }

  setDifficulty(level) {
    this.settings.difficultyLevel = level;

    // Update existing AI tanks
    this.aiTanks.forEach((aiTank) => {
      Object.assign(aiTank, this.getDifficultyModifiers());
    });
  }

  // Damage handling
  damageAITank(id, damage, source) {
    const aiTank = this.aiTanks.get(id);
    if (!aiTank) return false;

    aiTank.health = Math.max(0, aiTank.health - damage);
    aiTank.lastDamageTime = Date.now();

    // React to damage
    if (source && aiTank.health > 0) {
      aiTank.target = source;
      aiTank.state = 'engage';
    }

    // Remove if dead
    if (aiTank.health <= 0) {
      this.aiTanks.delete(id);

      // Death effects
      if (window.AdvancedGraphics) {
        window.AdvancedGraphics.createExplosion(aiTank.x, aiTank.y, 1.5);
      }

      if (window.EnhancedAudio) {
        window.EnhancedAudio.playSound('explosion_large', {
          position: { x: aiTank.x, y: aiTank.y }
        });
      }
    }

    return true;
  }

  // Cleanup
  cleanup() {
    this.aiTanks.clear();
  }
}

// Simple pathfinding system
class PathfindingSystem {
  constructor() {
    this.grid = null;
    this.gridSize = 50;
  }

  findPath(start, end, obstacles = []) {
    // Simple A* pathfinding implementation
    // For now, return direct path
    return [end];
  }
}

// Simple behavior tree system
class BehaviorTree {
  constructor() {
    this.nodes = new Map();
  }

  createNode(type, config) {
    // Behavior tree node creation
    return { type, config };
  }

  execute(node, context) {
    // Execute behavior tree node
    return 'success';
  }
}

// Global instance
window.AIOpponents = new AIOpponents();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIOpponents;
}