document.addEventListener('DOMContentLoaded', function() {
    const projectForm = document.querySelector('.project-form');
    const taskForm = document.querySelector('.task-form');
    const mainListWrapper = document.querySelector('.project-container > .list-wrapper');
    const overlay = document.querySelector('.modal-overlay');
    
    // --- CẤU HÌNH SORTABLE (KÉO THẢ) ---
    const sortableOptions = {
        group: 'nested',        // Cho phép kéo qua lại giữa các list cùng group
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        ghostClass: 'sortable-ghost',
        // Tự động dời item ra list-wrapper lớn nhất hoặc vào project khác nhờ chung group
    };

    // Khởi tạo kéo thả cho danh sách chính ngoài cùng
    if (mainListWrapper) {
        new Sortable(mainListWrapper, sortableOptions);
    }

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

    function attachEventsToNewItem(item) {
        // 1. Xử lý nút Option (...)
        const moreBtn = item.querySelector('.action-more');
        if (moreBtn) {
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // 2. Xử lý Đóng/Mở (chỉ dành cho Project)
        const header = item.querySelector('.item-header');
        if (header) {
            header.addEventListener('click', function() {
                const content = this.parentElement.querySelector('.item-content');
                const iconExpanded = this.querySelector('.icon-expanded');
                const iconCollapsed = this.querySelector('.icon-collapsed');
                
                if (content) {
                    const isHidden = window.getComputedStyle(content).display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    if (iconExpanded && iconCollapsed) {
                        iconExpanded.style.display = isHidden ? 'block' : 'none';
                        iconCollapsed.style.display = isHidden ? 'none' : 'block';
                    }
                }
            });
        }

        // 3. Khởi tạo Sortable cho danh sách con bên trong Project
        // Điều này giúp Project có thể nhận các Task/Project khác kéo vào
        const subList = item.querySelector('.list-wrapper');
        if (subList) {
            new Sortable(subList, sortableOptions);
        }
    }

    // Gán sự kiện ban đầu cho các item có sẵn trong HTML
    document.querySelectorAll('.project-item, .task-item').forEach(item => {
        attachEventsToNewItem(item);
    });

    // --- LOGIC MODAL & TABS ---

    const btnAdd = document.querySelector('.add-button');
    const btnCancel = document.querySelector('.btn-cancel');
    if (btnAdd && overlay) {
        btnAdd.addEventListener('click', () => overlay.style.display = 'flex');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        });
        btnCancel.addEventListener('click', () => overlay.style.display = 'none');
    }

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

    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', function() {
            const currentSelected = document.querySelector('.color-swatch.selected');
            if (currentSelected) currentSelected.classList.remove('selected');
            this.classList.add('selected');
        });
    });

    // --- LOGIC THÊM ITEM MỚI (CHẠY OFFLINE) ---

    const btnAccept = document.querySelector('.btn-accept');
    if (btnAccept) {
        btnAccept.addEventListener('click', function() {
            const isProjectForm = window.getComputedStyle(projectForm).display !== 'none';
            const activeInput = isProjectForm 
                ? projectForm.querySelector('.modal-input') 
                : taskForm.querySelector('.modal-input');
            
            const nameValue = activeInput.value.trim();
            const selectedSwatch = document.querySelector('.color-swatch.selected');
            const colorValue = selectedSwatch ? selectedSwatch.style.backgroundColor : '#ffffff';

            if (!nameValue) { activeInput.focus(); return; }
            if (!selectedSwatch) return;

            let newHTML = '';
            if (isProjectForm) {
                newHTML = `
                    <li class="project-item">
                        <div class="item-header">
                            <svg class="icon-collapsed" viewBox="0 0 24 24"><polyline points="8,5 16,12 8,19"/></svg>
                            <svg class="icon-expanded" viewBox="0 0 24 24" style="display:none;"><polyline points="5,8 12,16 19,8"/></svg>
                            <svg class="project-icon" viewBox="0 0 64 64">
                                <path d="M8 20 H22 L26 16 H44 Q50 16 50 22 V40 Q50 48 42 48 H16 Q8 48 8 40 Z" fill="${colorValue}"/>
                            </svg>
                            <p class="label">${nameValue}</p>
                            <svg class="action-more" viewBox="0 0 20 5" width="60">
                                <circle cx="5" cy="3" r="1"/><circle cx="10" cy="3" r="1"/><circle cx="15" cy="3" r="1"/>
                            </svg>
                        </div>
                        <div class="item-content" style="display:none;">
                            <ul class="list-wrapper"></ul>
                        </div>
                    </li>`;
            } else {
                newHTML = `
                    <li class="task-item">
                        <svg class="task-icon" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="${colorValue}"/>
                        </svg>
                        <p>${nameValue}</p>
                        <svg class="action-more" viewBox="0 0 20 5" width="60">
                            <circle cx="5" cy="3" r="1"/><circle cx="10" cy="3" r="1"/><circle cx="15" cy="3" r="1"/>
                        </svg>
                    </li>`;
            }

            if (mainListWrapper) {
                mainListWrapper.insertAdjacentHTML('beforeend', newHTML);
                // Gán sự kiện và khả năng Sortable cho phần tử vừa tạo
                attachEventsToNewItem(mainListWrapper.lastElementChild);
            }

            overlay.style.display = 'none';
            activeInput.value = '';
        });
    }
});