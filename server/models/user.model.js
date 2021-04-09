const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  createdBy: {
    type: Number,
    required:false
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
  lastName: {
    type: String,
    required:false
  },
  middleName: {
    type: String,
      required:false
  },
  companyReviews: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  versionKey: false
});


module.exports = mongoose.model('User', UserSchema);
