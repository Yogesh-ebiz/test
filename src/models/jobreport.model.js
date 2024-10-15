const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');


const JobReportSchema = new mongoose.Schema({
  jobReportId: {
    type: Number
  },
  jobId: {
    type: Number,
    required: true,
  },
  reportedBy: {
    type: Object,
    required: true,
  },
  isAnonymous: {
    type: Boolean,
  },
  reason: {
    type: Array,
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

JobReportSchema.plugin(autoIncrement, {
  model: 'JobReport',
  field: 'jobReportId',
  startAt: 100000,
  incrementBy: 1
});
JobReportSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('JobReport', JobReportSchema);
