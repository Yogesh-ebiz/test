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
    type: Number,
    required: true
  },
  department: {
    type: String
  },
  text: {
    type: String
  },
  answers: [{ type: Schema.Types.ObjectId, ref: 'UserAnswer' }]
}, {
  versionKey: false
});

UserQuestionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('UserQuestion', UserQuestionSchema);


