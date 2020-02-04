const mongoose = require('mongoose');

const EmploymentTypeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  name: {
    type: Object,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  shortCode: {
    type: String,
    required: false
  },
  icon: {
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


module.exports = mongoose.model('EmploymentType', EmploymentTypeSchema);


