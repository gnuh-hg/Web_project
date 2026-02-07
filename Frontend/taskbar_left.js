document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật Selector cho Modal/Overlay
    const overlay = document.querySelector('.modal-overlay');
    const btnAdd = document.querySelector('.add-button');
    const btnTabProject = document.querySelector('.btn-tab-project');
    const btnTabTask = document.querySelector('.btn-tab-task');
    const projectForm = document.querySelector('.project-form');
    const taskForm = document.querySelector('.task-form');
    
    // Xử lý Overlay (Mở/Đóng Modal)
    if (btnAdd && overlay) {
        btnAdd.addEventListener('click', () => overlay.style.display = 'flex');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        });
    }

    // Xử lý chuyển đổi Tab Project/Task trong Modal
    if (btnTabProject && btnTabTask) {
        btnTabProject.addEventListener('click', () => {
            btnTabProject.style.borderBottom = "1px solid #00FFFF";
            btnTabTask.style.borderBottom = "1px solid #2b2d31";
            projectForm.style.display = "block";
            taskForm.style.display = "none";
        });

        btnTabTask.addEventListener('click', () => {
            btnTabTask.style.borderBottom = "1px solid #00FFFF";
            btnTabProject.style.borderBottom = "1px solid #2b2d31";
            taskForm.style.display = "block";
            projectForm.style.display = "none";
        });
    }

    // Xử lý nút Option (...) không làm ảnh hưởng cha (Dùng class .action-more mới)
    const moreButtons = document.querySelectorAll('.action-more');
    moreButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Chặn nổi bọt để không kích hoạt sự kiện đóng/mở của project cha
            // Logic mở menu sửa/xóa có thể thêm ở đây
        });
    });

    // Xử lý Đóng/Mở Project (Dùng .item-header và .item-content mới)
    const headers = document.querySelectorAll('.item-header');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.parentElement.querySelector('.item-content');
            const iconExpanded = this.querySelector('.icon-expanded');
            const iconCollapsed = this.querySelector('.icon-collapsed');
            
            if (content) {
                const isHidden = window.getComputedStyle(content).display === 'none';
                content.style.display = isHidden ? 'block' : 'none';
                
                // Cập nhật trạng thái Icon SVG
                if (iconExpanded && iconCollapsed) {
                    iconExpanded.style.display = isHidden ? 'block' : 'none';
                    iconCollapsed.style.display = isHidden ? 'none' : 'block';
                }
            }
        });
    });

    // Xử lý chọn màu sắc (Dùng .color-swatch mới)
    const colorSwatches = document.querySelectorAll('.color-swatch');
    
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', function() {
        
        // Tìm và xóa class 'selected' ở phần tử cũ
        const currentSelected = document.querySelector('.color-swatch.selected');
        if (currentSelected) {
          currentSelected.classList.remove('selected');
        }
    
        // Thêm class 'selected' vào phần tử vừa click
        this.classList.add('selected');
      });
    });
});