const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const PromotionSchema = new mongoose.Schema({
  createdBy: {
    type: Number,
    required: true
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  planId: {
    type: Object,
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
  lastUpdatedDate: {
    type: Number,
    required: false
  },
  startdDate: {
    type: Number,
    required: true
  },
  endDate: {
    type: Number,
    required: true
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

