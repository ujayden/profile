'use strict';
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
        attribution: '&copy; <a href="https://portal.csdi.gov.hk/" target="_blank">Lands Department - CSDI Portal</a>'
    });

    var topoLabels = L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/en/WGS84/{z}/{x}/{y}.png', {
        maxZoom: 20
    });

    topoBase.addTo(map);
    topoLabels.addTo(map);
    L.marker(mapLocation).addTo(map)
        .openPopup();
}

console.log("Additional features script loaded.");