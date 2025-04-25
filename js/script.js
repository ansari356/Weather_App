const WEATHER_API_KEY = "cb301aa38e9dbd9559f4f7bf62688659";
const UNITS = "metric";

// DOM Elements
const elements = {
    cityInput: document.getElementById("city-input"),
    searchBtn: document.getElementById("search-btn"),
    citySelect: document.getElementById("city-select"),
    weatherIcon: document.getElementById("weather-icon"),
    temperature: document.querySelector(".temperature"),
    dateTime: document.querySelector(".date-time"),
    weatherDesc: document.querySelector(".weather-description"),
    rainChance: document.querySelector(".rain-chance"),
    location: document.querySelector(".location"),
    windValue: document.querySelector(".detail-card:nth-child(1) .detail-value"),
    windExtra: document.querySelector(".detail-card:nth-child(1) .detail-extra"),
    humidityValue: document.querySelector(".detail-card:nth-child(2) .detail-value"),
    humidityExtra: document.querySelector(".detail-card:nth-child(2) .detail-extra"),
    sunriseTime: document.querySelector(".sun-time:nth-child(1) span:nth-child(2)"),
    sunriseDiff: document.querySelector(".sun-time:nth-child(1) .time-diff"),
    sunsetTime: document.querySelector(".sun-time:nth-child(2) span:nth-child(2)"),
    sunsetDiff: document.querySelector(".sun-time:nth-child(2) .time-diff"),
    airQualityValue: document.querySelector(".detail-card:nth-child(4) .detail-value"),
    airQualityExtra: document.querySelector(".detail-card:nth-child(4) .detail-extra"),
    clearBtn: document.createElement('button'),
    themeToggle: document.getElementById("theme-toggle"),
    logoutBtn: document.getElementById("logout-btn"),
    sidebar: document.querySelector(".sidebar"),
    body: document.body
};

// Cities data
const Cities = [
    { city: "New York", code: "US", fullName: "New York, US" },
    { city: "Los Angeles", code: "US", fullName: "Los Angeles, US" },
    { city: "Chicago", code: "US", fullName: "Chicago, US" },
    { city: "London", code: "UK", fullName: "London, UK" },
    { city: "Paris", code: "FR", fullName: "Paris, FR" },
    { city: "Berlin", code: "DE", fullName: "Berlin, DE" },
    { city: "Madrid", code: "ES", fullName: "Madrid, ES" },
    { city: "Rome", code: "IT", fullName: "Rome, IT" },
    { city: "Amsterdam", code: "NL", fullName: "Amsterdam, NL" },
    { city: "Moscow", code: "RU", fullName: "Moscow, RU" },
    { city: "Beijing", code: "CN", fullName: "Beijing, CN" },
    { city: "Shanghai", code: "CN", fullName: "Shanghai, CN" },
    { city: "Tokyo", code: "JP", fullName: "Tokyo, JP" },
    { city: "Seoul", code: "KR", fullName: "Seoul, KR" },
    { city: "Bangkok", code: "TH", fullName: "Bangkok, TH" },
    { city: "Jakarta", code: "ID", fullName: "Jakarta, ID" },
    { city: "Mumbai", code: "IN", fullName: "Mumbai, IN" },
    { city: "New Delhi", code: "IN", fullName: "New Delhi, IN" },
    { city: "Dubai", code: "AE", fullName: "Dubai, AE" },
    { city: "Riyadh", code: "SA", fullName: "Riyadh, SA" },
    { city: "Istanbul", code: "TR", fullName: "Istanbul, TR" },
    { city: "Cairo", code: "EG", fullName: "Cairo, EG" },
    { city: "Johannesburg", code: "ZA", fullName: "Johannesburg, ZA" },
    { city: "Sydney", code: "AU", fullName: "Sydney, AU" },
    { city: "Melbourne", code: "AU", fullName: "Melbourne, AU" },
    { city: "São Paulo", code: "BR", fullName: "São Paulo, BR" },
    { city: "Buenos Aires", code: "AR", fullName: "Buenos Aires, AR" },
    { city: "Mexico City", code: "MX", fullName: "Mexico City, MX" },
    { city: "Toronto", code: "CA", fullName: "Toronto, CA" },
    { city: "Vancouver", code: "CA", fullName: "Vancouver, CA" }
];


