document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.querySelector('.modal-overlay');
    const modalBox = document.querySelector('.modal-box');
    const modalMoreBox = document.querySelector('.modal-more-box');
    const projectForm = document.querySelector('.project-form');
    const taskForm = document.querySelector('.task-form');
    const mainListWrapper = document.querySelector('.project-container > .list-wrapper');
    
    let currentSelectedItem = null; 

    // --- HÀM 1: ĐỌC DỮ LIỆU TỪ SERVER ---
    async function loadData() {
        try {
            const response = await fetch('http://localhost:3000/data');
            const items = await response.json();
            items.sort((a, b) => a.position - b.position);
            mainListWrapper.innerHTML = '';

            // Hàm đệ quy để render đúng cấp bậc
            function renderRecursive(parentId, container) {
                const children = items.filter(item => item.parent_id === parentId);
                children.forEach(item => {
                    renderItem(item, container); // Render item hiện tại
                    if (item.type === "PROJECT") {
                        const newContainer = document.querySelector(`[data-id="${item.id}"] .list-wrapper`);
                        renderRecursive(item.id, newContainer); // Đệ quy tìm con của item này
                    }
                });
            }

            // Bắt đầu từ cấp cao nhất (parent_id là null hoặc không có)
            renderRecursive(null, mainListWrapper);
        } catch (err) {
            console.error("Lỗi khi load dữ liệu:", err);
        }
    }

    // --- HÀM 2: TẠO HTML CHO TỪNG ITEM ---
    function renderItem(item, wrapper) {
        let html = '';
        const color = item.color || "#ffffff"; 
        // Kiểm tra xem folder có đang được lưu là mở hay không
        const expandedClass = item.expanded ? 'is-expanded' : '';
        const displayStyle = item.expanded ? 'block' : 'none';
        const iconExpandedStyle = item.expanded ? 'block' : 'none';
        const iconCollapsedStyle = item.expanded ? 'none' : 'block';

        if (item.type === "PROJECT") {
            html = `
                <li class="project-item ${expandedClass}" data-id="${item.id}">
                    <div class="item-header">
                        <svg class="icon-collapsed" viewBox="0 0 24 24" style="display:${iconCollapsedStyle};"><polyline points="8,5 16,12 8,19"/></svg>
                        <svg class="icon-expanded" viewBox="0 0 24 24" style="display:${iconExpandedStyle};"><polyline points="5,8 12,16 19,8"/></svg>
                        <svg class="project-icon" viewBox="0 0 64 64"><path d="M8 20 H22 L26 16 H44 Q50 16 50 22 V40 Q50 48 42 48 H16 Q8 48 8 40 Z" fill="${color}"/></svg>
                        <p class="label">${item.name}</p>
                        <div class="modal-more"><svg class="action-more" viewBox="0 0 20 5" width="60"><circle cx="5" cy="3" r="1"/><circle cx="10" cy="3" r="1"/><circle cx="15" cy="3" r="1"/></svg></div>
                    </div>
                    <div class="item-content"><ul class="list-wrapper"></ul></div>
                </li>`;
        } else {
            html = `
                <li class="task-item" data-id="${item.id}">
                    <svg class="task-icon" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${color}"/></svg>
                    <p>${item.name}</p>
                    <div class="modal-more"><svg class="action-more" viewBox="0 0 20 5" width="60"><circle cx="5" cy="3" r="1"/><circle cx="10" cy="3" r="1"/><circle cx="15" cy="3" r="1"/></svg></div>
                </li>`;
        }

        wrapper.insertAdjacentHTML('beforeend', html);
        attachEventsToNewItem(wrapper.lastElementChild);
    }

    // --- HÀM 3: LƯU DỮ LIỆU ---
    async function saveData() {
        const items = [];
        function traverse(wrapper, parentId = null) {
            const listItems = wrapper.querySelectorAll(':scope > li');
            listItems.forEach((li, index) => {
                const id = li.getAttribute('data-id');
                const name = li.querySelector('p').innerText;
                const isProject = li.classList.contains('project-item');
                const iconPath = li.querySelector('.project-icon path') || li.querySelector('.task-icon circle');
                const currentColor = iconPath ? (iconPath.getAttribute('fill') || iconPath.style.fill) : '#ffffff';
                
                // Kiểm tra xem folder có class is-expanded không
                const isExpanded = li.classList.contains('is-expanded');

                items.push({
                    id: id,
                    name: name,
                    type: isProject ? "PROJECT" : "TASK",
                    parent_id: parentId,
                    position: index,
                    color: currentColor,
                    expanded: isExpanded // Lưu trạng thái mở/đóng
                });

                if (isProject) {
                    const subWrapper = li.querySelector('.list-wrapper');
                    if (subWrapper) traverse(subWrapper, id);
                }
            });
        }
        traverse(mainListWrapper);

        try {
            await fetch('http://localhost:3000/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(items)
            });
        } catch (err) { console.error("Lỗi lưu dữ liệu:", err); }
    }

    // ... (Các hàm modal giữ nguyên) ...
    function closeAllModals() {
        overlay.style.display = 'none';
        modalBox.style.display = 'none';
        modalMoreBox.style.display = 'none';
        currentSelectedItem = null; 
    }

    const sortableOptions = {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        ghostClass: 'sortable-ghost',
        onEnd: saveData
    };

    if (mainListWrapper) new Sortable(mainListWrapper, sortableOptions);

    function attachEventsToNewItem(item) {
        // Modal more btn
        const moreBtn = item.querySelector('.modal-more');
        if (moreBtn) {
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                currentSelectedItem = item; 
                const currentName = item.querySelector('p').innerText;
                const iconPath = item.querySelector('.project-icon path') || item.querySelector('.task-icon circle');
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

        // Click header mở folder
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
                // Quan trọng: Lưu trạng thái ngay khi người dùng click mở/đóng
                saveData(); 
            });
        }

        const subList = item.querySelector('.list-wrapper');
        if (subList) new Sortable(subList, sortableOptions);
    }

    // ... (Các sự kiện Accept/Delete/Tab giữ nguyên như code trước của bạn) ...
    // Note: Đảm bảo phần "Chấp nhận thêm mới" gọi hàm renderItem thay vì viết HTML thủ công
    const btnAccept = document.querySelector('.modal-box .btn-accept');
    if (btnAccept) {
        btnAccept.addEventListener('click', function() {
            const isProjectForm = window.getComputedStyle(projectForm).display !== 'none';
            const activeInput = isProjectForm ? projectForm.querySelector('.modal-input') : taskForm.querySelector('.modal-input');
            const nameValue = activeInput.value.trim();
            const selectedSwatch = document.querySelector('.modal-box .color-swatch.selected');
            const colorValue = selectedSwatch ? selectedSwatch.style.backgroundColor : '#ffffff';
            if (!nameValue) { activeInput.focus(); return; }

            const newId = (isProjectForm ? 'p' : 't') + Date.now();
            renderItem({
                id: newId,
                name: nameValue,
                type: isProjectForm ? "PROJECT" : "TASK",
                color: colorValue,
                parent_id: null,
                expanded: false
            }, mainListWrapper);

            closeAllModals();
            activeInput.value = '';
            saveData();
        });
    }

    // Các listener còn lại
    const btnAcceptMore = document.querySelector('.modal-more-box .btn-accept');
    if (btnAcceptMore) {
        btnAcceptMore.addEventListener('click', function() {
            if (!currentSelectedItem) return;
            const newName = modalMoreBox.querySelector('.modal-input').value.trim();
            const selectedSwatch = modalMoreBox.querySelector('.color-swatch.selected');
            const newColor = selectedSwatch ? selectedSwatch.style.backgroundColor : '#ffffff';
            if (newName === "") return;
            currentSelectedItem.querySelector('p').innerText = newName;
            const iconPath = currentSelectedItem.querySelector('.project-icon path') || currentSelectedItem.querySelector('.task-icon circle');
            if (iconPath) iconPath.setAttribute('fill', newColor);
            closeAllModals();
            saveData();
        });
    }

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

    const btnAdd = document.querySelector('.add-button');
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            overlay.style.display = 'flex';
            modalBox.style.display = 'flex';
            modalMoreBox.style.display = 'none';
        });
    }

    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAllModals(); });
    document.querySelectorAll('.btn-cancel').forEach(btn => btn.addEventListener('click', closeAllModals));

    const btnTabProject = document.querySelector('.btn-tab-project');
    const btnTabTask = document.querySelector('.btn-tab-task');
    if (btnTabProject && btnTabTask) {
        btnTabProject.addEventListener('click', () => {
            btnTabProject.style.borderBottom = "1px solid #00FFFF";
            btnTabTask.style.borderBottom = "1px solid #2b2d31";
            projectForm.style.display = "block"; taskForm.style.display = "none";
        });
        btnTabTask.addEventListener('click', () => {
            btnTabTask.style.borderBottom = "1px solid #00FFFF";
            btnTabProject.style.borderBottom = "1px solid #2b2d31";
            taskForm.style.display = "block"; projectForm.style.display = "none";
        });
    }

    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    loadData();
});