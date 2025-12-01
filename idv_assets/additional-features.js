'use strict';
let developerMode = false;
// Load global_config and use its data if needed
fetch('/global_config.json')
    .then(response => response.json())
    .then(globalConfig => {
        // Check for fullsite grayscale feature
        if (globalConfig.features?.fullsiteGrayscale?.enabled) {
            const grayscaleConfig = globalConfig.features.fullsiteGrayscale;
            let shouldApplyGrayscale = false;

            if (grayscaleConfig.enablebydate) {
                const now = new Date();
                const dateList = grayscaleConfig.enableDateList || [];
                
                shouldApplyGrayscale = dateList.some(period => {
                    const startDate = new Date(period.startDateTime);
                    const endDate = new Date(period.endDateTime);
                    return now >= startDate && now <= endDate;
                });
            } else {
                // If enablebydate is false but enabled is true, always apply
                shouldApplyGrayscale = true;
            }

            if (shouldApplyGrayscale) {
                document.documentElement.style.filter = 'grayscale(60%)';
                document.documentElement.style.webkitFilter = 'grayscale(60%)';
            }
        }
    })
    .catch(error => {
        console.error("Error loading global config:", error);
    }
);
let loadMap = true;
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
autoDeveloperMode(true);

if (developerMode) {
    console.log("Developer mode is enabled. Google Analytics and certain features are disabled.");
}

if (loadMap) {
    let mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error("Map container not found!");
    }
    mapContainer.setAttribute('style', 'height: 400px; width: 100%; border-radius: 0.5rem; z-index: 0;');
    let mapLocation = [22.3040, 114.1790]; //PolyU
    let map = L.map('map').setView(mapLocation, 14);

    var topoBase = L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/WGS84/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://portal.csdi.gov.hk/" target="_blank">Map from Lands Department</a>'
    });

    var topoLabels = L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/en/WGS84/{z}/{x}/{y}.png', {
        maxZoom: 20
    });

    topoBase.addTo(map);
    topoLabels.addTo(map);
    L.marker(mapLocation).addTo(map)
        .openPopup();
    
    // Add Lands Department logo
    L.Control.LandsLogo = L.Control.extend({
        onAdd: function(map) {
            var img = L.DomUtil.create('img');
            img.src = '/libraries/leaflet/images/Lands_Department_logo.png';
            img.style.width = '24px';
            img.style.opacity = '0.6';
            img.style.cursor = 'pointer';
            img.title = 'Lands Department';
            img.onclick = function() {
                window.open('https://portal.csdi.gov.hk/', '_blank');
            };
            return img;
        }
    });
    
    L.control.landsLogo = function(opts) {
        return new L.Control.LandsLogo(opts);
    }
    
    L.control.landsLogo({ position: 'bottomright' }).addTo(map);
}
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = GLightbox({
        touchNavigation: true,
        loop: true,
        autoplayVideos: false
    });
});
document.addEventListener('DOMContentLoaded', function() {
    if (!developerMode) {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-YCECGQET86');
    }
});
console.log("Additional features script loaded.");