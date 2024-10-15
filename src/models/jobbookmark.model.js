const mongoose = require('mongoose');

const JobBookmarkSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  userId: {
    type: Number,
    required: true
  },
  jobId: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    default: "ACTIVE"
  },
}, {
  versionKey: false
});


module.exports = mongoose.model('JobBookmark', JobBookmarkSchema);
