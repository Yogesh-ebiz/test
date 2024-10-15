const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const UserQuestionSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  companyId: {
    type: Number,
    required: false
  },
  userId: {
    type: Number
  },
  feature: {
    type: Boolean
  },
  sequence: {
    type: Number
  },
  target: {
    type: Object
  },
  text: {
    type: String
  },
  type: {
    type: String,
    default: 'MULTILINE'
  },
  noMaxSelection: {
    type: Number
  },
  options: {
    type: Array
  },
  topAnswer: { type: Schema.Types.ObjectId, ref: 'UserAnswer' },
  answers: [{ type: Schema.Types.ObjectId, ref: 'UserAnswer' }]
}, {
  versionKey: false
});

UserQuestionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('UserQuestion', UserQuestionSchema);


