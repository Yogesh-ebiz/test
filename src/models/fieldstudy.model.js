const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const FieldStudySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: false,
    default: ''
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  icon: {
    type: String,
    required: false,
    default: ''
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  sequence: {
    type: Number,
    default: 0
  }
}, {
  versionKey: false
});

FieldStudySchema.plugin(mongoosePaginate);


module.exports = mongoose.model('FieldStudy', FieldStudySchema);


