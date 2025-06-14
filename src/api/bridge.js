export async function getStorageBridge() {
    const isForgeEnv = typeof window !== 'undefined' &&
        window.location.hostname.includes('atlassian.net');

    try {
        if (isForgeEnv) {
            try {
                const { readJsonAttachment, writeObjectToJsonAttachment } = await import('@/api/bridge');
                return { readJsonAttachment, writeObjectToJsonAttachment };

            } catch (error) {
                console.error('Failed to load Forge bridge:', error);
                throw new Error('Forge bridge unavailable');
            }
        }
    } catch (error) {
        console.error('Error checking Forge environment:', error);
    }

                    const { readJsonAttachment, writeObjectToJsonAttachment } = await import('@/api/local');
                return { readJsonAttachment, writeObjectToJsonAttachment };

}