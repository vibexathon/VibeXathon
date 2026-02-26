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

  // Unlimited retry logic
  let attempt = 0;
  while (true) {
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
