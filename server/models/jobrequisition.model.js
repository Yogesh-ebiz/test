const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const JobRequisitionSchema = new mongoose.Schema({

  jobId: {
    type: Number,
    required: true
  },
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
  minMonthExperience: {
    type: Number,
    required: false,
    default: null
  },
  maxMonthExperience: {
    type: Number,
    required: false,
    default: null
  },
  lastCurrencyUom: {
    type: String,
    required: true
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
  jobFunction: {
    type: Object,
    required: false
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
    required: true
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  employmentType: {
    type: String,
    required: true
  },
  promotion: {
    type: Object,
    default: null,
    required: false
  },
  isSaved: {
    type: Boolean,
    default: false,
    required: false
  },
  company: {
    type: Object,
    required: true
  },
  connection: {
    type: Object,
    required: false
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  isExternal: {
    type: Boolean,
    default: false,
    required: false
  },
  externalUrl: {
    type: String,
    required: false
  }
}, {
  versionKey: false
});

JobRequisitionSchema.plugin(autoIncrement, {
  model: 'JobRequisition',
  field: 'jobId',
  startAt: 100000,
  incrementBy: 1
});
JobRequisitionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('JobRequisition', JobRequisitionSchema);

