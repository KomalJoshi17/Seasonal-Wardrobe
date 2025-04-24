// Seasonal Quiz - Simplified Version with Two Quiz Types

// Quiz state variables
let currentQuiz = null;
let currentQuestions = [];
let currentAnswers = [];
let currentQuestionIndex = 0;
let quizStartTime = null;

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to quiz option buttons
    document.getElementById('personalityQuiz').addEventListener('click', () => startQuiz('personality'));
    document.getElementById('colorQuiz').addEventListener('click', () => startQuiz('color'));
    document.getElementById('generateQuiz').addEventListener('click', generateRandomQuiz);
    
    // Add event listeners to navigation buttons
    document.getElementById('backBtn').addEventListener('click', backToOptions);
    document.getElementById('prevBtn').addEventListener('click', goToPreviousQuestion);
    document.getElementById('nextBtn').addEventListener('click', goToNextQuestion);
    
    // Add event listeners to result action buttons
    document.getElementById('saveResults').addEventListener('click', saveResults);
    document.getElementById('shareResults').addEventListener('click', shareResults);
    document.getElementById('returnToQuizzes').addEventListener('click', backToOptions);
});

// Start a quiz based on the selected type
function startQuiz(quizType) {
    // Hide quiz options and show loading
    document.querySelector('.quiz-options').style.display = 'none';
    document.getElementById('loadingIndicator').style.display = 'block';
    
    // Reset quiz state
    currentQuiz = { type: quizType };
    currentQuestions = [];
    currentAnswers = [];
    currentQuestionIndex = 0;
    quizStartTime = new Date();
    
    // Load questions based on quiz type
    loadQuestions(quizType);
    
    // Update UI
    updateQuizTitle();
    updateProgressBar();
    showCurrentQuestion();
    
    // Hide loading and show quiz content
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
}

// Generate a random quiz with auto-generated questions
function generateRandomQuiz() {
    // Hide quiz options and show loading
    document.querySelector('.quiz-options').style.display = 'none';
    document.getElementById('loadingIndicator').style.display = 'block';
    
    // Reset quiz state
    currentQuiz = { type: 'auto', title: "Fashion Knowledge Quiz" };
    currentQuestions = generateFashionQuestions();
    currentAnswers = new Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;
    quizStartTime = new Date();
    
    // Update UI
    updateQuizTitle();
    updateProgressBar();
    showCurrentQuestion();
    
    // Hide loading and show quiz content
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
}

// Shuffle array function
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Load questions for the selected quiz type
function loadQuestions(quizType) {
    switch(quizType) {
        case 'personality':
            loadPersonalityQuiz();
            break;
        case 'color':
            loadColorQuiz();
            break;
    }
}

