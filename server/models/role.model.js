const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new mongoose.Schema({
  default: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Number,
    required:true
  },
  company: {
    type: Number,
    required:true
  },
  status: {
    type: String
  },
  name: {
    type: String,
    required:true
  },
  roleName: {
    type: String
  },
  privileges: {
    type: Array,
      required:true
  },
  description: {
    type: Object,
    required:false
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Role', RoleSchema);
