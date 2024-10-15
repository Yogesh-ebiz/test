const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');



const SalarySchema = new mongoose.Schema({
  partyId: {
    type: Number,
    required: false
  },
  employmentTitle: {
    type: String,
    required: false,
    default: ''
  },
  employmentType: {
    type: String,
    required: true
  },
  jobFunction: {
    type: String,
  },
  yearsExperience: {
    type: Number,
  },
  company: {
    type: Object,
  },
  hasLiked: {
    type: Boolean,
    default: false
  },
  currency: {
    type: String,
    required: true,
    default: ''
  },
  basePayPeriod: {
    type: String,
    required: true,
    default: ''
  },
  baseSalary: {
    type: Number,
    required: true
  },
  additionalIncome: {
    type: Number,
    required: false
  },
  cashBonus: {
    type: Number,
    required: false
  },
  stockBonus: {
    type: Number,
    required: false
  },
  profitSharing: {
    type: Number,
    required: false
  },
  tip: {
    type: Number,
    required: false
  },
  commission: {
    type: Number,
    required: false
  },
  gender: {
    type: String,
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
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number
  }
}, {
  versionKey: false
});

SalarySchema.plugin(autoIncrement, {
  model: 'Salary',
  field: 'salaryId',
  startAt: 100000,
  incrementBy: 1
});
SalarySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Salary', SalarySchema);

