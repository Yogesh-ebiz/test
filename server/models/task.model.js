const mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const TaskSchema = new mongoose.Schema({
  required: {
    type: Boolean,
    required: true,
    default: false
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  reminders: {
    type: Array
  },
  isCompleted: {
    type: Boolean
  },
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object
  },
  meta: {
    type: Object
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
    type: Object
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
  priority: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  owner: { type: Schema.Types.ObjectId, ref: 'Member' },
  members: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
  tags: [{ type: Schema.Types.ObjectId, ref: 'Label' }]
}, {
  versionKey: false
});

TaskSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Task', TaskSchema);


