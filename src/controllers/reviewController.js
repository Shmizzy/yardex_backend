const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Servicer = require('../models/servicerProfile');
const middleware = require('../middleware/authMiddleware');

router.use(middleware.auth);

router.post('/create', async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Authentication required' });

        const newReview = await Review.create({
            user: req.user.id,
            servicer: req.body.servicer,
            rating: req.body.rating,
            review: req.body.review
        })
        newReview.save();

        const servicer = await Servicer.findById(req.body.servicer);
        const oldAverage = servicer.ratings.average;
        const numberOfRatings = servicer.ratings.numberOfRatings;
        const newRating = req.body.newRating; 

        const newAverage = ((oldAverage * numberOfRatings) + newRating) / (numberOfRatings + 1);

        const updatedServicer = await Servicer.findByIdAndUpdate(
            req.body.servicer,
            {
                $inc: { 'ratings.numberOfRatings': 1 },
                'ratings.average': newAverage
            },
            { new: true }
        );

        console.log('Updated Servicer:', updatedServicer);

        res.status(201).json({ newReview });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/:servicerId/reviews', async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Authentication required' });

        const reviews = await Review.find({ servicer: req.params.servicerId });
        if (!reviews)
            return res.status(404).json({ message: 'There are no reviews for this servicer at this time..' })
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;