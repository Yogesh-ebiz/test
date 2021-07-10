const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  companyId: {
    type: Number,
    required: true
  },
  customerId: {
    type: String
  },
  email: {
    type: String
  },
  createdBy: {
    type: Number,
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  credit: {
    type: Number,
    default: 0
  },
  status: {
    type: String
  },
  primaryAddress: {
    type: Object
  },
  subscription: {
    type: Object
  }

}, {
  versionKey: false
});


module.exports = mongoose.model('Company', CompanySchema);


