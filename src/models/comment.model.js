const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');


const CommentSchema = new mongoose.Schema({
  subjectType: {
    type: String,
    required: true
  },
  subject: {
    type: Object
  },
  createdBy: {
    type: Object,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  },
  reactions: [{ type: Schema.Types.ObjectId, ref: 'Reaction' }]

}, {
  versionKey: false
});
CommentSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Comment', CommentSchema);

