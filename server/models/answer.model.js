const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const AnswerSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  answer: {
    type: String,
    required: true
  },
  question: { type: Schema.Types.ObjectId, ref: 'Question'}
}, {
  versionKey: false
});

AnswerSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Answer', AnswerSchema);