// Load personality quiz questions
function loadPersonalityQuiz() {
    currentQuiz.title = "Style Personality Quiz";
    
    // Create a larger pool of questions
    const questionPool = [
        {
            question: "When shopping for clothes, what's your primary consideration?",
            options: ["Quality and timelessness", "Uniqueness and artistic value", "Simplicity and functionality", "Trendiness and statement pieces"],
            styles: ["Classic", "Bohemian", "Minimalist", "Trendy"]
        },
        {
            question: "Which color palette do you gravitate towards most?",
            options: ["Neutrals with occasional pops of color", "Earth tones and rich jewel tones", "Monochromatic schemes in neutral colors", "Bold, bright colors and patterns"],
            styles: ["Classic", "Bohemian", "Minimalist", "Trendy"]
        },
        {
            question: "What's your ideal weekend outfit?",
            options: ["Well-fitted jeans and a crisp button-down shirt", "Flowy dress or relaxed pants with layered accessories", "Simple t-shirt and jeans with clean sneakers", "The latest street style look from social media"],
            styles: ["Classic", "Bohemian", "Minimalist", "Trendy"]
        },
        {
            question: "How would you describe your accessory style?",
            options: ["Timeless pieces like pearl earrings or a quality watch", "Handcrafted, unique pieces from various cultures", "Minimal and subtle - perhaps just a simple watch", "Statement pieces that follow current trends"],
            styles: ["Classic", "Bohemian", "Minimalist", "Trendy"]
        },
        {
            question: "Which fabric do you prefer for your clothing?",
            options: ["Natural fibers like wool, cotton, and silk", "Natural textured fabrics like linen and raw cotton", "Comfortable, easy-care fabrics with clean lines", "Whatever material creates the right look for the trend"],
            styles: ["Classic", "Bohemian", "Minimalist", "Trendy"]
        },
        // Additional questions for variety
        {
            question: "How do you approach fashion trends?",
            options: ["I adopt classic elements that stand the test of time", "I create my own unique style regardless of trends", "I focus on timeless minimalism with quality pieces", "I enjoy following and experimenting with new trends"],
            styles: ["Classic", "Bohemian", "Minimalist", "Trendy"]
        },
        {
            question: "Which celebrity's style do you most admire?",
            options: ["Kate Middleton or George Clooney", "Florence Welch or Johnny Depp", "Jenna Lyons or Steve Jobs", "Zendaya or Harry Styles"],
            styles: ["Classic", "Bohemian", "Minimalist", "Trendy"]
        },
        {
            question: "How would you describe your ideal home decor?",
            options: ["Traditional with quality furniture pieces", "Eclectic with global influences and artistic touches", "Clean lines with functional, uncluttered spaces", "Contemporary with the latest design trends"],
            styles: ["Classic", "Bohemian", "Minimalist", "Trendy"]
        },
        {
            question: "What's your approach to makeup or grooming?",
            options: ["Polished and refined, enhancing natural features", "Creative and expressive, possibly with unique colors", "Minimal and natural, focusing on skin care", "Current beauty trends and techniques"],
            styles: ["Classic", "Bohemian", "Minimalist", "Trendy"]
        },
        {
            question: "How do you organize your closet?",
            options: ["Well-organized by category with quality hangers", "Loosely arranged with favorite pieces easily accessible", "Minimal, with only essential items neatly arranged", "Frequently reorganized to feature newest purchases"],
            styles: ["Classic", "Bohemian", "Minimalist", "Trendy"]
        }
    ];
    
    // Randomly select 5 questions from the pool
    currentQuestions = shuffleArray(questionPool).slice(0, 5);
    
    // Initialize answers array
    currentAnswers = new Array(currentQuestions.length).fill(null);
}

