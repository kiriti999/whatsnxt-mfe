import { useContext, useRef, useState, useCallback, useEffect } from 'react';
import { TiptapManageContext } from '../../../../context/TiptapManageContext';
import { IconPhoto } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { unifiedUploadWebWorker } from '../../../../utils/worker/assetManager';

// File size limits (in bytes)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const RECOMMENDED_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_DIMENSIONS = { width: 4096, height: 4096 }; // 4K max

// Supported image formats
const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// Custom Image button component
const ImageControl = ({ editor }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { courseId, updateProgress } = useContext(TiptapManageContext);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const activeUploads = useRef(new Set<string>());

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate image dimensions
  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const isValid = img.width <= MAX_DIMENSIONS.width && img.height <= MAX_DIMENSIONS.height;
        if (!isValid) {
          setValidationError(`Image dimensions too large. Max: ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height}px, Actual: ${img.width}x${img.height}px`);
        }
        resolve(isValid);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setValidationError('Invalid image file');
        resolve(false);
      };

      img.src = url;
    });
  };

  // Comprehensive file validation
  const validateFile = async (file: File): Promise<boolean> => {
    // Clear previous errors
    setValidationError(null);

    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setValidationError(`Unsupported file format. Supported: ${SUPPORTED_FORMATS.join(', ')}`);
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File too large: ${formatFileSize(file.size)}. Maximum allowed: ${formatFileSize(MAX_FILE_SIZE)}`);
      return false;
    }

    // Warn about large files
    if (file.size > RECOMMENDED_SIZE) {
      console.warn(`Large file detected: ${formatFileSize(file.size)}. Consider optimizing for better performance.`);
    }

    // Check image dimensions
    const dimensionsValid = await validateImageDimensions(file);
    return dimensionsValid;
  };

  // Optional: Compress large images
  const compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the target value so it allows adding the same files
    event.target.value = '';

    if (!file || !editor || isUploading) {
      return;
    }

    // Validate file before processing
    const isValid = await validateFile(file);
    if (!isValid) {
      // Error message is already set by validateFile
      setTimeout(() => setValidationError(null), 5000); // Clear error after 5s
      return;
    }

    // Prevent multiple simultaneous uploads
    setIsUploading(true);

    let tempUrl: string | null = null;
    let finalFile = file;

    try {
      // Auto-compress if file is large but within limits
      if (file.size > RECOMMENDED_SIZE) {
        console.log('Compressing large image...');
        finalFile = await compressImage(file, 1920, 0.8);
        console.log(`Compressed: ${formatFileSize(file.size)} → ${formatFileSize(finalFile.size)}`);
      }

      // Create temp URL
      tempUrl = URL.createObjectURL(finalFile);

      // Track this upload
      activeUploads.current.add(tempUrl);

      const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_IMAGEKIT_API;
      // Upload without immediate editor update (RECOMMENDED for performance)
      const result = await unifiedUploadWebWorker({
        file: finalFile,
        tempUrl,
        editor: null, // Don't pass editor to prevent immediate updates
        folder: courseId,
        resource_type: 'image',
        setProgress: updateProgress,
        bffApiUrl
      });

      // Only add to editor after successful upload
      if (result?.secure_url && editor && activeUploads.current.has(tempUrl)) {
        editor.chain().focus().setImage({
          src: result.secure_url,
          alt: file.name.split('.')[0], // Add alt text for accessibility
          title: file.name
        }).run();
      }

    } catch (error) {
      console.error('Image upload failed:', error);

      setValidationError('Upload failed. Please try again.');
      setTimeout(() => setValidationError(null), 5000);

      // Remove failed image from editor if it was added
      if (tempUrl && editor) {
        const { state } = editor;
        const doc = state.doc;

        doc.descendants((node, pos) => {
          if (node.type.name === 'image' && node.attrs.src === tempUrl) {
            const tr = state.tr.delete(pos, pos + node.nodeSize);
            editor.view.dispatch(tr);
            return false;
          }
        });
      }

    } finally {
      // Cleanup
      if (tempUrl) {
        activeUploads.current.delete(tempUrl);
        URL.revokeObjectURL(tempUrl);
      }
      setIsUploading(false);
    }
  }, [editor, courseId, updateProgress, isUploading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any remaining blob URLs
      activeUploads.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      activeUploads.current.clear();
    };
  }, []);

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept={SUPPORTED_FORMATS.join(',')}
        disabled={isUploading}
      />

      {/* Styled button */}
      <Button
        size='xs'
        type='button'
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        title={`Add Image (Max: ${formatFileSize(MAX_FILE_SIZE)})`}
        loading={isUploading}
        disabled={isUploading}
        color={validationError ? 'red' : undefined}
      >
        <IconPhoto size={20} />
      </Button>

      {/* Error display */}
      {validationError && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          background: '#ffebee',
          border: '1px solid #f44336',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#d32f2f',
          maxWidth: '300px',
          zIndex: 1000,
          marginTop: '4px'
        }}>
          {validationError}
        </div>
      )}
    </>
  );
};

export default ImageControl;