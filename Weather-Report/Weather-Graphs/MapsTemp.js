document.addEventListener("DOMContentLoaded", () => {
    // Initialize temp map
    const mapTemp = L.map('mapTemp').setView([22.9734, 78.6569], 5);

    // Base tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapTemp);

    // Borders (thin, transparent fill)
    fetch('States.geojson') // change to your file name
        .then(res => res.json())
        .then(borderData => {
            L.geoJSON(borderData, {
                style: {
                    color: "#000",
                    weight: 1,
                    opacity: 0.5,
                    fillOpacity: 0
                }
            }).addTo(mapTemp);
        });

    // Heatmap points
    fetch('Cities.geojson')
        .then(res => res.json())
        .then(async data => {
            const points = [];
            for (const f of data.features) {
                const [lng, lat] = f.geometry.coordinates;
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
                );
                const json = await res.json();
                const temp = json.current_weather?.temperature;
                if (typeof temp === "number") {
                    points.push([lat, lng, (temp + 5) / 50]); // normalize
                }
            }
            L.heatLayer(points, {
                radius: 25,
                blur: 15,
                gradient: {
                    0.0: '#0000ff',
                    0.5: '#ffff00',
                    1.0: '#ff0000'
                }
            }).addTo(mapTemp);
        });

    // Make sure it renders when shown
    window.showTempMap = () => {
        setTimeout(() => mapTemp.invalidateSize(), 100);
    };
});
