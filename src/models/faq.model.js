const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const FaqSchema = new mongoose.Schema({
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
  text: {
    type: String,
    required: true
  },
  default: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array
  },
  noMaxSelection: {
    type: Number
  },
  hint: {
    type: String
  },
  description: {
    type: String
  },
  answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
}, {
  versionKey: false
});

FaqSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Faq', FaqSchema);


