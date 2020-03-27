const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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
  job: { type: Schema.Types.ObjectId, ref: 'JobRequisition' },
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
    default: Date.now
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
  },
  progress: [{ type: Schema.Types.ObjectId, ref: 'ApplicationProgress' }]

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

