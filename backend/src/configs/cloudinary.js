import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = () => {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("✔️  Cloudinary config initialized.");
  } else {
    console.warn("⚠️  Cloudinary keys missing from .env - Image uploads will fail.");
  }
};

export default cloudinary;