// Load color quiz questions
function loadColorQuiz() {
    currentQuiz.title = "Seasonal Color Quiz";
    
    // Create a larger pool of questions
    const questionPool = [
        {
            question: "Which colors best represent a Spring palette?",
            options: ["Bright, clear colors with warm undertones", "Soft, muted colors with cool undertones", "Rich, warm, and earthy tones", "Bold, clear colors with cool undertones"],
            correctAnswer: 0,
            explanation: "Spring palettes feature bright, clear colors with warm undertones like coral, peach, bright green, and clear blue."
        },
        {
            question: "Which season's palette includes deep burgundy, forest green, and burnt orange?",
            options: ["Spring", "Summer", "Fall", "Winter"],
            correctAnswer: 2,
            explanation: "Fall palettes include rich, warm, earthy tones like deep burgundy, forest green, burnt orange, and mustard yellow."
        },
        {
            question: "If you look best in soft, muted colors with cool undertones, which seasonal palette might suit you?",
            options: ["Spring", "Summer", "Fall", "Winter"],
            correctAnswer: 1,
            explanation: "Summer palettes feature soft, muted colors with cool undertones like lavender, powder blue, soft pink, and sage green."
        },
        {
            question: "Which season's color palette includes stark white, true black, and jewel tones?",
            options: ["Spring", "Summer", "Fall", "Winter"],
            correctAnswer: 3,
            explanation: "Winter palettes include bold, clear colors with cool undertones like stark white, true black, royal blue, and emerald green."
        },
        {
            question: "Which color would most likely appear in a Summer palette?",
            options: ["Bright coral", "Soft lavender", "Burnt orange", "Royal purple"],
            correctAnswer: 1,
            explanation: "Soft lavender is a typical Summer palette color because it has the soft, muted quality with cool undertones characteristic of Summer colors."
        },
        // Additional questions for variety
        {
            question: "Which metal finish best complements a Winter color palette?",
            options: ["Rose gold", "Yellow gold", "Silver/platinum", "Copper"],
            correctAnswer: 2,
            explanation: "Silver and platinum with their cool, clear appearance best complement the Winter palette's high contrast and cool undertones."
        },
        {
            question: "What distinguishes Spring colors from Autumn colors?",
            options: ["Spring colors are warmer", "Spring colors are brighter and clearer", "Spring colors are darker", "Spring colors are more muted"],
            correctAnswer: 1,
            explanation: "While both Spring and Autumn have warm undertones, Spring colors are brighter and clearer, while Autumn colors are more muted and rich."
        },
        {
            question: "Which lipstick shade would best suit someone with a Summer color palette?",
            options: ["Bright orange-red", "Deep burgundy", "Soft rose pink", "Clear bright fuchsia"],
            correctAnswer: 2,
            explanation: "Soft rose pink complements the Summer palette's muted, cool undertones, while avoiding colors that are too bright or intense."
        },
        {
            question: "Which season's palette would most likely include olive green?",
            options: ["Spring", "Summer", "Autumn", "Winter"],
            correctAnswer: 2,
            explanation: "Olive green is a muted, warm tone that fits perfectly in the Autumn palette with its earthy, rich characteristics."
        },
        {
            question: "If someone looks best in clear, bright colors with cool undertones, which season are they likely to be?",
            options: ["Spring", "Summer", "Autumn", "Winter"],
            correctAnswer: 3,
            explanation: "Winter palettes feature clear, bright colors with cool undertones, creating high contrast looks that suit Winter individuals."
        }
    ];
    
    // Randomly select 5 questions from the pool
    currentQuestions = shuffleArray(questionPool).slice(0, 5);
    
    // Initialize answers array
    currentAnswers = new Array(currentQuestions.length).fill(null);
}

