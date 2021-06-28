const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const AdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  lifetime_budget: {
    type: String,
    required: false
  },
  start_time: {
    type: String,
    required: false
  },
  end_time: {
    type: String,
    required: false
  },
  campaign_id: {
    type: String,
    required: false
  },
  bid_amount: {
    type: String,
    required: false
  },
  billing_event: {
    type: String,
    required: false
  },
  optimization_goal: {
    type: String,
    required: false
  },
  targeting: { type: Schema.Types.ObjectId, ref: 'Target' },
  ads: [{ type: Schema.Types.ObjectId, ref: 'Ad' }],
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
