// Horizontal Scroll Support - Convert mouse wheel to horizontal scroll

function setupHorizontalScroll() {
    const containers = document.querySelectorAll('.shop-items-grid, .maps-grid');

    containers.forEach(container => {
        // Remove existing listener if any
        if (container._horizontalScrollHandler) {
            container.removeEventListener('wheel', container._horizontalScrollHandler);
        }

        // Create new handler
        const handler = function (e) {
            if (e.deltaY !== 0) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        };

        // Store handler reference for cleanup
        container._horizontalScrollHandler = handler;

        // Add listener
        container.addEventListener('wheel', handler, { passive: false });
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHorizontalScroll);
} else {
    setupHorizontalScroll();
}

// Reinitialize when shop opens
const originalOpenFeature = window.openFeature;
if (originalOpenFeature) {
    window.openFeature = function (feature) {
        const result = originalOpenFeature.apply(this, arguments);
        if (feature === 'shop') {
            setTimeout(setupHorizontalScroll, 100);
        }
        return result;
    };
}

// Export function
window.setupHorizontalScroll = setupHorizontalScroll;
