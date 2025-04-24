document.addEventListener('DOMContentLoaded', function() {
    // Load saved outfits from localStorage
    loadOutfits();
    
    // Add event listener to the add outfit button
    document.getElementById('addOutfitBtn').addEventListener('click', addOutfit);
    
    // Add event listener for Enter key in the input field
    document.getElementById('outfitInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addOutfit();
        }
    });

    // Check if theme toggle is working
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        console.log("Theme toggle found");
    } else {
        console.log("Theme toggle not found");
    }

    // Check if localStorage is accessible
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        console.log("localStorage is working");
    } catch (e) {
        console.error("localStorage error:", e);
    }
});

// Function to add a new outfit
function addOutfit() {
    const outfitInput = document.getElementById('outfitInput');
    const weatherCategory = document.getElementById('weatherCategory');
    
    const outfit = outfitInput.value.trim();
    const category = weatherCategory.value;
    
    if (outfit === '') {
        alert('Please enter an outfit description');
        return;
    }
    
    // Add outfit to the appropriate list
    const listId = `${category}-list`;
    const outfitList = document.getElementById(listId);
    
    if (!outfitList) {
        console.error(`List with ID ${listId} not found`);
        return;
    }
    
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${outfit}</span>
        <button class="delete-btn" onclick="deleteOutfit(this, '${category}')">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    outfitList.appendChild(li);
    
    // Save to localStorage
    saveOutfits();
    
    // Clear input field
    outfitInput.value = '';
    outfitInput.focus();
}

// Function to delete an outfit
function deleteOutfit(button, category) {
    const li = button.parentElement;
    li.remove();
    
    // Save updated outfits to localStorage
    saveOutfits();
}

// Function to save outfits to localStorage
function saveOutfits() {
    const categories = ['sunny', 'rainy', 'cold', 'windy'];
    const outfits = {};
    
    categories.forEach(category => {
        const listId = `${category}-list`;
        const outfitList = document.getElementById(listId);
        
        if (!outfitList) {
            console.error(`List with ID ${listId} not found when saving`);
            outfits[category] = [];
            return;
        }
        
        const items = outfitList.querySelectorAll('li span');
        outfits[category] = Array.from(items).map(item => item.textContent);
    });
    
    try {
        localStorage.setItem('savedOutfits', JSON.stringify(outfits));
        console.log("Outfits saved successfully:", outfits);
    } catch (e) {
        console.error("Error saving outfits:", e);
    }
}

// Function to load outfits from localStorage
function loadOutfits() {
    try {
        const savedOutfits = localStorage.getItem('savedOutfits');
        
        if (!savedOutfits) {
            console.log("No saved outfits found");
            return;
        }
        
        const outfits = JSON.parse(savedOutfits);
        console.log("Loading outfits:", outfits);
        
        Object.keys(outfits).forEach(category => {
            const listId = `${category}-list`;
            const outfitList = document.getElementById(listId);
            
            if (!outfitList) {
                console.error(`List with ID ${listId} not found when loading`);
                return;
            }
            
            // Clear existing items
            outfitList.innerHTML = '';
            
            outfits[category].forEach(outfit => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${outfit}</span>
                    <button class="delete-btn" onclick="deleteOutfit(this, '${category}')">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                outfitList.appendChild(li);
            });
        });
    } catch (e) {
        console.error("Error loading outfits:", e);
    }
}