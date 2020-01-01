const mongoose = require('mongoose');

const IndustrySchema = new mongoose.Schema({
  name: {
    type: Object,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  longDescription: {
    type: String,
    required: false,
    default: ""
  },
  image: {
    type: String,
    required: false,
    default: ""
  },
  parent: {
    type: Object,
    required: false,
    default: null
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


module.exports = mongoose.model('Industry', IndustrySchema);


