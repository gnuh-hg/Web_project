document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.querySelector('.overlay');
    const btnAdd = document.querySelector('.button_add');
    const button_add_project = document.querySelector('.button_add_project');
    const button_add_task = document.querySelector('.button_add_task');
    const add_project = document.querySelector('.add_project');
    const add_task = document.querySelector('.add_task');
    
    // Xử lý Overlay
    if (btnAdd && overlay) {
        btnAdd.addEventListener('click', () => overlay.style.display = 'flex');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        });
    }

    // Xử lý chuyển đổi Tab Project/Task
    if (button_add_project && button_add_task) {
        button_add_project.addEventListener('click', () => {
            button_add_project.style.borderBottom = "1px solid #00FFFF";
            button_add_task.style.borderBottom = "1px solid #2b2d31";
            add_project.style.display = "block";
            add_task.style.display = "none";
        });

        button_add_task.addEventListener('click', () => {
            button_add_task.style.borderBottom = "1px solid #00FFFF";
            button_add_project.style.borderBottom = "1px solid #2b2d31";
            add_task.style.display = "block";
            add_project.style.display = "none";
        });
    }

    // Xử lý nút Option (...) không làm ảnh hưởng cha
    const moreButtons = document.querySelectorAll('.more');
    moreButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Quan trọng nhất: chặn nổi bọt
            // Code mở menu sửa/xóa ở đây
        });
    });

    // Xử lý Đóng/Mở Project
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