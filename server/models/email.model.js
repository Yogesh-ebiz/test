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
  recipients: {
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
  whenToSend: {
    type: Date,
    required: true
  },
  hasSent: {
    type: Boolean,
    default: false
  },
  createdDate: {
    type: Number,
    required: false,
    default: Date.now
  },
  createdBy:{ type: Schema.Types.ObjectId, ref: 'Member'},
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

