const mongoose = require("mongoose");

const specialitySchema = new mongoose.Schema({
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
  content: {
    type: String,
  },
  wallpaperimg: {
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

const Speciality = mongoose.model("Speciality", specialitySchema);

module.exports = Speciality;
