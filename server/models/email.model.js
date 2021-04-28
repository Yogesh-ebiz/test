const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const EmailSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  sender: {
    type: Object
  },
  receiver: {
    type: Object
  },
  subject: {
    type: String,
    required: false
  },
  bodyHtml: {
    type: String,
    required: true
  },
  attachments: {
    type: Array
  },
  users: {
    type: Array
  },
  createdDate: {
    type: Number,
    required: false
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


module.exports = mongoose.model('Email', EmailSchema);

