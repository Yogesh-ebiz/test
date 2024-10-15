const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');


const PoolSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  name: {
    type: String,
    required: true
  },
  noOfCandidates: {
    type: Number
  },
  description: {
    type: String,
    required: false
  },
  isIn: {
    type: Boolean,
    default: false
  },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  candidates: [{ type: Schema.Types.ObjectId, ref: 'Candidate' }],
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
}, {
  versionKey: false
});
PoolSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Pool', PoolSchema);
