/**
 * Advanced AI System for TheFortz
 * Intelligent bot opponents with multiple difficulty levels and behaviors
 */

class AIBot {
  constructor(config) {
    this.id = config.id || `bot_${Date.now()}_${Math.random()}`;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.angle = 0;
    this.tankDirection = 0;
    this.health = 100;
    this.shield = 100;
    this.difficulty = config.difficulty || 'medium'; // easy, medium, hard, expert
    this.name = this.generateName();
    this.score = 0;

    // AI state
    this.target = null;
    this.state = 'patrol'; // patrol, chase, flee, attack
    this.stateTimer = 0;
    this.lastShot = 0;
    this.pathfindingWaypoints = [];
    this.currentWaypoint = 0;
    this.stuckTimer = 0;
    this.lastPosition = { x: this.x, y: this.y };

    // Difficulty-based parameters
    this.setDifficultyParameters();

    // Personality traits
    this.aggression = 0.5 + Math.random() * 0.5; // How aggressive
    this.caution = 0.3 + Math.random() * 0.4; // How cautious
    this.accuracy = this.baseAccuracy;
  }

  generateName() {
    const prefixes = ['Tank', 'Bot', 'AI', 'Mech', 'Cyber', 'Robo', 'Auto'];
    const suffixes = ['Destroyer', 'Hunter', 'Warrior', 'Guardian', 'Striker', 'Phantom', 'Reaper'];
    const numbers = Math.floor(Math.random() * 999);
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${suffixes[Math.floor(Math.random() * suffixes.length)]}_${numbers}`;
  }

  setDifficultyParameters() {
    switch (this.difficulty) {
      case 'easy':
        this.reactionTime = 800;
        this.baseAccuracy = 0.4;
        this.shootCooldown = 500;
        this.visionRange = 400;
        this.predictionSkill = 0.2;
        break;
      case 'medium':
        this.reactionTime = 500;
        this.baseAccuracy = 0.6;
        this.shootCooldown = 400;
        this.visionRange = 600;
        this.predictionSkill = 0.5;
        break;
      case 'hard':
        this.reactionTime = 300;
        this.baseAccuracy = 0.8;
        this.shootCooldown = 300;
        this.visionRange = 800;
        this.predictionSkill = 0.7;
        break;
      case 'expert':
        this.reactionTime = 150;
        this.baseAccuracy = 0.95;
        this.shootCooldown = 250;
        this.visionRange = 1000;
        this.predictionSkill = 0.9;
        break;
    }
  }

  update(deltaTime, gameState) {
    this.stateTimer += deltaTime;

    // Find target
    this.findTarget(gameState.players);

    // Update state machine
    this.updateState(gameState);

    // Execute behavior based on state
    switch (this.state) {
      case 'patrol':
        this.patrol(gameState);
        break;
      case 'chase':
        this.chase(gameState);
        break;
      case 'flee':
        this.flee(gameState);
        break;
      case 'attack':
        this.attack(gameState);
        break;
    }

    // Check if stuck
    this.checkIfStuck(deltaTime);

    // Update last position
    this.lastPosition = { x: this.x, y: this.y };
  }

  findTarget(players) {
    let closestDistance = Infinity;
    let closestPlayer = null;

    Object.values(players).forEach((player) => {
      if (player.id === this.id) return;
      if (player.health <= 0) return;

      const distance = this.distanceTo(player.x, player.y);

      if (distance < this.visionRange && distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = player;
      }
    });

    this.target = closestPlayer;
  }

  updateState(gameState) {
    const healthPercent = this.health / 100;

    if (!this.target) {
      this.state = 'patrol';
      return;
    }

    const distanceToTarget = this.distanceTo(this.target.x, this.target.y);

    // Flee if low health and cautious
    if (healthPercent < 0.3 && this.caution > 0.5) {
      this.state = 'flee';
      return;
    }

    // Attack if in range and aggressive
    if (distanceToTarget < 300 && this.aggression > 0.6) {
      this.state = 'attack';
      return;
    }

    // Chase if target is visible but not in attack range
    if (distanceToTarget < this.visionRange) {
      this.state = 'chase';
      return;
    }

    this.state = 'patrol';
  }

  patrol(gameState) {
    // Random movement
    if (this.stateTimer > 2000 || this.pathfindingWaypoints.length === 0) {
      this.stateTimer = 0;
      this.generatePatrolPath(gameState);
    }

    this.followPath(gameState);
  }

  chase(gameState) {
    if (!this.target) return;

    // Move towards target
    const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    this.moveInDirection(angle, gameState);

    // Aim at target
    this.aimAtTarget();

    // Shoot if in range
    const distance = this.distanceTo(this.target.x, this.target.y);
    if (distance < 500 && this.canShoot()) {
      this.shoot(gameState);
    }
  }

  flee(gameState) {
    if (!this.target) return;

    // Move away from target
    const angle = Math.atan2(this.y - this.target.y, this.x - this.target.x);
    this.moveInDirection(angle, gameState);

    // Look for power-ups
    this.seekPowerUp(gameState);
  }

  attack(gameState) {
    if (!this.target) return;

    // Strafe around target
    const angleToTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    const strafeAngle = angleToTarget + Math.PI / 2;

    // Mix of moving towards and strafing
    const moveAngle = angleToTarget * 0.3 + strafeAngle * 0.7;
    this.moveInDirection(moveAngle, gameState);

    // Aim with prediction
    this.aimAtTargetWithPrediction();

    // Shoot
    if (this.canShoot()) {
      this.shoot(gameState);
    }
  }

  moveInDirection(angle, gameState) {
    const speed = 3;
    const newX = this.x + Math.cos(angle) * speed;
    const newY = this.y + Math.sin(angle) * speed;

    // Check boundaries
    if (newX > 50 && newX < gameState.gameWidth - 50 &&
    newY > 50 && newY < gameState.gameHeight - 50) {

      // Simple wall avoidance
      if (!this.checkWallCollision(newX, newY, gameState)) {
        this.x = newX;
        this.y = newY;
        this.tankDirection = angle;
      }
    }
  }

  aimAtTarget() {
    if (!this.target) return;

    const angleToTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);

    // Add inaccuracy based on difficulty
    const inaccuracy = (1 - this.accuracy) * (Math.random() - 0.5) * 0.5;
    this.angle = angleToTarget + inaccuracy;
  }

  aimAtTargetWithPrediction() {
    if (!this.target) return;

    // Predict target position
    const bulletSpeed = 10;
    const distance = this.distanceTo(this.target.x, this.target.y);
    const timeToHit = distance / bulletSpeed;

    const predictedX = this.target.x + (this.target.vx || 0) * timeToHit * this.predictionSkill;
    const predictedY = this.target.y + (this.target.vy || 0) * timeToHit * this.predictionSkill;

    const angleToTarget = Math.atan2(predictedY - this.y, predictedX - this.x);

    // Add inaccuracy
    const inaccuracy = (1 - this.accuracy) * (Math.random() - 0.5) * 0.3;
    this.angle = angleToTarget + inaccuracy;
  }

  canShoot() {
    const now = Date.now();
    return now - this.lastShot > this.shootCooldown;
  }

  shoot(gameState) {
    this.lastShot = Date.now();

    // Return shoot command
    return {
      type: 'shoot',
      botId: this.id,
      x: this.x,
      y: this.y,
      angle: this.angle
    };
  }

  generatePatrolPath(gameState) {
    this.pathfindingWaypoints = [];
    const waypointCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < waypointCount; i++) {
      this.pathfindingWaypoints.push({
        x: 100 + Math.random() * (gameState.gameWidth - 200),
        y: 100 + Math.random() * (gameState.gameHeight - 200)
      });
    }

    this.currentWaypoint = 0;
  }

  followPath(gameState) {
    if (this.pathfindingWaypoints.length === 0) return;

    const waypoint = this.pathfindingWaypoints[this.currentWaypoint];
    const distance = this.distanceTo(waypoint.x, waypoint.y);

    if (distance < 50) {
      this.currentWaypoint = (this.currentWaypoint + 1) % this.pathfindingWaypoints.length;
    } else {
      const angle = Math.atan2(waypoint.y - this.y, waypoint.x - this.x);
      this.moveInDirection(angle, gameState);
    }
  }

  seekPowerUp(gameState) {
    if (!gameState.powerUps || gameState.powerUps.length === 0) return;

    let closestPowerUp = null;
    let closestDistance = Infinity;

    gameState.powerUps.forEach((powerUp) => {
      const distance = this.distanceTo(powerUp.x, powerUp.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPowerUp = powerUp;
      }
    });

    if (closestPowerUp && closestDistance < 400) {
      const angle = Math.atan2(closestPowerUp.y - this.y, closestPowerUp.x - this.x);
      this.moveInDirection(angle, gameState);
    }
  }

  checkWallCollision(x, y, gameState) {
    if (!gameState.walls) return false;

    return gameState.walls.some((wall) => {
      const dx = x - wall.x;
      const dy = y - wall.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (wall.radius || 30) + 45; // 45 is tank radius
    });
  }

  checkIfStuck(deltaTime) {
    const moved = this.distanceTo(this.lastPosition.x, this.lastPosition.y);

    if (moved < 1) {
      this.stuckTimer += deltaTime;

      if (this.stuckTimer > 1000) {
        // Unstuck by moving in random direction
        const randomAngle = Math.random() * Math.PI * 2;
        this.x += Math.cos(randomAngle) * 50;
        this.y += Math.sin(randomAngle) * 50;
        this.stuckTimer = 0;
      }
    } else {
      this.stuckTimer = 0;
    }
  }

  distanceTo(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  takeDamage(damage) {
    if (this.shield > 0) {
      this.shield = Math.max(0, this.shield - damage);
    } else {
      this.health = Math.max(0, this.health - damage);
    }

    return this.health <= 0;
  }
}

const AdvancedAI = {
  bots: [],
  maxBots: 10,

  // Add a bot to the game
  addBot(gameState, difficulty = 'medium') {
    if (this.bots.length >= this.maxBots) return null;

    const bot = new AIBot({
      x: 100 + Math.random() * (gameState.gameWidth - 200),
      y: 100 + Math.random() * (gameState.gameHeight - 200),
      difficulty: difficulty
    });

    this.bots.push(bot);
    return bot;
  },

  // Remove a bot
  removeBot(botId) {
    this.bots = this.bots.filter((bot) => bot.id !== botId);
  },

  // Update all bots
  update(deltaTime, gameState) {
    const actions = [];

    this.bots.forEach((bot) => {
      bot.update(deltaTime, gameState);

      // Collect bot actions
      const action = bot.shoot(gameState);
      if (action) {
        actions.push(action);
      }
    });

    return actions;
  },

  // Get bot by ID
  getBot(botId) {
    return this.bots.find((bot) => bot.id === botId);
  },

  // Clear all bots
  clear() {
    this.bots = [];
  },

  // Add multiple bots with mixed difficulties
  addMixedBots(gameState, count) {
    const difficulties = ['easy', 'medium', 'hard', 'expert'];

    for (let i = 0; i < count; i++) {
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      this.addBot(gameState, difficulty);
    }
  },

  // Get all bot data for rendering
  getBotData() {
    return this.bots.map((bot) => ({
      id: bot.id,
      x: bot.x,
      y: bot.y,
      angle: bot.angle,
      tankDirection: bot.tankDirection,
      health: bot.health,
      shield: bot.shield,
      name: bot.name,
      score: bot.score,
      isBot: true
    }));
  }
};

// Export for use in game
if (typeof window !== 'undefined') {
  window.AdvancedAI = AdvancedAI;
  window.AIBot = AIBot;
}