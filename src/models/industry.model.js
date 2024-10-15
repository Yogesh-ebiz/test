const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const IndustrySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: Object
  },
  locale: {
    type: Object,
    required: true
  },
  shortCode: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  icon: {
    type: String,
    required: false,
    default: ""
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  sequence: {
    type: Number,
    default: 0
  }
}, {
  versionKey: false
});



IndustrySchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Industry', IndustrySchema);


