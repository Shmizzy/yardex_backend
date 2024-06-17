const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  servicer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'refunded'], 
    default: 'pending' 
  },
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest', 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now 
  },
  
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
