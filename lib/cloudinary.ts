import { v2 as cloudinary } from "cloudinary";

// If CLOUDINARY_URL is present, we don't need manual config as the SDK picks it up.
if (!process.env.CLOUDINARY_URL) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error(
      "Missing Cloudinary environment variables. Image uploads will fail.",
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.log("Cloudinary configured via CLOUDINARY_URL");
}

export default cloudinary;