// Initialize the app
function init() {
    setupDropdown();
    setupClearButton();
    setupEventListeners();
    updateDateTime();
    checkThemePreference();
    
    // Check for current user
    const currentUser = localStorage.getItem("currentUser");
    
    if (currentUser) {
        // Load user data
        const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`)) || {};
        
        if (userData.lastSearch) {
            // User has previous search
            fetchWeather(userData.lastSearch.city, userData.lastSearch.country);
        } else {
            // New user - first time login
            showGreeting();
        }
    } else {
        // No user logged in (shouldn't happen as we redirect to login)
        showGreeting();
    }
}

// Setup dropdown with cities
function setupDropdown() {
    Cities.forEach(city => {
        const option = document.createElement('option');
        option.value = `${city.city},${city.code}`;
        option.textContent = city.fullName;
        option.dataset.search = `${city.city.toLowerCase()} ${city.code.toLowerCase()}`;
        elements.citySelect.appendChild(option);
    });

    elements.cityInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const options = elements.citySelect.options;
        
        for (let i = 1; i < options.length; i++) {
            const option = options[i];
            // if (option.dataset.search.includes(searchTerm)) {
            //     option.style.display = '';
            // } else {
            //     option.style.display = 'none';
            // }
        }
    });

    elements.citySelect.addEventListener('change', function() {
        if (this.value) {
            const [city, code] = this.value.split(',');
            elements.cityInput.value = city;
            fetchWeather(city, code);
        }
    });
}

// Setup clear button for search input
function setupClearButton() {
    elements.clearBtn.innerHTML = '<i class="fas fa-times"></i>';
    elements.clearBtn.className = 'clear-btn';
    elements.clearBtn.addEventListener('click', () => {
        elements.cityInput.value = '';
        elements.cityInput.focus();
        elements.clearBtn.style.display = 'none';
        elements.cityInput.parentNode.classList.remove('has-input');
    });
    
    elements.cityInput.parentNode.appendChild(elements.clearBtn);
    
    elements.cityInput.addEventListener('input', function() {
        if (this.value) {
            this.parentNode.classList.add('has-input');
            elements.clearBtn.style.display = 'block';
        } else {
            this.parentNode.classList.remove('has-input');
            elements.clearBtn.style.display = 'none';
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    elements.searchBtn.addEventListener("click", handleSearch);
    elements.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSearch();
    });
    elements.cityInput.addEventListener('input', function() {
        handleChange();
    });

    elements.themeToggle.addEventListener("click", toggleTheme);
    elements.logoutBtn.addEventListener("click", handleLogout);
}

// Handle logout

function handleLogout() {
    // Clear current user and login status
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    
    // Show logout confirmation
    alert("Logout successful!");
    
    // Redirect to login page
    window.location.href = "../html/login.html";
}

// Check user's theme preference
function checkThemePreference() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "dark-theme" || (!savedTheme && prefersDark)) {
        elements.body.classList.add("dark-theme");
        updateThemeIcon();
    }
}

// Toggle between light and dark theme
function toggleTheme() {
    elements.body.classList.toggle("dark-theme");
    const theme = elements.body.classList.contains("dark-theme") ? "dark-theme" : "light-theme";
    localStorage.setItem("theme", theme);
    updateThemeIcon();
}

// Update theme toggle icon
function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector("i");
    if (elements.body.classList.contains("dark-theme")) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    }
}
function handleChange(){
    let input = elements.cityInput.value.trim();
    fetch('../cities_list.xlsx')
    .then(res => res.arrayBuffer())
    .then(data => {
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      var suggestions =  document.getElementById('suggestions');
      suggestions.innerHTML = '';
      let suggestionsCount = 0;
      for(let i = 0; i < json.length; i++) {
          if(json[i]['name'].toLowerCase().startsWith(input.toLowerCase())){
            const city = document.createElement("div");
            city.textContent = json[i]['name'];
            city.className = "suggestion search-box";
            suggestionsCount++;
            if(suggestionsCount > 10){
                break;
            }
            else{
                suggestions.appendChild(city);

            }
          city.onclick = () => {
                elements.cityInput.value = json[i]['name'];
                suggestions.innerHTML = '';
                fetchWeather(json[i]['name']);
            } 

          }
        }

      
    });
}
// Handle search action
function handleSearch() {
    const input = elements.cityInput.value.trim();
    if (input.includes(',')) {
        const [city, code] = input.split(',').map(s => s.trim());
        fetchWeather(city, code);
    } else {
        const foundCity = Cities.find(c => 
            c.city.toLowerCase() === input.toLowerCase()
        );
        
        if (foundCity) {
            fetchWeather(foundCity.city, foundCity.code);
        } else {
            fetchWeather(input);
        }
    }
}

// Set weather background based on condition
function setWeatherBackground(condition) {
    // Remove all weather background classes
    const weatherClasses = [
        'weather-bg-clear',
        'weather-bg-clouds',
        'weather-bg-rain',
        'weather-bg-thunderstorm',
        'weather-bg-snow',
        'weather-bg-mist'
    ];
    elements.sidebar.classList.remove(...weatherClasses);
    
    // Add appropriate class based on condition
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) {
        elements.sidebar.classList.add('weather-bg-clear');
    } else if (conditionLower.includes('cloud')) {
        elements.sidebar.classList.add('weather-bg-clouds');
    } else if (conditionLower.includes('rain')) {
        elements.sidebar.classList.add('weather-bg-rain');
    } else if (conditionLower.includes('thunder')) {
        elements.sidebar.classList.add('weather-bg-thunderstorm');
    } else if (conditionLower.includes('snow')) {
        elements.sidebar.classList.add('weather-bg-snow');
    } else {
        elements.sidebar.classList.add('weather-bg-mist');
    }
}

// Get wind direction from degrees
function getWindDirection(deg) {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    const index = Math.round(deg / 22.5);
    return directions[index];
}

// Update date and time display
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    elements.dateTime.textContent = now.toLocaleDateString("en-US", options);
    
    // Update every minute
    setTimeout(updateDateTime, 60000);
}

// Get air quality description
function getAirQualityDescription(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
}

// Calculate sunrise/sunset difference
function calculateSunTimeDifference(sunTime) {
    const now = new Date();
    const sunDate = new Date(sunTime * 1000);
    const diffMinutes = Math.floor((sunDate - now) / 60000);
    
    if (Math.abs(diffMinutes) < 60) {
        const prefix = diffMinutes > 0 ? "-" : "+";
        return `${prefix} ${Math.abs(diffMinutes)}m`;
    } else {
        const hours = Math.floor(Math.abs(diffMinutes) / 60);
        const minutes = Math.abs(diffMinutes) % 60;
        const prefix = diffMinutes > 0 ? "-" : "+";
        return `${prefix} ${hours}h ${minutes}m`;
    }
}

// Fetch weather data from API


async function fetchWeather(city, countryCode = '') {
    if (!city) return;
    
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}${countryCode ? `,${countryCode}` : ''}&appid=${WEATHER_API_KEY}&units=${UNITS}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod !== 200) {
            alert("Weather data not found. Please try another location.");
            return;
        }
        
        // Save search to user's history
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) {
            const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`)) || {};
            userData.lastSearch = {
                city: data.name,
                country: data.sys.country,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
        }
        
        updateUI(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Error fetching weather data. Please try again.");
    }
}


