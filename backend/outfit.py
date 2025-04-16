from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
import base64
import io
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create blueprint
outfit_bp = Blueprint('outfit', __name__)

# Configure Gemini model
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

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
        
        # Convert image to RGB if it's in RGBA mode (this can fix some issues)
        if image.mode == 'RGBA':
            image = image.convert('RGB')
            
        # Save image to a temporary file to ensure it's properly formatted for Gemini
        temp_path = "temp_image.jpg"
        image.save(temp_path)
        
        # Load the image for Gemini
        image_for_model = Image.open(temp_path)
        
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
        
        response = model.generate_content([prompt, image_for_model])
        analysis = response.text
        
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
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
    Ask a specific question about an outfit image
    """
    try:
        data = request.json
        image_data = data.get('image', '')
        question = data.get('question', '')
        
        if not image_data or not question:
            return jsonify({'error': 'Image data and question are required'}), 400
        
        # Remove the data URL prefix if present
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert image to RGB if it's in RGBA mode
        if image.mode == 'RGBA':
            image = image.convert('RGB')
            
        # Save image to a temporary file
        temp_path = "temp_image.jpg"
        image.save(temp_path)
        
        # Load the image for Gemini
        image_for_model = Image.open(temp_path)
        
        # Generate response to the question
        prompt = f"""
        Look at this outfit image and answer the following question:
        
        {question}
        
        Provide a detailed and helpful response.
        """
        
        response = model.generate_content([prompt, image_for_model])
        answer = response.text
        
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return jsonify({
            'success': True,
            'answer': answer
        })
        
    except Exception as e:
        print(f"Outfit Question Error: {str(e)}")
        return jsonify({'error': f'Failed to process question: {str(e)}'}), 500