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
    type: Number,
    required: false
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  sequence: {
    type: Number,
    default: 0
  },
  children: {
    type: Array,
    required: false,
    default: []
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Industry', IndustrySchema);


