const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const EmailSignatureSchema = new mongoose.Schema({
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  default: {
    type: Boolean,
    default: false
  },
  createdDate: {
    type: Date,
    required: false,
    default: Date.now
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member'},
  updatedDate: {
    type: Date,
    required: false
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Member'},
  name: {
    type: String
  },
  bodyHtml: {
    type: String
  },
  company: { type: Schema.Types.ObjectId, ref: 'Company'},
}, {
  versionKey: false
});


module.exports = mongoose.model('EmailSignature', EmailSignatureSchema);

