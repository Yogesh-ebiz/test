const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const EducationSchema = new mongoose.Schema({
  status: {
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
  institute:{
    type: Object
  },
  degree: {
    type: String
  },
  gpa:{
    type: Number
  },
  fromDate: {
    type: String
  },
  thruDate: {
    type: Number,
    required: false
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  hasGraduated: {
    type: Boolean
  },
  degree: {
    type: String
  },
  fieldOfStudy: {
    type: Object
  }
}, {
  versionKey: false
});

module.exports = mongoose.model('Education', EducationSchema);
