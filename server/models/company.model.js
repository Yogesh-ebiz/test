const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  groupName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: false
  },
  logoImageUrl: {
    type: String,
    required: false
  },
  location: {
    type: Object,
    required: true
  },


}, {
  versionKey: false
});


module.exports = mongoose.model('Company', CompanySchema);


