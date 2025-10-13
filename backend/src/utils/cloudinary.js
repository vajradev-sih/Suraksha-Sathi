import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables (ensure this is done once in index.js or app.js)
// If you use 'nodemon -r dotenv/config', this line might not be needed, but it's safer.
// dotenv.config(); 

// Configure Cloudinary using environment variables from your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // sih-internal
    api_key: process.env.CLOUDINARY_API_KEY,       // 737734146781243
    api_secret: process.env.CLOUDINARY_API_SECRET, // g-jLEzPyyy8lHFFLlMP33wjjv0ew
    secure: true
});

export default cloudinary; // Export the configured instance