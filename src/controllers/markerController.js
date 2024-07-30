const express = require('express');
const router = express.Router();
const Marker = require('../models/marker');
const ServicerProfile = require('../models/servicerProfile');
const { isServicer } = require('../middleware/authMiddleware');


router.post('/create', isServicer, async (req, res) => {
    try {
        const newMarker = await Marker.create({
            servicer: req.user.id,
            location: req.body.location,
            status: req.body.status
        });
        const savedMarker = await newMarker.save();
        res.status(201).json(savedMarker)
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const markers = await Marker.find({});
        res.status(200).json(markers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

router.get('/profile/:userId', async (req, res) => {
    try {
        const fetchProfile = await ServicerProfile.findOne({ user: req.params.userId });
        if (!fetchProfile)
            res.status(404).json({ message: 'Profile not found' });
        res.status(200).json({ fetchProfile });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

router.post('/edit/:id', isServicer, async (req, res) => {
    try {
        const editedMarker = await Marker.findOneAndUpdate(
            {  servicer: req.user.id },
            {
                location: {
                    type: 'Point',
                    coordinates: req.body.coordinates
                }
            },
            { new: true }
        );
        if (!editedMarker)
            return res.status(404).json({ message: 'Marker not found or you are not the owner of this marker.' });
        res.status(200).json(editedMarker);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/delete/:id', isServicer, async (req, res) => {
    try {
        const deletedMarker = await Marker.findOneAndDelete(
            { _id: req.params.id, servicer: req.user.id }
        );
        if (!deletedMarker)
            return res.status(404).json({ message: 'Marker not found' });
        res.status(200).json({ message: 'Marker successfully deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;