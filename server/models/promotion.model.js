const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const PromotionSchema = new mongoose.Schema({
  promotionId: {
    type: Number,
    required: true
  },
  jobId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: false
  },
  hasExpired: {
    type: Boolean,
    required: false,
    default: false
  },
  createdDate: {
    type: Number,
    required: false,
    default: Date.now()
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  }

}, {
  versionKey: false
});

PromotionSchema.plugin(autoIncrement, {
  model: 'Promotion',
  field: 'promotionId',
  startAt: 100000,
  incrementBy: 1
});
PromotionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Promotion', PromotionSchema);

