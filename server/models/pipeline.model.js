const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const PipelineSchema = new mongoose.Schema({
  pipelineId: {
    type: Number
  },
  pipelineTemplateId: {
    type: Object,
    required: true
  },
  jobId: {
    type: Object
  },
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
    type: Number
  },
  custom: {
    type: Boolean,
    default: false
  },
  autoRejectBlackList: {
    type: Boolean,
    default: false
  },
  default: {
    type: Boolean,
    default: false
  },
  stages: [{ type: Schema.Types.ObjectId, ref: 'Stage' }],
}, {
  versionKey: false
});


PipelineSchema.plugin(autoIncrement, {
  model: 'Pipeline',
  field: 'pipelineId',
  startAt: 100000,
  incrementBy: 1
});
PipelineSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Pipeline', PipelineSchema);


