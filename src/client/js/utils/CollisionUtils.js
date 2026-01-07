/**
 * CollisionUtils - Collision detection utilities
 * Extracted from PhysicsSystem and other modules as part of the refactoring
 * 
 * Provides collision detection functions for various shapes and scenarios
 * **Validates: Requirements 2.2, 1.1**
 */

export class CollisionUtils {
    /**
     * Check if two circles intersect
     * @param {number} x1 - First circle center X
     * @param {number} y1 - First circle center Y
     * @param {number} r1 - First circle radius
     * @param {number} x2 - Second circle center X
     * @param {number} y2 - Second circle center Y
     * @param {number} r2 - Second circle radius
     * @returns {boolean} True if circles intersect
     */
    static circlesIntersect(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= r1 + r2;
    }

    /**
     * Check if a point is inside a circle
     * @param {number} px - Point X coordinate
     * @param {number} py - Point Y coordinate
     * @param {number} cx - Circle center X
     * @param {number} cy - Circle center Y
     * @param {number} radius - Circle radius
     * @returns {boolean} True if point is inside circle
     */
    static pointInCircle(px, py, cx, cy, radius) {
        const dx = px - cx;
        const dy = py - cy;
        return (dx * dx + dy * dy) <= radius * radius;
    }

    /**
     * Check if a point is inside a rectangle
     * @param {number} px - Point X coordinate
     * @param {number} py - Point Y coordinate
     * @param {number} rx - Rectangle X coordinate (top-left)
     * @param {number} ry - Rectangle Y coordinate (top-left)
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {boolean} True if point is inside rectangle
     */
    static pointInRect(px, py, rx, ry, width, height) {
        return px >= rx && px <= rx + width && py >= ry && py <= ry + height;
    }

