const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ExperienceSchema = new mongoose.Schema({
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
    type: Number
  },
  thruDate: {
    type: Number
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
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Experience', ExperienceSchema);
