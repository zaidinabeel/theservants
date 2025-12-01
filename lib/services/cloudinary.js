/**
 * ============================================
 * CLOUDINARY SERVICE
 * ============================================
 * Handles image uploads to Cloudinary
 * 
 * HOW TO SETUP:
 * 1. Sign up at https://cloudinary.com
 * 2. Go to Dashboard to get Cloud Name, API Key, API Secret
 * 3. Add these to .env file:
 *    - CLOUDINARY_CLOUD_NAME
 *    - CLOUDINARY_API_KEY
 *    - CLOUDINARY_API_SECRET
 */

import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure Cloudinary
 */
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured() {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    !process.env.CLOUDINARY_CLOUD_NAME.includes('your_')
  );
}

/**
 * Upload image to Cloudinary
 * @param {string} base64Data - Base64 encoded image data
 * @param {object} options - Upload options (folder, public_id, etc.)
 * @returns {Promise<object>} Upload result with URL
 */
export async function uploadImage(base64Data, options = {}) {
  // Return mock URL if Cloudinary not configured
  if (!isCloudinaryConfigured()) {
    return {
      secure_url: `https://via.placeholder.com/800x600/001F3F/D4AF37?text=Upload+Image`,
      public_id: `mock_${Date.now()}`,
      isMocked: true,
    };
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'theservants',
      ...options,
    });

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} Deletion result
 */
export async function deleteImage(publicId) {
  if (!isCloudinaryConfigured()) {
    return { result: 'ok', isMocked: true };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Get optimized image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export function getOptimizedUrl(publicId, options = {}) {
  if (!isCloudinaryConfigured()) {
    return `https://via.placeholder.com/800x600/001F3F/D4AF37?text=${encodeURIComponent(publicId)}`;
  }

  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  });
}
