const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');

const RoleSchema = new mongoose.Schema({
  default: {
    type: Boolean
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number
  },
  updatedDate: {
    type: Number
  },
  updatedBy: {
    type: Number
  },
  company: {
    type: Number
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  name: {
    type: String,
    required:true
  },
  privileges: {
    type: Array,
    required:true
  },
  description: {
    type: String
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Role', RoleSchema);
