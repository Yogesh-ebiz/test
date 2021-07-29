const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new mongoose.Schema({
  default: {
    type: Boolean
  },
  createdBy: {
    type: Number
  },
  company: {
    type: Number
  },
  status: {
    type: String
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
    type: Object
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Role', RoleSchema);
