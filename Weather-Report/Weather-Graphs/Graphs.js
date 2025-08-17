document.addEventListener("DOMContentLoaded", () => {
    const stateList = document.getElementById("search-options");
    const toggleButton = document.getElementById("search-button");
    const ctx = document.getElementById("myWeatherChart").getContext("2d");
    let showingStates = true;
    let lastState = null;
    let chartInstance = null;

    const apiKey = "13219d5a4bd4454dabc171925252907"; // WeatherAPI.com key

    // ---- Full States + Union Territories with all cities ----
    const citiesData = {
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kurnool", "Anantapur", "Nellore", "Rajahmundry", "Ongole", "Eluru"],
        "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Roing", "Bomdila", "Aalo", "Changlang", "Daporijo"],
        "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur", "Nagaon", "Tinsukia", "Sivasagar", "Diphu", "Bongaigaon"],
        "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bettiah", "Sasaram", "Hajipur", "Siwan"],
        "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", "Durg", "Ambikapur", "Kawardha", "Raigarh"],
        "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Quepem", "Sanguem"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Morbi", "Anand"],
        "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
        "Himachal Pradesh": ["Shimla", "Mandi", "Solan", "Dharamshala", "Palampur", "Kullu", "Bilaspur", "Nahan", "Hamirpur", "Una"],
        "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Hazaribagh", "Giridih", "Ramgarh", "Deoghar", "Phusro", "Medininagar"],
        "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Kalaburagi", "Davangere", "Ballari", "Vijayapura", "Shivamogga"],
        "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Alappuzha", "Kannur", "Kottayam", "Palakkad", "Malappuram"],
        "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Satna", "Rewa", "Ratlam", "Burhanpur"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Sangli"],
        "Manipur": ["Imphal", "Thoubal", "Kakching", "Ukhrul", "Churachandpur", "Bishnupur", "Senapati", "Tamenglong", "Jiribam", "Pherzawl"],
        "Meghalaya": ["Shillong", "Tura", "Nongpoh", "Jowai", "Baghmara", "Williamnagar", "Mairang", "Resubelpara", "Nongstoin", "Khliehriat"],
        "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Lawngtlai", "Siaha", "Mamit", "Hnahthial", "Khawzawl"],
        "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Kiphire", "Mon", "Longleng"],
        "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Balasore", "Baripada", "Bhadrak", "Jeypore", "Dhenkanal"],
        "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Barnala"],
        "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Sikar", "Pali", "Alwar", "Bharatpur"],
        "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Singtam", "Rangpo", "Soreng", "Ravangla", "Chungthang", "Pakyong"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul"],
        "Telangana": ["Hyderabad", "Secunderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Mahbubnagar", "Khammam", "Mancherial", "Adilabad", "Siddipet"],
        "Tripura": ["Agartala", "Udaipur", "Belonia", "Dharmanagar", "Kailashahar", "Khowai", "Sonamura", "Ambassa", "Kamalpur", "Sabroom"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Prayagraj", "Ghaziabad", "Bareilly", "Aligarh", "Moradabad"],
        "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Kashipur", "Rudrapur", "Pauri", "Almora", "Nainital"],
        "West Bengal": ["Kolkata", "Siliguri", "Asansol", "Durgapur", "Howrah", "Kharagpur", "Haldia", "Jalpaiguri", "Bardhaman", "Malda"],

        // Union Territories
        "Andaman and Nicobar Islands": ["Port Blair", "Mayabunder", "Car Nicobar", "Bamboo Flat", "Rangat", "Diglipur"],
        "Chandigarh": ["Chandigarh"],
        "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa", "Naroli", "Khanvel"],
        "Delhi": ["New Delhi", "Delhi Cantonment", "Rohini", "Dwarka", "Saket", "Karol Bagh", "Connaught Place"],
        "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Kupwara", "Rajouri", "Poonch", "Pulwama"],
        "Ladakh": ["Leh", "Kargil", "Diskit", "Nubra", "Zanskar"],
        "Lakshadweep": ["Kavaratti", "Agatti", "Amini", "Andrott", "Kalpeni", "Minicoy"],
        "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
    };

    console.log(citiesData);

    async function showWeather(location) {
        try {
            // 1. Get coordinates for location
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
            const geoData = await geoRes.json();
            if (!geoData.results || geoData.results.length === 0) {
                alert(`Could not find location: ${location}`);
                return;
            }

            const { latitude, longitude, name, admin1 } = geoData.results[0];

            // 2. Get weather data (7 days)
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
            );
            const weatherData = await weatherRes.json();

            const labels = weatherData.daily.time.map((dateStr, idx) => {
                if (idx === 0) return "Today";
                const date = new Date(dateStr);
                return date.toLocaleDateString("en-US", { weekday: "long" });
            });

            // Average max and min temp to match old avgtemp_c
            const temps = weatherData.daily.temperature_2m_max.map((max, idx) =>
                ((max + weatherData.daily.temperature_2m_min[idx]) / 2).toFixed(1)
            );

            if (chartInstance) chartInstance.destroy();

            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${location} Temperature (°C)`,
                        data: temps,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { responsive: true }
            });

            // 3. Get AQI
            const aqiRes = await fetch(
                `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi`
            );
            const aqiData = await aqiRes.json();
            const aqiValue = aqiData.hourly.us_aqi[0];

            let aqiText = "";
            switch (true) {
                case aqiValue <= 50: aqiText = "Good"; break;
                case aqiValue <= 100: aqiText = "Moderate"; break;
                case aqiValue <= 150: aqiText = "Unhealthy for Sensitive Groups"; break;
                case aqiValue <= 200: aqiText = "Unhealthy"; break;
                case aqiValue <= 300: aqiText = "Very Unhealthy"; break;
                default: aqiText = "Hazardous";
            }

            document.getElementById("A-1").textContent = `AQI: ${aqiValue}`;
            document.getElementById("City").textContent = `City: ${name}`;
            document.getElementById("State").textContent = `State: ${lastState || admin1 || "Unknown"}`;
            document.getElementById("Condition").textContent = `Condition: ${aqiText}`;

        } catch (err) {
            console.error(err);
            alert(`Could not load weather/AQI for ${location}`);
        }
    }



    function renderList(items, clickHandler) {
        stateList.innerHTML = "";
        items.forEach(item => {
            const p = document.createElement("p");
            p.textContent = item;
            p.className = "list-item";
            p.addEventListener("click", () => clickHandler(item));
            stateList.appendChild(p);
        });
    }

    function showStates() {
        renderList(Object.keys(citiesData), state => {
            lastState = state;
            showCities(state);
            showingStates = false;
        });
    }

    function showCities(state) {
        if (!citiesData[state] || citiesData[state].length === 0) {
            stateList.innerHTML = "<p>No cities available</p>";
            return;
        }
        renderList(citiesData[state], city => {
            showWeather(city);
        });
    }

    toggleButton.addEventListener("click", () => {
        if (showingStates) {
            if (!lastState) {
                alert("Click a state first to see its cities.");
                return;
            }
            showCities(lastState);
            toggleButton.textContent = "States";
        } else {
            showStates();
            toggleButton.textContent = "Cities";
        }
        showingStates = !showingStates;
    });

    showStates();
});
window.showWeather = async function (city) {
    try {
        // First geocode the city to get lat/lon
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            document.getElementById("A-1").textContent = "AQI: N/A";
            return;
        }

        const { latitude, longitude } = geoData.results[0];

        // Get air quality data
        const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm2_5`);
        const aqiData = await aqiRes.json();

        if (aqiData.hourly && aqiData.hourly.pm2_5 && aqiData.hourly.pm2_5.length > 0) {
            const latestAQI = aqiData.hourly.pm2_5[0];
            document.getElementById("A-1").textContent = `AQI PM2.5: ${latestAQI}`;
        } else {
            document.getElementById("A-1").textContent = "AQI: N/A";
        }
    } catch (error) {
        console.error("Error fetching AQI:", error);
        document.getElementById("A-1").textContent = "AQI: Error";
    }
};

