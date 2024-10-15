const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const JobpipelineSchema = new mongoose.Schema({
  pipelineTemplateId: {
    type: Schema.Types.ObjectId, 
    ref: 'PipelineTemplate'
  },
  jobId: {
    type: Schema.Types.ObjectId, 
    ref: 'JobRequisition'
  },
  name: {
    type: String
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  updatedDate: {
    type: Number,
    default: Date.now
  },
  custom: {
    type: Boolean,
    default: false
  },
  autoRejectBlackList: {
    type: Boolean,
    default: false
  },
  category: {
    type: String
  },
  department: {
    type: Number
  },
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

JobpipelineSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Jobpipeline', JobpipelineSchema);


