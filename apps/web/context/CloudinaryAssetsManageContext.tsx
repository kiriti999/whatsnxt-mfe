import { createContext, useCallback, useEffect } from 'react';
import { getUploadedAssets } from '../utils/worker/workerWithLocalStorage';
import { deleteDataWebWorker } from '../components/RichTextEditor/common';

// ** Defaults
const defaultProvider = {};

const CloudinaryAssetsManageContext = createContext(defaultProvider);

const CloudinaryAssetsManageContextProvider = ({ children }: { children: React.ReactNode }) => {

    // delete the unused assets if they exists 
    useEffect(() => {
        deleteUnusedAssets()
    }, [])

    const deleteUnusedAssets = useCallback(async () => {
        if (getUploadedAssets() && getUploadedAssets().length > 0) {
            await deleteDataWebWorker({ assetsList: getUploadedAssets() })
        }
    }, [])

    return (
        <CloudinaryAssetsManageContext.Provider value={{}}>
            {children}
        </CloudinaryAssetsManageContext.Provider>
    );
};

export { CloudinaryAssetsManageContext, CloudinaryAssetsManageContextProvider };
