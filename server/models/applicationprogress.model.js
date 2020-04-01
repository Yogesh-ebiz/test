const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const ApplicationProgressSchema = new mongoose.Schema({
  applicationProgressId: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    required: false,
    default: '',
  },
  applicationId: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: false
  },
  candidateComment: {
    type: String,
    required: false,
    default: ''
  },
  note: {
    type: String,
    required: false,
    default: '',
  },
  requiredAction: {
    type: Boolean,
    required: false,
    default: false
  },
  type: {
    type: String,
    required: true
  },
  event: {
    type: Object,
    required: false
  },
  createdDate: {
    type: Number,
    required: false,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  },
  attachment: {
    type: Object,
    required: false
  },
  candidateAttachment: {
    type: Object,
    required: false
  },
  comments: {
    type: Array,
    required: false,
    default: []
  }

}, {
  versionKey: false
});

ApplicationProgressSchema.plugin(autoIncrement, {
  model: 'ApplicationProgress',
  field: 'applicationProgressId',
  startAt: 100000,
  incrementBy: 1
});
ApplicationProgressSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('ApplicationProgress', ApplicationProgressSchema);

