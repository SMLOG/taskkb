export async function pickFile() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    
    // Create iframe dynamically as child of overlay
    const iframe = document.createElement('iframe');
    iframe.id = 'pickerFrame';
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    // Apply styles
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    iframe.style.cssText = `
        width: 450px;
        height: 300px;
        border: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        background: white;
        border: 1px solid #ccc;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transition: all 0.3s ease;
        border-radius: 8px;
    `;

    // Force reflow for transitions
    void overlay.offsetWidth;
    void iframe.offsetWidth;

    // Animate in
    overlay.style.opacity = '1';
    iframe.style.opacity = '1';
    iframe.style.transform = 'translate(-50%, -50%) scale(1)';

    // Generate unique ID
    const instanceId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            iframe.contentWindow.postMessage({
                type: 'cancel',
                instanceId,
                error: 'Clicked outside'
            }, '*');
        }
    });

    // Create iframe content
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                }
                .file-picker {
                    padding: 20px;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                }
                .close-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-size: 20px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    color: #666;
                }
                .close-btn:hover {
                    color: #333;
                }
                .search-bar {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                    gap: 8px;
                }
                #searchInput {
                    padding: 8px;
                    flex-grow: 1;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                button {
                    padding: 8px 16px;
                    background-color: #f0f0f0;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                button:hover {
                    background-color: #e0e0e0;
                }
                #itemList {
                    flex-grow: 1;
                    max-height: 180px;
                    overflow-y: auto;
                    border: 1px solid #eee;
                    padding: 10px;
                    margin-bottom: 15px;
                }
                #itemList p {
                    margin: 5px 0;
                    padding: 8px;
                    cursor: pointer;
                    border-radius: 4px;
                }
                #itemList p:hover {
                    background-color: #f5f5f5;
                }
                #itemList p.selected {
                    background-color: #e0f0ff;
                }
                .no-items {
                    color: #777;
                    text-align: center;
                    padding: 20px;
                }
                .button-container {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                .button-container button:first-child {
                    background-color: #4a90e2;
                    color: white;
                }
                .button-container button:first-child:hover {
                    background-color: #3a7bc8;
                }
            </style>
        </head>
        <body>
            <div class="file-picker">
                <button class="close-btn" onclick="closeDialog()">×</button>
                <h3>Select a file</h3>
                <div class="search-bar">
                    <input type="text" id="searchInput" placeholder="*.tregridio" onkeyup="filterItems()">
                    <button onclick="searchItems()">Search</button>
                    <button onclick="sortItems()">A-Z</button>
                </div>
                <div id="itemList">
                    <p class="no-items" id="noItems">No items found</p>
                </div>
                <div class="button-container">
                    <button onclick="selectItem()">Select</button>
                    <button onclick="cancel()">Cancel</button>
                </div>
            </div>
            <script>
                const instanceId = "${instanceId}";
                let selectedItem = null;

                function loadItems() {
                    const items = JSON.parse(localStorage.getItem('files') || '[]');
                    const list = document.getElementById('itemList');
                    const noItems = document.getElementById('noItems');
                    list.innerHTML = '';
                    
                    if (items.length === 0) {
                        noItems.style.display = 'block';
                    } else {
                        noItems.style.display = 'none';
                        items.forEach(item => {
                            const p = document.createElement('p');
                            p.textContent = item;
                            p.onclick = () => {
                                const prevSelected = list.querySelector('.selected');
                                if (prevSelected) prevSelected.classList.remove('selected');
                                p.classList.add('selected');
                                selectedItem = item;
                            };
                            list.appendChild(p);
                        });
                    }
                }

                function filterItems() {
                    const input = document.getElementById('searchInput').value.toLowerCase();
                    const items = JSON.parse(localStorage.getItem('files') || '[]');
                    const list = document.getElementById('itemList');
                    list.innerHTML = '';
                    selectedItem = null;
                    
                    const filtered = items.filter(item => item.toLowerCase().includes(input));
                    const noItems = document.getElementById('noItems');
                    
                    if (filtered.length === 0) {
                        noItems.style.display = 'block';
                    } else {
                        noItems.style.display = 'none';
                        filtered.forEach(item => {
                            const p = document.createElement('p');
                            p.textContent = item;
                            p.onclick = () => {
                                const prevSelected = list.querySelector('.selected');
                                if (prevSelected) prevSelected.classList.remove('selected');
                                p.classList.add('selected');
                                selectedItem = item;
                            };
                            list.appendChild(p);
                        });
                    }
                }

                function searchItems() {
                    filterItems();
                }

                function sortItems() {
                    const items = JSON.parse(localStorage.getItem('files') || '[]').sort();
                    localStorage.setItem('files', JSON.stringify(items));
                    loadItems();
                }

                function selectItem() {
                    if (!selectedItem) {
                        alert('Please select a file first');
                        return;
                    }
                    window.parent.postMessage({
                        type: 'select',
                        instanceId: instanceId,
                        value: selectedItem
                    }, '*');
                }

                function cancel() {
                    window.parent.postMessage({
                        type: 'cancel',
                        instanceId: instanceId,
                        error: 'Selection cancelled'
                    }, '*');
                }

                function closeDialog() {
                    window.parent.postMessage({
                        type: 'cancel',
                        instanceId: instanceId,
                        error: 'Dialog closed'
                    }, '*');
                }

                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        closeDialog();
                    } else if (e.key === 'Enter' && document.activeElement.id !== 'searchInput') {
                        selectItem();
                    }
                });

                // Initialize
                if (!localStorage.getItem('files')) {
                    localStorage.setItem('files', JSON.stringify([
                        'document1.tregridio',
                        'report2.tregridio',
                        'project3.tregridio'
                    ]));
                }
                document.getElementById('searchInput').focus();
                loadItems();
            </script>
        </body>
        </html>
    `);
    iframeDoc.close();

    return new Promise((resolve, reject) => {
        const handleMessage = (event) => {
            if (event.data.instanceId !== instanceId) return;

            const cleanup = () => {
                window.removeEventListener('message', handleMessage);
                overlay.style.opacity = '0';
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 300);
            };

            if (event.data.type === 'select') {
                cleanup();
                resolve(event.data.value);
            } else if (event.data.type === 'cancel') {
                cleanup();
                reject(new Error(event.data.error));
            }
        };

        window.addEventListener('message', handleMessage);
    });
}