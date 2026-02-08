document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.querySelector('.modal-overlay');
    const modalBox = document.querySelector('.modal-box');
    const modalMoreBox = document.querySelector('.modal-more-box');
    const projectForm = document.querySelector('.project-form');
    const taskForm = document.querySelector('.task-form');
    const mainListWrapper = document.querySelector('.project-container > .list-wrapper');
    
    // BIẾN TOÀN CỤC: Lưu item đang được chọn để Sửa hoặc Xóa
    let currentSelectedItem = null; 

    // --- HÀM ĐÓNG TẤT CẢ MODAL ---
    function closeAllModals() {
        overlay.style.display = 'none';
        modalBox.style.display = 'none';
        modalMoreBox.style.display = 'none';
        // Reset biến để an toàn
        currentSelectedItem = null; 
    }

    // --- CẤU HÌNH KÉO THẢ (SORTABLE) ---
    const sortableOptions = {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        ghostClass: 'sortable-ghost',
    };

    if (mainListWrapper) {
        new Sortable(mainListWrapper, sortableOptions);
    }

    // --- GÁN SỰ KIỆN CHO ITEM (FOLDER/TASK) ---
    function attachEventsToNewItem(item) {
        // 1. Bấm vào nút modal-more (3 chấm)
        const moreBtn = item.querySelector('.modal-more');
        if (moreBtn) {
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                
                // Gán item vào biến toàn cục để các hàm Delete/Accept bên ngoài sử dụng
                currentSelectedItem = item; 

                // Lấy thông tin hiện tại đưa vào Modal More
                const currentName = item.querySelector('p').innerText;
                const iconPath = item.querySelector('.project-icon path') || item.querySelector('.task-icon circle');
                const currentColor = iconPath ? (iconPath.getAttribute('fill') || iconPath.style.fill) : '#ffffff';

                overlay.style.display = 'flex';
                modalMoreBox.style.display = 'flex';
                modalBox.style.display = 'none';

                modalMoreBox.querySelector('.modal-input').value = currentName;
                
                // Đánh dấu màu trong bảng màu
                const swatches = modalMoreBox.querySelectorAll('.color-swatch');
                swatches.forEach(s => {
                    s.classList.remove('selected');
                    if (s.style.backgroundColor === currentColor) {
                        s.classList.add('selected');
                    }
                });
            });
        }

        // 2. Xử lý Đóng/Mở Folder
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

        // 3. Khởi tạo kéo thả cho sub-list bên trong Folder
        const subList = item.querySelector('.list-wrapper');
        if (subList) {
            new Sortable(subList, sortableOptions);
        }
    }

    // --- XỬ LÝ CÁC NÚT TRONG MODAL MORE (LÀM NGOÀI HÀM ATTACH) ---

    // Nút Accept (Sửa)
    const btnAcceptMore = document.querySelector('.modal-more-box .btn-accept');
    if (btnAcceptMore) {
        btnAcceptMore.addEventListener('click', function() {
            if (!currentSelectedItem) return;
        
            const newName = modalMoreBox.querySelector('.modal-input').value.trim();
            const selectedSwatch = modalMoreBox.querySelector('.color-swatch.selected');
            const newColor = selectedSwatch ? selectedSwatch.style.backgroundColor : '#ffffff';
        
            if (newName === "") return;
        
            currentSelectedItem.querySelector('p').innerText = newName;
            const iconPath = currentSelectedItem.querySelector('.project-icon path') || 
                             currentSelectedItem.querySelector('.task-icon circle');
            if (iconPath) {
                iconPath.setAttribute('fill', newColor);
            }
        
            closeAllModals();
        });
    }

    // Nút Delete (Xóa)
    const btnDelete = document.querySelector('.btn-delete');
    if (btnDelete) {
        btnDelete.addEventListener('click', function() {
            if (currentSelectedItem) {
                currentSelectedItem.remove();
                closeAllModals();
            }
        });
    }

    // --- XỬ LÝ NÚT ADD PROJECT CHÍNH ---
    const btnAdd = document.querySelector('.add-button');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            overlay.style.display = 'flex';
            modalBox.style.display = 'flex';
            modalMoreBox.style.display = 'none';
        });
    }

    // --- ĐÓNG MODAL KHI BẤM RA NGOÀI HOẶC NÚT CANCEL ---
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAllModals();
    });

    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // --- XỬ LÝ TABS TRONG MODAL ADD ---
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

    // --- LOGIC THÊM ITEM MỚI ---
    const btnAccept = document.querySelector('.modal-box .btn-accept');
    if (btnAccept) {
        btnAccept.addEventListener('click', function() {
            const isProjectForm = window.getComputedStyle(projectForm).display !== 'none';
            const activeInput = isProjectForm 
                ? projectForm.querySelector('.modal-input') 
                : taskForm.querySelector('.modal-input');
            
            const nameValue = activeInput.value.trim();
            const selectedSwatch = document.querySelector('.modal-box .color-swatch.selected');
            const colorValue = selectedSwatch ? selectedSwatch.style.backgroundColor : '#ffffff';

            if (!nameValue) { activeInput.focus(); return; }

            let newHTML = '';
            if (isProjectForm) {
                newHTML = `
                    <li class="project-item">
                        <div class="item-header">
                            <svg class="icon-collapsed" viewBox="0 0 24 24"><polyline points="8,5 16,12 8,19"/></svg>
                            <svg class="icon-expanded" viewBox="0 0 24 24" style="display:none;"><polyline points="5,8 12,16 19,8"/></svg>
                            <svg class="project-icon" viewBox="0 0 64 64"><path d="M8 20 H22 L26 16 H44 Q50 16 50 22 V40 Q50 48 42 48 H16 Q8 48 8 40 Z" fill="${colorValue}"/></svg>
                            <p class="label">${nameValue}</p>
                            <div class="modal-more">
                                <svg class="action-more" viewBox="0 0 20 5" width="60">
                                    <circle cx="5" cy="3" r="1"/><circle cx="10" cy="3" r="1"/><circle cx="15" cy="3" r="1"/>
                                </svg>
                            </div>
                        </div>
                        <div class="item-content" style="display:none;"><ul class="list-wrapper"></ul></div>
                    </li>`;
            } else {
                newHTML = `
                    <li class="task-item">
                        <svg class="task-icon" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${colorValue}"/></svg>
                        <p>${nameValue}</p>
                        <div class="modal-more">
                            <svg class="action-more" viewBox="0 0 20 5" width="60">
                                <circle cx="5" cy="3" r="1"/><circle cx="10" cy="3" r="1"/><circle cx="15" cy="3" r="1"/>
                            </svg>
                        </div>
                    </li>`;
            }

            mainListWrapper.insertAdjacentHTML('beforeend', newHTML);
            attachEventsToNewItem(mainListWrapper.lastElementChild);
            closeAllModals();
            activeInput.value = '';
        });
    }

    // Chọn màu (Palette)
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Khởi tạo ban đầu cho các phần tử có sẵn trong HTML
    document.querySelectorAll('.project-item, .task-item').forEach(item => {
        attachEventsToNewItem(item);
    });
});