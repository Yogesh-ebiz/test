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
  internalCode: {
    type: String,
    required: false
  },
  internalCode: {
    type: String,
    required: false
  },
  internalCode: {
    type: String,
    required: false
  },
  internalCode: {
    type: String,
    required: false
  },
  internalCode: {
    type: String,
    required: false
  },
  internalCode: {
    type: String,
    required: false
  },
  internalCode: {
    type: String,
    required: false
  },
  internalCode: {
    type: String,
    required: false
  },
  internalCode: {
    type: String,
    required: false
  },
  ads: [{ type: Schema.Types.ObjectId, ref: 'Ad' }],
}, {
  versionKey: false
});


module.exports = mongoose.model('Ad', AdSchema);


//
// {
//   'name' : 'My First AdSet',
//   'lifetime_budget' : '20000',
//   'start_time' : '2021-04-25T09:42:08-0700',
//   'end_time' : '2021-05-02T09:42:08-0700',
//   'campaign_id' : '<adCampaignLinkClicksID>',
//   'bid_amount' : '500',
//   'billing_event' : 'IMPRESSIONS',
//   'optimization_goal' : 'POST_ENGAGEMENT',
//   'targeting' : {'age_min':20,'age_max':24,'behaviors':[{'id':6002714895372,'name':'All travelers'}],'genders':[1],'geo_locations':{'countries':['US'],'regions':[{'key':'4081'}],'cities':[{'key':'777934','radius':10,'distance_unit':'mile'}]},'interests':[{'id':'<adsInterestID>','name':'<adsInterestName>'}],'life_events':[{'id':6002714398172,'name':'Newlywed (1 year)'}],'facebook_positions':['feed'],'publisher_platforms':['facebook','audience_network']},
//   'status' : 'PAUSED',
// }
