const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  createdBy: {
    type: Number,
    required:false
  },
  createdDate: {
    type: Number,
    required:false
  },
  lastApplied: {
    type: Number,
    required:false
  },
  status: {
    type: String,
  },
  firstName: {
    type: String,
    required:false
  },
  lastName: {
    type: String,
    required:false
  },
  middleName: {
    type: String,
    required:false
  },
  resumes: [{ type: Schema.Types.ObjectId, ref: 'File' }]
}, {
  versionKey: false
});


module.exports = mongoose.model('User', UserSchema);
