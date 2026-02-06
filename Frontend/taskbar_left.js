document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.querySelector('.overlay');
    const btnAdd = document.querySelector('.button_add');

    if (btnAdd && overlay) {
        btnAdd.addEventListener('click', () => overlay.style.display = 'flex');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        });
    }

    const parents = document.querySelectorAll('.parent');
    
    parents.forEach(parent => {
        parent.addEventListener('click', function() {
            const child = this.parentElement.querySelector('.child');
            const iconOpen = this.querySelector('.open');
            const iconClose = this.querySelector('.close');
            
            if (child) {
                const isHidden = window.getComputedStyle(child).display === 'none';
                
                child.style.display = isHidden ? 'block' : 'none';
                
                if (iconOpen && iconClose) {
                    iconOpen.style.display = isHidden ? 'block' : 'none';
                    iconClose.style.display = isHidden ? 'none' : 'block';
                }
            }
        });
    });
});