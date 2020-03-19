const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const SourcesSchema = new mongoose.Schema({

  source: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  url: {
    type: String,
    required: false,
    default: null
  },
  category: {
    type: String,
    required: false,
    default: null
  },
  language: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: false
  },
}, {
  versionKey: false
});

SourcesSchema.plugin(autoIncrement, {
  model: 'Source',
  field: 'sourceId',
  startAt: 100000,
  incrementBy: 1
});
SourcesSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Source', SourcesSchema);

