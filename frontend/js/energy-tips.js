document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const currentWeather = document.querySelector('.current-weather');
    const energyTips = document.querySelector('.energy-tips');
    
    // Event Listeners
    searchBtn.addEventListener('click', getWeatherData);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            getWeatherData();
        }
    });
    
    // Functions
    function getWeatherData() {
        const city = cityInput.value.trim();
        if (!city) return;
        
        // Show loading state
        currentWeather.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Loading weather data...</p></div>';
        energyTips.innerHTML = '';
        
        fetch(`/energy/weather?city=${encodeURIComponent(city)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showError(data.error);
                    return;
                }
                
                displayWeatherData(data);
                generateEnergyTips(data);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Failed to fetch weather data. Please try again.');
            });
    }
    
    function displayWeatherData(data) {
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const weatherIcon = getWeatherIcon(data.weather[0].icon);
        const weatherDesc = data.weather[0].description;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        
        currentWeather.innerHTML = `
            <div class="weather-info">
                <div class="weather-main">
                    <div class="city-name">${data.name}, ${data.sys.country}</div>
                    <div class="weather-icon-temp">
                        <i class="${weatherIcon}"></i>
                        <div class="temperature">${temp}°C</div>
                    </div>
                    <div class="weather-description">${weatherDesc}</div>
                </div>
                <div class="weather-details">
                    <div class="detail">
                        <i class="fas fa-thermometer-half"></i>
                        <span>Feels like: ${feelsLike}°C</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-tint"></i>
                        <span>Humidity: ${humidity}%</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-wind"></i>
                        <span>Wind: ${windSpeed} m/s</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    function generateEnergyTips(data) {
        const temp = data.main.temp;
        const weatherCondition = data.weather[0].main.toLowerCase();
        
        let tips = [];
        
        // Temperature-based tips
        if (temp < 10) {
            tips.push({
                icon: 'fas fa-home',
                title: 'Heating Efficiency',
                content: 'Keep your thermostat between 18-20°C. Each degree lower can save up to 10% on your heating bill.'
            });
            tips.push({
                icon: 'fas fa-door-closed',
                title: 'Prevent Heat Loss',
                content: 'Check for drafts around windows and doors. Use draft stoppers or weather stripping to seal gaps.'
            });
        } else if (temp > 25) {
            tips.push({
                icon: 'fas fa-fan',
                title: 'Cooling Efficiency',
                content: 'Use fans instead of air conditioning when possible. They use up to 50 times less electricity.'
            });
            tips.push({
                icon: 'fas fa-sun',
                title: 'Manage Sunlight',
                content: 'Close blinds or curtains during the hottest part of the day to keep your home cooler naturally.'
            });
        }
        
        // Weather condition based tips
        if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
            tips.push({
                icon: 'fas fa-tint',
                title: 'Rainwater Collection',
                content: 'Consider collecting rainwater for watering plants and gardens, reducing water consumption.'
            });
        } else if (weatherCondition.includes('clear') || weatherCondition.includes('sun')) {
            tips.push({
                icon: 'fas fa-solar-panel',
                title: 'Solar Opportunity',
                content: 'Great day for solar energy! If you have solar panels, run energy-intensive appliances during daylight hours.'
            });
        } else if (weatherCondition.includes('cloud')) {
            tips.push({
                icon: 'fas fa-lightbulb',
                title: 'Lighting Efficiency',
                content: 'On cloudy days, ensure you\'re using LED bulbs which use up to 80% less energy than traditional bulbs.'
            });
        }
        
        // Always include general tips
        tips.push({
            icon: 'fas fa-plug',
            title: 'Standby Power',
            content: 'Unplug electronics or use smart power strips to eliminate standby power consumption, which can account for 10% of home energy use.'
        });
        
        // Display tips
        let tipsHTML = '<h2><i class="fas fa-leaf"></i> Energy Saving Tips</h2>';
        tips.forEach(tip => {
            tipsHTML += `
                <div class="tip-card">
                    <div class="tip-icon"><i class="${tip.icon}"></i></div>
                    <div class="tip-content">
                        <h3>${tip.title}</h3>
                        <p>${tip.content}</p>
                    </div>
                </div>
            `;
        });
        
        energyTips.innerHTML = tipsHTML;
    }
    
    function showError(message) {
        currentWeather.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
        energyTips.innerHTML = '';
    }
    
    function getWeatherIcon(iconCode) {
        // Map OpenWeather icons to Font Awesome icons
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-rain',
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };
        
        return iconMap[iconCode] || 'fas fa-cloud';
    }
});