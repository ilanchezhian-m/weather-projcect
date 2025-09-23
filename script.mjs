
function toggleDropdown() {
  const menu = document.getElementById('dropdownmenu');
  // Toggle between none and flex
  if (menu.style.display === 'flex') {
    menu.style.display = 'none';
  } else {
    menu.style.display = 'flex';
  }
}

// Update label and close dropdown on day selection
document.querySelectorAll('.day-button').forEach(btn => {
  btn.addEventListener('click', function() {
    // Update the dropdown button label
    document.getElementById('dayDropdownBtn').childNodes[0].nodeValue = this.textContent + ' ';
    // Optionally, highlight the active day
    document.querySelectorAll('.day-button').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    // Close the dropdown
    document.getElementById('dropdownmenu').style.display = 'none';
  });
});


// 
document.addEventListener('click', function(event) {
  const menu = document.getElementById('dropdownmenu');
  const button = document.querySelector('.day-dropdown');
  if (!menu.contains(event.target) && !button.contains(event.target)) {
    menu.style.display = 'none';
  }
});




// API inputs 
function getWeatherIcon(weatherCode) {
  const codeMap = {
    0: "icon-sunny.webp",
    1: "icon-partly-cloudy.webp",
    2: "icon-overcast.webp",
    3: "icon-drizzle.webp",
    45: "icon-fog.webp",
    48: "icon-fog.webp",
    51: "icon-drizzle.webp",
    53: "icon-drizzle.webp",
    55: "icon-drizzle.webp",
    61: "icon-rain.webp",
    63: "icon-rain.webp",
    65: "icon-rain.webp",
    71: "icon-snow.webp",
    73: "icon-snow.webp",
    75: "icon-snow.webp",
    80: "icon-rain.webp",
    81: "icon-rain.webp",
    82: "icon-storm.webp",
    95: "icon-storm.webp",
  };
  return `/assets/images/${codeMap[weatherCode] || "icon-sunny.webp"}`;
}

