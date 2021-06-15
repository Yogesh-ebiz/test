const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const DisputeSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  meta: {
    type: Object
  }
}, {
  versionKey: false
});

DisputeSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Dispute', DisputeSchema);


