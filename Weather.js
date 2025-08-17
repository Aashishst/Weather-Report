document.addEventListener('DOMContentLoaded', function () {
  /* ---------- facts hover ---------- */
  const facts = {
    "Longest Day": "1 July, Monday ⇒ Gujarat ⇒ 5:25am ⇒ 7:25pm",
    "Shortest Day": "31 July, Wednesday ⇒ Arunachal Pradesh ⇒ 5:40am ⇒ 6:35pm",
    "Highest Rainfall": "22 July, Monday ⇒ Maharashtra (Chiplun) ⇒ 1113 mm(average)",
    "Lowest Temp": "10 July, Wednesday ⇒ Himachal Pradesh (Losar) ⇒ 9°C",
    "Strongest Winds": "18 July, Thursday ⇒ Goa coast ⇒ up to 40 km/h",
    "Best AQI": "14 July, Sunday ⇒ Ladakh (Leh) ⇒ AQI ~42",
    "Hottest Day": "5 July, Friday ⇒ Rajasthan (Sām) ⇒ 39°C",
    "Coldest Night": "9 July, Tuesday ⇒ Jammu & Kashmir (Dras) ⇒ -2°C",
    "Longest Rain": "25 July, Thursday ⇒ Kerala (Western Ghats) ⇒ ~6 hours"
  };

  const keywords = document.querySelectorAll('.fact-keyword');
  const dropdown = document.getElementById('fact-dropdown');

  keywords.forEach(keyword => {
    keyword.addEventListener('mouseenter', function () {
      dropdown.innerHTML = facts[keyword.getAttribute('data-fact')] || '';
      const parentRect = keyword.parentElement.getBoundingClientRect();
      const rect = keyword.getBoundingClientRect();
      dropdown.style.top = (rect.top - parentRect.top + 80) + 'px';
      dropdown.classList.add('visible');
    });
    keyword.addEventListener('mouseleave', function () {
      dropdown.classList.remove('visible');
    });
  });

  const factsMenu = document.getElementById('facts-menu');
  if (factsMenu) {
    factsMenu.addEventListener('mouseleave', function () {
      dropdown.classList.remove('visible');
    });
  }

  /* ---------- popup note ---------- */
  const note = document.createElement('div');
  note.textContent = 'Please choose a state to view the weather report.';
  note.style.position = 'fixed';
  note.style.top = '20px';
  note.style.left = '50%';
  note.style.transform = 'translateX(-50%)';
  note.style.background = '#b1dfecff';
  note.style.color = '#333';
  note.style.padding = '16px 32px';
  note.style.border = '2px solid #4881c7ff';
  note.style.borderRadius = '8px';
  note.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  note.style.zIndex = '1000';
  note.style.fontSize = '1.1em';
  note.style.fontWeight = 'bold';
  note.style.fontFamily = 'Exo, sans-serif';
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 1500);

  /* ---------- weather ---------- */
  const apiKey = "13219d5a4bd4454dabc171925252907";

  function fetchWeather(city) {
    if (!city) return;

    // Replace "Odisha" with an actual city name for WeatherAPI
    if (city.toLowerCase() === "odisha") {
      city = "Bhubaneswar";
    }

    const todayURL = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=no`;
    const yesterdayURL = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${encodeURIComponent(city)}&dt=${getYesterdayDate()}`;

    // Fetch today/tomorrow
    fetch(todayURL)
      .then(res => res.json())
      .then(data => {
        const current = data.current;
        const forecastDays = data.forecast.forecastday;

        if (current) {
          document.getElementById("current-temp").textContent = `Temperature: ${current.temp_c}°C`;
          document.getElementById("current-humidity").textContent = `Humidity: ${current.humidity}%`;
          document.getElementById("current-wind").textContent = `Wind Speed: ${current.wind_kph} km/h`;
          document.getElementById("current-condition").textContent = `Condition: ${current.condition.text}`;
        }

        if (forecastDays[0] && forecastDays[0].astro) {
          document.getElementById("sunrise-time").textContent = `Timming: ${forecastDays[0].astro.sunrise}`;
          document.getElementById("sunset-time").textContent = `Timming: ${forecastDays[0].astro.sunset}`;
          document.getElementById("sunrise-direction").textContent = `Direction: East`;
          document.getElementById("sunset-direction").textContent = `Direction: West`;
        }

        if (forecastDays[1] && forecastDays[1].day) {
          const tday = forecastDays[1].day;
          document.getElementById("tomorrow-temp").textContent = `Temperature: ${tday.avgtemp_c}°C`;
          document.getElementById("tomorrow-humidity").textContent = `Humidity: ${tday.avghumidity}%`;
          document.getElementById("tomorrow-wind").textContent = `Wind Speed: ${tday.maxwind_kph} km/h`;
          document.getElementById("tomorrow-condition").textContent = `Condition: ${tday.condition.text}`;
        }
      });

    // Fetch yesterday
    fetch(yesterdayURL)
      .then(res => res.json())
      .then(data => {
        if (data.forecast && data.forecast.forecastday[0]) {
          const yDay = data.forecast.forecastday[0].day;
          document.getElementById("yesterday-temp").textContent = `Temperature: ${yDay.avgtemp_c}°C`;
          document.getElementById("yesterday-humidity").textContent = `Humidity: ${yDay.avghumidity}%`;
          document.getElementById("yesterday-wind").textContent = `Wind Speed: ${yDay.maxwind_kph} km/h`;
          document.getElementById("yesterday-condition").textContent = `Condition: ${yDay.condition.text}`;
        }
      });
  }

  function getYesterdayDate() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  document.querySelectorAll("#search-options p").forEach(option => {
    option.addEventListener("click", () => {
      const city = option.textContent.trim();
      fetchWeather(city);
    });
  });
});
