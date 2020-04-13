const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  createdBy: {
    type: Number,
    required:false
  },
  status: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required:false
  },
  lastName: {
    type: String,
    required:false
  },
  middleName: {
    type: String,
      required:false
  },
  headline: {
    type: String,
    required:false
  },
  rating: {
    type: Number,
    required:false
  },
  createdDate: {
    type: Number,
      required:false
  },
  imageUrl: {
    type: String,
    required:false
  },
  coverImageUrl: {
    type: String,
    required:false
  },
  preferredCurrency: {
    type: String,
    required:false
  },
  partyType: {
    type: String,
    required:false
  },
  partyTitle: {
    type: String,
    required:false
  },
  companyReviews: { type: Schema.Types.ObjectId, ref: 'CompanyReview' },
  noOfReviews: {
    type: Number,
    required: false,
    default:0
  },
  employments: {
    type: Array,
    required: false,
    default: []
  },
  educations: {
    type: Array,
    required: false,
    default: []
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  roles: [{
    type: String,
  }]
}, {
  versionKey: false
});


module.exports = mongoose.model('User', UserSchema);
