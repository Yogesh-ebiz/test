const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const AdSchema = new mongoose.Schema({
  status: {
    type: String
  },
  productId: {
    type: String
  },
  lifetimeBudget: {
    type: Number,
    required: false
  },
  startTime: {
    type: Number
  },
  endTime: {
    type: Number
  },
  campaignId: {
    type: String,
    required: false
  },
  bidAmount: {
    type: Number,
    required: false
  },
  billingEvent: {
    type: String,
    required: false
  },
  optimizationGoal: {
    type: String,
    required: false
  },
  targeting: { type: Schema.Types.ObjectId, ref: 'Target' }
}, {
  versionKey: false
});


module.exports = mongoose.model('Ad', AdSchema);

//   'campaign_id' : '<adCampaignLinkClicksID>',
//   'bid_amount' : '500',
//   'billing_event' : 'IMPRESSIONS',
//   'optimization_goal' : 'POST_ENGAGEMENT',
//   'targeting' : {'age_min':20,'age_max':24,'behaviors':[{'id':6002714895372,'name':'All travelers'}],'genders':[1],'geo_locations':{'countries':['US'],'regions':[{'key':'4081'}],'cities':[{'key':'777934','radius':10,'distance_unit':'mile'}]},'interests':[{'id':'<adsInterestID>','name':'<adsInterestName>'}],'life_events':[{'id':6002714398172,'name':'Newlywed (1 year)'}],'facebook_positions':['feed'],'publisher_platforms':['facebook','audience_network']},
//   'status' : 'PAUSED',
// }
