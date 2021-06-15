const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const ReceiptSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
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
  metadata: {
    type: Object
  },
  type: {   //SUBSCRIPTION || PURCHASE
    type: String
  },
  isPaid: {
    type: Boolean
  },
  payment: {
    type: Object
  },
  paymentMethod: {
    type: String
  },
  receiptUrl: {
    type: String
  },
  userId: {
    type: Number
  },
  // jobId: { type: Schema.Types.ObjectId, ref: 'JobRequisition'},
  // member: { type: Schema.Types.ObjectId, ref: 'Member'},
  // refund: { type: Schema.Types.ObjectId, ref: 'Refund'},
  // dispute: { type: Schema.Types.ObjectId, ref: 'Dispute'}
}, {
  versionKey: false
});

ReceiptSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Receipt', ReceiptSchema);


