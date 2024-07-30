const express = require('express');
const router = express.Router();
const ServicerProfile = require('../models/servicerProfile');
const { isServicer } = require('../middleware/authMiddleware');


router.get('/', async (req, res) => {
    try {
        const servicerLocations = await ServicerProfile.find({})

        res.status(200).json(servicerLocations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const servicerLocations = await ServicerProfile.findById(req.params.id);

        res.status(200).json(servicerLocations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.post('/edit/:id', isServicer, async (req, res) => {
    try {
        const editedMarker = await ServicerProfile.findByIdAndUpdate(
            req.params.id,
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



module.exports = router;