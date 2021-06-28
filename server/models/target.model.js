const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TargetSchema = new mongoose.Schema({
  age_min: {
    type: String,
    required: false
  },
  age_max: {
    type: String,
    required: false
  },
  genders: {
    type: String,
  },
  geo_locations: {
    type: Object,
  },
  interests: {
    type: Array,
  },
  life_events: {
    type: Array,
  },
  adPositions: {
    type: Array,
  },
  behaviors: [{ type: Schema.Types.ObjectId, ref: "Behavior" }],
}, {
  versionKey: false
});


module.exports = mongoose.model('Target', TargetSchema);

//{'age_min':20,'age_max':24,
// 'behaviors':[{'id':6002714895372, 'name':'All travelers'}],
// 'genders':[1],
// 'geo_locations':{'countries':['US'],'regions':[{'key':'4081'}],'cities':[{'key':'777934','radius':10,'distance_unit':'mile'}]},
// 'interests':[{'id':'<adsInterestID>','name':'<adsInterestName>'}],
// 'life_events':[{'id':6002714398172,'name':'Newlywed (1 year)'}],
// 'facebook_positions':['feed'],
// 'publisher_platforms':['facebook','audience_network']},


