const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const ApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: Number,
    required: true
  },
  jobId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: false
  },
  createdDate: {
    type: Number,
    required: false
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  availableDate: {
    type: Number,
    required: true
  },
  attachment: {
    type: String,
    required: false
  }

}, {
  versionKey: false
});

ApplicationSchema.plugin(autoIncrement, {
  model: 'Application',
  field: 'applicationId',
  startAt: 100000,
  incrementBy: 1
});
ApplicationSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Application', ApplicationSchema);

