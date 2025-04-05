from flask import Flask, request, jsonify, send_file
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables
load_dotenv()
WEATHER_API_KEY = '093a44f57ca807d2b7a6f6b1163da88c'

@app.route('/')
def serve_energy_tips():
    return send_file('energy-tips.html')

@app.route('/energy/weather')
def get_weather():
    try:
        city = request.args.get('city')
        
        # Check if city parameter is provided
        if not city:
            return jsonify({'error': 'Please provide a city name'}), 400
            
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={WEATHER_API_KEY}"
        response = requests.get(url)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'City not found or API error'}), response.status_code
            
    except Exception as e:
        print(f"Weather API Error: {str(e)}")
        return jsonify({'error': 'Failed to fetch weather data'}), 500

if __name__ == '__main__':
    print("Starting Energy Tips Server...")
    app.run(debug=True, port=5001)