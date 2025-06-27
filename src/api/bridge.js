export async function getStorageBridge(m) {
    return getStorageBridgeByName(m);
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
        case "B": {
            return await import('@/api/browser');
        }
        case "D": {
            return await import('@/api/device');
        }
        case "L": {
            return await import('@/api/localStorage');
        }
        case "U": {
            return await import('@/api/url');
        }
    }


}