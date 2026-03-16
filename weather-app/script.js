// ============================================
// API CONFIGURATION
// ============================================
// INSTRUCTIONS TO USE REAL API:
// 1. Go to https://openweathermap.org/
// 2. Sign up for free account
// 3. Get your API key from dashboard
// 4. Replace the API_KEY below with your key
// 5. Wait 10-15 minutes for API key to activate

const API_KEY = '9efb70409163ede52df9453d34f44d68'; // Your OpenWeatherMap API key
let CITY = 'Hanoi'; // Default city
let COUNTRY = 'VN'; // Default country
let currentLocation = null; // Store detected location

// Geolocation detection
async function detectLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.log('🚫 Geolocation not supported by this browser');
      reject('Geolocation not supported');
      return;
    }

    console.log('📍 Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log(`📍 Location detected: ${lat.toFixed(2)}, ${lon.toFixed(2)}`);

        try {
          // Get city name from coordinates
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
          );

          if (response.ok) {
            const locationData = await response.json();
            if (locationData.length > 0) {
              const location = locationData[0];
              currentLocation = { lat, lon };
              CITY = location.name;
              COUNTRY = location.country;

              console.log(`🏙️ Detected city: ${CITY}, ${COUNTRY}`);

              // Update location display
              document.querySelector('.location h1').textContent = `${CITY}, ${getCountryName(COUNTRY)}`;

              resolve({ lat, lon, city: CITY, country: COUNTRY });
            } else {
              reject('Location not found');
            }
          } else {
            reject('Failed to get location name');
          }
        } catch (error) {
          console.log('❌ Error getting location name:', error);
          reject(error);
        }
      },
      (error) => {
        console.log('❌ Geolocation error:', error.message);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log('🚫 User denied location access');
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('📍 Location information unavailable');
            break;
          case error.TIMEOUT:
            console.log('⏰ Location request timeout');
            break;
        }
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

// Get full country name
function getCountryName(countryCode) {
  const countries = {
    'VN': 'Vietnam',
    'US': 'United States',
    'GB': 'United Kingdom',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'TH': 'Thailand',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'AU': 'Australia',
    'CA': 'Canada',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'BR': 'Brazil',
    'IN': 'India',
    'RU': 'Russia'
  };
  return countries[countryCode] || countryCode;
}

// Test API key function
async function testAPIKey() {
  if (API_KEY === 'demo-mode' || !API_KEY || API_KEY === 'your-api-key-here') {
    console.log('🎭 Using demo mode');
    return false;
  }

  try {
    console.log('🔑 Testing API key...');
    const testResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}&units=metric`
    );

    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ API key is valid!', data.name, data.main.temp + '°C');
      return true;
    } else {
      const errorData = await testResponse.json();
      console.log('❌ API key test failed:', errorData.message);
      console.log('💡 Solutions:');
      console.log('   1. Check if API key is correct');
      console.log('   2. Wait 10-15 minutes for new API key to activate');
      console.log('   3. Get a new API key from https://openweathermap.org/');
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

const tabs = document.querySelectorAll('.tab-btn');
const hourlyForecast = document.querySelector('.hourly-forecast');

let currentWeatherData = null;

const weatherData = {
  temperature: [],
  precipitation: [],
  wind: [],
  'air-quality': [],
  'uv-index': [],
  sunset: []
};

async function fetchWeatherData() {
  // First try to detect location
  try {
    await detectLocation();
    console.log(`🌍 Using detected location: ${CITY}, ${COUNTRY}`);
  } catch (error) {
    console.log(`🏠 Using default location: ${CITY}, ${COUNTRY}`);
  }

  // Test API key first
  const isAPIValid = await testAPIKey();

  if (!isAPIValid) {
    console.log('🔄 Using demo data instead...');
    useDemoData();
    return;
  }

  try {
    console.log('🌤️ Fetching real weather data for', CITY, '...');

    let weatherUrl, forecastUrl;

    if (currentLocation) {
      // Use coordinates for more accurate data
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${API_KEY}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${API_KEY}&units=metric`;
    } else {
      // Use city name
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&appid=${API_KEY}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY},${COUNTRY}&appid=${API_KEY}&units=metric`;
    }

    // Current weather
    const currentResponse = await fetch(weatherUrl);

    if (!currentResponse.ok) {
      throw new Error(`HTTP error! status: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();
    console.log('📊 Current weather:', currentData.name, currentData.main.temp + '°C', currentData.weather[0].description);

    // 5-day forecast
    const forecastResponse = await fetch(forecastUrl);

    if (!forecastResponse.ok) {
      throw new Error(`HTTP error! status: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();
    console.log('📈 Forecast data loaded:', forecastData.list.length, 'data points');

    // Air quality
    const airQualityResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${API_KEY}`
    );
    const airQualityData = await airQualityResponse.json();
    console.log('🌬️ Air quality loaded');

    currentWeatherData = {
      current: currentData,
      forecast: forecastData,
      airQuality: airQualityData
    };

    console.log('✅ All real weather data loaded successfully!');
    updateCurrentWeather();
    updateWeatherData();
    updateHourlyForecast('temperature');

  } catch (error) {
    console.error('❌ Error fetching weather data:', error);
    console.log('🔄 Falling back to demo data...');
    useDemoData();
  }
}

