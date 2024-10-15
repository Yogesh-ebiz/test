const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ExperienceSchema = new mongoose.Schema({
  district: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  country: {
    type: String
  },
  employer:{
    type: Object
  },
  description: {
    type: String
  },
  employmentTitle: {
    type: String
  },
  employmentType: {
    type: String
  },
  fromDate: {
    type: String
  },
  thruDate: {
    type: String
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  terminationReason: {
    type: String,
    required: false
  },
  terminationType: {
    type: String,
    required: false
  },
  jobFunction: {
    type: String
  },
  jobType: {
    type: String
  },
  website: {
    type: String
  },
  salary: {
    type: Number
  },
  tasks: {
    type: Array
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Experience', ExperienceSchema);
