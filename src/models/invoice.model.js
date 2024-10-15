const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');
const Schema = mongoose.Schema;


const InvoiceSchema = new mongoose.Schema({

  createdDate: {
    type: Date,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Date,
    default: Date.now
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
  amountDue: {
    type: Number
  },
  amountPaid: {
    type: Number
  },
  amountRemaining: {
    type: Number
  },
  attempted: {
    type: Boolean
  },
  dueDate: {
    type: Number
  },
  paid: {
    type: Boolean
  },
  pamentIntent: {
    type: String
  },
  currency: {
    type: String
  },
  subtotal: {
    type: Number
  },
  tax: {
    type: Number
  },
  total: {
    type: String
  },
  description: {
    type: String
  },
  chargeId: {
    type: String
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  items: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  customer: { type: Schema.Types.ObjectId, ref: 'Member' },
  discounts: [{ type: Schema.Types.ObjectId, ref: 'Discount' }],
  refund: { type: Schema.Types.ObjectId, ref: 'Refund' },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  comments:[{ type: Schema.Types.ObjectId, ref: 'Comment'}],
  tags:[{ type: Schema.Types.ObjectId, ref: 'Label'}]
}, {
  versionKey: false
});

InvoiceSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Invoice', InvoiceSchema);

