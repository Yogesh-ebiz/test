const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const FlagSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  type: {
    type: String,
    required: true
  },
  companyId: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Meber' },
  candidate: { type: Schema.Types.ObjectId, ref: 'Candidate' },
}, {
  versionKey: false
});

FlagSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Flag', FlagSchema);


