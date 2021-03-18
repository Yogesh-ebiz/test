const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const PipelineSchema = new mongoose.Schema({
  pipelineId: {
    type: Number
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    default: Date.now,
    required: true
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
  type: {
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
    type: Number,
    required: true
  },
  stages: {
    type: Array,
    required: true
  }
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


