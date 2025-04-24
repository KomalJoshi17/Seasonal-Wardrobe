document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadBox = document.getElementById('uploadBox');
    const imageInput = document.getElementById('imageInput');
    const previewBox = document.getElementById('previewBox');
    const imagePreview = document.getElementById('imagePreview');
    const newImageBtn = document.getElementById('newImageBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analysisSection = document.getElementById('analysisSection');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Store the current image data
    let currentImageData = null;
    
    // Event Listeners
    uploadBox.addEventListener('click', () => imageInput.click());
    
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });
    
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImageFile(e.target.files[0]);
        }
    });
    
    newImageBtn.addEventListener('click', () => {
        previewBox.style.display = 'none';
        uploadBox.style.display = 'block';
        analysisSection.style.display = 'none';
        chatMessages.innerHTML = '';
        currentImageData = null;
    });
    
    analyzeBtn.addEventListener('click', analyzeOutfit);
    
    sendBtn.addEventListener('click', sendQuestion);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendQuestion();
        }
    });
    
    // Functions
    function analyzeOutfit() {
        if (!currentImageData) return;
        
        loadingOverlay.style.display = 'flex';
        
        fetch('/outfit/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: currentImageData
            })
        })
        .then(response => response.json())
        .then(data => {
            loadingOverlay.style.display = 'none';
            
            if (data.success) {
                analysisSection.style.display = 'block';
                const formattedAnalysis = formatAnalysis(data.analysis);
                addMessage('bot', formattedAnalysis);
            } else {
                alert('Error: ' + (data.error || 'Failed to analyze outfit'));
            }
        })
        .catch(error => {
            loadingOverlay.style.display = 'none';
            console.error('Error:', error);
            alert('Error analyzing outfit. Please try again.');
        });
    }
    
    function sendQuestion() {
        const question = userInput.value.trim();
        if (!question || !currentImageData) return;
        
        addMessage('user', question);
        userInput.value = '';
        
        loadingOverlay.style.display = 'flex';
        
        fetch('/outfit/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: currentImageData,
                question: question
            })
        })
        .then(response => response.json())
        .then(data => {
            loadingOverlay.style.display = 'none';
            
            if (data.success) {
                // Format the answer before adding it to the chat
                const formattedAnswer = formatAnalysis(data.answer);
                addMessage('bot', formattedAnswer);
            } else {
                alert('Error: ' + (data.error || 'Failed to process question'));
            }
        })
        .catch(error => {
            loadingOverlay.style.display = 'none';
            console.error('Error:', error);
            alert('Error processing question. Please try again.');
        });
    }
    
    function handleImageFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            currentImageData = e.target.result;
            imagePreview.src = currentImageData;
            uploadBox.style.display = 'none';
            previewBox.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }
    
    // Add this function to your analyzer.js file
    
    function formatAnalyzerMessage(messageElement) {
        // Find all text that looks like bullet points and convert to proper lists
        let html = messageElement.innerHTML;
        
        // Replace asterisks with proper bullet points
        html = html.replace(/\*\s+(.*?)(?=\n\*|\n\n|$)/g, '<li>$1</li>');
        
        // Wrap lists in ul tags
        if (html.includes('<li>')) {
            html = html.replace(/<li>(.*?)(?=<li>|$)/g, '<ul><li>$1</ul>');
            html = html.replace(/<\/ul><ul>/g, '');
        }
        
        // Format headings
        html = html.replace(/\n(#+)\s+(.*?)(?=\n)/g, function(match, hashes, text) {
            const level = hashes.length;
            return `<h${level+2}>${text}</h${level+2}>`;
        });
        
        // Format bold text
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Format italic text
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Add section dividers
        html = html.replace(/\n\n/g, '</div><div class="analysis-section">');
        html = '<div class="analysis-section">' + html + '</div>';
        
        messageElement.innerHTML = html;
    }
    
    // Modify your addMessage function to apply formatting
    function addMessage(type, content) {
        const messagesContainer = document.getElementById('analysis-messages');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(type === 'user' ? 'user-message' : 'bot-message');
        
        if (type === 'user') {
            messageDiv.textContent = content;
        } else {
            messageDiv.innerHTML = content;
            formatAnalyzerMessage(messageDiv);
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function formatAnalysis(text) {
        // Create a container for the formatted analysis
        let formattedText = '<div class="analysis-section">';
        
        // Split the text by numbered sections (1., 2., etc.)
        const sections = text.split(/\d+\.\s+/);
        
        // Get the section titles using regex
        const sectionTitles = text.match(/\d+\.\s+([^:]+):/g) || [];
        
        // Skip the first empty section if it exists
        const startIndex = sections[0].trim() === '' ? 1 : 0;
        
        // Process each section
        for (let i = startIndex; i < sections.length; i++) {
            const sectionIndex = i - (startIndex === 1 ? 1 : 0);
            
            if (sectionTitles[sectionIndex]) {
                // Extract the title without the number and colon
                const titleText = sectionTitles[sectionIndex].replace(/\d+\.\s+/, '').replace(':', '');
                formattedText += `<div class="analysis-heading">${titleText}</div>`;
            }
            
            // Process the content of the section
            let content = sections[i];
            if (i === 0 && startIndex === 0) {
                // This is an introduction paragraph before the numbered sections
                formattedText += `<div class="analysis-content">${content}</div>`;
                continue;
            }
            
            // Remove the title from the content if it exists
            if (sectionTitles[sectionIndex]) {
                const titlePattern = new RegExp(sectionTitles[sectionIndex].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                content = content.replace(titlePattern, '').trim();
            }
            
            // Highlight bold text (text between ** ** or important keywords)
            content = content.replace(/\*\*(.*?)\*\*/g, '<span class="analysis-highlight">$1</span>');
            
            // Make important keywords bold if they're not already
            const keywordsToHighlight = [
                'casual', 'formal', 'sporty', 'elegant', 'business', 'professional',
                'monochromatic', 'complementary', 'analogous', 'neutral', 'vibrant',
                'loose', 'fitted', 'oversized', 'tailored', 'slim', 'relaxed',
                'office', 'party', 'everyday', 'special occasion', 'interview',
                'summer', 'winter', 'fall', 'spring', 'seasonal'
            ];
            
            keywordsToHighlight.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                content = content.replace(regex, match => {
                    // Only replace if not already in a highlight span
                    if (!content.includes(`<span class="analysis-highlight">${match}</span>`)) {
                        return `<span class="analysis-highlight">${match}</span>`;
                    }
                    return match;
                });
            });
            
            // Convert bullet points (lines starting with * or -) to styled points
            const lines = content.split('\n');
            let processedContent = '';
            
            lines.forEach(line => {
                line = line.trim();
                if (line.startsWith('*') || line.startsWith('-')) {
                    // This is a bullet point
                    const pointText = line.substring(1).trim();
                    processedContent += `<div class="analysis-point">${pointText}</div>`;
                } else if (line) {
                    // Regular paragraph
                    processedContent += `<p>${line}</p>`;
                }
            });
            
            formattedText += `<div class="analysis-content">${processedContent}</div>`;
        }
        
        formattedText += '</div>';
        return formattedText;
    }
    
    // Function to analyze image using Gemini API
    async function analyzeOutfitWithGemini(imageData) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = 'flex';
        
        try {
            // Replace with your actual Gemini API key
            const apiKey = 'AIzaSyABWll1qHfrauwsTZqcnp_B7baRZUtG3jI';
            const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
            
            // Convert image data to base64
            const base64Image = imageData.split(',')[1];
            
            // Prepare the request payload
            const payload = {
                contents: [{
                    parts: [
                        { text: "Analyze this outfit image. Describe the outfit in detail, identify the season it's best suited for (summer, winter, fall, or spring), and suggest appropriate occasions to wear it." },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 1024
                }
            };
            
            // Make the API request
            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            const analysisText = data.candidates[0].content.parts[0].text;
            
            // Detect season from analysis
            const detectedSeason = detectSeason(analysisText);
            
            // Create outfit summary
            const outfitSummary = `Outfit for ${detectedSeason} - ${new Date().toLocaleDateString()}`;
            
            // Save to outfit organizer
            const saved = saveOutfitToOrganizer(outfitSummary, detectedSeason);
            
            // Display analysis
            document.getElementById('analysisSection').style.display = 'block';
            addMessage('bot', analysisText);
            
            // Show notification about saving
            if (saved) {
                addMessage('bot', `I've automatically added this outfit to your ${detectedSeason.charAt(0).toUpperCase() + detectedSeason.slice(1)} collection in the Outfit Organizer.`);
                showNotification(`Outfit saved to ${detectedSeason} collection!`);
            }
            
            return analysisText;
        } catch (error) {
            console.error('Error analyzing image:', error);
            addMessage('bot', 'Sorry, there was an error analyzing your outfit. Please try again.');
            return null;
        } finally {
            loadingOverlay.style.display = 'none';
        }
    }
    
    // Function to detect season from analysis text
    function detectSeason(analysisText) {
        const seasonKeywords = {
            'summer': ['summer', 'hot weather', 'warm weather', 'beach', 'lightweight', 'breathable', 'shorts', 'sandals', 'tank top', 'linen'],
            'winter': ['winter', 'cold weather', 'snow', 'freezing', 'warm layers', 'coat', 'jacket', 'sweater', 'boots', 'scarf', 'gloves'],
            'spring': ['spring', 'mild weather', 'light jacket', 'floral', 'pastel', 'rain', 'showers', 'light layers'],
            'fall': ['fall', 'autumn', 'cool weather', 'layering', 'jacket', 'cardigan', 'boots', 'earth tones', 'flannel']
        };
        
        // Count occurrences of season keywords
        const seasonCounts = {
            'summer': 0,
            'winter': 0,
            'spring': 0,
            'fall': 0
        };
        
        // Check for each keyword in the analysis text
        for (const season in seasonKeywords) {
            for (const keyword of seasonKeywords[season]) {
                const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
                const matches = analysisText.match(regex);
                if (matches) {
                    seasonCounts[season] += matches.length;
                }
            }
        }
        
        // Find the season with the most keyword matches
        let detectedSeason = 'unknown';
        let maxCount = 0;
        
        for (const season in seasonCounts) {
            if (seasonCounts[season] > maxCount) {
                maxCount = seasonCounts[season];
                detectedSeason = season;
            }
        }
        
        return maxCount > 0 ? detectedSeason : 'unknown';
    }
    
    // Function to save outfit to organizer
    function saveOutfitToOrganizer(outfitDescription, season) {
        // Map seasons to weather categories
        const seasonToWeather = {
            'summer': 'sunny',
            'winter': 'cold',
            'spring': 'rainy',
            'fall': 'windy',
            'unknown': 'sunny'
        };
        
        const weatherCategory = seasonToWeather[season];
        
        // Get existing outfits from localStorage
        let savedOutfits = localStorage.getItem('savedOutfits');
        let outfits = savedOutfits ? JSON.parse(savedOutfits) : {
            'sunny': [],
            'cold': [],
            'rainy': [],
            'windy': []
        };
        
        // Add outfit to the appropriate category if it doesn't already exist
        if (!outfits[weatherCategory].includes(outfitDescription)) {
            outfits[weatherCategory].push(outfitDescription);
            localStorage.setItem('savedOutfits', JSON.stringify(outfits));
            return true;
        }
        
        return false;
    }
    
    // Function to show notification
    function showNotification(message) {
        const notification = document.getElementById('saveNotification');
        const notificationText = notification.querySelector('p');
        notificationText.textContent = message;
        
        notification.style.display = 'flex';
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
    
    // Update the analyzeImage function to use Gemini
    function analyzeImage() {
        const imageInput = document.getElementById('imageInput');
        
        if (!imageInput.files || imageInput.files.length === 0) {
            alert('Please select an image first');
            return;
        }
        
        const file = imageInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imageData = e.target.result;
            analyzeOutfitWithGemini(imageData);
        };
        
        reader.readAsDataURL(file);
    }
    
    // Add event listeners when the document is loaded
    document.addEventListener('DOMContentLoaded', function() {
        const uploadBox = document.getElementById('uploadBox');
        const imageInput = document.getElementById('imageInput');
        const previewBox = document.getElementById('previewBox');
        const imagePreview = document.getElementById('imagePreview');
        const newImageBtn = document.getElementById('newImageBtn');
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        // Upload box click event
        uploadBox.addEventListener('click', function() {
            imageInput.click();
        });
        
        // Image input change event
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    uploadBox.style.display = 'none';
                    previewBox.style.display = 'block';
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
        
        // New image button click event
        newImageBtn.addEventListener('click', function() {
            uploadBox.style.display = 'block';
            previewBox.style.display = 'none';
            document.getElementById('analysisSection').style.display = 'none';
            document.getElementById('chatMessages').innerHTML = '';
        });
        
        // Analyze button click event
        analyzeBtn.addEventListener('click', analyzeImage);
    });