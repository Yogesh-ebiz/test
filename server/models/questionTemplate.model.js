const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const QuestionTemplateSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  company: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  createdDate: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Object
  },
  updatedDate: {
    type: Number,
    required: false
  },
  updatedBy: {
    type: Object
  },
}, {
  versionKey: false
});


module.exports = mongoose.model('QuestionTemplate', QuestionTemplateSchema);

