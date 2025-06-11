// progressUtils.ts
export interface ProgressEntry {
    fileName: string;
    timestamp: string;
    progress: number;
}

interface UpdateProgressParams extends ProgressEntry {
    isCompleted?: boolean;
}

export const updateProgressList = (
    prevProgressList: ProgressEntry[],
    { fileName, timestamp, progress, isCompleted = false }: UpdateProgressParams
): ProgressEntry[] => {
    const existingProgressIndex = prevProgressList.findIndex(item => item.timestamp === timestamp);

    if (existingProgressIndex !== -1) {
        // Update existing progress
        const updatedProgressList = [...prevProgressList];
        if (isCompleted) {
            // Remove entry if upload is complete
            updatedProgressList.splice(existingProgressIndex, 1);
        } else {
            // Update entry with new progress
            updatedProgressList[existingProgressIndex].progress = progress;
        }
        return updatedProgressList;
    } else {
        // Add new progress entry
        if (fileName && !isCompleted) {
            return [...prevProgressList, { fileName, timestamp, progress }];
        }
        return [...prevProgressList];
    }
};
