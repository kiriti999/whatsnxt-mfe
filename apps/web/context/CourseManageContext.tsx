import { createContext, useCallback, useEffect } from 'react';
import { getUploadedAssets } from '../utils/worker/workerWithLocalStorage';
import { deleteDataWebWorker } from '../components/RichTextEditor/common';

// ** Defaults
const defaultProvider = {};

const CourseManageContext = createContext(defaultProvider);

const CourseManageContextProvider = ({ children }) => {

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
        <CourseManageContext.Provider value={{}}>
            {children}
        </CourseManageContext.Provider>
    );
};

export { CourseManageContext, CourseManageContextProvider };
