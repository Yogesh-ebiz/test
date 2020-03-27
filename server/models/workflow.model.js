const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const WorkflowSchema = new mongoose.Schema({
  workflowId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: false
  },
  partyId: {
    type: Number,
    required: true
  },
  companyId: {
    type: Number,
    required: false
  },
  workflow: {
    type: Array,
    required: true
  },
  status: {
    type: String,
    required: false
  },
  isMaster: {
    type: Boolean,
    required: true,
    default: false
  },
  isPrimary: {
    type: Boolean,
    required: true,
    default: false
  },
  department: {
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
  }
}, {
  versionKey: false
});

WorkflowSchema.plugin(autoIncrement, {
  model: 'Workflow',
  field: 'workflowId',
  startAt: 100000,
  incrementBy: 1
});
WorkflowSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Workflow', WorkflowSchema);

