const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const statusEnum = require('../const/statusEnum');


const QuestionTemplateSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  updatedDate: {
    type: Number,
    required: false
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
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' }
}, {
  versionKey: false
});
QuestionTemplateSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('QuestionTemplate', QuestionTemplateSchema);


