const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');
const ApplicationProgress = require('./applicationprogress.model');
const Evaluation = require('./evaluation.model');
const { getFromCache, saveToCache, deleteFromCache } = require('../services/cacheService');


const ApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: Number
  },
  jobTitle: {
    type: String
  },
  //user = partyId
  // user: {
  //   type: Object,
  //   required: false
  // },
  partyId: {
    type: Number
  },
  status: {
    type: String,
    required: false,
    default: statusEnum.ACTIVE
  },
  reason: {
    type: String
  },
  shortlist: {
    type: Boolean,
    default: false
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
    type: Number
  },
  hasAccepted: {
    type: Boolean
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
    type: Number,
    required:false,
    default: 0
  },
  noOfComments: {
    type: Number,
    default: 0
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
  conversationId: {
    type: String,
  },
  allowView: {
    type: Boolean,
  },
  match: {
    type: Number,
    default: 0,
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  user: { type: Schema.Types.ObjectId, ref: 'Candidate' },
  job: { type: Schema.Types.ObjectId, ref: 'JobRequisition' },
  questionSubmission: { type: Schema.Types.ObjectId, ref: 'QuestionSubmission' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  labels: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  progress: [{ type: Schema.Types.ObjectId, ref: 'ApplicationProgress' }],
  currentProgress: { type: Schema.Types.ObjectId, ref: 'ApplicationProgress' },
  files: [{ type: Schema.Types.ObjectId, ref: 'File' }],
  emails:[{ type: Schema.Types.ObjectId, ref: 'Email'}],
  evaluations:[{ type: Schema.Types.ObjectId, ref: 'Evaluation'}]
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

ApplicationSchema.post('remove', async function (next) {
  ApplicationProgress.remove({_id: this.currentProgress}).exec();
  Evaluation.remove({application: this._id}).exec();
  next();
});

ApplicationSchema.post('findByIdAndUpdate', async function (application) {
  if (application) {
    const candidateId = typeof application.user === 'object' ? application.user._id : application.user;
    await deleteFromCache(`candidate:${candidateId}`);
  }
});

ApplicationSchema.post('save', async function (application) {
  if (application) {
    const candidateId = typeof application.user === 'object' ? application.user._id : application.user;
    await deleteFromCache(`candidate:${candidateId}`);
  }
});

ApplicationSchema.post('findByIdAndDelete', async function (application) {
  if (application) {
    const candidateId = typeof application.user === 'object' ? application.user._id : application.user;
    await deleteFromCache(`candidate:${candidateId}`);
  }
});


module.exports = mongoose.model('Application', ApplicationSchema);

