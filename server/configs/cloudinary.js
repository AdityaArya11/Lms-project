import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET_KEY
        });
        console.log("Cloudinary Configured");
    } catch (error) {
        console.error("Cloudinary connection/configuration error:", error);
    }
}

export default connectCloudinary;