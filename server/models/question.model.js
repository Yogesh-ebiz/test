const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const QuestionSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number
  },
  type: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: true
  },
  options: {
    type: Array
  },
  noMaxSelection: {
    type: Number
  },
  hint: {
    type: String
  },
  description: {
    type: String
  },

}, {
  versionKey: false
});
QuestionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Question', QuestionSchema);


