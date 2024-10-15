const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const JobFunctionSchema = new mongoose.Schema({
  id: {
    type: Number
  },
  name: {
    type: Object,
    required: true
  },
  shortCode: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  longDescription: {
    type: String,
    required: false,
    default: ""
  },
  icon: {
    type: String,
    required: false,
    default: ""
  },
  parent: {
    type: Number,
    required: false
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  sequence: {
    type: Number,
    default: 0
  },
  children: {
    type: Array,
    required: false,
    default: []
  }
}, {
  versionKey: false
});


JobFunctionSchema.plugin(autoIncrement, {
  model: 'JobFunction',
  field: 'id',
  startAt: 100000,
  incrementBy: 1
});

JobFunctionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('JobFunction', JobFunctionSchema);


