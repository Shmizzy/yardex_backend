const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');
const upload = require('../cloudinary/cloudinary');
const io = require('../../app');



router.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;
  cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
    if (error) {
      return res.status(500).send(error);
    }
    io.to(req.body.socketRoom).emit('imageUploaded', result.secure_url);
    res.status(200).json({ imageUrl: result.secure_url });
  }).end(file.buffer);
});


module.exports = router;