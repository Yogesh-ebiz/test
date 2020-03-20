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
  status: {
    type: String,
    required: true,
    default: "ACTIVE"
  },
  distance: {
    type: Number,
    required: false
  },
  jobLevel: {
    type: String,
    required: false
  },
  jobType: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  state: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  repeats: {
    type: String,
    required: false
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('JobAlert', JobAlertSchema);
