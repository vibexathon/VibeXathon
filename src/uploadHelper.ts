/**
 * Helper functions for robust file uploads to Supabase
 */

import { supabase } from './supabaseClient';

interface UploadOptions {
  maxRetries?: number;
  retryDelay?: number;
  onProgress?: (progress: number) => void;
}

/**
 * Upload file to Supabase with retry logic and better error handling
 */
export const uploadFileToSupabase = async (
  file: File,
  path: string,
  bucketName: string,
  options: UploadOptions = {}
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const { maxRetries = 3, retryDelay = 1000 } = options;

  // Validate file
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { success: false, error: `File too large. Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB` };
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: `Invalid file type: ${file.type}. Please upload JPG, PNG, or PDF` };
  }

  console.log('Upload attempt:', {
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    fileType: file.type,
    path,
    bucketName
  });

  // Retry logic
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${maxRetries}...`);

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error(`Upload attempt ${attempt} failed:`, uploadError);
        
        // If it's the last attempt, return the error
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Upload failed after ${maxRetries} attempts: ${uploadError.message}`
          };
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(path);

      if (!urlData?.publicUrl) {
        return { success: false, error: 'Failed to generate public URL' };
      }

      console.log('Public URL generated:', urlData.publicUrl);

      return {
        success: true,
        url: urlData.publicUrl
      };

    } catch (error: any) {
      console.error(`Upload attempt ${attempt} exception:`, error);
      
      if (attempt === maxRetries) {
        return {
          success: false,
          error: `Upload failed: ${error.message || 'Unknown error'}`
        };
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  return { success: false, error: 'Upload failed after all retries' };
};

/**
 * Compress image before upload (for large images)
 */
export const compressImage = async (file: File, maxSizeMB: number = 2): Promise<File> => {
  // If file is already small enough or is a PDF, return as is
  if (file.size <= maxSizeMB * 1024 * 1024 || file.type === 'application/pdf') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions (max 1920px width)
        const maxWidth = 1920;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              console.log('Image compressed:', {
                original: `${(file.size / 1024).toFixed(2)} KB`,
                compressed: `${(compressedFile.size / 1024).toFixed(2)} KB`
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
