// ==========================
// AQI Conversion from PM2.5
// ==========================
function pm25ToAQI(pm25) {
    const breakpoints = [
        { cLow: 0.0, cHigh: 12.0, aqiLow: 0, aqiHigh: 50 },
        { cLow: 12.1, cHigh: 35.4, aqiLow: 51, aqiHigh: 100 },
        { cLow: 35.5, cHigh: 55.4, aqiLow: 101, aqiHigh: 150 },
        { cLow: 55.5, cHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
        { cLow: 150.5, cHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
        { cLow: 250.5, cHigh: 350.4, aqiLow: 301, aqiHigh: 400 },
        { cLow: 350.5, cHigh: 500.4, aqiLow: 401, aqiHigh: 500 }
    ];
    for (const bp of breakpoints) {
        if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
            return Math.round(
                ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.aqiLow
            );
        }
    }
    return null;
}

// ==========================
// AQI category colors
// ==========================
function getAQIColor(aqi) {
    if (aqi <= 50) return "#009966";    // Good
    if (aqi <= 100) return "#ffde33";   // Moderate
    if (aqi <= 150) return "#ff9933";   // Unhealthy for sensitive groups
    if (aqi <= 200) return "#cc0033";   // Unhealthy
    if (aqi <= 300) return "#660099";   // Very Unhealthy
    return "#7e0023";                   // Hazardous
}

// ==========================
// Map Setup
// ==========================
const map = L.map('map').setView([22.9734, 78.6569], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let selectedMarker = null;
const markersByKey = new Map();

// ==========================
// Manual coordinate overrides
// ==========================
const cityOverrides = {
    "Leh": { latitude: 34.1526, longitude: 77.5770 },
    "Kargil": { latitude: 34.5685, longitude: 76.1313 },
    "Aizawl": { latitude: 23.7271, longitude: 92.7176 },
    "Silvassa": { latitude: 20.2739, longitude: 73.0083 },
    "Daman": { latitude: 20.3974, longitude: 72.8328 },
    "Port Blair": { latitude: 11.6234, longitude: 92.7265 },
    "Itanagar": { latitude: 27.0844, longitude: 93.6053 },
    "Dispur": { latitude: 26.1445, longitude: 91.7362 }
    // add more overrides if needed
};

// ==========================
// AQI Fetch Function
// ==========================
async function fetchAQI(cityName, stateName) {
    try {
        // ✅ normalize state (preserve spaces)
        stateName = (stateName || "").replace(/\s+/g, " ").trim();

        // ✅ manual override first
        if (cityOverrides[cityName]) {
            const { latitude, longitude } = cityOverrides[cityName];
            return await fetchAQIData(latitude, longitude);
        }

        // try city + state
        let query = `${cityName}, ${stateName}`;
        let geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en`);
        let geoData = await geoRes.json();

        // fallback: city only
        if (!geoData.results || geoData.results.length === 0) {
            query = cityName;
            geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en`);
            geoData = await geoRes.json();
        }

        if (!geoData.results || geoData.results.length === 0) {
            return { aqi: "Error fetching AQI", pm25: "N/A" };
        }

        const { latitude, longitude } = geoData.results[0];
        return await fetchAQIData(latitude, longitude);

    } catch (err) {
        console.error("Error fetching AQI:", err);
        return { aqi: "Error", pm25: "Error" };
    }
}

// helper: fetch AQI by coordinates
async function fetchAQIData(latitude, longitude) {
    const aqiRes = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm2_5`
    );
    const aqiData = await aqiRes.json();

    if (aqiData.hourly && aqiData.hourly.pm2_5 && aqiData.hourly.pm2_5.length > 0) {
        const pm25 = aqiData.hourly.pm2_5[0];
        const aqiValue = pm25ToAQI(pm25);
        return { aqi: aqiValue, pm25: pm25 };
    } else {
        return { aqi: "AQI data not available", pm25: "—" };
    }
}


// ==========================
// Public function for list clicks
// ==========================
window.highlightCityByName = function (name, state) {
    if (!name) return;
    const key = `${name.toLowerCase().trim()}, ${state.toLowerCase().trim()}`;
    const marker = markersByKey.get(key);
    if (marker) {
        marker.fire('click');
    } else {
        console.warn("No marker found for:", name, state);
    }
};

// ==========================
// Load GeoJSON and Add Points
// ==========================
fetch('Cities.geojson')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                const marker = L.circleMarker(latlng, {
                    radius: 4.5,
                    color: '#117302',
                    weight: 1.5,
                    opacity: 0.9,
                    fillColor: '#8bf576',
                    fillOpacity: 0.85
                });
                const city = (feature.properties?.name || "").toLowerCase().trim();
                const state = (feature.properties?.state || "").toLowerCase().trim();
                if (city && state) markersByKey.set(`${city}, ${state}`, marker);
                return marker;
            },
            onEachFeature: (feature, layer) => {
                const cityName = feature.properties?.name || "Unknown City";
                const stateName = feature.properties?.state || "Unknown State";

                layer.bindTooltip(`${cityName}, ${stateName}`, { direction: 'top' });

                layer.on('click', async () => {
                    // reset old marker
                    if (selectedMarker) {
                        selectedMarker.setStyle({
                            color: '#117302',
                            weight: 1.5,
                            fillColor: '#8bf576',
                            fillOpacity: 0.85
                        });
                        selectedMarker.setRadius(4.5);
                    }

                    // fetch AQI
                    const { aqi, pm25 } = await fetchAQI(cityName, stateName);

                    // highlight with AQI color
                    let color = 'red';
                    if (!isNaN(aqi)) color = getAQIColor(aqi);

                    layer.setStyle({
                        color: color,
                        fillColor: color,
                        weight: 2,
                        fillOpacity: 0.9
                    });
                    layer.setRadius(8);
                    layer.bringToFront();
                    selectedMarker = layer;

                    map.setView(layer.getLatLng(), 8);

                    // update tooltip
                    layer.bindTooltip(
                        `${cityName}, ${stateName}<br>AQI: ${aqi}`,
                        { direction: 'top' }
                    ).openTooltip();
                });
            }
        }).addTo(map);
    });
