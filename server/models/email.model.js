const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');
const emailType = require('../const/emailType');

let mongoosePaginate = require('mongoose-aggregate-paginate-v2');


const EmailSchema = new mongoose.Schema({
  status: {
    type: String,
    default: emailType.DEFAULT
  },
  type: {
    type: String
  },
  from: {
    type: Object
  },
  to: {
    type: Array
  },
  cc: {
    type: Array
  },
  bcc: {
    type: Array
  },
  subject: {
    type: String,
    required: false
  },
  body: {
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
  hasRead: {
    type: Boolean,
    default: false
  },
  createdDate: {
    type: Number,
    required: false,
    default: Date.now
  },
  meta: {
    type: Object
  },
  createdBy:{ type: Schema.Types.ObjectId, ref: 'Member'},
  labels:[{ type: Schema.Types.ObjectId, ref: 'Label'}],
  threads:[{ type: Schema.Types.ObjectId, ref: 'Email'}]
}, {
  versionKey: false
});
EmailSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Email', EmailSchema);

