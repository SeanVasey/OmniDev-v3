'use client';

import { createClient } from './client';
import { isSupabaseConfigured } from './database';

export interface UploadedFile {
  id: string;
  storage_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string | null;
  created_at: string;
}

const STORAGE_BUCKET = 'chat-attachments';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  userId: string,
  file: File,
  messageId?: string
): Promise<UploadedFile | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. File upload disabled.');
    return createMockUpload(file);
  }

  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    const supabase = createClient();

    // Generate unique file path
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 11);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomId}.${fileExt}`;
    const storagePath = `${userId}/${fileName}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    // Save attachment metadata to database
    const { data: attachmentData, error: attachmentError } = await supabase
      .from('attachments')
      .insert({
        user_id: userId,
        message_id: messageId || null,
        storage_path: storagePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        public_url: publicUrl,
      })
      .select()
      .single();

    if (attachmentError) {
      console.error('Error saving attachment metadata:', attachmentError);
      // Clean up uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      return null;
    }

    return {
      id: attachmentData.id,
      storage_path: attachmentData.storage_path,
      file_name: attachmentData.file_name,
      file_type: attachmentData.file_type,
      file_size: attachmentData.file_size,
      public_url: attachmentData.public_url,
      created_at: attachmentData.created_at,
    };
  } catch (error) {
    console.error('Exception uploading file:', error);
    return null;
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  userId: string,
  files: File[],
  messageId?: string
): Promise<UploadedFile[]> {
  const uploads = await Promise.all(files.map((file) => uploadFile(userId, file, messageId)));

  return uploads.filter((upload): upload is UploadedFile => upload !== null);
}

/**
 * Delete a file from storage
 */
export async function deleteFile(attachmentId: string, storagePath: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true; // Silently succeed in mock mode
  }

  try {
    const supabase = createClient();

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      return false;
    }

    // Delete metadata from database
    const { error: dbError } = await supabase.from('attachments').delete().eq('id', attachmentId);

    if (dbError) {
      console.error('Error deleting attachment metadata:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting file:', error);
    return false;
  }
}

/**
 * Get file download URL (with expiration)
 */
export async function getFileDownloadUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Exception creating signed URL:', error);
    return null;
  }
}

/**
 * Validate file type
 */
export function isValidFileType(file: File): boolean {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Code
    'text/javascript',
    'text/typescript',
    'text/jsx',
    'text/tsx',
    'text/html',
    'text/css',
    'application/json',
    'text/xml',
  ];

  return allowedTypes.includes(file.type) || file.type.startsWith('text/');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file type category
 */
export function getFileCategory(fileType: string): 'image' | 'document' | 'code' | 'other' {
  if (fileType.startsWith('image/')) return 'image';
  if (
    fileType.includes('pdf') ||
    fileType.includes('document') ||
    fileType.includes('text/plain')
  ) {
    return 'document';
  }
  if (
    fileType.includes('javascript') ||
    fileType.includes('typescript') ||
    fileType.includes('json') ||
    fileType.includes('html') ||
    fileType.includes('css')
  ) {
    return 'code';
  }
  return 'other';
}

/**
 * Create a mock upload for when Supabase is not configured
 */
function createMockUpload(file: File): UploadedFile {
  return {
    id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    storage_path: `mock/${file.name}`,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    public_url: URL.createObjectURL(file), // Create a temporary blob URL
    created_at: new Date().toISOString(),
  };
}
