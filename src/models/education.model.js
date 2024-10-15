const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const EducationSchema = new mongoose.Schema({
  status: {
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
    type: String,
    required: false
  },
  hasGraduated: {
    type: Boolean
  },
  isCurrent: {
    type: Boolean
  },
  district:{
    type: String,
  },
  city:{
    type: String,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  fieldOfStudy: { type: Schema.Types.ObjectId, ref: 'FieldStudy' },
}, {
  versionKey: false
});

module.exports = mongoose.model('Education', EducationSchema);