async function getWeather() {
  const city = document.getElementById('cityInput').value;
  const weatherDIV = document.getElementById('weatherResult');
  const dateValue = document.getElementById('dateInput').value;

  // Format and display the date
  const displayDateElem = document.getElementById('displayDate');
  if (displayDateElem) {
    if (dateValue) {
      const dateObj = new Date(dateValue);
      const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
      displayDateElem.textContent = dateObj.toLocaleDateString('en-US', options);
    } else {
      const now = new Date();
      const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
      displayDateElem.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  // Step 1: Fetch coordinates
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
  try {
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherDIV.innerHTML = "city not found ";
      return;
    }
    weatherDIV.innerHTML = "";

    const { latitude, longitude, name, country } = geoData.results[0];
    document.getElementById('country').textContent = `${name}, ${country}`;

    // Step 2: Fetch weather data for those coordinates
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&hourly=temperature_2m,weathercode&current=relative_humidity_2m,temperature_2m,precipitation,wind_speed_10m&timezone=Asia%2FSingapore`;

    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();




lastWeatherData = weatherData;
renderHourlyForecast(weatherData);


    
const dateElem = document.getElementById('dateInput');
if (dateElem) {
  dateElem.style.display = ""; // Show it now
  const now = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  dateElem.textContent = now.toLocaleDateString('en-US', options);
}






    // Step 3: Update your UI
    if (weatherData.current) {
      document.getElementById('feels-like').textContent = weatherData.current.temperature_2m + '°';
      document.getElementById('humidity').textContent = weatherData.current.relative_humidity_2m + '%';
      document.getElementById('wind').textContent = weatherData.current.wind_speed_10m + ' km/h';
      document.getElementById('precipitation').textContent = weatherData.current.precipitation + ' mm';
      document.getElementById('degreeInput').textContent = weatherData.current.temperature_2m + '°';
    } else {
      weatherDIV.innerHTML = "Weather data not available!";
    }

    // 7-day daily forecast
    if (weatherData.daily) {
      const dailyContainer = document.getElementById('daily-forecast');
      dailyContainer.innerHTML = ""; // Clear previous content

      for (let i = 0; i < 7; i++) {
        const dateObj = new Date(weatherData.daily.time[i]);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = weatherData.daily.temperature_2m_max[i];
        const minTemp = weatherData.daily.temperature_2m_min[i];
        const weatherCode = weatherData.daily.weathercode[i];
        const iconSrc = getWeatherIcon(weatherCode);

        dailyContainer.innerHTML += `
          <div class="daily">
            <p class="daily-day">${dayName}</p>
            <img class="center-image" src="${iconSrc}" alt="">
            <div class="bottom-row">
              <span class="left-text">${Math.round(maxTemp)}°</span>
              <span class="right-text">${Math.round(minTemp)}°</span>
            </div>
          </div>
        `;
      }
    }
  } catch (error) {
    weatherDIV.innerHTML = "Error fetching data!";
    console.error(error);
  }
}



// units Button
const unitsBtn = document.getElementById('unitsBtn');
const unitsDropdown = document.getElementById('unitsDropdown');

unitsBtn.addEventListener('click', function(event) {
  event.stopPropagation();
  unitsDropdown.classList.toggle('open');
});

document.addEventListener('click', function(event) {
  if (!unitsDropdown.contains(event.target) && !unitsBtn.contains(event.target)) {
    unitsDropdown.classList.remove('open');
  }
});

// serch city suggestion

    const cityInput = document.getElementById("cityInput");
    const suggestionsBox = document.getElementById("suggestions");

    cityInput.addEventListener("input", async function () {
      const query = this.value.trim();
      if (query.length < 3) {
        suggestionsBox.innerHTML = "";
        return;
      }

      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
        );
        const data = await res.json();

        suggestionsBox.innerHTML = "";

        if (data.results) {
          data.results.forEach(city => {
            const div = document.createElement("div");
            div.textContent = `${city.name}, ${city.country}`;
            div.addEventListener("click", () => {
              cityInput.value = city.name;
              suggestionsBox.innerHTML = "";
              console.log("Selected city:", city); // has latitude & longitude
            });
            suggestionsBox.appendChild(div);
          });
        }
      } catch (err) {
        console.error("Error fetching city data", err);
      }
    });



    // hourly code 24 hours 1 hour time interval
    function renderHourlyForecast(weatherData, selectedDay = null) {
  const hours = weatherData.hourly.time;
  const temps = weatherData.hourly.temperature_2m;
  const codes = weatherData.hourly.weathercode;

  // Which day?
  let targetDate = selectedDay
    ? getDateForWeekday(selectedDay)
    : new Date().toISOString().slice(0, 10);

  const now = new Date();

  let hourlyData = [];
  for (let i = 0; i < hours.length; i++) {
    if (hours[i].startsWith(targetDate)) {
      const hourObj = new Date(hours[i]);
      if (targetDate === now.toISOString().slice(0, 10) && hourObj < now) continue;
      hourlyData.push({
        hourLabel: hourObj.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        temp: Math.round(temps[i]),
        code: codes[i],
      });
    }
  }

  const container = document.getElementById('hourly-forecast');
  container.innerHTML = '';
  hourlyData.forEach(h => {
    container.innerHTML += `
      <div class="hourly-forecast-scroll">
        <div class="single-side">
          <img class="clouds" src="${getWeatherIcon(h.code)}" alt="">
          <span class="box">${h.hourLabel}</span>
        </div>
        <span class="clouds-degree">${h.temp}°</span>
      </div>
    `;
  });
}

// Helper for week days
function getDateForWeekday(weekday) {
  const daysMap = {
    "Sunday": 0, "Monday": 1, "Tuesday": 2,
    "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6,
  };
  const today = new Date();
  const todayDay = today.getDay();
  let offset = daysMap[weekday] - todayDay;
  if (offset < 0) offset += 7;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + offset);
  return targetDate.toISOString().slice(0, 10);
}




let lastWeatherData = null; // Store globally


// In your day button event:
document.querySelectorAll('.day-button').forEach(btn => {
  btn.addEventListener('click', function() {
    const day = this.textContent.trim();
    if (lastWeatherData) {
      renderHourlyForecast(lastWeatherData, day);
    }
    // ... dropdown close and label update logic ...
  });
});


function renderHourlyEmptyBoxes(count = 12) {
  const container = document.getElementById('hourly-forecast');
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="hourly-forecast-scroll">
        <div class="single-side">
          <div class="box" style="width:48px;height:32px;background:;border-radius:8px;"></div>
        </div>
        <span class="clouds-degree"></span>
      </div>
    `;
  }
}

    function renderDailyEmptyBoxes(count=7){
      const container2 = document.getElementById('daily-forecast');
      container2.innerHTML = "";
      for (let i=0; i < count; i++){
        container2.innerHTML += `<div class="daily"  style="width:100px;height:130px;background:;border-radius:12px;">
            <p class="daily-day"></p>
            <img class="center-image" src="" alt="">
            <div class="bottom-row">
              <span class="left-text"></span>
              <span class="right-text"></span>
            </div>
          </div>`
        ;
      }
    }

    function renderCurrentData (){
      const container3 = document.getElementById('currentData');
        container3.innerHTML =`
    <div class="description skeleton-box"   >
      <p >Feels like </p>
    <p class="data " id="feels-like">-</p>
    </div>
    <div class="description">
      <P >Humidity</P>
      <p class="data" id="humidity">-</p>
    </div>
    <div class="description">
       <p >Wind</p>
       <p class="data" id="wind">-</p>
    </div>
    <div class="description">
      <p >Precipitation</p>
      <p class="data" id="precipitation">-</p>
    </div>
   </div>
    `;
}


function renderImageData (){
  const container4 = document.getElementById('bgImage')
  container4.innerHTML =
    `
    <img class="bigimage" src="/assets/images/bg-today-large.svg" alt="big background" >
    <div class="inner-container">
      <div class="location-info">
        <p class="city" id="country"></p>
        <p class="date" id="dateInput" style="display:none"></p>
      </div>
      <img class="sunicon" src="/assets/images/icon-sunny.webp" alt="sunny icon">
      <p class="degree" id="degreeInput" ></p>
    </div>`
}




// ... existing getWeather() logic ...

// After you've fetched weatherData and are ready to show real info:




window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cityInput').value = "Chennai";
  renderHourlyEmptyBoxes(); // Shows blank hourly slots until fetch
  renderDailyEmptyBoxes();
  renderCurrentData();
  renderImageData();

  getWeather();

});
