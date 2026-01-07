// Tank Battle Script Templates for Map Creator
const SCRIPT_TEMPLATES = {
    tankWelcome: {
        name: "🚛 Tank Battle Welcome",
        description: "Welcome message for tank battles",
        code: `-- 🚛 Tank Battle Welcome Script
function onBattleStart()
    showMessage("🚛 Welcome to Tank Battle Arena!")
    showMessage("💥 Destroy enemy tanks to win!")
    showMessage("⚡ Collect power-ups for advantages!")
    
    -- Spawn initial power-ups
    spawnTankPowerUp("armor", 400, 200)
    spawnTankPowerUp("damage", 600, 400)
end

function onTankSpawn(tank)
    showMessage("Tank " .. tank.name .. " deployed to battlefield!")
    giveTankWeapon(tank.id, "cannon")
end`
    },
    
    tankPowerUpSpawner: {
        name: "🔋 Tank Power-Up Spawner",
        description: "Spawns tank power-ups every 30 seconds",
        code: `-- 🔋 Tank Power-Up Spawner Script
function onBattleStart()
    showMessage("⚡ Power-up spawning system activated!")
    -- Start spawning power-ups after 15 seconds
    setTimer(spawnRandomTankPowerUp, 15000)
end

function spawnRandomTankPowerUp()
    local pos = randomPosition()
    local tankPowerUps = {"armor", "damage", "speed", "firerate", "lootbox"}
    local randomType = tankPowerUps[math.random(1, 5)]
    
    spawnTankPowerUp(randomType, pos.x, pos.y)
    showMessage("🔋 Tank power-up spawned: " .. randomType)
    playTankSound("powerup_spawn.wav")
    
    -- Schedule next power-up in 30 seconds
    setTimer(spawnRandomTankPowerUp, 30000)
end

function onTankDestroyed(tank, killer)
    -- Spawn power-up where tank was destroyed
    spawnTankPowerUp("lootbox", tank.x, tank.y)
    showMessage("🎁 Lootbox dropped!")
end`
    },
    
    tankKillStreak: {
        name: "🏆 Tank Kill Streak System",
        description: "Rewards tank commanders for kill streaks",
        code: `-- 🏆 Tank Kill Streak System
local tankKillStreaks = {}

function onTankSpawn(tank)
    tankKillStreaks[tank.id] = 0
    showMessage("🚛 " .. tank.name .. " tank deployed!")
end

function onTankDestroyed(tank, killer)
    -- Reset victim's streak
    tankKillStreaks[tank.id] = 0
    spawnExplosion(tank.x, tank.y)
    createCrater(tank.x, tank.y)
    
    if killer then
        tankKillStreaks[killer.id] = tankKillStreaks[killer.id] + 1
        local streak = tankKillStreaks[killer.id]
        
        if streak == 2 then
            showMessage("🔥 " .. killer.name .. " tank is on a roll!")
            upgradeTankArmor(killer.id, 1)
        elseif streak == 3 then
            showMessage("💥 " .. killer.name .. " tank is on a killing spree!")
            giveTankWeapon(killer.id, "heavy_cannon")
            spawnTankPowerUp("damage", killer.x, killer.y)
        elseif streak == 5 then
            showMessage("⚡ " .. killer.name .. " tank is DOMINATING!")
            setTankSpeed(killer.id, 150)
            upgradeTankArmor(killer.id, 2)
        elseif streak == 7 then
            showMessage("🏆 " .. killer.name .. " tank is UNSTOPPABLE!")
            activateTankTurret(killer.x, killer.y)
            spawnExplosion(killer.x + 50, killer.y + 50)
        end
        
        rewardKiller(killer.id, "kill_bonus")
    end
end`
    },
    
    tankKingOfHill: {
        name: "👑 Tank King of the Hill",
        description: "Tank control point battle mode",
        code: `-- 👑 Tank King of the Hill Battle Mode
local hillTimer = 0
local currentKingTank = nil
local requiredTime = 45000 -- 45 seconds to win
local controlZone = "control_point"

function onBattleStart()
    showMessage("👑 TANK KING OF THE HILL MODE!")
    showMessage("🎯 Control the center zone for 45 seconds!")
    showMessage("🚛 Only one tank can control at a time!")
    
    -- Create defensive barriers around the hill
    createTankBarrier(350, 250, 100, 20)
    createTankBarrier(450, 250, 100, 20)
    createTankBarrier(400, 200, 20, 100)
    createTankBarrier(400, 350, 20, 100)
    
    setTimer(checkTankHillControl, 1000) -- Check every second
end

function checkTankHillControl()
    local tanksInHill = getTanksInArea(controlZone)
    
    if #tanksInHill == 1 then
        local tank = tanksInHill[1]
        
        if currentKingTank == tank.id then
            hillTimer = hillTimer + 1000
            
            -- Reward controlling tank
            if hillTimer % 5000 == 0 then -- Every 5 seconds
                upgradeTankArmor(tank.id, 1)
                showMessage("🛡️ " .. tank.name .. " tank armor upgraded!")
            end
            
            if hillTimer >= requiredTime then
                showMessage("👑 " .. tank.name .. " WINS by controlling the hill!")
                spawnExplosion(tank.x, tank.y)
                endBattle("victory")
                return
            else
                local remaining = (requiredTime - hillTimer) / 1000
                showMessage("👑 " .. tank.name .. " controlling: " .. remaining .. "s left")
            end
        else
            currentKingTank = tank.id
            hillTimer = 0
            showMessage("👑 " .. tank.name .. " tank is now KING OF THE HILL!")
            playTankSound("king_crown.wav")
            setTankSpeed(tank.id, 80) -- Slow down the king
        end
    else
        if currentKingTank then
            showMessage("⚔️ Hill is contested! Timer paused!")
            -- Reset king tank speed
            setTankSpeed(currentKingTank, 100)
        end
        currentKingTank = nil
    end
    
    -- Continue checking
    setTimer(checkTankHillControl, 1000)
end

function onTankDestroyed(tank, killer)
    if tank.id == currentKingTank then
        showMessage("💥 The King tank has fallen!")
        currentKingTank = nil
        hillTimer = 0
    end
end`
    },
    
    movingPlatforms: {
        name: "Moving Platforms",
        description: "Creates moving platforms that players can ride",
        code: `-- Moving Platforms Script
function onGameStart()
    showMessage("Moving platforms activated!")
    startMovingPlatform("platform1", 100, 200, 400, 200, 5000)
    startMovingPlatform("platform2", 300, 100, 300, 400, 3000)
end

function startMovingPlatform(platformId, x1, y1, x2, y2, duration)
    movePlatform(platformId, x1, y1, x2, y2, duration, true)
end

function movePlatform(platformId, fromX, fromY, toX, toY, duration, reverse)
    moveObject(platformId, toX, toY, duration)
    
    setTimer(function()
        if reverse then
            movePlatform(platformId, toX, toY, fromX, fromY, duration, false)
        else
            movePlatform(platformId, fromX, fromY, toX, toY, duration, true)
        end
    end, duration + 500)
end`
    },
    
    explosiveBarrels: {
        name: "Explosive Barrels",
        description: "Barrels that explode when shot",
        code: `-- Explosive Barrels Script
function onObjectDestroy(objectId)
    local obj = getObject(objectId)
    
    if obj and obj.type == "barrel" then
        local pos = getObjectPosition(objectId)
        spawnExplosion(pos.x, pos.y)
        playSound("explosion.wav")
        showMessage("Barrel exploded!")
        
        -- Damage nearby players (simplified)
        local nearbyPlayers = getPlayersInArea("explosion_" .. objectId)
        for i, player in ipairs(nearbyPlayers) do
            showMessage(player.name .. " was caught in the explosion!")
        end
    end
end`
    },
    
    tankLastStanding: {
        name: "🏁 Last Tank Standing",
        description: "Survival battle mode with shrinking battlefield",
        code: `-- 🏁 Last Tank Standing Battle Mode
local aliveTanks = {}
local battleZoneRadius = 400
local shrinkTimer = 0
local shrinkInterval = 30000 -- Shrink every 30 seconds

function onBattleStart()
    showMessage("🏁 LAST TANK STANDING MODE!")
    showMessage("⚠️ Battle zone will shrink every 30 seconds!")
    showMessage("💀 Stay inside or take damage!")
    
    setTimer(shrinkBattleZone, shrinkInterval)
end

function onTankSpawn(tank)
    aliveTanks[tank.id] = true
    showMessage("🚛 " .. tank.name .. " tank enters the battlefield!")
end

function onTankDestroyed(tank, killer)
    aliveTanks[tank.id] = nil
    spawnExplosion(tank.x, tank.y)
    
    local aliveCount = 0
    local lastTank = nil
    for tankId, alive in pairs(aliveTanks) do
        if alive then
            aliveCount = aliveCount + 1
            lastTank = tankId
        end
    end
    
    showMessage("💥 " .. tank.name .. " eliminated! " .. aliveCount .. " tanks remaining!")
    
    if aliveCount == 1 then
        showMessage("🏆 " .. lastTank .. " is the LAST TANK STANDING!")
        endBattle("victory")
    elseif aliveCount == 0 then
        showMessage("💀 All tanks destroyed! Draw!")
        endBattle("draw")
    end
end

function shrinkBattleZone()
    battleZoneRadius = battleZoneRadius - 50
    shrinkTimer = shrinkTimer + 1
    
    if battleZoneRadius <= 100 then
        showMessage("⚠️ FINAL ZONE! Battle zone at minimum size!")
        return
    end
    
    showMessage("🔥 BATTLE ZONE SHRINKING! New radius: " .. battleZoneRadius)
    playTankSound("zone_shrink.wav")
    
    -- Damage tanks outside the zone
    for tankId, alive in pairs(aliveTanks) do
        if alive then
            local tank = getObject(tankId)
            if tank then
                local centerX, centerY = 400, 300 -- Map center
                local distanceFromCenter = distance(tank.x, tank.y, centerX, centerY)
                
                if distanceFromCenter > battleZoneRadius then
                    showMessage("⚠️ " .. tank.name .. " taking zone damage!")
                    -- Damage tank (simplified)
                end
            end
        end
    end
    
    -- Schedule next shrink
    setTimer(shrinkBattleZone, shrinkInterval)
end`
    },
    
    tankDefense: {
        name: "🏰 Tank Base Defense",
        description: "Defend your base from enemy tank waves",
        code: `-- 🏰 Tank Base Defense Mode
local baseHealth = 1000
local waveNumber = 0
local enemyTanks = {}
local defensePoints = {"turret1", "turret2", "turret3"}

function onBattleStart()
    showMessage("🏰 TANK BASE DEFENSE MODE!")
    showMessage("🎯 Defend your base from enemy waves!")
    showMessage("❤️ Base Health: " .. baseHealth)
    
    -- Activate defensive turrets
    for i, point in ipairs(defensePoints) do
        activateTankTurret(point)
    end
    
    setTimer(spawnEnemyWave, 10000) -- First wave in 10 seconds
end

function spawnEnemyWave()
    waveNumber = waveNumber + 1
    local enemyCount = waveNumber + 2 -- Increasing difficulty
    
    showMessage("🚨 WAVE " .. waveNumber .. " INCOMING!")
    showMessage("🚛 " .. enemyCount .. " enemy tanks approaching!")
    
    for i = 1, enemyCount do
        local spawnX = random(50, 750)
        local spawnY = random(50, 100) -- Spawn from north
        local enemyId = spawnTank("red", spawnX, spawnY)
        enemyTanks[enemyId] = true
        
        -- Give enemies random weapons
        local weapons = {"cannon", "heavy_cannon", "rapid_fire"}
        giveTankWeapon(enemyId, weapons[math.random(1, 3)])
    end
    
    playTankSound("wave_incoming.wav")
    setTimer(checkWaveComplete, 2000)
end

function checkWaveComplete()
    local enemiesAlive = 0
    for enemyId, alive in pairs(enemyTanks) do
        if alive then
            enemiesAlive = enemiesAlive + 1
        end
    end
    
    if enemiesAlive == 0 then
        showMessage("✅ Wave " .. waveNumber .. " defeated!")
        showMessage("💰 Bonus power-ups spawned!")
        
        -- Spawn reward power-ups
        spawnTankPowerUp("armor", 400, 300)
        spawnTankPowerUp("damage", 350, 350)
        
        if waveNumber >= 10 then
            showMessage("🏆 ALL WAVES DEFEATED! VICTORY!")
            endBattle("victory")
        else
            -- Next wave in 15 seconds
            setTimer(spawnEnemyWave, 15000)
        end
    else
        -- Continue checking
        setTimer(checkWaveComplete, 2000)
    end
end

function onTankDestroyed(tank, killer)
    if enemyTanks[tank.id] then
        enemyTanks[tank.id] = false
        spawnExplosion(tank.x, tank.y)
    end
end

function onBaseHit()
    baseHealth = baseHealth - 100
    showMessage("🚨 BASE UNDER ATTACK! Health: " .. baseHealth)
    
    if baseHealth <= 0 then
        showMessage("💀 BASE DESTROYED! DEFEAT!")
        endBattle("defeat")
    end
end`
    }
};

