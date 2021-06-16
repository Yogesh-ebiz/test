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
  createdBy: {
    type: Object
  },
  updatedDate: {
    type: Number,
    default: Date.now
  },
  updatedBy: {
    type: Object,
    required: false
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  userId: {
    type: String
  },
  email: {
    type: String
  },
  user: {
    type: Object
  },
  members: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
  department: { type: Schema.Types.ObjectId, ref: 'Department'},
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
    require: false
  },
  autoConfirmationEmail: {
    type: Boolean,
    default: false,
    required: false
  },
  pipeline: { type: Schema.Types.ObjectId, ref: 'Pipeline' }

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

