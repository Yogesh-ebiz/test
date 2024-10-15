const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserRoleSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  createdBy: {
    type: Number,
    required:false
  },
  status: {
    type: String,
    required: true
  },
  createdDate: {
    type: Number,
      required:false
  },
  updatedDate: {
    type: Number,
    required:false
  },
  user: {
    type: Object,
    required:true
  },
  company: {
    type: Object,
    required:false
  },
  partyTitle: {
    type: String,
    required:false
  },
  role: { type: Schema.Types.ObjectId, ref: 'Role' }
}, {
  versionKey: false
});


module.exports = mongoose.model('UserRole', UserRoleSchema);
