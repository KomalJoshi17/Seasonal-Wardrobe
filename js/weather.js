const API_KEY = '093a44f57ca807d2b7a6f6b1163da88c';
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const resetBtn = document.getElementById('resetBtn');

// Load default city when page loads
window.addEventListener('load', () => {
    const currentWeather = document.querySelector('.current-weather');
    const outfitDesc = document.querySelector('.outfit-desc');
    const forecastCards = document.querySelector('.forecast-cards');
    
    // Show empty state
    currentWeather.innerHTML = `
        <div class="weather-icon">
            <i class="fas fa-cloud" style="opacity: 0.5"></i>
        </div>
        <div class="temperature" style="opacity: 0.5">--°C</div>
        <div class="city-name" style="opacity: 0.5">Enter a city</div>
        <div class="weather-desc" style="opacity: 0.5">No data available</div>
    `;
    
    // Clear outfit recommendation and forecast
    outfitDesc.innerHTML = '';
    forecastCards.innerHTML = '';
});

// Weather API Functions
async function getWeatherData(city) {
    try {
        const currentWeather = document.querySelector('.current-weather');
        currentWeather.innerHTML = '<div class="loading">Loading weather data...</div>';

        // Test API key first
        const testResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}`);
        if (!testResponse.ok) {
            throw new Error('Invalid API key or API is not responding');
        }

        // Fetch current weather
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentWeatherData = await weatherResponse.json();

        // Fetch forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available');
        }
        
        const forecastData = await forecastResponse.json();

        // Update UI
        updateWeatherUI(currentWeatherData);
        updateForecastUI(forecastData);
        
        // Save successful search
        localStorage.setItem('lastSearchedCity', city);

    } catch (error) {
        console.error('Weather API Error:', error);
        const currentWeather = document.querySelector('.current-weather');
        currentWeather.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${error.message || 'Failed to fetch weather data. Please try again.'}</p>
            </div>`;
    }
}

function updateWeatherUI(data) {
    const currentWeather = document.querySelector('.current-weather');
    const weatherIcon = getWeatherIcon(data.weather[0].main);
    
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    currentWeather.innerHTML = `
        <div class="weather-icon">
            <i class="${weatherIcon}" data-weather="${data.weather[0].main}"></i>
        </div>
        <div class="temperature">${Math.round(data.main.temp)}°C</div>
        <div class="city-name">${data.name}</div>
        <div class="weather-desc">${data.weather[0].description}</div>
        <div class="weather-details">
            <div class="detail">
                <i class="fas fa-tint"></i>
                <span>Humidity: ${data.main.humidity}%</span>
            </div>
            <div class="detail">
                <i class="fas fa-wind"></i>
                <span>Wind: ${Math.round(data.wind.speed * 3.6)} km/h</span>
            </div>
            <div class="detail">
                <i class="fas fa-sun"></i>
                <span>Sunrise: ${sunrise}</span>
            </div>
            <div class="detail">
                <i class="fas fa-moon"></i>
                <span>Sunset: ${sunset}</span>
            </div>
        </div>
    `;

    // Call updateOutfitRecommendation with current weather data
    updateOutfitRecommendation(
        data.main.temp,
        data.main.humidity,
        data.wind.speed
    );
}

