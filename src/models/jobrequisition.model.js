const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');
const Company = require('./company.model');
const { getFromCache, saveToCache, deleteFromCache } = require('../services/cacheService');


const JobRequisitionSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  updatedDate: {
    type: Number,
    default: Date.now
  },
  publishedDate: {
    type: Number
  },
  endDate: {
    type: Number,
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
    type: Boolean,
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
  popularSkills: {
    type: Array,
    required: false
  },
  // skills: {
  //   type: Array,
  //   required: false
  // },
  employmentType: {
    type: Object,
    required: true,
    default: ''
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
  hasLiked: {
    type: Boolean,
    default: false,
    required: false
  },
  allowRemote: {
    type: Boolean,
    default: false
  },
  displaySalary: {
    type: Boolean,
    default: true
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
  stateCode: {
    type: String,
    required: false,
    default: ''
  },
  country: {
    type: String,
    required: true,
    default: ''
  },
  countryCode: {
    type: String,
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
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  industry: [{ type: Schema.Types.ObjectId, ref: 'Industry' }],
  skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
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
  jobFunction: { type: Schema.Types.ObjectId, ref: 'JobFunction' },
  pipeline: { type: Schema.Types.ObjectId, ref: 'Jobpipeline' },
  searchAd: { type: Schema.Types.ObjectId, ref: 'Ad' },
  ads: [{ type: Schema.Types.ObjectId, ref: 'Ad' }],
  impression: { type: Schema.Types.ObjectId, ref: 'JobImpression' }
}, {
  timestamps: true,
  versionKey: false
});

JobRequisitionSchema.plugin(autoIncrement, {
  model: 'JobRequisition',
  field: 'jobId',
  startAt: 100000,
  incrementBy: 1
});
JobRequisitionSchema.plugin(mongoosePaginate);

JobRequisitionSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'jobId', 'createdBy', 'title', 'department', 'company', 'companyId', 'city', 'state', 'country', 'hasSaved', 'status', 'level', 'type', 'employmentType', 'education', 'skills', 'industry', 'impression'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
  minimal() {
    const transformed = {};
    const fields = ['_id', 'jobId', 'createdBy', 'title', 'department', 'company', 'companyId', 'city', 'state', 'country', 'hasSaved', 'status', 'level', 'type', 'employmentType', 'education', 'industry', 'impression'];
    fields.forEach((field) => {
      if(field==='company' || field==='impression'){
        transformed[field] = this[field].minimal()  ;
      } else {
        transformed[field] = this[field];
      }
    });

    return transformed;
  }
});

JobRequisitionSchema.post('findByIdAndUpdate', async function (job) {
  if (job) {
    await deleteFromCache(`job:${job._id}`);
    await deleteFromCache(`job:${job.jobId}`);
  }
});

JobRequisitionSchema.post('save', async function (job) {
  if (job) {
    await deleteFromCache(`job:${job._id}`);
    await deleteFromCache(`job:${job.jobId}`);
  }
});

JobRequisitionSchema.post('findByIdAndDelete', async function (job) {
  if (job) {
    await deleteFromCache(`job:${job._id}`);
    await deleteFromCache(`job:${job.jobId}`);
  }
});


module.exports = mongoose.model('JobRequisition', JobRequisitionSchema);
