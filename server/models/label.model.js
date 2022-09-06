const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const LabelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  default: {
    type: Boolean,
    default: false
  },
  company: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number
  },
  updatedBy: {
    type: Number,
    required: false
  }
}, {
  versionKey: false
});

LabelSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Label', LabelSchema);


