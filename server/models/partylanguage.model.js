const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const PartyLanguageSchema = new mongoose.Schema({
  partyLanguageId: {
    type: Number,
    required: false
  },
  partyId: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: false
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


PartyLanguageSchema.plugin(autoIncrement, {
  model: 'PartyLanguage',
  field: 'partyLanguageId',
  startAt: 100000,
  incrementBy: 1
});
PartyLanguageSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('PartyLanguage', PartyLanguageSchema);
