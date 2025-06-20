import {
    createContext,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
    useEffect,
    useCallback,
} from 'react';
import useAuth from '../hooks/Authentication/useAuth';
import { getAssetFromLocalStorage } from '../utils/worker/localStorageHandler';
import { unifiedDeleteWebWorker } from '../utils/worker/assetManager';

// ** Defaults
interface ProgressEntry {
    fileName: string;
    timestamp: string;
    progress: number;
}

interface TiptapManageContextProps {
    courseId?: string;
    progressList: ProgressEntry[];
    setProgressList: Dispatch<SetStateAction<ProgressEntry[]>>;
    userId?: string | '';
    updateProgress: (entry: ProgressEntry) => void;
    isAssetsUploading: boolean;
}

const defaultProvider: TiptapManageContextProps = {
    courseId: '',
    progressList: [],
    setProgressList: () => { },
    updateProgress: () => { },
    isAssetsUploading: false,
    userId: '',
};

const TiptapManageContext = createContext(defaultProvider);

interface TiptapManageContextProviderProps {
    children: ReactNode;
    courseId?: string;
    setIsAssetsUploading: Dispatch<SetStateAction<boolean>>
    isAssetsUploading: boolean
}

const TiptapManageContextProvider = ({ isAssetsUploading, children, courseId, setIsAssetsUploading }: TiptapManageContextProviderProps) => {
    const [progressList, setProgressList] = useState<ProgressEntry[]>([]);
    const [userId, setUserId] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (progressList.length > 0) {
            setIsAssetsUploading(true)
        } else {
            setIsAssetsUploading(false)
        }
    }, [progressList])

    useEffect(() => {
        if (user) {
            (async function () {
                const userId = user?.id
                // @ts-ignore
                setUserId(userId);
            })();
        }

    }, [user]);


    // delete ids on unload
    useEffect(() => {
        return () => {
            // calls on unload
            deleteUnusedAssets()
        }
    }, [])

    const deleteUnusedAssets = useCallback(async () => {
        if (getAssetFromLocalStorage() && getAssetFromLocalStorage().length > 0) {
            await unifiedDeleteWebWorker({ assetsList: getAssetFromLocalStorage(), clearLocalStorage: true })
        }
    }, [])


    const updateProgress = ({ fileName, timestamp, progress, isCompleted = false }) => {
        setProgressList(prevProgressList => {
            const existingProgressIndex = prevProgressList.findIndex(item => item.timestamp === timestamp);

            if (existingProgressIndex !== -1) {
                // Update existing progress
                const updatedProgressList = [...prevProgressList];
                if (isCompleted) {
                    // Remove entry if upload is complete
                    updatedProgressList.splice(existingProgressIndex, 1);
                } else {
                    // update entry if upload is complete
                    updatedProgressList[existingProgressIndex].progress = progress;
                }
                return updatedProgressList;
            } else {
                // Add new progress entry
                if (fileName && !isCompleted) {
                    return [...prevProgressList, { fileName, timestamp, progress }]
                }

                return [...prevProgressList]
            }
        });
    };

    const contextValue = {
        courseId,
        setProgressList,
        progressList,
        updateProgress, isAssetsUploading
    };

    return (
        <TiptapManageContext.Provider value={contextValue}>
            {children}
        </TiptapManageContext.Provider>
    );
};

export { TiptapManageContext, TiptapManageContextProvider };