    /**
     * Check if two rectangles intersect
     * @param {number} x1 - First rectangle X
     * @param {number} y1 - First rectangle Y
     * @param {number} w1 - First rectangle width
     * @param {number} h1 - First rectangle height
     * @param {number} x2 - Second rectangle X
     * @param {number} y2 - Second rectangle Y
     * @param {number} w2 - Second rectangle width
     * @param {number} h2 - Second rectangle height
     * @returns {boolean} True if rectangles intersect
     */
    static rectsIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
    }

    /**
     * Check if a circle intersects with a rectangle
     * @param {number} cx - Circle center X
     * @param {number} cy - Circle center Y
     * @param {number} radius - Circle radius
     * @param {number} rx - Rectangle X
     * @param {number} ry - Rectangle Y
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @returns {boolean} True if circle intersects rectangle
     */
    static circleRectIntersect(cx, cy, radius, rx, ry, width, height) {
        // Find the closest point on the rectangle to the circle center
        const closestX = Math.max(rx, Math.min(cx, rx + width));
        const closestY = Math.max(ry, Math.min(cy, ry + height));

        // Calculate distance from circle center to closest point
        const dx = cx - closestX;
        const dy = cy - closestY;
        const distanceSquared = dx * dx + dy * dy;

        return distanceSquared <= radius * radius;
    }

    /**
     * Calculate distance from a point to a line segment
     * @param {number} px - Point X coordinate
     * @param {number} py - Point Y coordinate
     * @param {number} x1 - Line segment start X
     * @param {number} y1 - Line segment start Y
     * @param {number} x2 - Line segment end X
     * @param {number} y2 - Line segment end Y
     * @returns {number} Distance from point to line segment
     */
    static distanceToSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if a point is inside a polygon
     * @param {number} px - Point X coordinate
     * @param {number} py - Point Y coordinate
     * @param {Array<{x: number, y: number}>} vertices - Polygon vertices
     * @returns {boolean} True if point is inside polygon
     */
    static pointInPolygon(px, py, vertices) {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x;
            const yi = vertices[i].y;
            const xj = vertices[j].x;
            const yj = vertices[j].y;

            const intersect = ((yi > py) !== (yj > py)) &&
                (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    /**
     * Check if a point is inside a hexagon
     * @param {number} px - Point X coordinate
     * @param {number} py - Point Y coordinate
     * @param {number} cx - Hexagon center X
     * @param {number} cy - Hexagon center Y
     * @param {number} radius - Hexagon radius
     * @returns {boolean} True if point is inside hexagon
     */
    static pointInHexagon(px, py, cx, cy, radius) {
        // Generate hexagon vertices
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            vertices.push({
                x: cx + radius * Math.cos(angle),
                y: cy + radius * Math.sin(angle)
            });
        }
        return this.pointInPolygon(px, py, vertices);
    }

    /**
     * Check if a circle collides with a hexagon
     * @param {number} cx - Circle center X
     * @param {number} cy - Circle center Y
     * @param {number} circleRadius - Circle radius
     * @param {number} hx - Hexagon center X
     * @param {number} hy - Hexagon center Y
     * @param {number} hexRadius - Hexagon radius
     * @returns {boolean} True if circle collides with hexagon
     */
    static circleHexagonCollision(cx, cy, circleRadius, hx, hy, hexRadius) {
        // Quick distance check first
        const dx = cx - hx;
        const dy = cy - hy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > hexRadius + circleRadius) {
            return false; // Too far away
        }

        // Check if circle center is inside hexagon
        if (this.pointInHexagon(cx, cy, hx, hy, hexRadius)) {
            return true;
        }

        // Check distance to each hexagon edge
        let minDistance = Infinity;
        for (let i = 0; i < 6; i++) {
            const angle1 = (Math.PI / 3) * i - Math.PI / 6;
            const angle2 = (Math.PI / 3) * (i + 1) - Math.PI / 6;

            const x1 = hx + hexRadius * Math.cos(angle1);
            const y1 = hy + hexRadius * Math.sin(angle1);
            const x2 = hx + hexRadius * Math.cos(angle2);
            const y2 = hy + hexRadius * Math.sin(angle2);

            const dist = this.distanceToSegment(cx, cy, x1, y1, x2, y2);
            minDistance = Math.min(minDistance, dist);
        }

        return minDistance <= circleRadius;
    }

    /**
     * Check if two line segments intersect
     * @param {number} x1 - First segment start X
     * @param {number} y1 - First segment start Y
     * @param {number} x2 - First segment end X
     * @param {number} y2 - First segment end Y
     * @param {number} x3 - Second segment start X
     * @param {number} y3 - Second segment start Y
     * @param {number} x4 - Second segment end X
     * @param {number} y4 - Second segment end Y
     * @returns {boolean} True if segments intersect
     */
    static segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denom === 0) return false; // Parallel lines

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }

    /**
     * Get the closest point on a line segment to a given point
     * @param {number} px - Point X coordinate
     * @param {number} py - Point Y coordinate
     * @param {number} x1 - Line segment start X
     * @param {number} y1 - Line segment start Y
     * @param {number} x2 - Line segment end X
     * @param {number} y2 - Line segment end Y
     * @returns {{x: number, y: number}} Closest point on segment
     */
    static closestPointOnSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        return { x: xx, y: yy };
    }

    /**
     * Calculate the area of a polygon
     * @param {Array<{x: number, y: number}>} vertices - Polygon vertices
     * @returns {number} Area of polygon
     */
    static polygonArea(vertices) {
        let area = 0;
        for (let i = 0; i < vertices.length; i++) {
            const j = (i + 1) % vertices.length;
            area += vertices[i].x * vertices[j].y;
            area -= vertices[j].x * vertices[i].y;
        }
        return Math.abs(area / 2);
    }

    /**
     * Check if two polygons intersect using SAT (Separating Axis Theorem)
     * @param {Array<{x: number, y: number}>} poly1 - First polygon vertices
     * @param {Array<{x: number, y: number}>} poly2 - Second polygon vertices
     * @returns {boolean} True if polygons intersect
     */
    static polygonsIntersect(poly1, poly2) {
        // Helper function to get polygon edges
        const getEdges = (polygon) => {
            const edges = [];
            for (let i = 0; i < polygon.length; i++) {
                const j = (i + 1) % polygon.length;
                edges.push({
                    x: polygon[j].x - polygon[i].x,
                    y: polygon[j].y - polygon[i].y
                });
            }
            return edges;
        };

        // Helper function to get perpendicular axis
        const getAxis = (edge) => {
            return { x: -edge.y, y: edge.x };
        };

        // Helper function to project polygon onto axis
        const project = (polygon, axis) => {
            let min = Infinity;
            let max = -Infinity;
            for (const vertex of polygon) {
                const projection = vertex.x * axis.x + vertex.y * axis.y;
                min = Math.min(min, projection);
                max = Math.max(max, projection);
            }
            return { min, max };
        };

        // Check all axes from both polygons
        const edges = [...getEdges(poly1), ...getEdges(poly2)];
        for (const edge of edges) {
            const axis = getAxis(edge);
            const proj1 = project(poly1, axis);
            const proj2 = project(poly2, axis);

            // Check for separation
            if (proj1.max < proj2.min || proj2.max < proj1.min) {
                return false; // Found separating axis
            }
        }

        return true; // No separating axis found, polygons intersect
    }
}

export default CollisionUtils;
