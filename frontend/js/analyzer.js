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
    
    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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
});