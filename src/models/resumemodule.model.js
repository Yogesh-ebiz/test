const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const ResumeModuleSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Number,
    default: Date.now
  },
  updatedBy: {
    type: Object
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  name: {
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    default: true
  },
  content: {
    type: String,
    required: true
  },
}, {
  versionKey: false
});


ResumeModuleSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('ResumeModule', ResumeModuleSchema);


