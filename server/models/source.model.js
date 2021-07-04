const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');


const SourceSchema = new mongoose.Schema({
  status: {
    type: String,
    required: false,
    default: statusEnum.ACTIVE
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    required: false
  },
  userId: {
    type: Number
  },
  hasViewed: {
    type: Boolean
  },
  hasSaved: {
    type: Boolean
  },
  hasApplied: {
    type: Boolean
  },
  job: { type: Schema.Types.ObjectId, ref: 'JobRequisition' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Candidate' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Candidate' },
  candidate: { type: Schema.Types.ObjectId, ref: 'Candidate' },
  campaign: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }]
}, {
  versionKey: false
});

SourceSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Source', SourceSchema);

