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
            await unifiedDeleteWebWorker({ assetsList: storedAssets });


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
