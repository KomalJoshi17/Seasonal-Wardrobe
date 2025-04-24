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
        const items = outfitList.querySelectorAll('li span');
        
        outfits[category] = Array.from(items).map(item => item.textContent);
    });
    
    localStorage.setItem('savedOutfits', JSON.stringify(outfits));
}

// Function to load outfits from localStorage
function loadOutfits() {
    const savedOutfits = localStorage.getItem('savedOutfits');
    
    if (savedOutfits) {
        const outfits = JSON.parse(savedOutfits);
        
        Object.keys(outfits).forEach(category => {
            const listId = `${category}-list`;
            const outfitList = document.getElementById(listId);
            
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
    }
}