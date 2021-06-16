const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const EmailCampaignStageSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    default: statusEnum.ACTIVE
  },
  type: {
    type: String
  },
  createdDate: {
    type: Number,
    required: false,
    default: Date.now
  },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, {
  versionKey: false
});

EmailCampaignProgressSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('EmailCampaignStage', EmailCampaignStageSchema);

