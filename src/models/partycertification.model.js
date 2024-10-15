const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const PartyCertificationSchema = new mongoose.Schema({
  partyCertificationId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: true
  },
  certificationId: {
    type: String,
    required: false
  },
  company: {
    type: Object,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  issuedDate: {
    type: Number,
    required: true
  },
  expirationDate: {
    type: Number,
    required: false
  },
  url: {
    type: String,
    required: false,
    default: ''
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  city: {
    type: String,
    required: false,
    default: ''
  },
  state: {
    type: String,
    required: false,
    default: ''
  },
  country: {
    type: String,
    required: false,
    default: ''
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number
  }

}, {
  versionKey: false
});

PartyCertificationSchema.plugin(autoIncrement, {
  model: 'PartyCertification',
  field: 'partyCertificationId',
  startAt: 100000,
  incrementBy: 1
});
PartyCertificationSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('PartyCertification', PartyCertificationSchema);
