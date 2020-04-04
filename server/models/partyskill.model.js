const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const PartySKillSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  partySkillId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: true
  },
  skillTypeId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: false
  },
  noOfMonths: {
    type: Number,
    required: false
  },
  selfRating: {
    type: Number,
    required: false,
    default: 0
  },
  averageEndorsedRating: {
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
  endorsements: [{ type: Schema.Types.ObjectId, ref: 'Endorsement' }],
  highlySkilledEndorsers: {
    type: Object,
    default: null
  },
  mutaulEndorser: {
    type: Object,
    default: null
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    default: Date.now
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
