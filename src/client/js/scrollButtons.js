// Scroll Buttons Functionality

function initScrollButtons() {
    const scrollButtons = document.querySelectorAll('.scroll-btn');

    scrollButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.dataset.target;
            const container = document.getElementById(targetId);

            if (!container) return;

            const scrollAmount = 300;
            const direction = this.classList.contains('scroll-btn-left') ? -1 : 1;

            container.scrollBy({
                left: scrollAmount * direction,
                behavior: 'smooth'
            });

            // Update button visibility after scroll
            setTimeout(() => updateScrollButtonVisibility(container), 300);
        });
    });

    // Initialize visibility for all scroll containers
    document.querySelectorAll('.shop-items-grid').forEach(container => {
        updateScrollButtonVisibility(container);

        // Update on scroll
        container.addEventListener('scroll', () => {
            updateScrollButtonVisibility(container);
        });
    });
}

function updateScrollButtonVisibility(container) {
    if (!container) return;

    const containerId = container.id;
    const leftBtn = document.querySelector(`.scroll-btn-left[data-target="${containerId}"]`);
    const rightBtn = document.querySelector(`.scroll-btn-right[data-target="${containerId}"]`);

    if (!leftBtn || !rightBtn) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    // Hide left button if at start
    if (scrollLeft <= 5) {
        leftBtn.classList.add('hidden');
    } else {
        leftBtn.classList.remove('hidden');
    }

    // Hide right button if at end or no scroll needed
    if (scrollLeft >= maxScroll - 5 || maxScroll <= 0) {
        rightBtn.classList.add('hidden');
    } else {
        rightBtn.classList.remove('hidden');
    }
}

// Maps Grid Scroll Functions
function scrollMapsLeft() {
    const mapsGrid = document.querySelector('.maps-grid');
    if (mapsGrid) {
        const scrollAmount = 300;
        mapsGrid.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
        setTimeout(() => updateMapsScrollButtons(), 300);
    }
}

function scrollMapsRight() {
    const mapsGrid = document.querySelector('.maps-grid');
    if (mapsGrid) {
        const scrollAmount = 300;
        mapsGrid.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
        setTimeout(() => updateMapsScrollButtons(), 300);
    }
}

function updateMapsScrollButtons() {
    const mapsGrid = document.querySelector('.maps-grid');
    const leftBtn = document.querySelector('.maps-scroll-left');
    const rightBtn = document.querySelector('.maps-scroll-right');

    if (!mapsGrid || !leftBtn || !rightBtn) return;

    const scrollLeft = mapsGrid.scrollLeft;
    const scrollWidth = mapsGrid.scrollWidth;
    const clientWidth = mapsGrid.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    // Hide left button if at start
    if (scrollLeft <= 5) {
        leftBtn.classList.add('disabled');
    } else {
        leftBtn.classList.remove('disabled');
    }

    // Hide right button if at end or no scroll needed
    if (scrollLeft >= maxScroll - 5 || maxScroll <= 0) {
        rightBtn.classList.add('disabled');
    } else {
        rightBtn.classList.remove('disabled');
    }
}

// Initialize maps scroll buttons when maps are loaded
function initMapsScrollButtons() {
    const mapsGrid = document.querySelector('.maps-grid');
    if (mapsGrid) {
        // Force horizontal scrolling
        mapsGrid.style.display = 'flex';
        mapsGrid.style.flexWrap = 'nowrap';
        mapsGrid.style.overflowX = 'auto';
        mapsGrid.style.overflowY = 'hidden';
        mapsGrid.style.scrollBehavior = 'smooth';

        // Update button states initially
        updateMapsScrollButtons();

        // Update on scroll
        mapsGrid.addEventListener('scroll', updateMapsScrollButtons);

        // Update when window resizes
        window.addEventListener('resize', updateMapsScrollButtons);

        console.log('✅ Maps grid horizontal scrolling initialized');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initScrollButtons();
        initMapsScrollButtons();
    });
} else {
    initScrollButtons();
    initMapsScrollButtons();
}

// Export functions
window.initScrollButtons = initScrollButtons;
window.updateScrollButtonVisibility = updateScrollButtonVisibility;
window.scrollMapsLeft = scrollMapsLeft;
window.scrollMapsRight = scrollMapsRight;
window.updateMapsScrollButtons = updateMapsScrollButtons;
window.initMapsScrollButtons = initMapsScrollButtons;
