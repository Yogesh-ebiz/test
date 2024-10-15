const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const ApplicationHistorySchema = new mongoose.Schema({
  applicationHistoryId: {
    type: Number,
    required: true
  },
  applicationId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: true
  },
  action: {
    type: Object,
    required: true
  },
  createdDate: {
    type: Number,
    required: false,
    default: Date.now
  }

}, {
  versionKey: false
});

ApplicationHistorySchema.plugin(autoIncrement, {
  model: 'ApplicationHistory',
  field: 'applicationHistoryId',
  startAt: 100000,
  incrementBy: 1
});
ApplicationHistorySchema.plugin(mongoosePaginate);


module.exports = mongoose.model('ApplicationHistory', ApplicationHistorySchema);

