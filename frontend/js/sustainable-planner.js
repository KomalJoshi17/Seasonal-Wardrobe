// Initialize theme
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    if (typeof initializeTheme === 'function') {
        initializeTheme();
    }
    
    // Add event listeners
    document.getElementById('searchBtn').addEventListener('click', getWeatherForecast);
    document.getElementById('cityInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getWeatherForecast();
        }
    });
    
    // Theme toggle functionality is now handled in theme.js
});

// Weather API key
const weatherApiKey = '093a44f57ca807d2b7a6f6b1163da88c';
// Gemini API key
const geminiApiKey = 'AIzaSyABWll1qHfrauwsTZqcnp_B7baRZUtG3jI';

// Get weather forecast
async function getWeatherForecast() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'flex';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('weekPlan').style.display = 'none';
    
    try {
        // Fetch 5-day forecast
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${weatherApiKey}`);
        
        if (!forecastResponse.ok) {
            throw new Error('Weather data not found');
        }
        
        const forecastData = await forecastResponse.json();
        
        // Get daily forecasts (one per day)
        const dailyForecasts = extractDailyForecasts(forecastData);
        
        // Generate sustainable outfit plans using Gemini API
        const outfitPlans = await generateOutfitPlans(dailyForecasts);
        
        // Display the plans
        displayWeekPlan(city, dailyForecasts, outfitPlans);
        
        // Generate and display sustainability tips
        const sustainabilityTips = await generateSustainabilityTips(dailyForecasts);
        displaySustainabilityTips(sustainabilityTips);
        
        // Calculate and display sustainability score
        calculateSustainabilityScore(outfitPlans);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('errorMessage').style.display = 'flex';
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// Extract one forecast per day from the 5-day forecast data
function extractDailyForecasts(forecastData) {
    const dailyForecasts = [];
    const processedDates = new Set();
    
    forecastData.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dateString = date.toISOString().split('T')[0];
        
        if (!processedDates.has(dateString)) {
            processedDates.add(dateString);
            dailyForecasts.push({
                date: date,
                temp: forecast.main.temp,
                feels_like: forecast.main.feels_like,
                humidity: forecast.main.humidity,
                weather: forecast.weather[0],
                wind: forecast.wind
            });
        }
    });
    
    // Limit to 5 days
    return dailyForecasts.slice(0, 5);
}

// Generate sustainable outfit plans using Gemini API
async function generateOutfitPlans(dailyForecasts) {
    try {
        // Prepare weather data for Gemini
        const weatherSummary = dailyForecasts.map((forecast, index) => {
            const date = forecast.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            return `Day ${index + 1} (${date}): ${Math.round(forecast.temp)}°C, ${forecast.weather.description}, humidity ${forecast.humidity}%, wind ${forecast.wind.speed} m/s`;
        }).join('\n');
        
        // Call Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiApiKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a sustainable fashion expert. Create a 5-day sustainable outfit plan based on the following weather forecast. For each day, suggest a complete outfit that is both weather-appropriate and environmentally friendly.

Weather forecast:
${weatherSummary}

For each day, provide:
1. A complete outfit description (top, bottom, layers, etc.)
2. Materials to look for (e.g., organic cotton, recycled polyester)
3. A sustainability tip specific to that outfit
4. A sustainability score from 1-100 for the outfit

Format your response as a JSON array with 5 objects, one for each day, with properties: "outfit", "materials", "tip", and "score". Keep each outfit description concise but detailed enough to be helpful.`
                    }]
                }]
            })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            
            // Extract JSON from the response
            const jsonMatch = textResponse.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        
        // Fallback if parsing fails
        return generateFallbackOutfitPlans(dailyForecasts);
        
    } catch (error) {
        console.error('Error generating outfit plans:', error);
        return generateFallbackOutfitPlans(dailyForecasts);
    }
}

// Generate fallback outfit plans if the API call fails
function generateFallbackOutfitPlans(dailyForecasts) {
    return dailyForecasts.map(forecast => {
        const temp = forecast.temp;
        let outfit, materials, tip;
        
        if (temp < 10) {
            outfit = "Warm sweater, thermal leggings, winter coat, scarf, and beanie";
            materials = "Recycled wool, organic cotton, and responsibly sourced down";
            tip = "Layer your clothing for warmth instead of turning up the heat at home";
        } else if (temp < 20) {
            outfit = "Light sweater, jeans, and a medium jacket";
            materials = "Organic cotton, recycled denim, and tencel";
            tip = "Choose versatile pieces that can be styled multiple ways to reduce consumption";
        } else {
            outfit = "Breathable t-shirt, shorts or skirt, and a light cardigan for evening";
            materials = "Organic cotton, hemp, or linen";
            tip = "Air dry your clothes instead of using a dryer to save energy";
        }
        
        return {
            outfit: outfit,
            materials: materials,
            tip: tip,
            score: Math.floor(Math.random() * 20) + 70 // Random score between 70-90
        };
    });
}

