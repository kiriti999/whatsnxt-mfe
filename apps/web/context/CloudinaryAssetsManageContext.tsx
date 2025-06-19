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
            await unifiedDeleteWebWorker({ assetsList: getAssetFromLocalStorage() })
        }
    }, [])

    return (
        <CloudinaryAssetsManageContext.Provider value={{}}>
            {children}
        </CloudinaryAssetsManageContext.Provider>
    );
};

export { CloudinaryAssetsManageContext, CloudinaryAssetsManageContextProvider };
