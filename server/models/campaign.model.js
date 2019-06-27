const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CampaignSchema = new mongoose.Schema({
  ads: [{ type: Schema.Types.ObjectId, ref: 'Ad' }],
}, {
  versionKey: false
});


module.exports = mongoose.model('Campaign', CampaignSchema);

