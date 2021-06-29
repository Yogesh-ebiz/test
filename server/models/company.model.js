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
  createdBy: {
    type: Number,
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  creditLeft: {
    type: Number,
    default: 0
  },
  status: {
    type: String
  },
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },

}, {
  versionKey: false
});


module.exports = mongoose.model('Company', CompanySchema);