// Generate random fashion questions
function generateFashionQuestions() {
    const questionPool = [
        {
            question: "Which fabric is most suitable for hot summer days?",
            options: ["Wool", "Linen", "Polyester", "Leather"],
            correctAnswer: 1,
            explanation: "Linen is lightweight, breathable, and wicks moisture away from the body, making it ideal for hot summer days."
        },
        {
            question: "Which color palette is typically associated with Fall/Autumn?",
            options: ["Pastels and light blues", "Neons and bright yellows", "Burgundy, mustard, and olive green", "White, silver, and ice blue"],
            correctAnswer: 2,
            explanation: "Fall/Autumn color palettes typically include warm, rich tones like burgundy, mustard yellow, and olive green that reflect the changing leaves and natural environment."
        },
        {
            question: "What is 'layering' in fashion terms?",
            options: ["Wearing multiple accessories", "Wearing multiple garments on top of each other", "A sewing technique", "A type of fabric treatment"],
            correctAnswer: 1,
            explanation: "Layering refers to wearing multiple garments on top of each other, which allows for adaptability to changing temperatures and creates visual interest in an outfit."
        },
        {
            question: "Which shoe style is considered a timeless wardrobe staple?",
            options: ["Platform sneakers", "Classic leather loafers", "Neon high heels", "Furry boots"],
            correctAnswer: 1,
            explanation: "Classic leather loafers are considered timeless wardrobe staples because they're versatile, comfortable, and maintain their style relevance across changing fashion trends."
        },
        {
            question: "What does 'capsule wardrobe' refer to?",
            options: ["A collection of vintage clothing", "A small collection of versatile, mix-and-match pieces", "Clothing stored in capsules to save space", "A wardrobe designed for space travel"],
            correctAnswer: 1,
            explanation: "A capsule wardrobe is a small collection of versatile clothing pieces that can be mixed and matched to create multiple outfits, reducing clutter and simplifying style choices."
        },
        // Additional questions for variety
        {
            question: "What is 'fast fashion'?",
            options: ["Clothing designed for athletes", "Inexpensive clothing produced rapidly to meet trends", "High-end designer clothing", "Vintage clothing from past decades"],
            correctAnswer: 1,
            explanation: "Fast fashion refers to inexpensive clothing produced rapidly by mass-market retailers in response to the latest trends, often at the cost of ethical and environmental considerations."
        },
        {
            question: "Which pattern is traditionally associated with professional business attire?",
            options: ["Animal print", "Pinstripes", "Tie-dye", "Polka dots"],
            correctAnswer: 1,
            explanation: "Pinstripes are traditionally associated with professional business attire, particularly in suits and dress shirts, conveying a sense of formality and authority."
        },
        {
            question: "What is a 'sheath dress'?",
            options: ["A flowing maxi dress", "A fitted dress that follows the body's contours", "A dress with a full skirt", "A dress with dramatic sleeves"],
            correctAnswer: 1,
            explanation: "A sheath dress is a fitted dress that closely follows the body's contours from shoulder to hem, typically knee-length with minimal detailing for a sleek silhouette."
        },
        {
            question: "Which decade is known for popularizing bell-bottom pants?",
            options: ["1950s", "1970s", "1990s", "2010s"],
            correctAnswer: 1,
            explanation: "The 1970s is known for popularizing bell-bottom pants, which featured a tight fit through the thigh and a dramatic flare from the knee down."
        },
        {
            question: "What is 'color blocking' in fashion?",
            options: ["Wearing all one color", "Wearing outfits with geometric color patterns", "Combining distinct blocks of solid colors", "Dyeing fabric using traditional techniques"],
            correctAnswer: 2,
            explanation: "Color blocking is a styling technique that combines distinct blocks of solid colors in an outfit, often using contrasting or complementary colors for visual impact."
        },
        {
            question: "Which fashion term describes clothing that can be worn in multiple ways?",
            options: ["Avant-garde", "Convertible", "Bespoke", "Couture"],
            correctAnswer: 1,
            explanation: "Convertible clothing describes versatile pieces that can be worn in multiple ways, such as dresses that can be styled differently or items with removable components."
        },
        {
            question: "What is 'sustainable fashion'?",
            options: ["Clothing made from synthetic materials", "Fashion that focuses only on durability", "Clothing designed to be worn for one season only", "Fashion that considers environmental and ethical impacts"],
            correctAnswer: 3,
            explanation: "Sustainable fashion considers the environmental and ethical impacts of clothing production, focusing on reducing waste, using eco-friendly materials, and ensuring fair labor practices."
        },
        {
            question: "Which fabric is known for its cooling properties in hot weather?",
            options: ["Polyester", "Wool", "Cotton", "Leather"],
            correctAnswer: 2,
            explanation: "Cotton is known for its cooling properties in hot weather because it's breathable, absorbs moisture, and allows heat to escape from the body."
        }
    ];
    
    // Randomly select 5 questions from the pool
    return shuffleArray(questionPool).slice(0, 5);
}

// UI update functions
function updateQuizTitle() {
    document.getElementById('quizTitle').textContent = currentQuiz.title;
}

function updateProgressBar() {
    const totalQuestions = currentQuestions.length;
    const currentQuestion = currentQuestionIndex + 1;
    
    document.getElementById('currentQuestion').textContent = currentQuestion;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    
    const progressPercentage = (currentQuestion / totalQuestions) * 100;
    document.getElementById('progressBar').style.width = `${progressPercentage}%`;
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').textContent = currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next';
}

function showCurrentQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    questionContainer.innerHTML = '';
    
    // All quiz types use multiple choice format
    showMultipleChoiceQuestion(questionContainer);
}

