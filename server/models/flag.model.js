const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const FlagSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number
  },
  type: {
    type: String,
    required: true
  },
  userId: {
    type: Number
  },
  companyId: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  }
}, {
  versionKey: false
});

FlagSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Flag', FlagSchema);


