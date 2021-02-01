const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const JobRequisitionSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Object,
    required: true
  },
  jobId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  currency: {
    type: String,
    required: true
  },
  requiredResume: {
    type: String,
    required: false,
    default: true
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
  noOfResources: {
    type: Number,
    required: false,
    default: 1
  },
  noOfViews: {
    type: Number,
    required: false,
    default: 0
  },
  noOfApplied: {
    type: Number,
    required: false,
    default: 0
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
  isNegotiable: {
    type: String,
    required: false,
    default: false
  },
  hasApplied: {
    type: Boolean,
    default: false
  },
  noApplied: {
    type: Number,
    required: false,
    default: 0
  },
  appliedDate: {
    type: Number,
    required: false
  },
  applicationId: {
    type: Number,
    required: false
  },
  level: {
    type: Object,
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
  employmentType: {
    type: Object,
    required: true
  },
  industry: {
    type: Array,
    required: false,
    default: []
  },
  category: {
    type: Object,
    required: false
  },
  promotion: {
    type: Object,
    required: false
  },
  hasSaved: {
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
  hiringManager: {
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
  tags: {
    type: Array,
    required: false
  },
  isExternal: {
    type: Boolean,
    default: false,
    required: false
  },
  externalUrl: {
    type: String,
    required: false
  },
  shareUrl: {
    type: String,
    required: false,
    default: 'http://www.anymay.com/jobs/'
  },
  workflowId: {
    type: Number,
    required: true,
    default: 0
  },
  panelist: {
    type: Array,
    required: false,
    default: []
  },
  application: { type: Schema.Types.ObjectId, ref: 'Application' }
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

