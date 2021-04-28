const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

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
  questions: {
    type: Array,
    required: true
  },
  company: {
    type: Number,
    required: true
  }
}, {
  versionKey: false
});
QuestionTemplateSchema.plugin(autoIncrement, {
  model: 'QuestionTemplate',
  field: 'questionTemplateId',
  startAt: 100000,
  incrementBy: 1
});
QuestionTemplateSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('QuestionTemplate', QuestionTemplateSchema);


