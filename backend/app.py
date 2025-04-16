from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import requests
from dotenv import load_dotenv
from outfit import outfit_bp  # Import the outfit blueprint

# Load environment variables
load_dotenv()

app = Flask(__name__, static_url_path='', static_folder='../frontend')
CORS(app)

# Register the outfit blueprint
app.register_blueprint(outfit_bp, url_prefix='/outfit')

# API keys from .env
api_key = os.getenv("GEMINI_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")


# Configure Gemini model
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro-vision')


# Chat history for each session
chat_history = {}

# Serve HTML files from frontend folder
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/bot.html')
def serve_bot():
    return send_from_directory(app.static_folder, 'bot.html')

@app.route('/outfit-analyzer.html')
def serve_analyzer():
    return send_from_directory(app.static_folder, 'outfit-analyzer.html')

@app.route('/energy-tips.html')
def serve_energy_tips():
    return send_from_directory(app.static_folder, 'energy-tips.html')

# Weather API endpoint
@app.route('/energy/weather')
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'Please provide a city name'}), 400

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={WEATHER_API_KEY}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return jsonify(response.json())
        return jsonify({'error': 'City not found or API error'}), response.status_code
    except Exception as e:
        return jsonify({'error': f'Weather API Error: {str(e)}'}), 500

# Chatbot endpoint
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id', 'default')

    if session_id not in chat_history:
        chat_history[session_id] = model.start_chat(
            history=[
                {
                    "role": "user",
                    "parts": ["You are a helpful wardrobe assistant. Your primary goal is to help users organize their clothing by season, suggest outfit combinations, create packing lists, and plan seasonal transitions."]
                },
                {
                    "role": "model",
                    "parts": ["I'll be your seasonal wardrobe assistant! I can help you organize clothing by season, suggest outfit combinations, create packing lists, and plan seasonal transitions. How can I help with your wardrobe today?"]
                }
            ]
        )

    try:
        response = chat_history[session_id].send_message(user_message)
        return jsonify({'response': response.text, 'session_id': session_id})
    except Exception as e:
        return jsonify({'error': f'Chat API Error: {str(e)}'}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)

