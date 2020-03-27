const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');

const JobViewSchema = new mongoose.Schema({
  jobViewId: {
    type: Number,
    required: false
  },
  partyId: {
    type: Number,
    required: true
  },
  jobId: {
    type: Number,
    required: true
  },
  viewCount: {
    type: Number,
    default: 1
  },
  createdDate: {
    type: Number
  }
}, {
  versionKey: false
});


JobViewSchema.plugin(autoIncrement, {
  model: 'JobView',
  field: 'jobViewId',
  startAt: 100000,
  incrementBy: 1
});
JobViewSchema.plugin(mongoosePaginate);



module.exports = mongoose.model('JobView', JobViewSchema);
