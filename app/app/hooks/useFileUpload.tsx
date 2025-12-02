'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { uploadFiles, isValidFileType, formatFileSize, type UploadedFile } from '@/lib/supabase/storage';
import { toast } from 'sonner';

export function useFileUpload() {
  const { userId } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  /**
   * Upload files and return their metadata
   */
  const upload = async (files: File[], messageId?: string): Promise<UploadedFile[]> => {
    if (files.length === 0) return [];

    // Validate files
    const invalidFiles = files.filter((file) => !isValidFileType(file));
    if (invalidFiles.length > 0) {
      toast.error('Invalid file type', {
        description: `${invalidFiles.map((f) => f.name).join(', ')} - File type not supported`,
      });
      return [];
    }

    // Check file sizes
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter((file) => file.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error('File too large', {
        description: `${oversizedFiles.map((f) => `${f.name} (${formatFileSize(f.size)})`).join(', ')} - Maximum size is 10MB`,
      });
      return [];
    }

    setIsUploading(true);

    try {
      // Initialize progress tracking
      const progress: Record<string, number> = {};
      files.forEach((file) => {
        progress[file.name] = 0;
      });
      setUploadProgress(progress);

      // Upload all files
      const uploadedFiles = await uploadFiles(userId, files, messageId);

      // Update progress to 100% for all files
      const completedProgress: Record<string, number> = {};
      files.forEach((file) => {
        completedProgress[file.name] = 100;
      });
      setUploadProgress(completedProgress);

      if (uploadedFiles.length < files.length) {
        toast.warning('Some files failed to upload', {
          description: `${uploadedFiles.length} of ${files.length} files uploaded successfully`,
        });
      } else {
        toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      }

      return uploadedFiles;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    } finally {
      setIsUploading(false);
      // Clear progress after a delay
      setTimeout(() => setUploadProgress({}), 2000);
    }
  };

  /**
   * Validate a single file
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!isValidFileType(file)) {
      return { valid: false, error: 'File type not supported' };
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { valid: false, error: `File too large (max 10MB, got ${formatFileSize(file.size)})` };
    }

    return { valid: true };
  };

  return {
    upload,
    validateFile,
    isUploading,
    uploadProgress,
  };
}
