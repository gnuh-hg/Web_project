document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật Selector cho Modal/Overlay
    const projectForm = document.querySelector('.project-form');
    const taskForm = document.querySelector('.task-form');
    
    // Xử lý Overlay (Mở/Đóng Modal)
    const overlay = document.querySelector('.modal-overlay');
    const btnAdd = document.querySelector('.add-button');
    const btnCancel = document.querySelector('.btn-cancel');
    if (btnAdd && overlay) {
        btnAdd.addEventListener('click', () => overlay.style.display = 'flex');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        });
        btnCancel.addEventListener('click', () => overlay.style.display = 'none');
    }

    // Xử lý chuyển đổi Tab Project/Task trong Modal
    const btnTabProject = document.querySelector('.btn-tab-project');
    const btnTabTask = document.querySelector('.btn-tab-task');
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

    const btnAccept = document.querySelector('.btn-accept');
    if (btnAccept) {
        btnAccept.addEventListener('click', function() {
            // 1. Lấy Loại (Type): Project hay Task
            // Kiểm tra form nào đang hiển thị
            const isProjectForm = window.getComputedStyle(projectForm).display !== 'none';
            const type = isProjectForm ? 'PROJECT' : 'TASK';

            // 2. Lấy Tên (Name)
            // Lấy input từ form đang hiển thị để tránh lấy nhầm dữ liệu trống
            const activeInput = isProjectForm 
                ? projectForm.querySelector('.modal-input') 
                : taskForm.querySelector('.modal-input');
            const nameValue = activeInput.value.trim();

            // 3. Lấy Màu sắc (Color)
            const selectedSwatch = document.querySelector('.color-swatch.selected');
            // Lấy mã màu trực tiếp từ thuộc tính style inline
            const colorValue = selectedSwatch ? selectedSwatch.style.backgroundColor : null;

            // 4. Kiểm tra điều kiện (Validation)
            if (!nameValue) {
                activeInput.focus();
                return;
            }

            if (!selectedSwatch) {
                return;
            }

            // DỮ LIỆU CUỐI CÙNG ĐỂ GỬI BACKEND
            const payload = {
                type: type,
                name: nameValue,
                color: colorValue,
                parentId: null // Bạn có thể bổ sung logic lấy ID cha nếu đang ở trong project cụ thể
            };

            // Tạm thời đóng modal sau khi lấy dữ liệu thành công
            const overlay = document.querySelector('.modal-overlay');
            overlay.style.display = 'none';
            
            // Reset form cho lần dùng sau
            activeInput.value = '';
        });
    }
});