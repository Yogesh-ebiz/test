const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CitySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String
  },
  state_id: {
    type: Number
  },
  state_code: {
    type: String
  },
  country_code: {
    type: String
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  },
  flag: {
    type: String
  },
  wikiDataId: {
    type: String
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('City', CitySchema);