function showMultipleChoiceQuestion(container) {
    const question = currentQuestions[currentQuestionIndex];
    
    const questionElement = document.createElement('div');
    questionElement.className = 'question';
    questionElement.innerHTML = `
        <h3>${question.question}</h3>
        <div class="options-container">
            ${question.options.map((option, index) => `
                <div class="option ${currentAnswers[currentQuestionIndex] === index ? 'selected' : ''}" data-index="${index}">
                    ${option}
                </div>
            `).join('')}
        </div>
    `;
    
    container.appendChild(questionElement);
    
    // Add event listeners to options
    const options = container.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            selectAnswer(index);
        });
    });
}

// Handle answer selection for multiple choice questions
function selectAnswer(index) {
    currentAnswers[currentQuestionIndex] = index;
    
    // Update UI to show selected answer
    const options = document.querySelectorAll('.option');
    options.forEach((option, i) => {
        if (i === index) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Navigation functions
function goToNextQuestion() {
    // Check if current question is answered
    if (currentAnswers[currentQuestionIndex] === null) {
        alert('Please select an answer before proceeding.');
        return;
    }
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
        // Go to next question
        currentQuestionIndex++;
        updateProgressBar();
        showCurrentQuestion();
    } else {
        // Show results
        showResults();
    }
}

function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        updateProgressBar();
        showCurrentQuestion();
    }
}

function backToOptions() {
    // Hide quiz content and results
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    
    // Show quiz options
    document.querySelector('.quiz-options').style.display = 'grid';
}

// Results functions
function showResults() {
    // Hide quiz content
    document.getElementById('quizContent').style.display = 'none';
    
    // Calculate results
    const resultsData = calculateResults();
    
    // Display results
    displayResults(resultsData);
    
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
}

function calculateResults() {
    switch(currentQuiz.type) {
        case 'personality':
            return calculatePersonalityResults();
        case 'color':
        case 'auto':
            return calculateKnowledgeResults();
    }
}

function calculatePersonalityResults() {
    // Count style preferences
    const styleCounts = {
        "Classic": 0,
        "Bohemian": 0,
        "Minimalist": 0,
        "Trendy": 0
    };
    
    currentQuestions.forEach((question, index) => {
        const answerIndex = currentAnswers[index];
        if (answerIndex !== null && answerIndex !== undefined) {
            const style = question.styles[answerIndex];
            styleCounts[style]++;
        }
    });
    
    // Find dominant style
    let dominantStyle = '';
    let maxCount = 0;
    
    for (const style in styleCounts) {
        if (styleCounts[style] > maxCount) {
            maxCount = styleCounts[style];
            dominantStyle = style;
        }
    }
    
    // Calculate completion time
    const completionTime = Math.round((new Date() - quizStartTime) / 1000);
    
    return {
        style: dominantStyle,
        score: Math.round((maxCount / currentQuestions.length) * 100),
        completionTime: completionTime,
        styleCounts: styleCounts
    };
}

function calculateKnowledgeResults() {
    let correctCount = 0;
    let incorrectAnswers = [];
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = currentAnswers[index];
        if (userAnswer === question.correctAnswer) {
            correctCount++;
        } else {
            incorrectAnswers.push({
                question: question.question,
                userAnswer: question.options[userAnswer],
                correctAnswer: question.options[question.correctAnswer],
                explanation: question.explanation
            });
        }
    });
    
    // Calculate completion time
    const completionTime = Math.round((new Date() - quizStartTime) / 1000);
    
    return {
        score: Math.round((correctCount / currentQuestions.length) * 100),
        correctCount: correctCount,
        totalQuestions: currentQuestions.length,
        incorrectAnswers: incorrectAnswers,
        completionTime: completionTime
    };
}

function displayResults(resultsData) {
    const resultsContainer = document.getElementById('resultsContent');
    
    switch(currentQuiz.type) {
        case 'personality':
            displayPersonalityResults(resultsContainer, resultsData);
            break;
        case 'color':
        case 'auto':
            displayKnowledgeResults(resultsContainer, resultsData);
            break;
    }
}

