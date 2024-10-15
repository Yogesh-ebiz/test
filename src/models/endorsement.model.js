const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const EndorsementSchema = new mongoose.Schema({
  endorsementId: {
    type: Number,
    required: true
  },
  endorserId: {
    type: Number,
    required: true
  },
  isHighlySkilledEndorser: {
    type: Boolean,
    default: false
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
  },
  partySkill: { type: Schema.Types.ObjectId, ref: 'PartySkill' },
  endorser: { type: Schema.Types.ObjectId, ref: 'User' },

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
