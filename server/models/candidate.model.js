const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  createdDate: {
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
  middleName: {
    type: String,
    required:false
  },
  lastName: {
    type: String,
    required:false
  },
  email: {
    type: String,
    required:false
  },
  middleName: {
    type: String,
    required:false
  },
  tags: { type: Schema.Types.ObjectId, ref: 'Label' }
}, {
  versionKey: false
});


module.exports = mongoose.model('User', UserSchema);
