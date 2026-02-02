// Cloudinary Configuration Template
// Copy this file to cloudinaryConfig.js and replace with your actual credentials

export const CLOUDINARY_CONFIG = {
  cloudName: 'YOUR_CLOUD_NAME', // From Cloudinary dashboard
  uploadPreset: 'YOUR_UPLOAD_PRESET', // Create an unsigned upload preset in Cloudinary
  apiKey: 'YOUR_CLOUDINARY_API_KEY', // From Cloudinary dashboard (for signed uploads)
  apiSecret: 'YOUR_CLOUDINARY_API_SECRET', // From Cloudinary dashboard - KEEP SECRET!
};

export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
};
