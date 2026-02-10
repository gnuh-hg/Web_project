document.addEventListener('DOMContentLoaded', function() {
    // --- 1. KHAI BÁO BIẾN & TRUY XUẤT DOM ELEMENTS ---
    const overlay = document.querySelector('.modal-overlay');
    const modalBox = document.querySelector('.modal-box');
    const modalMoreBox = document.querySelector('.modal-more-box');
    
    const folderForm = document.querySelector('.folder-form');
    const projectForm = document.querySelector('.project-form'); 
    const mainListWrapper = document.querySelector('.folder-container > .list-wrapper');
    
    let currentSelectedItem = null; // Biến tạm lưu item đang tương tác (để sửa/xóa)

    // --- 2. QUẢN LÝ DỮ LIỆU (LOAD/SAVE) ---

    // Hàm đọc dữ liệu từ server và dựng cây thư mục (Recursive)
    async function loadData() {
        try {
            const response = await fetch('http://localhost:3000/data');
            const items = await response.json();
            
            // Sắp xếp các mục theo thứ tự position trước khi hiển thị
            items.sort((a, b) => a.position - b.position);
            mainListWrapper.innerHTML = '';

            // Hàm đệ quy: Tìm và vẽ các mục con dựa trên parent_id
            function renderRecursive(parentId, container) {
                const children = items.filter(item => item.parent_id === parentId);
                children.forEach(item => {
                    renderItem(item, container);
                    if (item.type === "FOLDER") {
                        const newContainer = document.querySelector(`[data-id="${item.id}"] .list-wrapper`);
                        if (newContainer) renderRecursive(item.id, newContainer);
                    }
                });
            }
            renderRecursive(null, mainListWrapper);
        } catch (err) {
            console.error("Lỗi khi load dữ liệu:", err);
        }
    }

    // Hàm thu thập trạng thái hiện tại của DOM và gửi POST để lưu vào server
    async function saveData() {
        const items = [];
        
        // Duyệt qua cây DOM hiện tại để chuyển thành mảng JSON
        function traverse(wrapper, parentId = null) {
            const listItems = wrapper.querySelectorAll(':scope > li');
            listItems.forEach((li, index) => {
                const id = li.getAttribute('data-id');
                const name = li.querySelector('p').innerText;
                const isFolder = li.classList.contains('folder-item');
                const iconPath = li.querySelector('.folder-icon path') || li.querySelector('.project-icon circle');
                const currentColor = iconPath ? (iconPath.getAttribute('fill') || iconPath.style.fill) : '#ffffff';
                const isExpanded = li.classList.contains('is-expanded');

                items.push({
                    id: id,
                    name: name,
                    type: isFolder ? "FOLDER" : "PROJECT",
                    parent_id: parentId,
                    position: index,
                    color: currentColor,
                    expanded: isExpanded
                });

                if (isFolder) {
                    const subWrapper = li.querySelector('.list-wrapper');
                    if (subWrapper) traverse(subWrapper, id);
                }
            });
        }
        if (mainListWrapper) traverse(mainListWrapper);

        try {
            await fetch('http://localhost:3000/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(items)
            });
        } catch (err) { console.error("Lỗi lưu dữ liệu:", err); }
    }

    // --- 3. LOGIC GIAO DIỆN (RENDER & EVENTS) ---

    // Tạo HTML cho từng item và gắn vào wrapper
    function renderItem(item, wrapper) {
        let html = '';
        const color = item.color || "#ffffff"; 
        const expandedClass = item.expanded ? 'is-expanded' : '';
        const iconExpandedStyle = item.expanded ? 'block' : 'none';
        const iconCollapsedStyle = item.expanded ? 'none' : 'block';

        if (item.type === "FOLDER") {
            html = `
                <li class="folder-item ${expandedClass}" data-id="${item.id}">
                    <div class="item-header">
                        <svg class="icon-collapsed" viewBox="0 0 24 24" style="display:${iconCollapsedStyle};"><polyline points="8,5 16,12 8,19"/></svg>
                        <svg class="icon-expanded" viewBox="0 0 24 24" style="display:${iconExpandedStyle};"><polyline points="5,8 12,16 19,8"/></svg>
                        <svg class="folder-icon" viewBox="0 0 64 64"><path d="M8 20 H22 L26 16 H44 Q50 16 50 22 V40 Q50 48 42 48 H16 Q8 48 8 40 Z" fill="${color}"/></svg>
                        <p class="label">${item.name}</p>
                        <div class="modal-more"><svg class="action-more" viewBox="0 0 20 5" width="60"><circle cx="5" cy="3" r="1"/><circle cx="10" cy="3" r="1"/><circle cx="15" cy="3" r="1"/></svg></div>
                    </div>
                    <div class="item-content"><ul class="list-wrapper"></ul></div>
                </li>`;
        } else {
            html = `
                <li class="project-item-child" data-id="${item.id}">
                    <svg class="project-icon" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${color}"/></svg>
                    <p>${item.name}</p>
                    <div class="modal-more"><svg class="action-more" viewBox="0 0 20 5" width="60"><circle cx="5" cy="3" r="1"/><circle cx="10" cy="3" r="1"/><circle cx="15" cy="3" r="1"/></svg></div>
                </li>`;
        }

        wrapper.insertAdjacentHTML('beforeend', html);
        attachEventsToNewItem(wrapper.lastElementChild);
    }

    // Gán các sự kiện click, đóng mở và Sortable cho item mới
    function attachEventsToNewItem(item) {
        // Sự kiện cho nút Option (...)
        const moreBtn = item.querySelector('.modal-more');
        if (moreBtn) {
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                currentSelectedItem = item; 
                const currentName = item.querySelector('p').innerText;
                const iconPath = item.querySelector('.folder-icon path') || item.querySelector('.project-icon circle');
                const currentColor = iconPath ? (iconPath.getAttribute('fill') || iconPath.style.fill) : '#ffffff';
                
                overlay.style.display = 'flex';
                modalMoreBox.style.display = 'flex';
                modalBox.style.display = 'none';
                modalMoreBox.querySelector('.modal-input').value = currentName;
                
                const swatches = modalMoreBox.querySelectorAll('.color-swatch');
                swatches.forEach(s => {
                    s.classList.remove('selected');
                    if (s.style.backgroundColor === currentColor) s.classList.add('selected');
                });
            });
        }

        // Sự kiện đóng/mở Folder
        const header = item.querySelector('.item-header');
        if (header) {
            header.addEventListener('click', function() {
                const parentLi = this.parentElement;
                parentLi.classList.toggle('is-expanded');

                const iconExpanded = this.querySelector('.icon-expanded');
                const iconCollapsed = this.querySelector('.icon-collapsed');
                
                if (iconExpanded && iconCollapsed) {
                    const isExpanded = parentLi.classList.contains('is-expanded');
                    iconExpanded.style.display = isExpanded ? 'block' : 'none';
                    iconCollapsed.style.display = isExpanded ? 'none' : 'block';
                }
                saveData(); // Lưu lại trạng thái expanded
            });
        }

        // Khởi tạo kéo thả cho danh sách con (nếu là folder)
        const subList = item.querySelector('.list-wrapper');
        if (subList) new Sortable(subList, sortableOptions);

        item.addEventListener('click', function(e) {
        // Ngăn chặn kích hoạt khi click vào nút "More" hoặc nút "Đóng/Mở" folder
        if (e.target.closest('.modal-more') || e.target.closest('.icon-collapsed') || e.target.closest('.icon-expanded')) {
            return;
        }

        const projectId = item.getAttribute('data-id');
        const isFolder = item.classList.contains('folder-item');
        if (!isFolder) displayProjectDashboard(projectId);
    });
    
    }

    // --- 4. CẤU HÌNH SORTABLE (KÉO THẢ) ---
    const sortableOptions = {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        ghostClass: 'sortable-ghost',
        onEnd: saveData // Mỗi khi thả item sẽ tự động lưu lại toàn bộ cấu trúc
    };

    if (mainListWrapper) new Sortable(mainListWrapper, sortableOptions);

    // --- 5. LOGIC MODAL & Tương tác người dùng ---

    function closeAllModals() {
        overlay.style.display = 'none';
        modalBox.style.display = 'none';
        modalMoreBox.style.display = 'none';
        currentSelectedItem = null; 
    }

    // Chấp nhận tạo mới Folder/Project
    const btnAccept = document.querySelector('.modal-box .btn-accept');
    if (btnAccept) {
        btnAccept.addEventListener('click', function() {
            const isFolderForm = window.getComputedStyle(folderForm).display !== 'none';
            const activeInput = isFolderForm ? folderForm.querySelector('.modal-input') : projectForm.querySelector('.modal-input');
            const nameValue = activeInput.value.trim();
            const selectedSwatch = document.querySelector('.modal-box .color-swatch.selected');
            const colorValue = selectedSwatch ? selectedSwatch.style.backgroundColor : '#ffffff';
            
            if (!nameValue) { activeInput.focus(); return; }

            const newId = (isFolderForm ? 'f' : 'p') + Date.now();
            renderItem({
                id: newId,
                name: nameValue,
                type: isFolderForm ? "FOLDER" : "PROJECT",
                color: colorValue,
                parent_id: null,
                expanded: false
            }, mainListWrapper);

            closeAllModals();
            activeInput.value = '';
            saveData();
        });
    }

    // Chấp nhận chỉnh sửa (Modal More)
    const btnAcceptMore = document.querySelector('.modal-more-box .btn-accept');
    if (btnAcceptMore) {
        btnAcceptMore.addEventListener('click', function() {
            if (!currentSelectedItem) return;
            const newName = modalMoreBox.querySelector('.modal-input').value.trim();
            const selectedSwatch = modalMoreBox.querySelector('.color-swatch.selected');
            const newColor = selectedSwatch ? selectedSwatch.style.backgroundColor : '#ffffff';
            
            if (newName === "") return;
            currentSelectedItem.querySelector('p').innerText = newName;
            const iconPath = currentSelectedItem.querySelector('.folder-icon path') || currentSelectedItem.querySelector('.project-icon circle');
            if (iconPath) iconPath.setAttribute('fill', newColor);
            
            closeAllModals();
            saveData();
        });
    }

    // Xóa item
    const btnDelete = document.querySelector('.btn-delete');
    if (btnDelete) {
        btnDelete.addEventListener('click', function() {
            if (currentSelectedItem) {
                currentSelectedItem.remove();
                closeAllModals();
                saveData();
            }
        });
    }

    // Mở modal thêm mới
    const btnAdd = document.querySelector('.add-button');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            overlay.style.display = 'flex';
            modalBox.style.display = 'flex';
            modalMoreBox.style.display = 'none';
        });
    }

    // Đóng modal khi bấm Cancel hoặc bấm ra ngoài Overlay
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAllModals(); });
    document.querySelectorAll('.btn-cancel').forEach(btn => btn.addEventListener('click', closeAllModals));

    // Logic chuyển đổi Tab (Folder <-> Project) trong Modal
    const btnTabFolder = document.querySelector('.btn-tab-folder');
    const btnTabProject = document.querySelector('.btn-tab-project');
    
    if (btnTabFolder && btnTabProject) {
        btnTabFolder.addEventListener('click', () => {
            btnTabFolder.style.borderBottom = "1px solid #00FFFF";
            btnTabProject.style.borderBottom = "1px solid #2b2d31";
            folderForm.style.display = "block"; 
            projectForm.style.display = "none";
        });
        btnTabProject.addEventListener('click', () => {
            btnTabProject.style.borderBottom = "1px solid #00FFFF";
            btnTabFolder.style.borderBottom = "1px solid #2b2d31";
            projectForm.style.display = "block"; 
            folderForm.style.display = "none";
        });
    }

    // Xử lý sự kiện chọn bảng màu
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // --- 6. KHỞI CHẠY LẦN ĐẦU ---
    loadData();
});