function updateCurrentWeather() {
  if (!currentWeatherData) return;

  const current = currentWeatherData.current;

  // Update temperature
  document.querySelector('.temp-value').textContent = Math.round(current.main.temp);

  // Update weather status
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  document.querySelector('.weather-status').textContent =
    `${current.weather[0].description.charAt(0).toUpperCase() + current.weather[0].description.slice(1)}, ${timeString}`;

  // Update weather details
  document.querySelector('.weather-details').innerHTML = `
    <div class="detail-item">
      <span class="label">Precipitation:</span>
      <span class="value">${current.rain ? Math.round(current.rain['1h'] || 0) : 0}%</span>
    </div>
    <div class="detail-item">
      <span class="label">Humidity:</span>
      <span class="value">${current.main.humidity}%</span>
    </div>
    <div class="detail-item">
      <span class="label">Wind:</span>
      <span class="value">${Math.round(current.wind.speed * 3.6)} km/h</span>
    </div>
    <div class="detail-item">
      <span class="label">UV Index:</span>
      <span class="value">${currentWeatherData.airQuality ? Math.round(currentWeatherData.airQuality.list[0].components.o3 / 100) : 'N/A'}</span>
    </div>
  `;

  // Update weather icon
  updateWeatherIcon(current.weather[0].main);
}

function updateWeatherIcon(weatherMain) {
  const iconElement = document.querySelector('.weather-icon svg');

  let iconSVG = '';

  switch (weatherMain.toLowerCase()) {
    case 'clear':
      iconSVG = `
        <circle cx="50" cy="50" r="20" fill="#FFD700"/>
        <g stroke="#FFD700" stroke-width="3" stroke-linecap="round">
          <line x1="50" y1="15" x2="50" y2="25"/>
          <line x1="50" y1="75" x2="50" y2="85"/>
          <line x1="15" y1="50" x2="25" y2="50"/>
          <line x1="75" y1="50" x2="85" y2="50"/>
          <line x1="25.86" y1="25.86" x2="32.93" y2="32.93"/>
          <line x1="67.07" y1="67.07" x2="74.14" y2="74.14"/>
          <line x1="74.14" y1="25.86" x2="67.07" y2="32.93"/>
          <line x1="32.93" y1="67.07" x2="25.86" y2="74.14"/>
        </g>
      `;
      break;
    case 'clouds':
      iconSVG = `
        <ellipse cx="35" cy="45" rx="20" ry="15" fill="#87CEEB"/>
        <ellipse cx="55" cy="40" rx="25" ry="18" fill="#B0C4DE"/>
        <ellipse cx="45" cy="55" rx="22" ry="16" fill="#D3D3D3"/>
      `;
      break;
    case 'rain':
      iconSVG = `
        <ellipse cx="50" cy="35" rx="25" ry="18" fill="#696969"/>
        <g stroke="#4169E1" stroke-width="2" stroke-linecap="round">
          <line x1="40" y1="55" x2="38" y2="70"/>
          <line x1="50" y1="55" x2="48" y2="70"/>
          <line x1="60" y1="55" x2="58" y2="70"/>
        </g>
      `;
      break;
    default:
      iconSVG = `
        <circle cx="35" cy="35" r="15" fill="#FFD700" opacity="0.8"/>
        <ellipse cx="65" cy="45" rx="25" ry="18" fill="#666" opacity="0.7"/>
      `;
  }

  iconElement.innerHTML = iconSVG;
}

