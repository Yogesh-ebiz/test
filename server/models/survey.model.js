const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const SurveySchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
}, {
  versionKey: false
});
SurveySchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Survey', SurveySchema);


