const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const PartySKillSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  partyId: {
    type: Number,
    required: true
  },
  skillTypeId: {
    type: Number,
    required: false
  },
  rating: {
    type: Number,
    required: false,
    default: 0
  },
  level: {
    type: String,
    required: false
  },
  noOfEndorsement: {
    type: Number,
    required: false,
    default: 0
  },
  endorsements: {
    type: Array,
    required: false
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Date,
    default: Date.now()
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  }

}, {
  versionKey: false
});


PartySKillSchema.plugin(autoIncrement, {
  model: 'PartySkill',
  field: 'partySkillId',
  startAt: 100000,
  incrementBy: 1
});
PartySKillSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('PartySkill', PartySKillSchema);
