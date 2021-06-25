const mongoose = require('mongoose');
// let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

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
    type: Object,
    required: true
  },
  company: {
    type: Number,
    required: true
  },
  viewCount: {
    type: Number,
    default: 1
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  token: {
    type: String
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
