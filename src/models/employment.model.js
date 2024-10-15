const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const EmploymentSchema = new mongoose.Schema({
  employmentId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: true
  },
  company: {
    type: Object,
    required: true
  },
  fromDate: {
    type: Number,
    required: true
  },
  thruDate: {
    type: Number,
    required: false
  },
  employmentTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  terminationReason: {
    type: String,
    required: false,
    default: ''
  },
  terminationType: {
    type: String,
    required: false,
    default: ''
  },
  isCurrent: {
    type: Boolean,
    required: true,
    default: false
  },
  createdDate: {
    type: Number,
    required: true,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  },
  city: {
    type: String,
    required: true,
    default: ''
  },
  state: {
    type: String,
    required: true,
    default: ''
  },
  country: {
    type: String,
    required: true,
    default: ''
  }
}, {
  versionKey: false
});

EmploymentSchema.plugin(autoIncrement, {
  model: 'Employment',
  field: 'employmentId',
  startAt: 100000,
  incrementBy: 1
});
EmploymentSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Employment', EmploymentSchema);

