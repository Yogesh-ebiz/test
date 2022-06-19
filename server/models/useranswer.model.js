const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const UserAnswerSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  text: {
    type: String
  }
}, {
  versionKey: false
});

UserAnswerSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('UserAnswer', UserAnswerSchema);


