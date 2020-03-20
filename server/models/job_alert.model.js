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
  distance: {
    type: Number,
    required: false
  },
  level: {
    type: String,
    required: false
  },
  employmentType: {
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
    type: Date,
    default: Date.now
  },
  repeats: {
    type: String,
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
