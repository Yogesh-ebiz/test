const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const RefundSchema = new mongoose.Schema({
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

RefundSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Refund', RefundSchema);


