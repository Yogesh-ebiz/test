const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');


const ApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: Number
  },
  jobId: {
    type: Object,
    required: true
  },
  job: {
    type: Object
  },
  jobTitle: {
    type: String
  },
  //user = partyId
  // user: {
  //   type: Object,
  //   required: false
  // },
  user: { type: Schema.Types.ObjectId, ref: 'Candidate' },
  partyId: {
    type: Number,
    required: true
  },
  company: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    required: false,
    default: statusEnum.ACTIVE
  },
  type: {
    type: String,
    required: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    required: false
  },
  updatedBy: {
    type: Number,
    required: false
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  availableDate: {
    type: Number,
    required: true
  },
  coverLetter: {
    type: String
  },
  offerLetter: {
    type: Object
  },
  photo: {
    type: Object
  },
  resume: {
    type: Object
  },
  desiredSalary: {
    type: Number
  },
  currency: {
    type: String
  },
  rating: {
    type: Number
  },
  noOfEvaluations: {
    type: Number
  },
  hasSubmittedQuestion: {
    type: Boolean,
    default: false,
    required: false
  },
  hasFollowed: {
    type: Boolean,
    default: false
  },
  attachment: {
    type: String
  },
  sources: {
    type: Array
  },
  token: {
    type: String
  },
  job: { type: Schema.Types.ObjectId, ref: 'JobRequisition' },
  questionSubmission: { type: Schema.Types.ObjectId, ref: 'QuestionSubmission' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  labels: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  progress: [{ type: Schema.Types.ObjectId, ref: 'ApplicationProgress' }],
  allProgress: [{ type: Schema.Types.ObjectId, ref: 'ApplicationProgress' }],
  currentProgress: { type: Schema.Types.ObjectId, ref: 'ApplicationProgress' },
  files: [{ type: Schema.Types.ObjectId, ref: 'File' }],
  emails:[{ type: Schema.Types.ObjectId, ref: 'Email'}]
}, {
  versionKey: false
});

ApplicationSchema.plugin(autoIncrement, {
  model: 'Application',
  field: 'applicationId',
  startAt: 100000,
  incrementBy: 1
});
ApplicationSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Application', ApplicationSchema);