// Update UI with weather data
function updateUI(data) {
    // Save the last searched location to localStorage
    // localStorage.setItem('lastSearchedCity', data.name);
    // localStorage.setItem('lastSearchedCountry', data.sys.country);
    
    // Update main weather info
    elements.temperature.textContent = `${Math.round(data.main.temp)}`;
    elements.weatherDesc.textContent = data.weather[0].main;
    elements.location.textContent = `${data.name}, ${data.sys.country}`;
    elements.rainChance.textContent = `Rain - ${data.clouds.all}%`;
    elements.weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    elements.weatherIcon.alt = data.weather[0].description;
    
    // Set weather background
    setWeatherBackground(data.weather[0].main);
    
    // ===== Enhanced Wind Card =====
    const windSpeed = data.wind.speed.toFixed(1);
    const windDirection = getWindDirection(data.wind.deg);
    const windGust = (data.wind.gust || data.wind.speed * 1.5).toFixed(1);
    
    elements.windValue.textContent = `${windSpeed} km/h`;
    elements.windExtra.textContent = `Wind Direction is ${windDirection}`;
    
    // Update additional wind info
    document.querySelector('.gust-value').textContent = `${windGust} km/h`;
    document.querySelector('.wind-direction').textContent = `${data.wind.deg}° ${windDirection}`;
    document.querySelector('.wind-card .progress-bar').style.width = `${Math.min(data.wind.speed / 30 * 100, 100)}%`;
    
    // ===== Enhanced Humidity Card =====
    const humidity = data.main.humidity;
    const dewPoint = (data.main.temp - (100 - humidity)/5).toFixed(1);
    let comfortLevel;
    
    if (humidity < 30) {
        comfortLevel = "Dry";
    } else if (humidity < 60) {
        comfortLevel = "Comfortable";
    } else {
        comfortLevel = "Humid";
    }
    
    elements.humidityValue.textContent = `${humidity}%`;
    elements.humidityExtra.textContent = comfortLevel;
    
    // Update additional humidity info
    document.querySelector('.dew-point').textContent = `${dewPoint}°C`;
    document.querySelector('.comfort-level').textContent = comfortLevel;
    document.querySelector('.humidity-card .progress-bar').style.width = `${humidity}%`;
    
    // ===== Enhanced Daylight Card =====
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    const dayLengthMs = sunset - sunrise;
    const dayLengthHours = Math.floor(dayLengthMs / (1000 * 60 * 60));
    const dayLengthMinutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60));
    const solarNoon = new Date(sunrise.getTime() + dayLengthMs/2);
    
    // Format times
    const sunriseTime = sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const sunsetTime = sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const solarNoonTime = solarNoon.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Update daylight info
    document.querySelector('.sunrise .sun-time-value').textContent = sunriseTime;
    document.querySelector('.sunset .sun-time-value').textContent = sunsetTime;
    document.querySelector('.sunrise .time-diff').textContent = calculateSunTimeDifference(data.sys.sunrise);
    document.querySelector('.sunset .time-diff').textContent = calculateSunTimeDifference(data.sys.sunset);
    document.querySelector('.day-length').textContent = `${dayLengthHours}h ${dayLengthMinutes}m`;
    document.querySelector('.solar-noon').textContent = solarNoonTime;
    
    // ===== Enhanced Air Quality Card =====
    // Note: OpenWeatherMap's free tier doesn't include air quality data
    // This is a simulated implementation - consider using AirVisual API for real data
    const baseAqi = Math.max(10, Math.min(
        (data.main.humidity / 2) + (data.wind.speed * 2) + (data.clouds.all / 4),
        300
    ));
    const aqi = Math.round(baseAqi + (Math.random() * 40 - 20));
    const aqiDescription = getAirQualityDescription(aqi);
    
    elements.airQualityValue.textContent = aqi;
    elements.airQualityExtra.textContent = aqiDescription;
    
    // Update additional air quality info
    document.querySelector('.pm25').textContent = `${(aqi * 0.7).toFixed(1)} μg/m³`;
    document.querySelector('.pm10').textContent = `${(aqi * 1.2).toFixed(1)} μg/m³`;
    document.querySelector('.air-quality-card .progress-bar').style.width = `${Math.min(aqi / 3, 100)}%`;
    
    // Update the progress bar color based on AQI level
    const aqiProgressBar = document.querySelector('.air-quality-card .progress-bar');
    if (aqi <= 50) {
        aqiProgressBar.style.backgroundColor = '#4CAF50'; // Good
    } else if (aqi <= 100) {
        aqiProgressBar.style.backgroundColor = '#FFEB3B'; // Moderate
    } else if (aqi <= 150) {
        aqiProgressBar.style.backgroundColor = '#FF9800'; // Unhealthy for sensitive
    } else if (aqi <= 200) {
        aqiProgressBar.style.backgroundColor = '#F44336'; // Unhealthy
    } else {
        aqiProgressBar.style.backgroundColor = '#9C27B0'; // Very unhealthy/Hazardous
    }
    
    // Update date/time
    updateDateTime();
    
    // Add card-specific classes for styling
    document.querySelector('.detail-card:nth-child(1)').classList.add('wind-card');
    document.querySelector('.detail-card:nth-child(2)').classList.add('humidity-card');
    document.querySelector('.detail-card:nth-child(4)').classList.add('air-quality-card');
}

// Show greeting message
function showGreeting() {
    const greetingMessages = [
        "Welcome to Weather App Search for a city to begin.",
        "Hello there! Check the weather in your city.",
        "Ready to check the weather? Enter a location!",
        "What's the weather like in your city today?"
    ];
    
    const randomMessage = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
    alert(randomMessage);
    
    // Set default empty state in UI
    elements.temperature.textContent = "--";
    elements.weatherDesc.textContent = "Search for a city";
    elements.location.textContent = "Weather App";
    elements.rainChance.textContent = "";
    elements.weatherIcon.src = "https://openweathermap.org/img/wn/01d@4x.png";
    
    // Clear weather details
    elements.windValue.textContent = "--";
    elements.windExtra.textContent = "--";
    elements.humidityValue.textContent = "--";
    elements.humidityExtra.textContent = "--";
    elements.sunriseTime.textContent = "--:-- AM";
    elements.sunriseDiff.textContent = "--";
    elements.sunsetTime.textContent = "--:-- PM";
    elements.sunsetDiff.textContent = "--";
    elements.airQualityValue.textContent = "--";
    elements.airQualityExtra.textContent = "--";
}


// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);