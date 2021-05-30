const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const QuestionTemplateSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  company: {
    type: Number,
    required: true
  }
}, {
  versionKey: false
});
QuestionTemplateSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('QuestionTemplate', QuestionTemplateSchema);


