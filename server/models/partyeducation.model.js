const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const PartyEducationSchema = new mongoose.Schema({
  partyEducationId: {
    type: Number,
    required: false
  },
  partyId: {
    type: Number,
    required: true
  },
  institute: {
    type: Object,
    required: true
  },
  fromDate: {
    type: Number,
    required: true
  },
  thruDate: {
    type: Number,
    required: false
  },
  fieldOfStudy: {
    type: Object,
    required: false
  },
  degree: {
    type: String,
    required: false
  },
  gpa: {
    type: Number,
    required: false,
    default: null
  },
  hasGraduated: {
    type: Boolean,
    required: true
  },
  isCurrent: {
    type: Boolean,
    required: true,
    default: false
  },
  city: {
    type: String,
    required: true,
    default: ''
  },
  state: {
    type: String,
    required: true,
    default: ''
  },
  country: {
    type: String,
    required: true,
    default: ''
  },
  createdDate: {
    type: Number,
    required: false
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  }
}, {
  versionKey: false
});

PartyEducationSchema.plugin(autoIncrement, {
  model: 'PartyEducation',
  field: 'partyEducationId',
  startAt: 100000,
  incrementBy: 1
});
PartyEducationSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('PartyEducation', PartyEducationSchema);

