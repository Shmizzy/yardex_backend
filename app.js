const dotenv = require('dotenv')
dotenv.config();
const express = require('express')
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

const authController = require('./src/controllers/authController');
const serviceController = require('./src/controllers/serviceController');
const markerController = require('./src/controllers/markerController');


mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB ' + mongoose.connection.name);
})

app.use(cors());
app.use(express.json());
app.use('/auth', authController);
app.use('/service-request', serviceController);
app.use('/marker', markerController);

app.listen(process.env.PORT ? process.env.PORT : 3000, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.PORT ? process.env.PORT : 3000}`);
});
