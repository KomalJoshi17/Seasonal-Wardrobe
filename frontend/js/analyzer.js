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
    
    // Event Listeners - Fixed drag and drop functionality
    uploadBox.addEventListener('click', () => imageInput.click());
    
    // Prevent default drag behaviors
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('drag-over'); // Changed from 'dragover' to 'drag-over'
    });
    
    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('drag-over'); // Changed from 'dragover' to 'drag-over'
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('drag-over'); // Changed from 'dragover' to 'drag-over'
        
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
    
    // Ensure the analyzeOutfit function is defined and working
    function analyzeOutfit() {
        if (!currentImageData) {
            alert('Please select an image first');
            return;
        }

        loadingOverlay.style.display = 'flex';

        console.log('Sending image data to server:', currentImageData); // Debugging log

        fetch('/outfit/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: currentImageData
            })
        })
        .then(response => {
            console.log('Received response:', response); // Debugging log
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Server responded with status ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            loadingOverlay.style.display = 'none';
            console.log('Received data:', data); // Debugging log

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
    
    sendBtn.addEventListener('click', sendQuestion);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendQuestion();
        }
    });

    function handleImageFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            currentImageData = e.target.result;
            imagePreview.src = currentImageData;
            uploadBox.style.display = 'none';
            previewBox.style.display = 'block';
        };

        reader.readAsDataURL(file);
    }

    async function analyzeOutfitWithGemini(imageData) {
        loadingOverlay.style.display = 'flex';

        try {
            const apiKey = 'AIzaSyABWll1qHfrauwsTZqcnp_B7baRZUtG3jI'; // Replace with your Gemini API key
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`;
            const base64Image = imageData.split(',')[1];

            const payload = {
                contents: [
                    {
                        parts: [
                            { text: "Analyze this outfit in detail. Highlight style, color themes, and potential improvements." },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ]
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            loadingOverlay.style.display = 'none';

            if (data && data.candidates && data.candidates.length > 0) {
                const analysisText = data.candidates[0].content.parts.map(p => p.text).join('\n');
                const formattedAnalysis = formatAnalysis(analysisText);
                analysisSection.style.display = 'block';
                addMessage('bot', formattedAnalysis);
            } else {
                alert('Failed to analyze outfit. Please try again.');
            }
        } catch (error) {
            loadingOverlay.style.display = 'none';
            console.error('Error:', error);
            alert('Error analyzing outfit. Please try again.');
        }
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

    function formatAnalyzerMessage(messageElement) {
        let html = messageElement.innerHTML;

        html = html.replace(/\*\s+(.*?)(?=\n\*|\n\n|$)/g, '<li>$1</li>');
        if (html.includes('<li>')) {
            html = html.replace(/<li>(.*?)(?=<li>|$)/g, '<ul><li>$1</ul>');
            html = html.replace(/<\/ul><ul>/g, '');
        }

        html = html.replace(/\n(#+)\s+(.*?)(?=\n)/g, (match, hashes, text) => {
            const level = hashes.length;
            return `<h${level + 2}>${text}</h${level + 2}>`;
        });

        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/\n\n/g, '</div><div class="analysis-section">');
        html = '<div class="analysis-section">' + html + '</div>';

        messageElement.innerHTML = html;
    }

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
        let formattedText = '<div class="analysis-section">';
        const sections = text.split(/\d+\.\s+/);
        const sectionTitles = text.match(/\d+\.\s+([^:]+):/g) || [];
        const startIndex = sections[0].trim() === '' ? 1 : 0;

        for (let i = startIndex; i < sections.length; i++) {
            const sectionIndex = i - (startIndex === 1 ? 1 : 0);

            if (sectionTitles[sectionIndex]) {
                const titleText = sectionTitles[sectionIndex].replace(/\d+\.\s+/, '').replace(':', '');
                formattedText += `<div class="analysis-heading">${titleText}</div>`;
            }

            let content = sections[i];
            if (i === 0 && startIndex === 0) {
                formattedText += `<div class="analysis-content">${content}</div>`;
                continue;
            }

            if (sectionTitles[sectionIndex]) {
                const titlePattern = new RegExp(sectionTitles[sectionIndex].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                content = content.replace(titlePattern, '').trim();
            }

            content = content.replace(/\*\*(.*?)\*\*/g, '<span class="analysis-highlight">$1</span>');

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
                    if (!content.includes(`<span class="analysis-highlight">${match}</span>`)) {
                        return `<span class="analysis-highlight">${match}</span>`;
                    }
                    return match;
                });
            });

            const lines = content.split('\n');
            let processedContent = '';

            lines.forEach(line => {
                line = line.trim();
                if (line.startsWith('*') || line.startsWith('-')) {
                    const pointText = line.substring(1).trim();
                    processedContent += `<div class="analysis-point">${pointText}</div>`;
                } else if (line) {
                    processedContent += `<p>${line}</p>`;
                }
            });

            formattedText += `<div class="analysis-content">${processedContent}</div>`;
        }

        formattedText += '</div>';
        return formattedText;
    }
});
