const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobPreferenceSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
      required:false
  },
  updatedDate: {
    type: Number,
    required:false
  },
  jobTitles: {
    type: Array,
    required:false
  },
  jobTypes: {
    type: Array,
    required:false
  },
  jobLocations: {
    type: Array,
    required:false
  },
  openToRelocate: {
    type: Boolean,
    required:false
  },
  openToJob: {
    type: Boolean,
    required:false
  },
  openToRemote: {
    type: Boolean,
    required:false
  },
  startDate: {
    type: String,
    required:false
  },
  userId: {
    type: Number,
    required:true
  },
}, {
  versionKey: false
});


module.exports = mongoose.model('JobPreference', JobPreferenceSchema);