function displayPersonalityResults(container, resultsData) {
    // Determine feedback based on dominant style
    let styleFeedback = '';
    let seasonalRecommendations = {};
    
    switch(resultsData.style) {
        case 'Classic':
            styleFeedback = "You have a timeless sense of style that values quality and elegance. You prefer well-made pieces that will last for years rather than following fleeting trends.";
            seasonalRecommendations = {
                spring: ["Light trench coat", "Cotton button-down shirts", "Straight-leg chinos"],
                summer: ["Linen blazer", "Polo shirts", "Tailored shorts"],
                fall: ["Cashmere sweaters", "Tailored wool pants", "Leather loafers"],
                winter: ["Camel coat", "Merino wool turtlenecks", "Dark denim with boots"]
            };
            break;
        case 'Bohemian':
            styleFeedback = "You have a free-spirited, artistic style that embraces natural fabrics, unique patterns, and global influences. You value individuality and creative expression in your wardrobe.";
            seasonalRecommendations = {
                spring: ["Floral maxi dresses", "Embroidered blouses", "Lightweight scarves"],
                summer: ["Flowy caftans", "Embellished sandals", "Natural fiber hats"],
                fall: ["Suede fringe jackets", "Patterned midi skirts", "Layered jewelry"],
                winter: ["Oversized knit sweaters", "Velvet pieces", "Patterned boots"]
            };
            break;
        case 'Minimalist':
            styleFeedback = "You prefer clean lines, simple silhouettes, and a neutral color palette. Your style values functionality and quality over embellishment or trends.";
            seasonalRecommendations = {
                spring: ["Lightweight cotton tees", "Straight-cut trousers", "Simple sneakers"],
                summer: ["Linen shift dresses", "Cotton shorts", "Leather sandals"],
                fall: ["Monochrome layering pieces", "Straight-leg jeans", "Ankle boots"],
                winter: ["Streamlined wool coat", "Cashmere sweaters", "Minimalist leather boots"]
            };
            break;
        case 'Trendy':
            styleFeedback = "You enjoy staying current with fashion trends and aren't afraid to experiment with new styles. Your wardrobe is constantly evolving to reflect the latest looks.";
            seasonalRecommendations = {
                spring: ["Statement sleeve tops", "Current denim silhouettes", "Season's trending colors"],
                summer: ["This season's 'it' dress", "Trending sandal styles", "Popular accessories"],
                fall: ["Current outerwear trends", "Season's trending prints", "Fashion-forward boots"],
                winter: ["Statement coats", "Trending knitwear", "This season's must-have accessories"]
            };
            break;
    }
    
    // Create HTML for results
    container.innerHTML = `
        <div class="results-header">
            <h2>Your Style Personality: ${resultsData.style}</h2>
            <div class="score-container">
                <div class="score-circle">
                    <span>${resultsData.score}%</span>
                </div>
                <p>Match</p>
            </div>
        </div>
        
        <div class="results-details">
            <p class="completion-time">Quiz completed in ${formatTime(resultsData.completionTime)}</p>
            
            <div class="style-feedback">
                <h3>Your Style Profile</h3>
                <p>${styleFeedback}</p>
            </div>
            
            <div class="style-breakdown">
                <h3>Style Breakdown</h3>
                <div class="style-bars">
                    ${Object.entries(resultsData.styleCounts).map(([style, count]) => `
                        <div class="style-bar">
                            <div class="style-label">${style}</div>
                            <div class="bar-container">
                                <div class="bar" style="width: ${(count / currentQuestions.length) * 100}%"></div>
                            </div>
                            <div class="style-percentage">${Math.round((count / currentQuestions.length) * 100)}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="seasonal-recommendations">
                <h3>Seasonal Wardrobe Recommendations</h3>
                <div class="season-grid">
                    <div class="season">
                        <h4>Spring</h4>
                        <ul>
                            ${seasonalRecommendations.spring.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="season">
                        <h4>Summer</h4>
                        <ul>
                            ${seasonalRecommendations.summer.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="season">
                        <h4>Fall</h4>
                        <ul>
                            ${seasonalRecommendations.fall.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="season">
                        <h4>Winter</h4>
                        <ul>
                            ${seasonalRecommendations.winter.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayKnowledgeResults(container, resultsData) {
    // Determine feedback based on score
    let feedback = '';
    let tips = [];
    
    if (resultsData.score >= 80) {
        feedback = "Excellent! You have a strong understanding of fashion concepts and seasonal style.";
        tips = [
            "Consider exploring more specialized fashion topics to deepen your knowledge",
            "Your expertise could be valuable in helping friends with their style choices",
            "You might enjoy following fashion forecasting and trend analysis"
        ];
    } else if (resultsData.score >= 60) {
        feedback = "Good job! You have a solid grasp of fashion basics with some room to grow.";
        tips = [
            "Focus on understanding the 'why' behind seasonal fashion rules",
            "Practice identifying color palettes for different seasons",
            "Learn more about fabric properties and how they relate to seasons"
        ];
    } else {
        feedback = "You're on your way to building your fashion knowledge. Keep learning!";
        tips = [
            "Start with the basics of seasonal color theory",
            "Learn about different fabric types and their properties",
            "Study how clothing silhouettes change with seasonal trends",
            "Practice identifying key pieces for each season's wardrobe"
        ];
    }
    
    // Create HTML for results
    container.innerHTML = `
        <div class="results-header">
            <h2>${currentQuiz.title} Results</h2>
            <div class="score-container">
                <div class="score-circle ${resultsData.score >= 80 ? 'excellent' : resultsData.score >= 60 ? 'good' : 'needs-improvement'}">
                    <span>${resultsData.score}%</span>
                </div>
                <p>Score</p>
            </div>
        </div>
        
        <div class="results-details">
            <p class="completion-time">Quiz completed in ${formatTime(resultsData.completionTime)}</p>
            <p class="score-summary">You answered ${resultsData.correctCount} out of ${resultsData.totalQuestions} questions correctly.</p>
            
            <div class="feedback-section">
                <h3>Feedback</h3>
                <p>${feedback}</p>
            </div>
            
            <div class="tips-section">
                <h3>Tips to Improve</h3>
                <ul>
                    ${tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            
            ${resultsData.incorrectAnswers.length > 0 ? `
                <div class="incorrect-answers">
                    <h3>Learning Opportunities</h3>
                    ${resultsData.incorrectAnswers.map((item, index) => `
                        <div class="incorrect-item">
                            <p class="question"><strong>Question ${index + 1}:</strong> ${item.question}</p>
                            <p class="your-answer"><span>Your answer:</span> ${item.userAnswer}</p>
                            <p class="correct-answer"><span>Correct answer:</span> ${item.correctAnswer}</p>
                            <p class="explanation">${item.explanation}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Helper function to format time
function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds} seconds`;
    } else {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }
}

// Result action functions
function saveResults() {
    const resultsText = document.getElementById('resultsContent').innerText;
    
    // Create a text file for download
    const blob = new Blob([`Fashion Quiz Results\n\n${resultsText}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fashion-quiz-results.txt';
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
}

function shareResults() {
    const resultsText = document.getElementById('resultsContent').innerText;
    
    // Try to use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'My Fashion Quiz Results',
            text: resultsText
        })
        .catch(error => {
            console.error('Error sharing:', error);
            // Fallback to clipboard
            copyToClipboard();
        });
    } else {
        // Fallback to clipboard
        copyToClipboard();
    }
}

function copyToClipboard() {
    const resultsText = document.getElementById('resultsContent').innerText;
    
    navigator.clipboard.writeText(resultsText)
        .then(() => {
            alert('Results copied to clipboard! You can now paste and share them.');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Could not copy to clipboard. Please share manually.');
        });
}