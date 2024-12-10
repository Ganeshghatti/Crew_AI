const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  phone: String,
  status: {
    type: String,
    enum: ['pending', 'verified', 'not-created'],
    default: 'pending'
  },
  verificationToken: String,
  verificationExpires: Date,
  createdAt: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
