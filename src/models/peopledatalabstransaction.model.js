const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PeopleDataLabsTransactionSchema = new mongoose.Schema({
  success: {
    type: Boolean,
  },
  scroll_token: {
    type: String,
  },
  rateLimit: {
    type: Object,
  },
  noOfResults: {
    type: Number
  },
  creditUsed: {
    type: Number
  }
}, {
  timestamps: true,
  versionKey: false
});


module.exports = mongoose.model('PeopleDataLabsTransaction', PeopleDataLabsTransactionSchema);

