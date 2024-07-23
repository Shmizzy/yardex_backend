const cloudinary = require('cloudinary').v2;
const multer = require('multer');



cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

module.exports = upload;