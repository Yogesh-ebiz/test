const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CountrySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  iso3: {
    type: String,
    required: false
  },
  iso2: {
    type: String,
    required: false
  },
  phonecode: {
    type: Number,
    default: Date.now
  },
  capital: {
    type: String,
    required: false
  },
  currency: {
    type: String,
    required: true
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


module.exports = mongoose.model('Country', CountrySchema);

