const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
const mongoosePaginate = require('mongoose-paginate-v2');


const SalaryReactionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  salaryHistoryId: {
    type: Number,
    required: true
  },
  userId: {
    type: Object,
    required: true
  },
  reactionType: {
    type: String,
    required: true
  },
  createdDate: {
    type: Number,
    default: Date.now
  }
}, {
  versionKey: false
});

SalaryReactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('SalaryReaction', SalaryReactionSchema);

