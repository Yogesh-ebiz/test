const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const EmailSchema = new mongoose.Schema({
  status: {
    type: String,
    default: statusEnum.ACTIVE
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
  name: {
    type: String
  },
  bodyHtml: {
    type: String,
    required: true
  },
  company: {
    type: Object
  },
}, {
  versionKey: false
});


module.exports = mongoose.model('EmailTemplate', EmailSchema);

