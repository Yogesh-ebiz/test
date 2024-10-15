const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');


const EmailCampaignSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  userId: {
    type: Number
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  updatedDate: {
    type: Number,
    required: false
  },
  updatedBy: {
    type: Number,
    required: false
  },
  emailAddress: {
    type: String
  },
  email: { type: Schema.Types.ObjectId, ref: 'Email' },
  candidate: { type: Schema.Types.ObjectId, ref: 'Candidate' },
  people: { type: Schema.Types.ObjectId, ref: 'People' },
  job: { type: Schema.Types.ObjectId, ref: 'JobRequisition' },
  application: { type: Schema.Types.ObjectId, ref: 'Application' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  labels: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  stages: [{ type: Schema.Types.ObjectId, ref: 'EmailCampaignStage' }],
  currentStage: { type: Schema.Types.ObjectId, ref: 'EmailCampaignStage' }
}, {
  versionKey: false
});

EmailCampaignSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('EmailCampaign', EmailCampaignSchema);

