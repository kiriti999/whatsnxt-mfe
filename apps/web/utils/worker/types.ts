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
    bffApiUrl?: string;

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
  error?: string;
  results?: any;
}

// Image Safety Types
export interface SafeSearchResult {
  adult: 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
  spoof: 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
  medical: 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
  violence: 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
  racy: 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
}

export interface ImageSafetyResult {
  safe: boolean;
  safeSearch: SafeSearchResult;
  blockedReasons: string[];
  confidence: 'low' | 'medium' | 'high';
}