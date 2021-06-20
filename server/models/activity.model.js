const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const ActivitySchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  causer: {
    type: Object,
    required: false
  },
  causerType: {
    type: String,
    required: true
  },
  causerId: {
    type: Object
  },
  action: {
    type: String,
    required: true
  },
  subject: {
    type: Object,
    required: true
  },
  subjectType: {
    type: String,
    required: true
  },
  subjectId: {
    type: String
  },
  meta: {
    type: Object
  }
}, {
  versionKey: false
});

ActivitySchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Activity', ActivitySchema);


