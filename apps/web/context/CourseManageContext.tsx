import { createContext, useCallback, useEffect } from 'react';
import { getAssetFromLocalStorage } from '../utils/worker/localStorageHandler';
import { unifiedDeleteWebWorker } from '../utils/worker/assetManager';

// ** Defaults
const defaultProvider = {};

const CourseManageContext = createContext(defaultProvider);

const CourseManageContextProvider = ({ children }) => {

    // delete the unused assets if they exists 
    useEffect(() => {
        deleteUnusedAssets()
    }, [])

    const deleteUnusedAssets = useCallback(async () => {
        try {
            const storedAssets = getAssetFromLocalStorage();

            // Early return if no assets to clean up
            if (!storedAssets?.length) {
                return;
            }

            console.log(`Cleaning up ${storedAssets.length} unused assets`);
            const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_IMAGEKIT_API;
            await unifiedDeleteWebWorker({ assetsList: storedAssets, clearLocalStorage: true, bffApiUrl });


        } catch (error) {
            console.error('Failed to delete unused assets:', error);

        }
    }, []);

    return (
        <CourseManageContext.Provider value={{}}>
            {children}
        </CourseManageContext.Provider>
    );
};

export { CourseManageContext, CourseManageContextProvider };
