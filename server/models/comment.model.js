const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');


const CommentSchema = new mongoose.Schema({
  applicationId: {
    type: Object,
    required: true
  },
  candidate: {
    type: Object,
    required: true
  },
  createdBy: {
    type: Object,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  }

}, {
  versionKey: false
});
CommentSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Comment', CommentSchema);

