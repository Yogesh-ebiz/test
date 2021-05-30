const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const EmailSchema = new mongoose.Schema({
  name: {
    type: String
  },
  bodyHtml: {
    type: String,
    required: true
  },
  company: {
    type: Number
  },
  createdDate: {
    type: Number,
    required: false,
    default: Date.now
  },
  createdBy: {
    type: Object
  },
  updatedDate: {
    type: Number,
    required: false
  },
  updatedBy: {
    type: Object
  },
}, {
  versionKey: false
});


module.exports = mongoose.model('EmailTemplate', EmailSchema);

