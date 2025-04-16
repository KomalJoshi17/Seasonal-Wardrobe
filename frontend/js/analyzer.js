document.addEventListener('DOMContentLoaded', function() {
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
    
    let currentImageData = null;
    
    // Handle drag and drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('drag-over');
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('drag-over');
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });
    
    // Handle click to upload
    uploadBox.addEventListener('click', () => {
        imageInput.click();
    });
    
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImageFile(e.target.files[0]);
        }
    });
    
    // Handle new image button
    newImageBtn.addEventListener('click', () => {
        previewBox.style.display = 'none';
        uploadBox.style.display = 'flex';
        analysisSection.style.display = 'none';
        chatMessages.innerHTML = '';
        currentImageData = null;
    });
    
    // Handle analyze button
    analyzeBtn.addEventListener('click', () => {
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
                
                // Add bot message with analysis
                const botMessage = document.createElement('div');
                botMessage.className = 'message bot-message';
                botMessage.innerHTML = formatAnalysis(data.analysis);
                chatMessages.appendChild(botMessage);
                
                // Add welcome message
                const welcomeMessage = document.createElement('div');
                welcomeMessage.className = 'message bot-message';
                welcomeMessage.textContent = "You can ask me specific questions about this outfit!";
                chatMessages.appendChild(welcomeMessage);
                
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                alert('Error: ' + (data.error || 'Failed to analyze outfit'));
            }
        })
        .catch(error => {
            loadingOverlay.style.display = 'none';
            console.error('Error:', error);
            alert('Error analyzing outfit. Please try again.');
        });
    });
    
    // Handle send button
    sendBtn.addEventListener('click', () => {
        sendQuestion();
    });
    
    // Handle enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendQuestion();
        }
    });
    
    // Function to handle image file
    function handleImageFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please upload an image file');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            currentImageData = e.target.result;
            imagePreview.src = e.target.result;
            uploadBox.style.display = 'none';
            previewBox.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }
    
    // Function to send question
    function sendQuestion() {
        const question = userInput.value.trim();
        
        if (!question || !currentImageData) return;
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.textContent = question;
        chatMessages.appendChild(userMessage);
        
        // Clear input
        userInput.value = '';
        
        // Add typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot-message typing-indicator';
        typingIndicator.innerHTML = '<span>.</span><span>.</span><span>.</span>';
        chatMessages.appendChild(typingIndicator);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Send question to API
        // Update the fetch URL from a relative path to the full Render URL
        fetch('https://seasonal-wardrobe.onrender.com/outfit/ask', {
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
            // Remove typing indicator
            chatMessages.removeChild(typingIndicator);
            
            if (data.success) {
                // Add bot response
                const botResponse = document.createElement('div');
                botResponse.className = 'message bot-message';
                botResponse.innerHTML = formatText(data.answer);
                chatMessages.appendChild(botResponse);
            } else {
                // Add error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'message bot-message error';
                errorMessage.textContent = data.error || 'Failed to process your question';
                chatMessages.appendChild(errorMessage);
            }
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => {
            // Remove typing indicator
            chatMessages.removeChild(typingIndicator);
            
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'message bot-message error';
            errorMessage.textContent = 'Error processing your question. Please try again.';
            chatMessages.appendChild(errorMessage);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            console.error('Error:', error);
        });
    }
    
    // Format analysis text with markdown-like syntax
    function formatAnalysis(text) {
        return text
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^# (.*?)$/gm, '<h3>$1</h3>')
            .replace(/^## (.*?)$/gm, '<h4>$1</h4>');
    }
    
    // Format regular text
    function formatText(text) {
        return text
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
});