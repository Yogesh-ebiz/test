const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const ArticleSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Number
  },
  siteName: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  content: {
    type: String
  },
  image: {
    type: String
  },
  url: {
    type: String
  },
  articleId: {
    type: Number
  },
  partyId: {
    type: Number
  },
  featured: {
    type: Boolean,
    default: false
  },
  noOfViews: {
    type: Number,
    default: 0
  },
}, {
  versionKey: false
});

ArticleSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Article', ArticleSchema);


