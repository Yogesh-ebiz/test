const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReferenceSchema = new mongoose.Schema({
  createdBy: {
    type: Number,
    required:false
  },
  createdDate: {
    type: Date,
      required:false
  },
  updatedDate: {
    type: Date,
    required:false
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  title: {
    type: String
  },
  relationship: {
    type: String
  },
  company: {
    type: String
  },
}, {
  versionKey: false
});


module.exports = mongoose.model('Reference', ReferenceSchema);
