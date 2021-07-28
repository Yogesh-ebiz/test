const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const ApplicationProgressSchema = new mongoose.Schema({
  applicationProgressId: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    required: false,
    default: '',
  },
  applicationId: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: statusEnum.ACTIVE
  },
  isRequired: {
    type: Boolean
  },
  candidateComment: {
    type: String,
    required: false,
    default: ''
  },
  event: {
    type: Object,
    required: false
  },
  reasons: {
    type: Array,
    required: false
  },
  createdDate: {
    type: Number,
    required: false,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  },
  noOfComments: {
    type: Number,
    required: false
  },
  noOfEvaluations: {
    type: Number,
    required: false
  },
  noOfEmails: {
    type: Number,
    required: false
  },
  noOfEvents: {
    type: Number,
    required: false
  },
  rating: {
    type: Number
  },
  attachment: { type: Schema.Types.ObjectId, ref: 'File' },
  candidateAttachment: { type: Schema.Types.ObjectId, ref: 'File' },
  stage: { type: Schema.Types.ObjectId, ref: 'Stage' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  evaluations: [{ type: Schema.Types.ObjectId, ref: 'Evaluation' }],
  emails: [{ type: Schema.Types.ObjectId, ref: 'Email' }],
}, {
  versionKey: false
});

ApplicationProgressSchema.plugin(autoIncrement, {
  model: 'ApplicationProgress',
  field: 'applicationProgressId',
  startAt: 100000,
  incrementBy: 1
});
ApplicationProgressSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('ApplicationProgress', ApplicationProgressSchema);

