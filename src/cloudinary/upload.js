const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');
const upload = require('../cloudinary/cloudinary');



router.post('/upload', upload.single('image'), (req, res) => {
    const file = req.file;
    cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.json({ imageUrl: result.secure_url });
    }).end(file.buffer);
  });


module.exports = router;