function updateWeatherData() {
  if (!currentWeatherData) return;

  const forecast = currentWeatherData.forecast.list.slice(0, 8);

  // Temperature data
  weatherData.temperature = forecast.map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    }),
    value: `${Math.round(item.main.temp)}°`,
    icon: '🌡️'
  }));

  // Precipitation data
  weatherData.precipitation = forecast.map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    }),
    value: `${Math.round((item.pop || 0) * 100)}%`,
    icon: '💧'
  }));

  // Wind data
  weatherData.wind = forecast.map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    }),
    value: `${Math.round(item.wind.speed * 3.6)} km/h`,
    icon: '💨'
  }));

  // Air quality (simplified)
  weatherData['air-quality'] = forecast.map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    }),
    value: ['Good', 'Fair', 'Poor'][Math.floor(Math.random() * 3)],
    icon: '🍃'
  }));

  // UV Index (estimated based on time)
  weatherData['uv-index'] = forecast.map(item => {
    const hour = new Date(item.dt * 1000).getHours();
    let uvIndex = 0;
    if (hour >= 6 && hour <= 18) {
      uvIndex = Math.max(0, Math.round(10 * Math.sin((hour - 6) * Math.PI / 12)));
    }
    return {
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      }),
      value: uvIndex.toString(),
      icon: hour >= 6 && hour <= 18 ? '☀️' : '🌙'
    };
  });

  // Sunset/Sunrise
  const sunrise = new Date(currentWeatherData.current.sys.sunrise * 1000);
  const sunset = new Date(currentWeatherData.current.sys.sunset * 1000);

  weatherData.sunset = forecast.map(item => {
    const itemTime = new Date(item.dt * 1000);
    const hour = itemTime.getHours();

    let value, icon;
    if (hour < sunrise.getHours()) {
      value = 'Night';
      icon = '🌙';
    } else if (hour === sunrise.getHours()) {
      value = 'Sunrise';
      icon = '🌅';
    } else if (hour < sunset.getHours()) {
      value = `${sunset.getHours() - hour}h to sunset`;
      icon = '☀️';
    } else if (hour === sunset.getHours()) {
      value = 'Sunset';
      icon = '🌅';
    } else {
      value = 'Night';
      icon = '🌙';
    }

    return {
      time: itemTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      }),
      value,
      icon
    };
  });

  // Update weekly forecast
  updateWeeklyForecast();
}

function updateWeeklyForecast() {
  if (!currentWeatherData) return;

  const dailyData = {};

  // Group forecast data by day
  currentWeatherData.forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();

    if (!dailyData[dayKey]) {
      dailyData[dayKey] = {
        temps: [],
        weather: item.weather[0].main,
        date: date
      };
    }
    dailyData[dayKey].temps.push(item.main.temp);
  });

  const weeklyForecast = document.querySelector('.weekly-forecast');
  const days = Object.values(dailyData).slice(0, 7);

  weeklyForecast.innerHTML = days.map((day, index) => {
    const dayName = index === 0 ? 'Today' :
      day.date.toLocaleDateString('en-US', { weekday: 'short' });

    const minTemp = Math.round(Math.min(...day.temps));
    const maxTemp = Math.round(Math.max(...day.temps));

    const weatherIcon = getWeatherEmoji(day.weather);

    return `
      <div class="day-item">
        <div class="day">${dayName}</div>
        <div class="weather-icon-small">${weatherIcon}</div>
        <div class="temp-range">${maxTemp}° / ${minTemp}°</div>
      </div>
    `;
  }).join('');
}

function getWeatherEmoji(weatherMain) {
  switch (weatherMain.toLowerCase()) {
    case 'clear': return '☀️';
    case 'clouds': return '☁️';
    case 'rain': return '🌧️';
    case 'snow': return '❄️';
    case 'thunderstorm': return '⛈️';
    case 'drizzle': return '🌦️';
    case 'mist':
    case 'fog': return '🌫️';
    default: return '⛅';
  }
}

