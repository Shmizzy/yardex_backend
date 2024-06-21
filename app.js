const dotenv = require('dotenv')
dotenv.config();
const express = require('express')
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');


const authController = require('./src/controllers/authController');
const serviceController = require('./src/controllers/serviceController');
const locationsControllers = require('./src/controllers/locationsController');


mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB ' + mongoose.connection.name);
})

app.use(cors());
app.use(express.json());
app.use('/auth', authController);
app.use('/service-request', serviceController);
app.use('/markers', locationsControllers);

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('user connected : ', socket.id);

    socket.on('update_location', (servicerId, location) => {
        console.log(`location updated -> ${location}`)
        io.emit('servicer_location_update', { servicerId, location });
    });


    socket.on('create_room', (servicerId) => {
        socket.join(`room_${servicerId}`);
        console.log(`Room created for servicer with ID: ${servicerId}`);
    });

    socket.on('join_room', (servicerId) => {
        socket.join(`room_${servicerId}`);
        console.log(`${servicerId} joined room_${servicerId}`)
    })
    socket.on('create_request', (data) => {
        console.log(`sending ${JSON.stringify(data)} to -> room_${data.servicer}`)
        io.to(`room_${data.servicer}`).emit('new_request', data);
    });
    socket.on('servicer_confirm', (servicerConfirmation, userSocketId) => {
        io.to(userSocketId).emit('servicer_confirmation', servicerConfirmation)
    });

    socket.on('user_confirm', (userConfirmation, serviceRequestId) => {
        io.emit('user_confirmation', userConfirmation)
    });

    socket.on('update_request', (updateRequest) => {
        io.emit('request_updated', updateRequest)
    });
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected :)`)
    });
})

server.listen(process.env.PORT ? process.env.PORT : 3000, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.PORT ? process.env.PORT : 3000}`);
});


module.exports = io;