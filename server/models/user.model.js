const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  partyId: {
    type: Number,
    required: true
  },
  employments: {
    type: Array,
    required: false,
    default: []
  },
  educations: {
    type: Array,
    required: false,
    default: []
  },
  hashedPassword: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  roles: [{
    type: String,
  }]
}, {
  versionKey: false
});


module.exports = mongoose.model('User', UserSchema);
