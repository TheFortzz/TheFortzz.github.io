// Zoom Slider Control - Map Creator Only
(function() {
    let mapZoomSlider, mapZoomSliderFill, mapZoomSliderThumb;
    
    // Initialize zoom slider when DOM is ready
    function initZoomSlider() {
        // Map creator zoom slider
        mapZoomSlider = document.getElementById('mapZoomSlider');
        mapZoomSliderFill = document.getElementById('mapZoomSliderFill');
        mapZoomSliderThumb = document.getElementById('mapZoomSliderThumb');
        
        if (mapZoomSlider && mapZoomSliderFill && mapZoomSliderThumb) {
            console.log('✅ Map creator zoom slider initialized successfully!');
            console.log('Slider element:', mapZoomSlider);
            console.log('Container visible:', window.getComputedStyle(mapZoomSlider.parentElement).display);
            // Set initial values
            updateSliderVisuals(mapZoomSlider.value, mapZoomSliderFill, mapZoomSliderThumb, mapZoomSlider);
            
            // Add event listener for slider input
            mapZoomSlider.addEventListener('input', function(e) {
                const zoomValue = parseFloat(e.target.value);
                
                // Update map creator zoom - need to update both the local and global variable
                if (typeof window.canvasZoom !== 'undefined') {
                    window.canvasZoom = zoomValue;
                    
                    // Trigger a re-render if the function exists
                    if (typeof window.renderMapCreatorCanvas === 'function') {
                        window.renderMapCreatorCanvas();
                    }
                }
                
                // Update slider visuals
                updateSliderVisuals(zoomValue, mapZoomSliderFill, mapZoomSliderThumb, mapZoomSlider);
                
                // Update zoom display
                const zoomDisplay = document.getElementById('zoomDisplay');
                if (zoomDisplay) {
                    zoomDisplay.textContent = Math.round(zoomValue * 100) + '%';
                }
            });
            
            // Sync slider with button zoom and mouse wheel
            setInterval(syncMapSliderWithZoom, 100);
        }
    }
    
    // Update slider fill and thumb position
    function updateSliderVisuals(zoomValue, fillElement, thumbElement, sliderElement) {
        const min = parseFloat(sliderElement.min);
        const max = parseFloat(sliderElement.max);
        const percentage = ((zoomValue - min) / (max - min)) * 100;
        
        // Update fill width
        fillElement.style.width = percentage + '%';
        
        // Update thumb position
        thumbElement.style.left = percentage + '%';
    }
    
    // Sync map creator slider with zoom changes from buttons/mouse wheel
    function syncMapSliderWithZoom() {
        if (!mapZoomSlider || window.canvasZoom === undefined) return;
        
        const currentZoom = window.canvasZoom;
        
        // Only update if zoom changed externally (not from slider)
        if (Math.abs(parseFloat(mapZoomSlider.value) - currentZoom) > 0.01) {
            mapZoomSlider.value = currentZoom;
            updateSliderVisuals(currentZoom, mapZoomSliderFill, mapZoomSliderThumb, mapZoomSlider);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initZoomSlider);
    } else {
        initZoomSlider();
    }
})();
