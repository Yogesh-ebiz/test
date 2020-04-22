const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const EndorsementSchema = new mongoose.Schema({
  endorsementId: {
    type: Number,
    required: true
  },
  endorser: {
    type: Object,
    required: true
  },
  partySkillId: {
    type: Number,
    required: false
  },
  rating: {
    type: Number,
    required: false,
    default: 0
  },
  relationship: {
    type: String,
    required: false
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


EndorsementSchema.plugin(autoIncrement, {
  model: 'Endorsement',
  field: 'endorsementId',
  startAt: 100000,
  incrementBy: 1
});
EndorsementSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Endorsement', EndorsementSchema);
