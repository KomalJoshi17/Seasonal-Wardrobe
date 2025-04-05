from flask import Flask, send_from_directory, request, jsonify
import os
import requests
from dotenv import load_dotenv

app = Flask(__name__, static_url_path='', static_folder='.')

# Load environment variables
load_dotenv()

# Weather API key
WEATHER_API_KEY = '093a44f57ca807d2b7a6f6b1163da88c'

# Create a directory for the outfit images if it doesn't exist
os.makedirs('animated-outfits', exist_ok=True)

@app.route('/')
def serve_index():
    return send_from_directory(os.path.dirname(__file__), 'animated-outfits.html')

@app.route('/weather')
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

@app.route('/animated-outfits/<path:filename>')
def serve_outfit_images(filename):
    # This is a placeholder route for serving outfit images
    # In a real implementation, you would have actual images in the animated-outfits directory
    
    # For demonstration, we'll create a placeholder image if it doesn't exist
    if filename == 'placeholder.png' and not os.path.exists(os.path.join('animated-outfits', filename)):
        create_placeholder_image('animated-outfits/placeholder.png', 'Please enter a city to see outfit')
    
    if filename == 'error.png' and not os.path.exists(os.path.join('animated-outfits', filename)):
        create_placeholder_image('animated-outfits/error.png', 'Error loading outfit')
    
    # Create gender and temperature-based outfit placeholders
    genders = ['male', 'female']
    temps = ['cold', 'cool', 'warm', 'hot']
    views = ['front', 'side']
    
    for gender in genders:
        for temp in temps:
            for view in views:
                img_name = f"{gender}-{temp}-{view}.png"
                if img_name == filename and not os.path.exists(os.path.join('animated-outfits', img_name)):
                    create_placeholder_image(f'animated-outfits/{img_name}', f"{gender.capitalize()} {temp} weather outfit ({view} view)")
    
    return send_from_directory('animated-outfits', filename)

def create_placeholder_image(path, text):
    """
    Creates a simple placeholder image with text.
    In a real implementation, you would have actual outfit images.
    This is just for demonstration purposes.
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # Create a blank image with a light background
        img = Image.new('RGB', (400, 600), color=(240, 240, 245))
        d = ImageDraw.Draw(img)
        
        # Try to use a default font
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()
        
        # Add text to the image
        text_width = d.textlength(text, font=font)
        d.text(((400-text_width)/2, 300), text, fill=(70, 70, 80), font=font)
        
        # Save the image
        img.save(path)
        print(f"Created placeholder image: {path}")
    except Exception as e:
        print(f"Error creating placeholder image: {e}")
        # If PIL is not available, we'll just create an empty file
        with open(path, 'wb') as f:
            f.write(b'')

if __name__ == '__main__':
    # Make sure the theme.js file exists
    if not os.path.exists('js'):
        os.makedirs('js', exist_ok=True)
    
    if not os.path.exists('js/theme.js'):
        with open('js/theme.js', 'w') as f:
            f.write("""
// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.querySelector('.theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply the saved theme
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Toggle theme when clicked
    themeToggle.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
});
            """)
    
    # Create CSS directory and style.css if they don't exist
    if not os.path.exists('css'):
        os.makedirs('css', exist_ok=True)
    
    if not os.path.exists('css/style.css'):
        with open('css/style.css', 'w') as f:
            f.write("""
/* Base styles and theme variables */
:root {
    --primary-color: #4a90e2;
    --secondary-color: #63cdda;
    --background-color: #f5f7fa;
    --card-background: #ffffff;
    --text-color: #333333;
    --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --danger-color: #e74c3c;
}

[data-theme="dark"] {
    --primary-color: #5c9ce0;
    --secondary-color: #63cdda;
    --background-color: #1a1a2e;
    --card-background: #16213e;
    --text-color: #e6e6e6;
    --shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    --danger-color: #e74c3c;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
    min-height: 100vh;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: var(--card-background);
    box-shadow: var(--shadow);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.nav-links {
    display: flex;
    gap: 1.5rem;
}

.nav-links a {
    color: var(--text-color);
    text-decoration: none;
    padding: 0.5rem 0;
    transition: color 0.3s ease;
    position: relative;
}

.nav-links a:hover, .nav-links a.active {
    color: var(--primary-color);
}

.nav-links a::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: var(--primary-color);
    transition: width 0.3s ease;
}

.nav-links a:hover::after, .nav-links a.active::after {
    width: 100%;
}

.theme-toggle {
    font-size: 1.2rem;
    color: var(--text-color);
    transition: color 0.3s ease;
}

.theme-toggle:hover {
    color: var(--primary-color);
}

@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        padding: 1rem;
    }
    
    .nav-links {
        margin-top: 1rem;
        flex-wrap: wrap;
        justify-content: center;
    }
}
            """)
    
    print("Starting Animated Weather Outfits server...")
    app.run(debug=True, port=5001)