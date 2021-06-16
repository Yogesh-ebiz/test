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
  jobId: {
    type: Object,
    required: true
  },
  user: {
    type: Object
  },
  userId: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  createdBy: {
    type: Number
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
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  labels: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  stages: [{ type: Schema.Types.ObjectId, ref: 'EmailCampaignStage' }],
  currentStage: { type: Schema.Types.ObjectId, ref: 'EmailCampaignStage' }
}, {
  versionKey: false
});

EmailCampaignSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('EmailCampaign', EmailCampaignSchema);

