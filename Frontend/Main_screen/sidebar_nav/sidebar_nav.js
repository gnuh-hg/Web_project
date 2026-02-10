document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.querySelector('.modal-overlay');
    const modalBox = document.querySelector('.modal-box');
    const modalMoreBox = document.querySelector('.modal-more-box');
    
    // Đổi tên biến form để khớp với chức năng mới
    const folderForm = document.querySelector('.folder-form');
    const projectForm = document.querySelector('.project-form'); 
    const mainListWrapper = document.querySelector('.folder-container > .list-wrapper');
    
    let currentSelectedItem = null; 

    // --- HÀM 1: ĐỌC DỮ LIỆU TỪ SERVER ---
    async function loadData() {
        try {
            const response = await fetch('http://localhost:3000/data');
            const items = await response.json();
            items.sort((a, b) => a.position - b.position);
            mainListWrapper.innerHTML = '';

            function renderRecursive(parentId, container) {
                const children = items.filter(item => item.parent_id === parentId);
                children.forEach(item => {
                    renderItem(item, container);
                    if (item.type === "FOLDER") { // Logic cho cấp cha
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

    // --- HÀM 2: TẠO HTML CHO TỪNG ITEM ---
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

    // --- HÀM 3: LƯU DỮ LIỆU ---
    async function saveData() {
        const items = [];
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
                    type: isFolder ? "FOLDER" : "PROJECT", // Cập nhật Type mới
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
                saveData(); 
            });
        }

        const subList = item.querySelector('.list-wrapper');
        if (subList) new Sortable(subList, sortableOptions);
    }

    const btnAccept = document.querySelector('.modal-box .btn-accept');
    if (btnAccept) {
        btnAccept.addEventListener('click', function() {
            // Kiểm tra xem đang ở tab folder hay tab project
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

    // Tab switcher logic
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

    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    loadData();
});