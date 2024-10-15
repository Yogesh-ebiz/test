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
  },
  partyId: {
    type: Number,
  },
  name: {
    type: String,
  },
  noOfMonths: {
    type: Number,
  },
  noOfHighlySkillEndorsers: {
    type: Number,
    default: 0
  },
  selfRating: {
    type: Number,
    default: 0
  },
  averageEndorsedRating: {
    type: Number,
    required: false,
    default: 0
  },
  level: {
    type: String,
  },
  hasEndorsed: {
    type: Boolean,
    default: false
  },
  noOfEndorsement: {
    type: Number,
    default: 0
  },
  highlySkilledEndorsers: {
    type: Object,
    default: null
  },
  mutaulEndorser: {
    type: Object,
    default: null
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Date,
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  endorsements: [{ type: Schema.Types.ObjectId, ref: 'Endorsement' }],
  skill: { type: Schema.Types.ObjectId, ref: 'Skill' }
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
