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
  allowChange: {
    type: Boolean,
    required: true,
    default: false
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
}, {
  versionKey: false
});

TaskSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Task', TaskSchema);


