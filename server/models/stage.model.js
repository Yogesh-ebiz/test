const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;


const StageSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    required: false
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
  default: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: true
  },
  timeLimit: {
    type: String,
    required: false
  },
  mandatory: {
    type: Boolean,
    required: false,
    default: false
  },
  applications: {
    type: Array,
    required: false
  },
  members: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  evaluations: [{ type: Schema.Types.ObjectId, ref: 'Evaluation' }],
}, {
  versionKey: false
});

StageSchema.plugin(autoIncrement, {
  model: 'Stage',
  field: 'stageId',
  startAt: 100000,
  incrementBy: 1
});
StageSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Stage', StageSchema);


