const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const SubscriptionSchema = new mongoose.Schema({
  status: {
    type: String
  },
  createdDate: {
    type: Number
  },
  subscriptionId: {
    type: String
  },
  cancelAt: {
    type: Number
  },
  cancelAtPeriodEnd: {
    type: Boolean
  },
  canceledAt: {
    type: Number
  },
  trialStart: {
    type: Number
  },
  trialEnd: {
    type: Number
  },
  plan: {
    type: Object
  },
  startDate: {
    type: Number
  },
  endDate: {
    type: Number
  },
  type: {
    type: String
  }

}, {
  versionKey: false
});

SubscriptionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Subscription', SubscriptionSchema);


