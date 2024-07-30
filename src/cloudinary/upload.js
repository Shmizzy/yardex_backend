const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');
const upload = require('../cloudinary/cloudinary');
const GroupChat = require('../models/review');
const io = require('../../app');
const streamifier = require('streamifier');



router.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;
  cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
    if (error) {
      return res.status(500).send(error);
    }
    const groupChat = await GroupChat.findOneAndUpdate({ chatRoomId: req.body.socketRoom }, { $push: { images: result.secure_url } },
      { new: true });
    res.status(200).json({ imageUrl: result.secure_url });
  }).end(file.buffer);


});


module.exports = router;