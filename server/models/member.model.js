const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const MemberSchema = new mongoose.Schema({
  createdBy: {
    type: Number,
    required:false
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  company: {
    type: Number,
    required:true
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  firstName: {
    type: String,
    required:true
  },
  lastName: {
    type: String,
    required:true
  },
  middleName: {
    type: String,
    required:false
  },
  imageUrl: {
    type: String,
    required:false
  },
  phone: {
    type: String,
    required:false
  },
  email: {
    type: String,
    required:true
  },
  language: {
    type: String,
    required:false
  },
  timezone: {
    type: String,
    required:false
  },
  preferTimeFormat: {
    type: String,
    required:false
  },
  userId: {
    type: Number,
    required:true
  },
  role: { type: Schema.Types.ObjectId, ref: 'Role' }
}, {
  versionKey: false
});


module.exports = mongoose.model('Member', MemberSchema);
