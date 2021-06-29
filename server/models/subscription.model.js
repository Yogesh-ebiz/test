const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const SubscriptionSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Number
  },
  currentPeriodStart: {
    type: Number
  },
  trialEnd: {
    type: Number
  },
  trialStart: {
    type: Number
  },
  product: {
    type: String
  },
  latestInvoice: {
    type: String
  },
  startDate: {
    type: Number
  },
  status: {
    type: String,
    required: true
  },
  payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
}, {
  versionKey: false
});

SubscriptionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Subscription', SubscriptionSchema);


