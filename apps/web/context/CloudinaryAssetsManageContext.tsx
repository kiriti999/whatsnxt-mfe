import { createContext, useCallback, useEffect } from 'react';
import { getAssetFromLocalStorage } from '../utils/worker/localStorageHandler';
import { unifiedDeleteWebWorker } from '../utils/worker/assetManager';

// ** Defaults
const defaultProvider = {};

const CloudinaryAssetsManageContext = createContext(defaultProvider);

const CloudinaryAssetsManageContextProvider = ({ children }: { children: React.ReactNode }) => {

    // delete the unused assets if they exists 
    useEffect(() => {
        deleteUnusedAssets()
    }, [])

    const deleteUnusedAssets = useCallback(async () => {
        if (getAssetFromLocalStorage() && getAssetFromLocalStorage().length > 0) {
            const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_IMAGEKIT_API;
            await unifiedDeleteWebWorker({ assetsList: getAssetFromLocalStorage(), clearLocalStorage: true, bffApiUrl })
        }
    }, [])

    return (
        <CloudinaryAssetsManageContext.Provider value={{}}>
            {children}
        </CloudinaryAssetsManageContext.Provider>
    );
};

export { CloudinaryAssetsManageContext, CloudinaryAssetsManageContextProvider };
