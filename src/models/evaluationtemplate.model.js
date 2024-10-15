const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const EvaluationTemplateSchema = new mongoose.Schema({
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  createdDate: {
    type: Number,
    required: false,
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
  default: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true
  },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  company: {
    type: Object,
    required: true
  }
}, {
  versionKey: false
});
EvaluationTemplateSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('EvaluationTemplate', EvaluationTemplateSchema);


