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
  application: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
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
    required: false,
    default: Date.now()
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  },
  attachment: {
    type: String,
    required: false
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