function useDemoData() {
  console.log('📊 Loading realistic demo data for Hanoi...');

  // Simulate realistic Hanoi weather data
  const now = new Date();
  const hour = now.getHours();

  // Base temperature varies by time of day
  let baseTemp = 25; // Default 25°C
  if (hour >= 6 && hour < 12) baseTemp = 22; // Morning: cooler
  else if (hour >= 12 && hour < 18) baseTemp = 28; // Afternoon: warmer
  else if (hour >= 18 && hour < 22) baseTemp = 26; // Evening: moderate
  else baseTemp = 23; // Night: cool

  // Update current weather display
  document.getElementById('currentTemp').textContent = baseTemp;
  document.getElementById('locationName').textContent = `${CITY}, ${getCountryName(COUNTRY)}`;

  // Update weather status with current time
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const weatherConditions = ['Partly Cloudy', 'Mostly Sunny', 'Light Haze', 'Clear'];
  const currentCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

  document.querySelector('.weather-status').textContent = `${currentCondition}, ${timeString}`;

  // Update weather details with realistic Hanoi data
  document.getElementById('weatherDetails').innerHTML = `
    <div class="detail-item">
      <span class="label">Precipitation:</span>
      <span class="value">${Math.floor(Math.random() * 20)}%</span>
    </div>
    <div class="detail-item">
      <span class="label">Humidity:</span>
      <span class="value">${60 + Math.floor(Math.random() * 25)}%</span>
    </div>
    <div class="detail-item">
      <span class="label">Wind:</span>
      <span class="value">${8 + Math.floor(Math.random() * 8)} km/h</span>
    </div>
    <div class="detail-item">
      <span class="label">UV Index:</span>
      <span class="value">${hour >= 10 && hour <= 16 ? Math.floor(Math.random() * 8) + 3 : Math.floor(Math.random() * 3)}</span>
    </div>
  `;

  // Generate realistic hourly temperature data
  weatherData.temperature = [];
  for (let i = 0; i < 8; i++) {
    const futureHour = (hour + i * 3) % 24;
    let temp = baseTemp;

    // Adjust temperature based on time of day
    if (futureHour >= 6 && futureHour < 12) temp = baseTemp - 2;
    else if (futureHour >= 12 && futureHour < 18) temp = baseTemp + 2;
    else if (futureHour >= 18 && futureHour < 22) temp = baseTemp;
    else temp = baseTemp - 3;

    temp += Math.floor(Math.random() * 4) - 2; // Add some variation

    const timeStr = futureHour === 0 ? '12am' :
      futureHour < 12 ? `${futureHour}am` :
        futureHour === 12 ? '12pm' : `${futureHour - 12}pm`;

    weatherData.temperature.push({
      time: timeStr,
      value: `${temp}°`,
      icon: '🌡️'
    });
  }

  // Generate realistic precipitation data
  weatherData.precipitation = weatherData.temperature.map(item => ({
    time: item.time,
    value: `${Math.floor(Math.random() * 30)}%`,
    icon: '💧'
  }));

  // Generate realistic wind data
  weatherData.wind = weatherData.temperature.map(item => ({
    time: item.time,
    value: `${8 + Math.floor(Math.random() * 8)} km/h`,
    icon: '💨'
  }));

  // Generate air quality data
  const airQualityLevels = ['Good', 'Fair', 'Moderate'];
  weatherData['air-quality'] = weatherData.temperature.map(item => ({
    time: item.time,
    value: airQualityLevels[Math.floor(Math.random() * airQualityLevels.length)],
    icon: '🍃'
  }));

  // Generate UV index data
  weatherData['uv-index'] = weatherData.temperature.map(item => {
    const itemHour = parseInt(item.time);
    const isAM = item.time.includes('am');
    const hour24 = isAM ? (itemHour === 12 ? 0 : itemHour) : (itemHour === 12 ? 12 : itemHour + 12);

    let uvIndex = 0;
    if (hour24 >= 6 && hour24 <= 18) {
      uvIndex = Math.max(0, Math.round(8 * Math.sin((hour24 - 6) * Math.PI / 12)));
    }

    return {
      time: item.time,
      value: uvIndex.toString(),
      icon: hour24 >= 6 && hour24 <= 18 ? '☀️' : '🌙'
    };
  });

  // Generate sunset/sunrise data
  weatherData.sunset = weatherData.temperature.map(item => {
    const itemHour = parseInt(item.time);
    const isAM = item.time.includes('am');
    const hour24 = isAM ? (itemHour === 12 ? 0 : itemHour) : (itemHour === 12 ? 12 : itemHour + 12);

    let value, icon;
    if (hour24 < 6) {
      value = 'Night';
      icon = '🌙';
    } else if (hour24 === 6) {
      value = 'Sunrise';
      icon = '🌅';
    } else if (hour24 < 18) {
      value = `${18 - hour24}h to sunset`;
      icon = '☀️';
    } else if (hour24 === 18) {
      value = 'Sunset';
      icon = '🌅';
    } else {
      value = 'Night';
      icon = '🌙';
    }

    return {
      time: item.time,
      value,
      icon
    };
  });

  // Update weekly forecast with realistic data
  updateWeeklyForecastDemo();

  // Start with temperature tab
  updateHourlyForecast('temperature');

  console.log('✅ Demo data loaded successfully!');
}

