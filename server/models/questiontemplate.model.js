const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const statusEnum = require('../const/statusEnum');


const QuestionTemplateSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Object,
    required: true
  },
  updatedDate: {
    type: Number,
    required: false
  },
  updatedBy: {
    type: Object
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
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


