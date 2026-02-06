document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.querySelector('.overlay');
    const btnAdd = document.querySelector('.button_add'); // Nhắm vào thẻ button bao ngoài

    btnAdd.addEventListener('click', function() {
        overlay.style.display = 'flex'; 
    });

    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            overlay.style.display = 'none';
        }
    });
});