const mongoose = require('mongoose');

const ExperienceLevelSchema = new mongoose.Schema({
  name: {
    type: Object,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  type: {
    type: String,
    required: false
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  sequence: {
    type: Number,
    default: 0
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('ExperienceLevel', ExperienceLevelSchema);


