const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CardSchema = new mongoose.Schema({
  id: {
    type: String
  },
  object: {
    type: String
  },
  address_city: {
    type: String
  },
  address_country: {
    type: String
  },
  address_line1: {
    type: String
  },
  address_line1_check: {
    type: String
  },
  address_line2: {
    type: String
  },
  address_state: {
    type: String
  },
  address_zip: {
    type: String
  },
  address_zip_check: {
    type: String
  },
  brand: {
    type: String
  },
  country: {
    type: String
  },
  cvc: {
    type: Number
  },
  cvc_check: {
    type: String
  },
  dynamic_last4: {
    type: Number
  },
  exp_month: {
    type: Number,
    required: true
  },
  exp_year: {
    type: Number,
    required: true
  },
  fingerprint: {
    type: String
  },
  funding: {
    type: String
  },
  last4: {
    type: String
  },
  metadata: {
    type: String
  },
  userId: {
    type: Number
  },
  companyId: {
    type: Number
  },
  isDefault: {
    type: Boolean
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Card', CardSchema);

