document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="/"], a[href^="."]');
    
    links.forEach(link => {
        if (!link.hash) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const transition = document.createElement('div');
                transition.className = 'page-transition slide-out';
                document.body.appendChild(transition);
                
                setTimeout(() => {
                    window.location.href = link.href;
                }, 500);
            });
        }
    });

    // Add slide-in animation when page loads
    const transition = document.createElement('div');
    transition.className = 'page-transition slide-in';
    document.body.appendChild(transition);
    
    setTimeout(() => {
        transition.remove();
    }, 500);
});