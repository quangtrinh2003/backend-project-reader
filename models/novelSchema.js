const mongoose = require("mongoose");

const novelSchema = mongoose.Schema({
  novelUrl: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: "No name",
  },
  description: {
    type: String,
    minLength: 0,
    maxLength: 700,
  },
  imageUrl: {
    type: String,
    default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLgH_wTPr7-Mr38vKTaZaIAcY1iwjIfCBqCA&s",
  },
  updateDate: {
    type: Date,
    default: Date.now(),
  },
});

const Novel = mongoose.model("novels", novelSchema);

module.exports = Novel;
