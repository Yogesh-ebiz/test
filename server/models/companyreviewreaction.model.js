const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
const mongoosePaginate = require('mongoose-paginate-v2');


const CompanyReviewReaction = new mongoose.Schema({
  companyReviewReactionId: {
    type: Number,
    required: false
  },
  companyReviewId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: true
  },
  reactionType: {
    type: String,
    required: true
  },
  createdDate: {
    type: Number,
    default: Date.now()
  }
}, {
  versionKey: false
});

CompanyReviewReaction.plugin(autoIncrement, {
  model: 'CompanyReviewReaction',
  field: 'companyReviewReactionId',
  startAt: 100000,
  incrementBy: 1
});
CompanyReviewReaction.plugin(mongoosePaginate);

module.exports = mongoose.model('CompanyReviewReaction', CompanyReviewReaction);

