const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const UserSchema = new mongoose.Schema({
  userId: {
    type: Number
  },
  createdBy: {
    type: Number,
    required:false
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastApplied: {
    type: Number,
    required:false
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  firstName: {
    type: String,
    required:true
  },
  lastName: {
    type: String,
    required:true
  },
  email: {
    type: String,
    required:true
  },
  phoneNumber: {
    type: String
  },
  middleName: {
    type: String,
  },
  preferences: {
    type: Object,
    default: {
      openToRelocate: true,
      openToRemote: true,
      openToJob: true,
      jobTitles: [],
      jobLocations: [],
      jobTypes: [],
      startDate: "IMMEDIATE"
    }
  },
  resumes: [{ type: Schema.Types.ObjectId, ref: 'File' }]
}, {
  versionKey: false
});


module.exports = mongoose.model('User', UserSchema);
