const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const JobTitleSchema = new mongoose.Schema({
  name: {
    type: Object,
    required: true
  },
  shortName: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false,
    default: ""
  }
}, {
  versionKey: false
});


JobTitleSchema.plugin(autoIncrement, {
  model: 'JobTitle',
  field: 'id',
  startAt: 100000,
  incrementBy: 1
});

JobTitleSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('JobTitle', JobTitleSchema);


