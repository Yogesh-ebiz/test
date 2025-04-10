const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
const mongoosePaginate = require('mongoose-paginate-v2');


const CompanyReviewSchema = new mongoose.Schema({
  companyReviewId: {
    type: Number,
    required: true
  },
  // user: {
  //   type: Object,
  //   required: true
  // },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  company: {
    type: Object,
    required: true
  },
  employmentType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: false,
    default: 'ACTIVE'
  },
  shareUrl: {
    type: String,
    required: false,
    default: ''
  },
  rating: {
    type: Number,
    required: false
  },
  overall: {
    type: Number,
    required: false,
    default: 0,
  },
  careerOpportunity: {
    type: Number,
    required: false,
    default: 0,
  },
  compensationAndBenefits: {
    type: Number,
    required: false,
    default: 0,
  },
  culture: {
    type: Number,
    required: false,
    default: 0,
  },
  diversity: {
    type: Number,
    required: false,
    default: 0,
  },
  management: {
    type: Number,
    required: false,
    default: 0,
  },
  workLife: {
    type: Number,
    required: false,
    default: 0,
  },
  hasLiked: {
    type: Boolean,
    required: false,
    default: false
  },
  noOfLikes: {
    type: Number,
    required: false,
    default: 0
  },
  hasLoved: {
    type: Boolean,
    required: false,
    default: false
  },
  likes: [{ type: Schema.Types.ObjectId, ref: 'CompanyReviewReaction' }],
  loves: [{ type: Schema.Types.ObjectId, ref: 'CompanyReviewReaction' }],
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
  noOfMonthsEmployment: {
    type: Number,
    required: false,
  },
  isAnonymous: {
    type: Boolean,
    required: false,
    default: true
  },
  employmentTitle: {
    type: String,
    required: false,
    default: ''
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
  city: {
    type: String,
    required: false,
    default: ''
  },
  state: {
    type: String,
    required: false,
    default: ''
  },
  country: {
    type: String,
    required: false,
    default: ''
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

CompanyReviewSchema.plugin(autoIncrement, {
  model: 'CompanyReview',
  field: 'companyReviewId',
  startAt: 100000,
  incrementBy: 1
});
CompanyReviewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CompanyReview', CompanyReviewSchema);

