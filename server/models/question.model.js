const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const QuestionSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  sequence: {
    type: Number,
    required: true
  },
  visibilityType: {
    type: Number,
    required: true
  },
  allowMembers: {
    type: Array,
    required: false
  },
  required: {
    type: Boolean,
    required: true
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


