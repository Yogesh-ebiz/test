const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');
const Schema = mongoose.Schema;


const PaymentSchema = new mongoose.Schema({
  createdBy: {
    type: Number
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number
  },
  status: {
    type: String
  },
  paymentType: {
    type: String
  },
  paymentMethod: {
    type: Object
  },
  amount: {
    type: Number
  },
  currency: {
    type: String
  },
  description: {
    type: String
  },
  chargeId: {
    type: String
  },
  refund: { type: Schema.Types.ObjectId, ref: 'Refund' },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  comments:[{ type: Schema.Types.ObjectId, ref: 'Comment'}],
  tags:[{ type: Schema.Types.ObjectId, ref: 'Label'}]
}, {
  versionKey: false
});

PaymentSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Payment', PaymentSchema);

