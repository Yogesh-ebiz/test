const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
const mongoosePaginate = require('mongoose-paginate-v2');


const CompanyReviewHistorySchema = new mongoose.Schema({
  companyReviewHistoryId: {
    type: Number,
    required: true
  },
  company: {
    type: Object,
    required: false
  },
  noOf5Stars: {
    type: Number,
    required: true,
    default: 0
  },
  noOf4Stars: {
    type: Number,
    required: false,
    default: 0
  },
  noOf3Stars: {
    type: Number,
    required: false,
    default: 0
  },
  noOf2Stars: {
    type: Number,
    required: false,
    default: 0
  },
  noOf1Stars: {
    type: Number,
    required: false,
    default: 0
  },
  recommendCompany: {
    type: Number,
    required: false
  },
  approveCEO: {
    type: Number,
    required: false
  },
  avgRating: {
    type: Number,
    required: false
  },
  totalReviews: {
    type: Number,
    required: false,
    default: 0
  },
  mostPopularReviews: {
    type: Array,
    required: false,
    default: []
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

CompanyReviewHistorySchema.plugin(autoIncrement, {
  model: 'CompanyReviewHistory',
  field: 'companyReviewHistoryId',
  startAt: 100000,
  incrementBy: 1
});
CompanyReviewHistorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CompanyReviewHistory', CompanyReviewHistorySchema);

