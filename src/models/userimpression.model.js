const mongoose = require('mongoose');
// let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');
const subjectTypeEnum = require('../const/subjectType');

const UserImpressionSchema = new mongoose.Schema({
  impressionId: {
    type: Number,
    required: false
  },
  partyId: {
    type: Number,
    required: true
  },
  company: {
    type: Object,
    required: true
  },
  viewCount: {
    type: Number,
    default: 1
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  token: {
    type: String
  },
  subject: { type: Schema.Types.ObjectId, required: false },
  subjectType: { 
    type: String,
    required: true,
    enum: [subjectTypeEnum.COMPANY, subjectTypeEnum.JOB],
  },
  source: {
    type: String,
  },
  type: {
    type: String,
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false }
}, {
  versionKey: false
});


UserImpressionSchema.plugin(autoIncrement, {
  model: 'UserImpression',
  field: 'impressionId',
  startAt: 100000,
  incrementBy: 1
});
UserImpressionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('UserImpression', UserImpressionSchema);
