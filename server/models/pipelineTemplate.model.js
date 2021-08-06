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
  createdBy: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Number,
    default: Date.now
  },
  updatedBy: {
    type: Object
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
  name: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  department: {
    type: Number
  },
  company: {
    type: Object
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
}, {
  versionKey: false
});


PipelineTemplateSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('PipelineTemplate', PipelineTemplateSchema);


