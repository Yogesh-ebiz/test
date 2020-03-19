const mongoose = require('mongoose');

const JobAlertSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  partyId: {
    type: Number,
    required: true
  },
  jobId: {
    type: Number,
    required: false
  },
  distance: {
    type: Number,
    required: false
  },
  jobId: {
    type: Number,
    required: false
  },
  jobLevel: {
    type: String,
    required: false
  },
  repeats: {
    type: String,
    required: false
  },
  location: {
    type: Object,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    default: "ACTIVE"
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('JobAlert', JobAlertSchema);
