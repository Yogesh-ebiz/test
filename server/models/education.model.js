const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const EducationSchema = new mongoose.Schema({
  educationId: {
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
  major: {
    type: String,
    required: false
  },
  degree: {
    type: String,
    required: false
  },
  grade: {
    type: Number,
    required: false
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

EducationSchema.plugin(autoIncrement, {
  model: 'Education',
  field: 'educationId',
  startAt: 100000,
  incrementBy: 1
});
EducationSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Education', EducationSchema);

