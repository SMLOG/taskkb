// Dynamically load scripts
export async function loadScript(src, onload)  {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            onload && onload();
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
};