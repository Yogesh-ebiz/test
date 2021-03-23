const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  createdBy: {
    type: Number,
    required:false
  },
  status: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required:false
  },
  lastName: {
    type: String,
    required:false
  },
  middleName: {
    type: String,
      required:false
  },
  createdDate: {
    type: Number,
      required:false
  },
  imageUrl: {
    type: String,
    required:false
  },
  preferredCurrency: {
    type: String,
    required:false
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  roles: [{
    type: String,
  }]
}, {
  versionKey: false
});


module.exports = mongoose.model('User', UserSchema);
