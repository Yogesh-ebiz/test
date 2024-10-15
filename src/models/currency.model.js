const mongoose = require('mongoose');


const CurrencySchema = new mongoose.Schema({
  currency: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Currency', CurrencySchema);

