const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SovrenTransactionSchema = new mongoose.Schema({
  Code: {
    type: String,
  },
  Message: {
    type: String,
  },
  TransactionId: {
    type: String
  },
  EngineVersion: {
    type: String
  },
  ApiVersion: {
    type: String
  },
  TotalElapsedMilliseconds: {
    type: Number
  },
  TransactionCost: {
    type: Number
  },
  CustomerDetails: {
    type: Object
  }
}, {
  timestamps: true,
  versionKey: false
});


module.exports = mongoose.model('SovrenTransaction', SovrenTransactionSchema);

