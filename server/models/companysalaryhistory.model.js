const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
const mongoosePaginate = require('mongoose-paginate-v2');


const CompanySalaryHistorySchema = new mongoose.Schema({
  companySalaryHistoryId: {
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
  avgTotalPay: {
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
  minStockBonus: {
    type: Number,
    required: false
  },
  maxStockBonus: {
    type: Number,
    required: false
  },
  minProfitSharing: {
    type: Number,
    required: false
  },
  maxProfitSharing: {
    type: Number,
    required: false
  },
  count: {
    type: Number,
    default: 0
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

CompanySalaryHistorySchema.plugin(autoIncrement, {
  model: 'CompanySalaryHistory',
  field: 'companySalaryHistoryId',
  startAt: 100000,
  incrementBy: 1
});
CompanySalaryHistorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CompanySalaryHistory', CompanySalaryHistorySchema);

