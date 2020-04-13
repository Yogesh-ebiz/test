const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  groupName: {
    type: String,
    required: true
  },
  createdBy: {
    type: Number,
    required: false
  },
  createdDate: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  coverImageUrl: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  externalId: {
    type: String,
    required: true
  },
  preferredCurrency: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  hasFollowed: {
    type: Boolean,
    required: true
  },
  primaryAddress: {
    type: Object,
    required: true
  },
  partyType: {
    type: String,
    required: true
  },
  partyLinks: {
    type: Object,
    required: true
  },
  size: {
    type: Object,
    required: true
  },
  officeSiteName: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  },
  yearFounded: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  mission: {
    type: String,
    required: true
  },
  annualRevenue: {
    type: Number,
    required: true
  },
  tickerSymbol: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  hasOwner: {
    type: Boolean,
    required: true
  },
  primaryPhone: {
    type: Object,
    required: true
  },
  primaryEmail: {
    type: Object,
    required: true
  }

}, {
  versionKey: false
});


module.exports = mongoose.model('Company', CompanySchema);


