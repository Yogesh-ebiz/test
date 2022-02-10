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
    required: false,
    default: 0
  },
  avgAdditionalIncome: {
    type: Number,
    required: false,
    default: 0
  },
  minAdditionalIncome: {
    type: Number,
    required: false,
    default: 0
  },
  maxAdditionalIncome: {
    type: Number,
    required: false,
    default: 0
  },
  avgCashBonus: {
    type: Number,
    required: false,
    default: 0
  },
  minCashBonus: {
    type: Number,
    required: false,
    default: 0
  },
  maxCashBonus: {
    type: Number,
    required: false,
    default: 0
  },
  avgStockBonus: {
    type: Number,
    required: false,
    default: 0
  },
  minStockBonus: {
    type: Number,
    required: false,
    default: 0
  },
  maxStockBonus: {
    type: Number,
    required: false,
    default: 0
  },
  avgProfitSharing: {
    type: Number,
    required: false,
    default: 0
  },
  minProfitSharing: {
    type: Number,
    required: false,
    default: 0
  },
  maxProfitSharing: {
    type: Number,
    required: false,
    default: 0
  },
  avgTip: {
    type: Number,
    required: false,
    default: 0
  },
  minTip: {
    type: Number,
    required: false,
    default: 0
  },
  maxTip: {
    type: Number,
    required: false,
    default: 0
  },
  avgCommision: {
    type: Number,
    required: false,
    default: 0
  },
  minCommision: {
    type: Number,
    required: false,
    default: 0
  },
  maxCommision: {
    type: Number,
    required: false,
    default: 0
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
    default: Date.now
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

