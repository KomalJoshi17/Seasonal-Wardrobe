from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import requests
from dotenv import load_dotenv
from outfit import outfit_bp  # Import the outfit blueprint

app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app)

# Register the outfit blueprint
app.register_blueprint(outfit_bp, url_prefix='/outfit')

# Load API key and configure Gemini
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY", "AIzaSyABWll1qHfrauwsTZqcnp_B7baRZUtG3jI")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

# Weather API key
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", '093a44f57ca807d2b7a6f6b1163da88c')

# Initialize chat history
chat_history = {}

@app.route('/')
def serve_index():
    return send_from_directory(os.path.dirname(__file__), 'index.html')

@app.route('/bot.html')
def serve_bot():
    return send_from_directory(os.path.dirname(__file__), 'bot.html')

@app.route('/outfit-analyzer.html')
def serve_analyzer():
    return send_from_directory(os.path.dirname(__file__), 'outfit-analyzer.html')

@app.route('/energy-tips.html')
def serve_energy_tips():
    return send_from_directory(os.path.dirname(__file__), 'energy-tips.html')

# Add the energy/weather endpoint
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

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        session_id = data.get('session_id', 'default')
        
        # Initialize chat for this session if it doesn't exist
        if session_id not in chat_history:
            chat_history[session_id] = model.start_chat(
                history=[
                    {
                        "role": "user",
                        "parts": ["You are a helpful wardrobe assistant. Your primary goal is to help users organize their clothing by season, suggest outfit combinations, create packing lists, and plan seasonal transitions. Keep your responses focused on clothing, fashion, and wardrobe organization. Be concise but thorough."]
                    },
                    {
                        "role": "model",
                        "parts": ["I'll be your seasonal wardrobe assistant! I can help you organize clothing by season, suggest outfit combinations, create packing lists, and plan seasonal transitions. How can I help with your wardrobe today?"]
                    }
                ]
            )
        
        # Get response from the model
        response = chat_history[session_id].send_message(user_message)
        
        return jsonify({
            'response': response.text,
            'session_id': session_id
        })
        
    except Exception as e:
        print(f"Chat API Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)