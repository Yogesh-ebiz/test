const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');


const ApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: Number,
    required: true
  },
  jobId: {
    type: Number,
    required: true
  },
  //user = partyId
  user: {
    type: Object,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: false
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
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
  photo: {
    type: Object
  },
  resume: {
    type: Object
  },
  percentMatched: {
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
  progress: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
  sources: {
    type: Array
  },
  questionSubmission: { type: Schema.Types.ObjectId, ref: 'QuestionSubmission' },
  note: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
  labels: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  progress: [{ type: Schema.Types.ObjectId, ref: 'ApplicationProgress' }],
  currentProgress: { type: Schema.Types.ObjectId, ref: 'ApplicationProgress' }

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

