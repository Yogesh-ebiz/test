const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');


const ReportedJobSchema = new mongoose.Schema({
  reportedJobId: {
    type: Number
  },
  jobId: {
    type: Number,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  isAnonymous: {
    type: Boolean,
  },
  reason: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    default: Date.now
  }
}, {
  versionKey: false
});

ReportedJobSchema.plugin(autoIncrement, {
  model: 'ReportedJob',
  field: 'reportJobId',
  startAt: 100000,
  incrementBy: 1
});
ReportedJobSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('ReportedJob', ReportedJobSchema);
