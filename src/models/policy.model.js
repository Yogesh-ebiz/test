const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PolicySchema = new mongoose.Schema({
  policy: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now,
    required: false
  },
  updatedAt: {
    type: Number,
    default: Date.now,
    required: true
  },
  createdBy: {
    type: Number
  },
  updatedBy: {
    type: Number
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Policy', PolicySchema);

