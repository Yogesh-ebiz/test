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
    type: String,
    required: false,
    default: ''
  },
  companySize: {
    type: String,
    required: false
  },
  distance: {
    type: String,
    required: false
  },
  level: {
    type: String,
    required: false,
    default: '',
  },
  industry: {
    type: String,
    required: false,
    default: '',
  },
  jobFunction: {
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
    type: Number,
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
    required: false,
    default: 0
  },
  remote: {
    type: Boolean,
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
