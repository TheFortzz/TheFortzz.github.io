/**
 * Missing Functions Finder
 * Scans HTML for onclick handlers and checks if corresponding functions exist
 */

// Extract all onclick handlers from HTML content
function findMissingFunctions() {
    console.log('🔍 Scanning for missing functions...');
    
    // Get all elements with onclick attributes
    const elementsWithOnclick = document.querySelectorAll('[onclick]');
    const missingFunctions = [];
    const foundFunctions = [];
    
    elementsWithOnclick.forEach(element => {
        const onclickValue = element.getAttribute('onclick');
        
        // Extract function names from onclick handlers
        const functionMatches = onclickValue.match(/(\w+)\s*\(/g);
        
        if (functionMatches) {
            functionMatches.forEach(match => {
                const functionName = match.replace('(', '');
                
                // Check if function exists
                if (typeof window[functionName] === 'function') {
                    if (!foundFunctions.includes(functionName)) {
                        foundFunctions.push(functionName);
                    }
                } else {
                    if (!missingFunctions.includes(functionName)) {
                        missingFunctions.push(functionName);
                    }
                }
            });
        }
    });
    
    console.log('✅ Found Functions:', foundFunctions);
    console.log('❌ Missing Functions:', missingFunctions);
    
    return { found: foundFunctions, missing: missingFunctions };
}

// Create missing function stubs
function createMissingFunctionStubs(missingFunctions) {
    // Create lightweight no-op stubs to avoid console errors when UI references functions
    missingFunctions.forEach(funcName => {
        if (typeof window[funcName] !== 'function') {
            window[funcName] = function(...args) {
                // Debug-level stub: avoid noisy warnings
                console.debug(`STUB: ${funcName}()`, args);
                return null;
            };
        }
    });
}

// Export functions
window.findMissingFunctions = findMissingFunctions;
window.createMissingFunctionStubs = createMissingFunctionStubs;

// Auto-run when loaded
setTimeout(() => {
    const result = findMissingFunctions();
    if (result.missing.length > 0) {
        // Create stubs to avoid runtime errors from missing handlers
        createMissingFunctionStubs(result.missing);
        console.info(`Created ${result.missing.length} lightweight stubs for missing onclick handlers`);
    } else {
        console.debug('All onclick handlers are present');
    }
}, 1000);