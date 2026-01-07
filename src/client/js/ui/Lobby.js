/**
 * Lobby UI functions
 */

function openFeature(feature) {
    console.log('Opening feature:', feature);
    // Placeholder for feature implementation
    alert(`${feature} feature coming soon!`);
}

// Make function globally accessible for backward compatibility
window.openFeature = openFeature;

// Export for module usage
export { openFeature };
