const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const QuestionSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  noMaxSelection: {
    type: Number
  },
  hint: {
    type: String
  },
  required: {
    type: Boolean,
    default: true
  },
  options: {
    type: Array
  }
}, {
  versionKey: false
});
QuestionSchema.plugin(autoIncrement, {
  model: 'Question',
  field: 'questionId',
  startAt: 100000,
  incrementBy: 1
});
QuestionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Question', QuestionSchema);


