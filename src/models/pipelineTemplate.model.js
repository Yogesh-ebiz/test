const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const PipelineTemplateSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  updatedAt: {
    type: Number,
    default: Date.now
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  custom: {
    type: Boolean,
    default: false
  },
  default: {
    type: Boolean,
    default: false
  },
  department: {
    type: Number
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  autoRejectBlackList: {
    type: Boolean,
    default: false
  },
  noOfJobs: {
    type: Number
  },
  /*
    stages: List of stages.  Each stages has a list of option. Option types are [EMAIL, EVALUATION, QUESTIONS, SURVEY]
    Example: Option { type: EMAIL, required: true, allowChange: true, default: emailId}
  */
  stages: {
    type: Array,
    required: true
  },

  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  updateBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
}, {
  versionKey: false
});


PipelineTemplateSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('PipelineTemplate', PipelineTemplateSchema);


