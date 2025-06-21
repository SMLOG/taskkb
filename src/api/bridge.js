export async function getStorageBridge(m) {
    const isForgeEnv = typeof window !== 'undefined' && [
        atob('cGVyZmVjdHRvZG8uY29t'),
        atob('dHJlZWdyaWQuaW8')
    ].filter(domain => location.href.indexOf(domain) > -1).length == 0;
    let mode = m || "L";

    try {
        if (isForgeEnv) {
            mode = "J"
        }

        return getStorageBridgeByName(mode);


    } catch (error) {
        console.error('Error checking Forge environment:', error);
    }

    const { readJsonAttachment, writeObjectToJsonAttachment, type } = await import('@/api/google');
    return { readJsonAttachment, writeObjectToJsonAttachment, type };

}

export async function getStorageBridgeByName(mode) {
    switch (mode) {
        case "G":
            {
                return await import('@/api/google');
            }
        case "J": {
            return await import('@/api/jira');
        }
        case "L": {
            return await import('@/api/browser');
        }
    }


}