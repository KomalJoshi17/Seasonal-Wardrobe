from flask import Blueprint, request, jsonify
import os
import base64
import google.generativeai as genai
from PIL import Image
import io
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create a Blueprint for outfit routes
outfit_bp = Blueprint('outfit', __name__)

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY", "AIzaSyABWll1qHfrauwsTZqcnp_B7baRZUtG3jI")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-pro')

@outfit_bp.route('/analyze', methods=['POST'])
def analyze_outfit():
    """
    Analyze an outfit image using Gemini API
    """
    try:
        data = request.json
        image_data = data.get('image', '')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Remove the data URL prefix if present
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Generate analysis using Gemini
        prompt = """
        Analyze this outfit image and provide detailed feedback on:
        1. Style identification (casual, formal, sporty, etc.)
        2. Color coordination and palette
        3. Fit and silhouette
        4. Occasion appropriateness
        5. Seasonal suitability
        6. Suggested accessories or modifications
        
        Format your response in a clear, structured way with sections for each aspect.
        """
        
        response = model.generate_content([prompt, image])
        analysis = response.text
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        print(f"Outfit Analysis Error: {str(e)}")
        return jsonify({'error': f'Failed to analyze outfit: {str(e)}'}), 500

@outfit_bp.route('/ask', methods=['POST'])
def ask_about_outfit():
    """
    Ask specific questions about an outfit image
    """
    try:
        data = request.json
        image_data = data.get('image', '')
        question = data.get('question', '')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
            
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        # Remove the data URL prefix if present
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Generate response using Gemini
        prompt = f"""
        Look at this outfit image and answer the following question:
        {question}
        
        Provide a helpful, detailed response focused specifically on the outfit in the image.
        """
        
        response = model.generate_content([prompt, image])
        answer = response.text
        
        return jsonify({
            'success': True,
            'answer': answer
        })
        
    except Exception as e:
        print(f"Outfit Question Error: {str(e)}")
        return jsonify({'error': f'Failed to process question: {str(e)}'}), 500