// Generate sustainability tips using Gemini API
async function generateSustainabilityTips(dailyForecasts) {
    try {
        // Calculate average temperature
        const avgTemp = dailyForecasts.reduce((sum, forecast) => sum + forecast.temp, 0) / dailyForecasts.length;
        
        // Determine dominant weather condition
        const weatherCounts = {};
        dailyForecasts.forEach(forecast => {
            const condition = forecast.weather.main;
            weatherCounts[condition] = (weatherCounts[condition] || 0) + 1;
        });
        
        let dominantWeather = Object.keys(weatherCounts).reduce((a, b) => 
            weatherCounts[a] > weatherCounts[b] ? a : b
        );
        
        // Call Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiApiKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate 4 practical sustainability tips for fashion and clothing care based on the following weather conditions:
- Average temperature: ${Math.round(avgTemp)}°C
- Dominant weather condition: ${dominantWeather}

For each tip, provide:
1. A title (3-5 words)
2. A detailed explanation (1-2 sentences)
3. An appropriate Font Awesome icon name (e.g., "tint" for water-related tips, "recycle" for recycling tips)

Format your response as a JSON array with 4 objects, each with properties: "title", "content", and "icon".`
                    }]
                }]
            })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            
            // Extract JSON from the response
            const jsonMatch = textResponse.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        
        // Fallback if parsing fails
        return generateFallbackSustainabilityTips();
        
    } catch (error) {
        console.error('Error generating sustainability tips:', error);
        return generateFallbackSustainabilityTips();
    }
}

// Generate fallback sustainability tips if the API call fails
function generateFallbackSustainabilityTips() {
    return [
        {
            title: "Wash Less, Save More",
            content: "Only wash clothes when truly necessary to conserve water and energy while extending garment life.",
            icon: "tint"
        },
        {
            title: "Thrift Before New",
            content: "Check second-hand stores before buying new to reduce environmental impact and save money.",
            icon: "recycle"
        },
        {
            title: "Repair, Don't Replace",
            content: "Learn basic mending skills to fix minor damages instead of discarding clothing items.",
            icon: "tools"
        },
        {
            title: "Quality Over Quantity",
            content: "Invest in fewer, higher-quality pieces that will last longer rather than fast fashion items.",
            icon: "star"
        }
    ];
}

// Display the week plan
function displayWeekPlan(city, forecasts, outfitPlans) {
    document.getElementById('cityName').textContent = city;
    document.getElementById('weekPlan').style.display = 'block';
    
    const planCardsContainer = document.getElementById('planCards');
    planCardsContainer.innerHTML = '';
    
    forecasts.forEach((forecast, index) => {
        const date = forecast.date;
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const outfitPlan = outfitPlans[index];
        
        const weatherIcon = getWeatherIcon(forecast.weather.main);
        
        const planCard = document.createElement('div');
        planCard.className = 'plan-card';
        planCard.innerHTML = `
            <div class="plan-card-header">
                <h3>${dayName}, ${dateStr}</h3>
            </div>
            <div class="plan-card-weather">
                <i class="${weatherIcon}"></i>
                <div class="weather-details">
                    <div class="weather-temp">${Math.round(forecast.temp)}°C</div>
                    <div class="weather-desc">${forecast.weather.description}</div>
                </div>
            </div>
            <div class="plan-card-outfit">
                <h4>Sustainable Outfit</h4>
                <div class="outfit-item">
                    <i class="fas fa-tshirt"></i>
                    <p>${outfitPlan.outfit}</p>
                </div>
                <div class="outfit-item">
                    <i class="fas fa-leaf"></i>
                    <p><strong>Materials:</strong> ${outfitPlan.materials}</p>
                </div>
                <div class="outfit-item">
                    <i class="fas fa-lightbulb"></i>
                    <p><strong>Tip:</strong> ${outfitPlan.tip}</p>
                </div>
                <div class="sustainability-badge">
                    Sustainability Score: ${outfitPlan.score}/100
                </div>
            </div>
        `;
        
        planCardsContainer.appendChild(planCard);
    });
}

// Display sustainability tips
function displaySustainabilityTips(tips) {
    const tipsContainer = document.getElementById('sustainabilityTips');
    tipsContainer.innerHTML = '';
    
    tips.forEach(tip => {
        const tipCard = document.createElement('div');
        tipCard.className = 'tip-card';
        tipCard.innerHTML = `
            <i class="fas fa-${tip.icon}"></i>
            <div class="tip-content">
                <h4>${tip.title}</h4>
                <p>${tip.content}</p>
            </div>
        `;
        
        tipsContainer.appendChild(tipCard);
    });
}

// Calculate and display sustainability score
function calculateSustainabilityScore(outfitPlans) {
    // Calculate average score
    const totalScore = outfitPlans.reduce((sum, plan) => sum + plan.score, 0);
    const averageScore = Math.round(totalScore / outfitPlans.length);
    
    // Update score display
    document.getElementById('scoreValue').textContent = averageScore;
    document.getElementById('scoreIndicator').style.width = `${averageScore}%`;
    
    // Update score message
    const scoreMessage = document.getElementById('scoreMessage');
    if (averageScore >= 90) {
        scoreMessage.textContent = 'Excellent! Your planned outfits have an outstanding environmental impact.';
    } else if (averageScore >= 75) {
        scoreMessage.textContent = 'Great job! Your planned outfits have a positive environmental impact.';
    } else if (averageScore >= 60) {
        scoreMessage.textContent = 'Good start! There are still some ways to improve your fashion sustainability.';
    } else {
        scoreMessage.textContent = 'Consider making more sustainable choices in your outfit planning.';
    }
}

// Get weather icon based on weather condition
function getWeatherIcon(condition) {
    const iconMap = {
        'Clear': 'fas fa-sun',
        'Clouds': 'fas fa-cloud',
        'Rain': 'fas fa-cloud-rain',
        'Drizzle': 'fas fa-cloud-rain',
        'Thunderstorm': 'fas fa-bolt',
        'Snow': 'fas fa-snowflake',
        'Mist': 'fas fa-smog',
        'Smoke': 'fas fa-smog',
        'Haze': 'fas fa-smog',
        'Dust': 'fas fa-smog',
        'Fog': 'fas fa-smog',
        'Sand': 'fas fa-wind',
        'Ash': 'fas fa-wind',
        'Squall': 'fas fa-wind',
        'Tornado': 'fas fa-wind'
    };
    
    return iconMap[condition] || 'fas fa-cloud';
}