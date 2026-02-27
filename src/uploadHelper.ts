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
 * Upload file to Supabase with unlimited retry logic and better error handling
 */
export const uploadFileToSupabase = async (
  file: File,
  path: string,
  bucketName: string,
  options: UploadOptions = {}
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const { retryDelay = 2000 } = options;

  // Validate file
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return { success: false, error: `File too large. Maximum size is 2MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please compress the image.` };
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

  // Unlimited retry logic with max attempts safety
  let attempt = 0;
  const maxAttempts = 50; // Safety limit to prevent infinite loops
  
  while (attempt < maxAttempts) {
    attempt++;
    try {
      console.log(`Upload attempt ${attempt}...`);

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
        
        // Check if it's a validation error (don't retry these)
        if (uploadError.message?.includes('already exists') || 
            uploadError.message?.includes('not found') ||
            uploadError.message?.includes('permission denied')) {
          return { success: false, error: uploadError.message };
        }
        
        // Wait before retrying with exponential backoff (max 10 seconds)
        const delay = Math.min(retryDelay * Math.min(attempt, 5), 10000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
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
      
      // Wait before retrying with exponential backoff (max 10 seconds)
      const delay = Math.min(retryDelay * Math.min(attempt, 5), 10000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we've exhausted all attempts
  return { success: false, error: `Upload failed after ${maxAttempts} attempts. Please check your internet connection and try again.` };
};

/**
 * Compress image before upload
 * @param file - The image file to compress
 * @param quality - Compression quality (0.1 to 1.0), or target size in MB if > 1
 */
export const compressImage = async (file: File, quality: number = 0.8): Promise<File> => {
  // If it's a PDF, return as is
  if (file.type === 'application/pdf') {
    return file;
  }

  // If quality is > 1, treat it as target size in MB (legacy behavior)
  if (quality > 1) {
    const targetSizeMB = quality;
    if (file.size <= targetSizeMB * 1024 * 1024) {
      return file;
    }
    quality = 0.7; // Use default quality for size-based compression
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions (max 1920px width for better compression)
        const maxWidth = 1920;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress with specified quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              console.log('Image compressed:', {
                original: `${(file.size / 1024).toFixed(2)} KB`,
                compressed: `${(compressedFile.size / 1024).toFixed(2)} KB`,
                quality: quality
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
