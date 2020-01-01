const mongoose = require('mongoose');

const JobRequisitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  durationMonths: {
    type: Number,
    required: false,
    default: null
  },
  experienceMonths: {
    type: Number,
    required: false,
    default: null
  },
  lastCurrencyUom: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: false
  },
  state: {
    type: String,
    required: false
  },
  isPromoted: {
    type: Boolean,
    required: false
  },
  noOfResources: {
    type: Number,
    required: false,
    default: 1
  },
  type: {
    type: String,
    required: false
  },
  expirationDate: {
    type: Number,
    required: false
  },
  requiredOnDate: {
    type: Number,
    required: false
  },
  salaryRangeLow: {
    type: Number,
    required: false
  },
  salaryRangeHigh: {
    type: Number,
    required: false
  },
  salaryFixed: {
    type: Number,
    required: false
  },
  noApplied: {
    type: Number,
    required: false,
    default: 0
  },
  level: {
    type: String,
    required: false
  },
  industry: {
    type: String,
    required: true
  },
  responsibilities: {
    type: Array,
    required: false
  },
  qualifications: {
    type: Array,
    required: false
  },
  skills: {
    type: Array,
    required: false
  },
  createdAt: {
    type: Number,
    default: Date.now
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('JobRequisition', JobRequisitionSchema);

