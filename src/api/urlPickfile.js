export async function pickUrl() {
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
        width: 500px;
        height: 200px;
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
                    height: 100%;
                }
                .file-picker {
                    width: 100%;
                    height: 100%;
                }
                .container {
                    padding: 20px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    position: absolute;
                    inset: 0;
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
                .url {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                #urlInput {
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
                    max-height: 250px;
                    overflow-y: auto;
                    border: 1px solid #eee;
                    padding: 10px;
                    margin-top: 15px;
                }
                #itemList p {
                    margin: 5px 0;
                    padding: 8px;
                    cursor: pointer;
                    border-radius: 4px;
                    display: flex;
                    justify-content: space-between;
                    transition: background-color 0.2s;
                }
                #itemList p:hover {
                    background-color: #f5f5f5;
                }
                #itemList p.selected {
                    background-color: #e0f0ff;
                    border-left: 4px solid #4a90e2;
                }
                .file-size {
                    color: #666;
                    font-size: 0.9em;
                }
                .no-items {
                    color: #777;
                    text-align: center;
                    padding: 20px;
                    display: none; /* Start hidden */
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
                <div class="container">
                    <button class="close-btn" onclick="closeDialog()">×</button>
                    <h3>Input a .treegridio URL</h3>
                    <div class="url">
                        <input type="text" id="urlInput" placeholder="input .treegridio url..." >
                        <button onclick="confirmUrl()"/>
                    </div>
                    
                </div>
            </div>
            <script>
 
                const instanceId = "${instanceId}";

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
                    } 
                });

                 function confirmUrl() {
                    let selectedItem = document.querySelector('#urlInput').value;
                    if (!selectedItem) {
                        alert('Please input a url first');
                        return;
                    }
                    window.parent.postMessage({
                        type: 'select',
                        instanceId: instanceId,
                        value: selectedItem
                    }, '*');
                }

                document.getElementById('urlInput').focus();
            </script>
        </body>
        </html>
    `);
    iframeDoc.close();

    return new Promise((resolve, reject) => {
        const handleMessage = async (event) => {
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
                try {
                    resolve({
                        filename: event.data.value
                    });
                } catch (error) {
                    reject(error);
                }
            } else if (event.data.type === 'cancel') {
                cleanup();
                reject(new Error(event.data.error));
            }
        };

        window.addEventListener('message', handleMessage);
    });
}

