// utils/imageUpload.js
// Image upload utilities for profile pictures
import { supabase } from '../supabaseConfig';

/**
 * Upload image to Supabase Storage
 * @param {string} uri - Local file URI from image picker
 * @param {string} userId - User ID for unique filename
 * @returns {Promise<string>} - Public URL of uploaded image
 */
export const uploadProfilePicture = async (uri, userId) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}.jpg`;

    // Fetch the image as blob
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Failed to fetch image from URI');
    }
    const blob = await response.blob();

    // Convert blob to ArrayBuffer
    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-picture')
      .upload(filename, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage error:', error);
      throw new Error(error.message || 'Storage upload failed');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-picture')
      .getPublicUrl(filename);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error; // Pass the original error instead of wrapping it
  }
};

/**
 * Delete profile picture from Supabase Storage
 * @param {string} imageUrl - Full URL of the image to delete
 * @returns {Promise<void>}
 */
export const deleteProfilePicture = async (imageUrl) => {
  try {
    // Extract filename from URL
    const filename = imageUrl.split('/').pop();

    const { error } = await supabase.storage
      .from('profile-picture')
      .remove([filename]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    // Don't throw - deletion failure shouldn't block user actions
  }
};

/**
 * Alternative: Upload to MinIO (if you prefer self-hosted)
 * Requires: npm install minio
 */
/*
import { Client } from 'minio';
import { minioConfig } from '../minioConfig';

const minioClient = new Client({
  endPoint: minioConfig.endPoint,
  port: minioConfig.port,
  useSSL: minioConfig.useSSL,
  accessKey: minioConfig.accessKey,
  secretKey: minioConfig.secretKey,
});

export const uploadProfilePictureMinIO = async (uri, userId) => {
  try {
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}.jpg`;

    // Fetch the image as blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Convert to buffer for MinIO
    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
    
    const buffer = Buffer.from(arrayBuffer);

    // Upload to MinIO
    await minioClient.putObject(
      minioConfig.bucket,
      filename,
      buffer,
      buffer.length,
      { 'Content-Type': 'image/jpeg' }
    );

    // Return public URL
    const publicUrl = `${minioConfig.useSSL ? 'https' : 'http'}://${minioConfig.endPoint}:${minioConfig.port}/${minioConfig.bucket}/${filename}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    throw new Error('Failed to upload profile picture');
  }
};
*/
