const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const JobRequisitionSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  updatedDate: {
    type: Number,
    default: Date.now
  },
  updatedBy: {
    type: Object,
    required: false
  },
  publishedDate: {
    type: Number
  },
  originalPublishedDate: {
    type: Number
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
    default: statusEnum.DRAFT
  },
  hasImported: {
    type: Boolean,
    default: false
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
  durationMonths: {
    type: Number,
    required: false,
    default: null
  },
  minMonthExperience: {
    type: Number,
    required: false,
    default: 0
  },
  maxMonthExperience: {
    type: Number,
    required: false,
    default: 0
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
  isHot: {
    type: Boolean
  },
  hasApplied: {
    type: Boolean,
    default: false
  },
  appliedDate: {
    type: Number,
    required: false
  },
  level: {
    type: Object,
    required: false,
    default: ''
  },
  jobFunction: {
    type: Object,
    required: false,
    default: ''
  },
  responsibilities: {
    type: Array,
    required: false
  },
  qualifications: {
    type: Array,
    required: false
  },
  minimumQualifications: {
    type: Array,
    required: false
  },
  skills: {
    type: Array,
    required: false
  },
  employmentType: {
    type: Object,
    required: true,
    default: ''
  },
  industry: {
    type: Array,
    required: true,
    default: []
  },
  education: {
    type: String,
    required: false,
    default: ''
  },
  category: {
    type: Object,
    required: false
  },
  promotion: {
    type: Array,
    required: false
  },
  hasSaved: {
    type: Boolean,
    default: false,
    required: false
  },
  allowRemote: {
    type: Boolean,
    default: false
  },
  connection: {
    type: Object,
    required: false
  },
  hiringManager: {
    type: Object,
    required: false
  },
  district: {
    type: String,
    required: false,
    default: ''
  },
  city: {
    type: String,
    required: false,
    default: ''
  },
  state: {
    type: String,
    required: false,
    default: ''
  },
  country: {
    type: String,
    required: true,
    default: ''
  },
  postalCode: {
    type: String,
    required: false
  },
  internalCode: {
    type: String,
    required: false
  },
  feedId: {
    type: Number
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
    default: 'http://www.accessed.co/jobs/'
  },
  companyId: {
    type: Number,
  },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  members: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
  department: { type: Schema.Types.ObjectId, ref: 'CompanyDepartment'},
  tags: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  questionTemplate: { type: Schema.Types.ObjectId, ref: 'QuestionTemplate'},
  hasQuestions: {
    type: Boolean,
    default: false,
    required: false
  },
  applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
  applicationForm:{
    type: Object,
    require: false,
    default : {
      resume : {
        isDisplay: true,
        isRequired: true
      },
      coverLetter: {
        isDisplay: true,
        isRequired: true
      },
      photo: {
        isDisplay: true,
        isRequired: true
      },
      email: {
        isDisplay: true,
        isRequired: true
      }
    },
  },
  autoConfirmationEmail: {
    type: Boolean,
    default: false,
    required: false
  },
  pipeline: { type: Schema.Types.ObjectId, ref: 'PipelineTemplate' },
  searchAd: { type: Schema.Types.ObjectId, ref: 'Ad' },
  ads: [{ type: Schema.Types.ObjectId, ref: 'Ad' }]
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
