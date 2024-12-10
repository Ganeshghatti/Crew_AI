const mongoose = require("mongoose");

const serivceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    unique: true,
    required: true,
  },
  link: {
    type: String,
    unique: true,
    required: true,
  },
  desc: {
    type: String,
  },
  icon: {
    type: String,
  },
  createdAt: {
    type: String,
    default: () => moment().format("MMMM Do YYYY, h:mm:ss a"),
    immutable: true,
  },
  lastUpdate: {
    type: String,
    default: () => moment().format("MMMM Do YYYY, h:mm:ss a"),
  },
});

const Service = mongoose.model("Service", serivceSchema);

module.exports = Service;
