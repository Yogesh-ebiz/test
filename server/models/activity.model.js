const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
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
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  subjectType: {
    type: String,
    required: true
  },
  subjectId: {
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