function updateOutfitRecommendation(temperature, humidity, windSpeed) {
    try {
        const outfitDesc = document.querySelector('.outfit-desc');
        if (!outfitDesc) {
            console.error('Outfit description element not found');
            return;
        }

        let recommendation = {
            clothing: '',
            colors: '',
            accessories: '',
            footwear: ''
        };

        // Temperature based recommendations
        if (temperature < 10) {
            recommendation.clothing = 'Heavy winter coat, scarf, gloves, and warm layers';
            recommendation.colors = 'Deep navy, burgundy, forest green, or charcoal gray';
            recommendation.accessories = 'Wool scarf, leather gloves, and warm beanie';
            recommendation.footwear = 'Insulated waterproof boots with warm socks';
        } else if (temperature < 20) {
            recommendation.clothing = 'Light jacket or sweater with long sleeves';
            recommendation.colors = 'Olive green, camel, light gray, or dusty blue';
            recommendation.accessories = 'Light scarf, leather bag, and simple jewelry';
            recommendation.footwear = 'Leather ankle boots or comfortable sneakers';
        } else if (temperature < 25) {
            recommendation.clothing = 'Light layers, t-shirt with optional light cardigan';
            recommendation.colors = 'Pastels, light blue, sage green, or soft yellow';
            recommendation.accessories = 'Sunglasses, canvas tote, and minimal jewelry';
            recommendation.footwear = 'Canvas sneakers or comfortable loafers';
        } else {
            recommendation.clothing = 'Light, breathable clothing, shorts or summer dress';
            recommendation.colors = 'White, light pink, sky blue, or mint green';
            recommendation.accessories = 'Wide-brim hat, sunglasses, and light scarf';
            recommendation.footwear = 'Sandals, espadrilles, or breathable sneakers';
        }

        // Weather condition adjustments
        if (humidity > 80) {
            recommendation.clothing += '. Choose moisture-wicking fabrics';
            recommendation.footwear += ' with moisture-wicking socks';
        }
        if (windSpeed > 20) {
            recommendation.accessories += ', windproof jacket';
        }

        outfitDesc.innerHTML = `
            <div class="outfit-section">
                <p><i class="fas fa-tshirt"></i> <strong>Clothing:</strong> ${recommendation.clothing}</p>
                <p><i class="fas fa-palette"></i> <strong>Colors:</strong> ${recommendation.colors}</p>
                <p><i class="fas fa-gem"></i> <strong>Accessories:</strong> ${recommendation.accessories}</p>
                <p><i class="fas fa-shoe-prints"></i> <strong>Footwear:</strong> ${recommendation.footwear}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error updating outfit recommendation:', error);
    }
}

function updateForecastUI(data) {
    const forecastCards = document.querySelector('.forecast-cards');
    forecastCards.innerHTML = '';
    
    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0);

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const weatherIcon = getWeatherIcon(day.weather[0].main);
        const iconColor = getWeatherIconColor(day.weather[0].main);
        
        forecastCards.innerHTML += `
            <div class="forecast-card">
                <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <i class="${weatherIcon}" style="color: ${iconColor}"></i>
                <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
                <div class="forecast-desc">${day.weather[0].description}</div>
                <div class="forecast-details">
                    <div class="forecast-detail">
                        <i class="fas fa-tint" style="color: #2196f3"></i>
                        <span>${day.main.humidity}%</span>
                    </div>
                    <div class="forecast-detail">
                        <i class="fas fa-wind" style="color: #64b5f6"></i>
                        <span>${Math.round(day.wind.speed * 3.6)} km/h</span>
                    </div>
                </div>
            </div>
        `;
    });
}

function getWeatherIconColor(weatherType) {
    const colors = {
        'Clear': '#ffd700', // Gold for sun
        'Clouds': '#8c9eff', // Light blue for clouds
        'Rain': '#4fc3f7', // Blue for rain
        'Snow': '#e1f5fe', // Light cyan for snow
        'Thunderstorm': '#5c6bc0', // Indigo for storm
        'Drizzle': '#81d4fa', // Light blue for drizzle
        'Mist': '#b0bec5' // Grey for mist
    };
    return colors[weatherType] || '#78909c';
}

function getWeatherIcon(weatherType) {
    const icons = {
        'Clear': 'fas fa-sun',
        'Clouds': 'fas fa-cloud',
        'Rain': 'fas fa-cloud-rain',
        'Snow': 'fas fa-snowflake',
        'Thunderstorm': 'fas fa-bolt',
        'Drizzle': 'fas fa-cloud-rain',
        'Mist': 'fas fa-smog'
    };
    return icons[weatherType] || 'fas fa-cloud';
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// Add some CSS for the forecast cards
const style = document.createElement('style');
style.textContent = `
    .forecast-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .forecast-card {
        background: var(--card-background);
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: var(--shadow);
    }

    .forecast-card i {
        font-size: 2rem;
        margin: 0.5rem 0;
        color: var(--primary-color);
    }

    .theme-toggle {
        cursor: pointer;
        font-size: 1.2rem;
    }

    .theme-toggle i {
        color: var(--text-color);
    }
`;
document.head.appendChild(style);

// Reset functionality
resetBtn.addEventListener('click', () => {
    cityInput.value = '';
    const currentWeather = document.querySelector('.current-weather');
    const outfitDesc = document.querySelector('.outfit-desc');
    const forecastCards = document.querySelector('.forecast-cards');
    
    // Clear weather display
    currentWeather.innerHTML = `
        <div class="weather-icon">
            <i class="fas fa-cloud" style="opacity: 0.5"></i>
        </div>
        <div class="temperature" style="opacity: 0.5">--°C</div>
        <div class="city-name" style="opacity: 0.5">Enter a city</div>
        <div class="weather-desc" style="opacity: 0.5">No data available</div>
    `;
    
    // Clear outfit recommendation
    outfitDesc.innerHTML = '';
    
    // Clear forecast
    forecastCards.innerHTML = '';
    
    // Remove from localStorage
    localStorage.removeItem('lastSearchedCity');
});
// Update the getWeatherData function
async function getWeatherData(city) {
    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`)
        ]);

        if (!weatherResponse.ok || !forecastResponse.ok) {
            throw new Error('City not found');
        }

        const currentWeatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        updateWeatherUI(currentWeatherData);
        updateForecastUI(forecastData);
        localStorage.setItem('lastSearchedCity', city);

    } catch (error) {
        const currentWeather = document.querySelector('.current-weather');
        currentWeather.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i><p>City not found</p></div>`;
    }
}
