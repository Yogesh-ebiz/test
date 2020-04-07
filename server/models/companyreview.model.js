const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
const mongoosePaginate = require('mongoose-paginate-v2');


const CompanyReviewSchema = new mongoose.Schema({
  companyReviewId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: false
  },
  company: {
    type: Object,
    required: true
  },
  rating: {
    type: Number,
    required: false
  },
  hasLiked: {
    type: Boolean,
    default: false
  },
  recommendCompany: {
    type: Boolean,
    required: true,
    default: false
  },
  approveCEO: {
    type: Boolean,
    required: true,
    default: false
  },
  isCurrentEmployee: {
    type: Boolean,
    required: false
  },
  reviewTitle: {
    type: String,
    required: false
  },
  pros: {
    type: Array,
    required: false
  },
  cons: {
    type: Array,
    required: false
  },
  advices: {
    type: Array,
    required: false
  },
  createdDate: {
    type: Number,
    default: Date.now()
  },
  lastUpdatedDate: {
    type: Number
  }
}, {
  versionKey: false
});

CompanyReviewSchema.plugin(autoIncrement, {
  model: 'CompanyReview',
  field: 'companyReviewId',
  startAt: 100000,
  incrementBy: 1
});
CompanyReviewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CompanyReview', CompanyReviewSchema);

