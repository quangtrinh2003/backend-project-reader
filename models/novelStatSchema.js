const mongoose = require("mongoose");

const novelStatSchema = mongoose.Schema({
  totalChapter: {
    type: Number,
    default: 0,
  },
});

const NovelStat = mongoose.model("novelstat", novelStatSchema);

module.exports = NovelStat;
