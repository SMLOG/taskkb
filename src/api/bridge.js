export async function getStorageBridge() {
    const domains = [
        atob('cGVyZmVjdHRvZG8uY29t'), 
        atob('dHJlZWdyaWQuaW8')       
    ];
    const isForgeEnv = typeof window !== 'undefined' && domains.filter(domain => location.href.indexOf(domain)>-1).length==0

    try {
        if (isForgeEnv) {
            try {
                const { readJsonAttachment, writeObjectToJsonAttachment} = await import('@/api/jira');
                return { readJsonAttachment, writeObjectToJsonAttachment,type :"Attachment" };

            } catch (error) {
                console.error('Failed to load Forge bridge:', error);
                throw new Error('Forge bridge unavailable');
            }
        }
    } catch (error) {
        console.error('Error checking Forge environment:', error);
    }

                    const { readJsonAttachment, writeObjectToJsonAttachment,type } = await import('@/api/local');
                return { readJsonAttachment, writeObjectToJsonAttachment,type:'localStorage' };

}