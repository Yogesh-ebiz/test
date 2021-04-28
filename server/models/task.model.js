const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const TaskSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true
  },
  options: {
    type: Object,
    required: false
  },
  data: {
    type: Object,
    required: false
  }
}, {
  versionKey: false
});

TaskSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Task', TaskSchema);


