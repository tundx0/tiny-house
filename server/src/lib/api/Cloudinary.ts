import { v2 as cloudinary } from "cloudinary";

const isConfigured = () =>
  !!(
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_KEY &&
    process.env.CLOUDINARY_SECRET
  );

export const Cloudinary = {
  // Uploads a base64 encoded image and returns its hosted url. Without
  // Cloudinary credentials the data url itself is stored (development only).
  upload: async (image: string): Promise<string> => {
    if (!isConfigured()) {
      return image;
    }

    const res = await cloudinary.uploader.upload(image, {
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
      folder: "TH_Assets/",
    });

    return res.secure_url;
  },
};
