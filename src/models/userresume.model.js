const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');
const _ = require("lodash");

const UserResumeSchema = new mongoose.Schema({
  userId: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required:true
  },
  template: { type: Schema.Types.ObjectId, ref: 'UserResumeTemplate' },
  resume: {
    type: Object
  },
},
{
  timestamps: true,
  versionKey: false
});



module.exports = mongoose.model('UserResume', UserResumeSchema);
