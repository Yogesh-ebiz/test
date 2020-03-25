const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const JobAlertSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  partyId: {
    type: Number,
    required: true
  },
  jobId: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    required: true,
    default: "ACTIVE"
  },
  title: {
    type: String,
    required: false,
    default: ''
  },
  company: {
    type: Array,
    required: false,
    default: []
  },
  companySize: {
    type: Number,
    required: false
  },
  distance: {
    type: Number,
    required: false
  },
  industry: {
    type: String,
    required: false,
    default: '',
  },
  employmentType: {
    type: String,
    required: false,
    default: '',
  },
  city: {
    type: String,
    required: false,
    default: '',
  },
  state: {
    type: String,
    required: false,
    default: '',
  },
  country: {
    type: String,
    required: false,
    default: '',
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  repeat: {
    type: String,
    required: false,
    default: ''
  },
  notification: {
    type: Array,
    required: false,
    default: []
  },
  noJobs: {
    type: Number,
    required: false
  }
}, {
  versionKey: false
});


JobAlertSchema.plugin(autoIncrement, {
  model: 'JobAlert',
  field: 'jobAlertId',
  startAt: 100000,
  incrementBy: 1
});
JobAlertSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('JobAlert', JobAlertSchema);
