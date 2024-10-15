const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const UserPublicationSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: false
  },
  author: {
    type: String,
    required: false
  },
  publisher: {
    type: String,
    required: false
  },
  publishedDate: {
    type: Number,
    required: false
  },
  url: {
    type: String,
    required: false,
    default: ''
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  isbn: {
    type: String,
    required: false,
    default: ''
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    default: Date.now
  }

}, {
  versionKey: false
});

UserPublicationSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('UserPublication', UserPublicationSchema);
