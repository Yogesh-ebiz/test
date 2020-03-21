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
    type: Number,
    required: false
  },
  distance: {
    type: Number,
    required: false
  },
  level: {
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
  repeats: {
    type: String,
    required: false,
    default: ''
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
