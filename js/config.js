// Game configuration
const CONFIG = {
    TANK: {
        SIZE: 90,
        MAX_SPEED: 5,
        ACCELERATION: 0.3,
        FRICTION: 0.9,
        ROTATION_SPEED: 0.05
    },
    BULLET: {
        SPEED: 10,
        SIZE: 8,
        DAMAGE: 10,
        COOLDOWN: 300
    },
    GAME: {
        WIDTH: 7500,
        HEIGHT: 7500,
        FPS: 60
    },
    NETWORK: {
        WS_URL: `ws://${window.location.hostname}:5000/ws`,
        UPDATE_RATE: 33 // ms between updates
    }
};

window.CONFIG = CONFIG;
