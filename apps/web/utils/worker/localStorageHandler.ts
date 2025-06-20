interface AssetItem {
    public_id: string;
    resource_type: string;
}

const STORAGE_KEY = 'cloudinaryAssets';

export const getAssetFromLocalStorage = (): AssetItem[] => {
    try {
        const storedAssets = localStorage.getItem(STORAGE_KEY);
        return storedAssets ? JSON.parse(storedAssets) : [];
    } catch (error) {
        console.error('Error getting uploaded assets from localStorage:', error);
        return [];
    }
};

export const addAssetOnLocalStorage = (public_id: string, resource_type: string): boolean => {
    try {
        const storedAssets = getAssetFromLocalStorage();

        // Check if asset already exists to avoid duplicates
        const existingAsset = storedAssets.find(asset => asset.public_id === public_id);
        if (existingAsset) {
            return true; // Asset already exists, consider it successful
        }

        storedAssets.push({ public_id, resource_type });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedAssets));
        return true;
    } catch (error) {
        console.error('Error adding uploaded asset to localStorage:', error);
        return false;
    }
};

export const updateAssetOnLocalStorage = (assetsArray: AssetItem[]): boolean => {
    try {
        const storedAssets = getAssetFromLocalStorage();

        // Filter out duplicates before merging
        const existingPublicIds = new Set(storedAssets.map(asset => asset.public_id));
        const newUniqueAssets = assetsArray.filter(asset => !existingPublicIds.has(asset.public_id));

        const newAssets = [...storedAssets, ...newUniqueAssets];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
        return true;
    } catch (error) {
        console.error('Error updating uploaded assets in localStorage:', error);
        return false;
    }
};

export const removeAssetFromLocalStoragesList = (publicIdsToRemove: string[]): boolean => {
    try {
        let storedAssets = getAssetFromLocalStorage();
        storedAssets = storedAssets.filter(asset => !publicIdsToRemove.includes(asset.public_id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedAssets));
        return true;
    } catch (error) {
        console.error('Error removing uploaded assets list from localStorage:', error);
        return false;
    }
};

export const removeAllAssetFromLocalStorage = (): boolean => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error removing all uploaded assets from localStorage:', error);
        return false;
    }
};