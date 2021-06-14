const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const TaskSchema = new mongoose.Schema({
  required: {
    type: Boolean,
    required: true,
    default: false
  },
  name: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    required: false
  },
  type: {
    type: String,
    required: true
  },
  options: {
    type: Object,
    required: false
  },
  template: {
    type: Object,
    required: false
  },
  data: {
    type: Object,
    required: false
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    required: false
  },
  updatedDate: {
    type: Number,
    default: Date.now
  },
  updatedBy: {
    type: Number
  },
  startDate: {
    type: Number
  },
  endDate: {
    type: Number
  },
  hasCompleted: {
    type: Boolean,
    default: false
  },
  member: { type: Schema.Types.ObjectId, ref: 'Member' }
}, {
  versionKey: false
});

TaskSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Task', TaskSchema);


