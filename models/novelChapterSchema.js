const mongoose = require("mongoose");

const novelChaptersInfo = mongoose.Schema({
  chapterName: {
    type: String,
  },
  uploadDate: {
    type: Date,
  },
  novelUrl: {
    type: String,
    index: true,
  },
  fileName: {
    type: String,
  },
});

const NovelChaptersInfo = mongoose.model(
  "novelchaptersinfo",
  novelChaptersInfo,
);

module.exports = NovelChaptersInfo;
