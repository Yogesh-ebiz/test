const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const LabelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  default: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
}, {
  versionKey: false
});

LabelSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Label', LabelSchema);


