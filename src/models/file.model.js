const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');

const FileSchema = new mongoose.Schema({
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    required: false
  },
  lastModifiedDate: {
    type: Number,
    default: Date.now
  },
  lastModifiedBy: {
    type: Number,
    default: Date.now
  },
  fileType: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
  },
  description: {
    type: String,
  },
  hash: {
    type: String
  },
  fileId: {
    type: Number
  },
}, {
  versionKey: false
});

// FileSchema.plugin(mongoosePaginate);
FileSchema.plugin(autoIncrement, {
  model: 'File',
  field: 'fileId',
  startAt: 100000,
  incrementBy: 1
});
FileSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('File', FileSchema);


