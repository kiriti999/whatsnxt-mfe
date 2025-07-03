export interface UploadResponse {
    url: string;
    secure_url: string;
    duration: number;
    public_id: string;
    resource_type: string;
    timestamp: string;
    format: string;
}

export interface ProgressUpdate {
    fileName: string;
    progress: number;
    timestamp: any;
    isCompleted?: boolean;
}

export interface UnifiedUploadOptions {
    file: File;
    folder: string;
    resource_type: string;
    setProgress: (progress: ProgressUpdate) => void;
    addToLocalStorage?: boolean
    bffApiUrl?: any;

    // Optional editor-specific options (for images)
    editor?: any;
    tempUrl?: string;
    lectureId?: string;

    // Behavior options
    rejectOnError?: boolean; // true for promise rejection, false for null return

}

// Unified Delete Worker Interfaces
export interface AssetItem {
    public_id: string;
    resource_type: 'image' | 'video' | 'raw' | 'auto' | string;
}

export interface WorkerResponse {
    status: 'success' | 'error';
    results?: any;
    error?: string;
}

export interface DeleteAssetResult {
    success: boolean;
    results?: any;
    error?: string;
}

// Updated interfaces - remove boolean return option
export interface UnifiedDeleteOptions {
    assetsList: AssetItem[];
    clearLocalStorage?: boolean; // Whether to clear localStorage on success
    returnDetailedResult?: boolean; // Whether to return full details or minimal object
}