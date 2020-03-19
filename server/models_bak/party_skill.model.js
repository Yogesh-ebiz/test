const mongoose = require('mongoose');

const PartySKillSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  partyId: {
    type: Number,
    required: true
  },
  skillTypeId: {
    type: Number,
    required: false
  },
  noOfMonths: {
    type: Number,
    required: false
  },
  rating: {
    type: Number,
    required: false
  },
  level: {
    type: String,
    required: false
  },
  noOfEndorsement: {
    type: Number,
    required: false
  },
  endorsements: {
    type: Object,
    required: false
  }

}, {
  versionKey: false
});


module.exports = mongoose.model('PartySkill', PartySKillSchema);
