/**
 * Mathematical utility functions
 * Common math operations used throughout the game
 */

export class MathUtils {
    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Linear interpolation between two values
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Calculate distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Distance between points
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate squared distance (faster than distance for comparisons)
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Squared distance between points
     */
    static distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    /**
     * Normalize an angle to be between -PI and PI
     * @param {number} angle - Angle in radians
     * @returns {number} Normalized angle
     */
    static normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    static degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Convert radians to degrees
     * @param {number} radians - Angle in radians
     * @returns {number} Angle in degrees
     */
    static radToDeg(radians) {
        return radians * 180 / Math.PI;
    }

    /**
     * Generate random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generate random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Check if a point is inside a circle
     * @param {number} px - Point X
     * @param {number} py - Point Y
     * @param {number} cx - Circle center X
     * @param {number} cy - Circle center Y
     * @param {number} radius - Circle radius
     * @returns {boolean} True if point is inside circle
     */
    static pointInCircle(px, py, cx, cy, radius) {
        return this.distanceSquared(px, py, cx, cy) <= radius * radius;
    }

    /**
     * Check if two circles intersect
     * @param {number} x1 - First circle X
     * @param {number} y1 - First circle Y
     * @param {number} r1 - First circle radius
     * @param {number} x2 - Second circle X
     * @param {number} y2 - Second circle Y
     * @param {number} r2 - Second circle radius
     * @returns {boolean} True if circles intersect
     */
    static circlesIntersect(x1, y1, r1, x2, y2, r2) {
        const distance = this.distance(x1, y1, x2, y2);
        return distance <= r1 + r2;
    }

    /**
     * Calculate angle between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Angle in radians
     */
    static angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Rotate a point around another point
     * @param {number} px - Point X
     * @param {number} py - Point Y
     * @param {number} cx - Center X
     * @param {number} cy - Center Y
     * @param {number} angle - Rotation angle in radians
     * @returns {Object} Rotated point {x, y}
     */
    static rotatePoint(px, py, cx, cy, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const dx = px - cx;
        const dy = py - cy;
        
        return {
            x: cx + dx * cos - dy * sin,
            y: cy + dx * sin + dy * cos
        };
    }

    /**
     * Check if a number is approximately equal to another (within epsilon)
     * @param {number} a - First number
     * @param {number} b - Second number
     * @param {number} epsilon - Tolerance (default: 0.001)
     * @returns {boolean} True if approximately equal
     */
    static approximately(a, b, epsilon = 0.001) {
        return Math.abs(a - b) < epsilon;
    }

    /**
     * Map a value from one range to another
     * @param {number} value - Value to map
     * @param {number} fromMin - Source range minimum
     * @param {number} fromMax - Source range maximum
     * @param {number} toMin - Target range minimum
     * @param {number} toMax - Target range maximum
     * @returns {number} Mapped value
     */
    static map(value, fromMin, fromMax, toMin, toMax) {
        return (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
    }
}

export default MathUtils;