const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
const mongoosePaginate = require('mongoose-paginate-v2');


const CompanyReviewHistorySchema = new mongoose.Schema({
  companyReviewHistoryId: {
    type: Number,
    required: true
  },
  company: {
    type: Object,
    required: false
  },
  employmentTitle: {
    type: String,
    required: true
  },
  avgBaseSalary: {
    type: Number,
    required: true
  },
  minBaseSalary: {
    type: Number,
    required: true
  },
  maxBaseSalary: {
    type: Number,
    required: true
  },
  avgAdditionalIncome: {
    type: Number,
    required: false
  },
  minAdditionalIncome: {
    type: Number,
    required: false
  },
  maxAdditionalIncome: {
    type: Number,
    required: false
  },
  minCashBonus: {
    type: Number,
    required: false
  },
  maxCashBonus: {
    type: Number,
    required: false
  },
  minstockBonus: {
    type: Number,
    required: false
  },
  maxStockBonus: {
    type: Number,
    required: false
  },
  profitSharing: {
    type: Number,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  state: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: false
  },
  createdDate: {
    type: Number,
    default: Date.now()
  },
  lastUpdatedDate: {
    type: Number
  }
}, {
  versionKey: false
});

CompanyReviewHistorySchema.plugin(autoIncrement, {
  model: 'CompanyReviewHistory',
  field: 'companyReviewHistoryId',
  startAt: 100000,
  incrementBy: 1
});
CompanyReviewHistorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CompanyReviewHistory', CompanyReviewHistorySchema);

