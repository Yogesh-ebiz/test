const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');


const PoolSchema = new mongoose.Schema({
  createdBy: {
    type: Number,
    required:false
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  company: {
    type: Number,
    required:true
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  name: {
    type: String,
    required: true
  },
  candidates: [{ type: Schema.Types.ObjectId, ref: 'Candidate' }],
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  description: {
    type: String,
    required: false
  },
  isIn: {
    type: Boolean,
    default: false
  }
}, {
  versionKey: false
});
PoolSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Pool', PoolSchema);
