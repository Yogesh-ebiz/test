const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');


const CompanyReviewReportSchema = new mongoose.Schema({
  companyReviewReportId: {
    type: Number,
    required: false
  },
  companyReviewId: {
    type: Number,
    required: true,
  },
  partyId: {
    type: Number,
    required: true,
  },
  isAnonymous: {
    type: Boolean,
  },
  reason: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    default: Date.now
  }
}, {
  versionKey: false
});

CompanyReviewReportSchema.plugin(autoIncrement, {
  model: 'CompanyReviewReport',
  field: 'companyReviewReport',
  startAt: 100000,
  incrementBy: 1
});
CompanyReviewReportSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('CompanyReviewReport', CompanyReviewReportSchema);