// Function to load a template
function loadScriptTemplate(templateKey) {
    const template = SCRIPT_TEMPLATES[templateKey];
    if (!template) return;
    
    const textarea = document.getElementById('mapScriptEditor');
    if (textarea) {
        textarea.value = template.code;
        showMessage(`Template loaded: ${template.name}`);
    }
}

// Function to show template selector
function showScriptTemplates() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    let templatesHTML = '';
    for (const [key, template] of Object.entries(SCRIPT_TEMPLATES)) {
        templatesHTML += `
            <div style="
                background: linear-gradient(135deg, rgba(0,247,255,0.1), rgba(0,200,220,0.05));
                border: 1px solid rgba(0,247,255,0.3);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.3s;
            " onclick="loadScriptTemplate('${key}'); this.closest('div').parentElement.remove();"
               onmouseenter="this.style.background='linear-gradient(135deg, rgba(0,247,255,0.2), rgba(0,200,220,0.1))'"
               onmouseleave="this.style.background='linear-gradient(135deg, rgba(0,247,255,0.1), rgba(0,200,220,0.05))'">
                <div style="color: #00f7ff; font-weight: bold; margin-bottom: 5px;">${template.name}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 12px;">${template.description}</div>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a2a3a, #2a3a4a);
            border: 2px solid #00f7ff;
            border-radius: 12px;
            padding: 30px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #00f7ff; margin: 0;">📋 Script Templates</h2>
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: #ff4444;
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">✕</button>
            </div>
            
            <div style="margin-bottom: 15px; color: rgba(255,255,255,0.7);">
                Click on a template to load it into the editor:
            </div>
            
            ${templatesHTML}
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Make functions globally available
window.loadScriptTemplate = loadScriptTemplate;
window.showScriptTemplates = showScriptTemplates;