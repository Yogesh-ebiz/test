const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const StateSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  country_id: {
    type: Number,
    required: false
  },
  country_code: {
    type: String,
    required: false
  },
  fips_code: {
    type: String
  },
  iso2: {
    type: String,
    required: false
  },
  created_at: {
    type: String,
    required: true
  },
  updated_at: {
    type: String,
    required: true
  },
  flag: {
    type: String,
    required: false
  },
  wikiDataId: {
    type: String,
    required: false
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('State', StateSchema);

