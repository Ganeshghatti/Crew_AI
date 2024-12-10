const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "User",
  },

  campaignId: {
    type: String,
    required: true,
    ref: "Campaign",
  },

  amount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  amountTip: {
    type: Number,
  },
  taxExemption: {
    type: Boolean,
  },
  isAnonymous: {
    type: Boolean,
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },

  txnid: {
    type: String,
    unique: true,
    required: true,
  },

  paymentDetails: {
    paymentId: String,
    mode: String,
    bankName: String,
    cardLastDigits: String,
    failureReason: String,
    timestamp: Date
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

transactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
