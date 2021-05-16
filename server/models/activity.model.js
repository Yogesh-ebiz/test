const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const ActivitySchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    required: true
  },
  applicationId: {
    type: Object
  },
  action: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  meta: {
    type: Object
  }
}, {
  versionKey: false
});

ActivitySchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Activity', ActivitySchema);


