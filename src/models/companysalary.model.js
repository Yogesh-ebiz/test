const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
const mongoosePaginate = require('mongoose-paginate-v2');


const CompanySalarySchema = new mongoose.Schema({
  companySalaryId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: false
  },
  partyEmploymentId: {
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
    required: true
  },
  yearsExperience: {
    type: Number,
    required: true
  },
  company: {
    type: Number,
    required: true
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
  commision: {
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

CompanySalarySchema.plugin(autoIncrement, {
  model: 'CompanySalary',
  field: 'companySalaryId',
  startAt: 100000,
  incrementBy: 1
});
CompanySalarySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CompanySalary', CompanySalarySchema);

