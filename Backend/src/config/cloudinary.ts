import { v2 as cloudinary } from "cloudinary";

const isConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload a buffer to Cloudinary and return the secure_url.
 * Returns null if Cloudinary is not configured.
 */
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string = "event-organizer"
): Promise<string | null> => {
  if (!isConfigured) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", transformation: [{ width: 1200, quality: "auto", fetch_format: "auto" }] },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return reject(error || new Error("Upload failed"));
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

export default cloudinary;
