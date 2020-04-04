const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const PartyPublicationSchema = new mongoose.Schema({
  partyPublicationId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: false
  },
  author: {
    type: String,
    required: false
  },
  date: {
    type: Number,
    required: false
  },
  publisher: {
    type: String,
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
  isbn: {
    type: String,
    required: false,
    default: ''
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    default: Date.now
  }

}, {
  versionKey: false
});

PartyPublicationSchema.plugin(autoIncrement, {
  model: 'PartyPublication',
  field: 'partyPublicationId',
  startAt: 100000,
  incrementBy: 1
});
PartyPublicationSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('PartyPublication', PartyPublicationSchema);
