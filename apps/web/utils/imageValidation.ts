/**
 * Shared image validation utilities
 */

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = (
  file: File,
  options: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    setValidationError: (error: string) => void;
  }
): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const { minWidth, minHeight, maxWidth, maxHeight, setValidationError } = options;

      const isValidMin = img.width >= minWidth && img.height >= minHeight;
      const isValidMax = img.width <= maxWidth && img.height <= maxHeight;

      if (!isValidMin) {
        setValidationError(
          `Image dimensions too small. Min: ${minWidth}x${minHeight}px, Actual: ${img.width}x${img.height}px`
        );
      } else if (!isValidMax) {
        setValidationError(
          `Image dimensions too large. Max: ${maxWidth}x${maxHeight}px, Actual: ${img.width}x${img.height}px`
        );
      }

      resolve(isValidMin && isValidMax);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      options.setValidationError('Invalid image file');
      resolve(false);
    };

    img.src = url;
  });
};

/**
 * Comprehensive file validation
 * Returns a Promise<boolean> and uses setValidationError to set error messages
 */
export const validateFile = async (
  file: File,
  options: {
    maxSize: number;
    allowedTypes: string[];
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    setValidationError: (error: string) => void;
  }
): Promise<boolean> => {
  const { maxSize, allowedTypes, setValidationError } = options;

  // Validate inputs
  if (!allowedTypes || !Array.isArray(allowedTypes)) {
    setValidationError('Invalid validation configuration: allowedTypes must be an array');
    return false;
  }

  if (!maxSize || maxSize <= 0) {
    setValidationError('Invalid validation configuration: maxSize must be a positive number');
    return false;
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    setValidationError(`Unsupported file format. Supported: ${allowedTypes.join(', ')}`);
    return false;
  }

  // Check file size
  if (file.size > maxSize) {
    setValidationError(
      `File too large: ${formatFileSize(file.size)}. Maximum allowed: ${formatFileSize(maxSize)}`
    );
    return false;
  }

  // Check image dimensions
  const dimensionsValid = await validateImageDimensions(file, options);
  return dimensionsValid;
};

/**
 * Default validation options for different image types
 */
export const DEFAULT_VALIDATION_OPTIONS = {
  BLOG_TUTORIAL: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/png', 'image/jpg', 'image/jpeg'],
    minWidth: 750,
    minHeight: 422,
    maxWidth: 6000,
    maxHeight: 6000,
  },
  PROFILE: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/png', 'image/jpg', 'image/jpeg'],
    minWidth: 150,
    minHeight: 150,
    maxWidth: 2048,
    maxHeight: 2048,
  },
  RICH_TEXT_EDITOR: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/png', 'image/jpg', 'image/jpeg'],
    minWidth: 1,
    minHeight: 1,
    maxWidth: 4096,
    maxHeight: 4096,
  }
};