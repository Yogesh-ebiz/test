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
  updatedDate: {
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
  },
  isSuper: {
    type: Boolean,
    default: false
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
}, {
  versionKey: false
});


module.exports = mongoose.model('Role', RoleSchema);