function updateWeeklyForecastDemo() {
  const weeklyForecast = document.querySelector('.weekly-forecast');
  const days = ['Today', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
  const icons = ['⛅', '☀️', '🌤️', '☁️', '🌦️', '☀️', '⛅'];

  const baseTemp = 25;

  weeklyForecast.innerHTML = days.map((day, index) => {
    const maxTemp = baseTemp + Math.floor(Math.random() * 6) - 1; // 24-30°C
    const minTemp = maxTemp - (5 + Math.floor(Math.random() * 5)); // 5-10°C lower

    return `
      <div class="day-item">
        <div class="day">${day}</div>
        <div class="weather-icon-small">${icons[index]}</div>
        <div class="temp-range">${maxTemp}° / ${minTemp}°</div>
      </div>
    `;
  }).join('');
}

function updateHourlyForecast(type) {
  const data = weatherData[type];

  if (!data || data.length === 0) {
    useDemoData();
    return;
  }

  hourlyForecast.innerHTML = data.map(item => `
    <div class="hour-item">
      <div class="time">${item.time}</div>
      <div class="wind-speed">${item.value}</div>
      <div class="wind-icon">${item.icon}</div>
    </div>
  `).join('');
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const tabType = tab.dataset.tab;
    updateHourlyForecast(tabType);
  });
});

function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (currentWeatherData) {
    const current = currentWeatherData.current;
    const statusElement = document.querySelector('.weather-status');
    statusElement.textContent = `${current.weather[0].description.charAt(0).toUpperCase() + current.weather[0].description.slice(1)}, ${timeString}`;
  }
}

// Initialize app
fetchWeatherData();
setInterval(updateTime, 60000);
setInterval(fetchWeatherData, 600000); // Update weather every 10 minutes

// Location detection button
document.getElementById('detectLocationBtn').addEventListener('click', async () => {
  const btn = document.getElementById('detectLocationBtn');
  btn.classList.add('loading');
  btn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';

  try {
    await detectLocation();
    console.log('🔄 Refreshing weather data for new location...');
    await fetchWeatherData();

    btn.classList.remove('loading');
    btn.innerHTML = '<i class="bi bi-geo-alt-fill"></i>';
    btn.style.background = '#10b981';
    btn.style.color = 'white';
    btn.style.borderColor = '#10b981';

    setTimeout(() => {
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.innerHTML = '<i class="bi bi-geo-alt"></i>';
    }, 2000);

  } catch (error) {
    console.log('❌ Failed to detect location');
    btn.classList.remove('loading');
    btn.innerHTML = '<i class="bi bi-exclamation-triangle"></i>';
    btn.style.background = '#ef4444';
    btn.style.color = 'white';
    btn.style.borderColor = '#ef4444';

    setTimeout(() => {
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.innerHTML = '<i class="bi bi-geo-alt"></i>';
    }, 2000);
  }
});