'use strict';
let AUTO_DETECT_DEV_MODE = true; // Set to false to disable auto-detection of developer mode
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});

// Initialize GLightbox
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: false,
        autoplayVideos: false
    });
});

// Copy ID functionality with tooltip and first-time alert
document.addEventListener('DOMContentLoaded', () => {
    const copyBtns = document.querySelectorAll('.copy-id-btn');
    const firstCopyAlert = document.getElementById('first_copy_alert');
    let hasShownAlert = false;

    const executeCopy = async (btn) => {
        const textToCopy = btn.getAttribute('data-copy-id');
        const tooltipWrapper = btn.closest('.tooltip');
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            let originalTip = '';
            
            if (tooltipWrapper) {
                originalTip = tooltipWrapper.getAttribute('data-tip');
                tooltipWrapper.setAttribute('data-tip', 'Copied!');
            }
            
            setTimeout(() => {
                if (tooltipWrapper) {
                    tooltipWrapper.setAttribute('data-tip', originalTip);
                }
            }, 1500);
        } catch (err) {
            console.error('Failed to copy text', err);
        }
    };

    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Always copy immediately
            executeCopy(btn);

            // Show alert first time
            if (!hasShownAlert && firstCopyAlert) {
                const toastContainer = document.getElementById('toast_container');
                if (toastContainer) toastContainer.style.display = 'block';

                firstCopyAlert.classList.remove('-translate-y-10', 'opacity-0');
                firstCopyAlert.classList.add('translate-y-0', 'opacity-100');
                hasShownAlert = true;
                
                // Hide automatically after 8 seconds
                setTimeout(() => {
                    firstCopyAlert.classList.remove('translate-y-0', 'opacity-100');
                    firstCopyAlert.classList.add('-translate-y-10', 'opacity-0');
                    setTimeout(() => {
                        if (toastContainer) toastContainer.style.display = 'none';
                    }, 500); // Wait for transition
                }, 8000);
            }
        });
    });
});

// Contact Form Listener
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Form submission logic to be implemented
        });
    }
});

let loadMap = true;
let developerMode = false;
// Check origin to determine developer mode - If yes, disable google analytics
function autoDeveloperMode(enableAutoDetect) {
    if (!enableAutoDetect) {
        return false;
    }
    const devOrigins = [
        "localhost",
        "l.ujayden.com",
        "127.0.0.1"
    ];
    // Yes - Disable google analytics + map load
    if (devOrigins.includes(window.location.hostname)) {
        developerMode = true;
        loadMap = false;
        //Override loadMap:
        //loadMap = true;
        console.log("Developer mode automatically enabled for origin:", window.location.hostname);
        return true;
    }
    return false;
}
// Auto-detect developer mode on page load
autoDeveloperMode(AUTO_DETECT_DEV_MODE);
if (developerMode) {
    console.log("Developer mode is enabled. Google Analytics and certain features are disabled.");
}

let map;
let mapInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    const collapse = mapContainer?.closest('.collapse');
    const toggle = collapse?.querySelector('input[type="checkbox"]');

    if (!mapContainer || !loadMap) return;

    mapContainer.setAttribute('style', 'height: 400px; width: 100%; border-radius: 0.5rem; z-index: 0;');
    const mapLocation = [22.3040, 114.1790];

    function initMap() {
        if (mapInitialized) return;

        map = L.map('map').setView(mapLocation, 13);

        const topoBase = L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/WGS84/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="https://api.portal.hkmapservice.gov.hk/disclaimer" target="_blank">Map from Lands Department</a>'
        });

        const topoLabels = L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/en/WGS84/{z}/{x}/{y}.png', {
            maxZoom: 20
        });

        topoBase.addTo(map);
        topoLabels.addTo(map);
        L.marker(mapLocation).addTo(map).openPopup();

        // Add Lands Department logo
        L.Control.LandsLogo = L.Control.extend({
            onAdd: function(map) {
                let img = L.DomUtil.create('img');
                img.src = '/libraries/leaflet/images/Lands_Department_logo.png';
                img.style.width = '24px';
                img.style.opacity = '0.6';
                img.style.cursor = 'pointer';
                img.title = 'Lands Department';
                img.onclick = function() {
                    window.open('https://api.portal.hkmapservice.gov.hk/disclaimer', '_blank');
                };
                return img;
            }
        });
        
        L.control.landsLogo = function(opts) {
            return new L.Control.LandsLogo(opts);
        }
        
        L.control.landsLogo({ position: 'bottomright' }).addTo(map);

        mapInitialized = true;
    }

    function refreshMap() {
        if (!mapInitialized) initMap();
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }

    if (toggle) {
        if (toggle.checked) refreshMap();

        toggle.addEventListener('change', () => {
            if (toggle.checked) refreshMap();
        });
    } else {
        refreshMap();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if (!developerMode) {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-YCECGQET86');
    }
});