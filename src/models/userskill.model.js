const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSkillSchema = new mongoose.Schema({
  createdBy: {
    type: Number,
    required:false
  },
  createdDate: {
    type: Number,
      required:false
  },
  updatedDate: {
    type: Number,
    required:false
  },
  name: {
    type: String
  },
  noOfMonths: {
    type: Number
  },
  rating: {
    type: Number
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('UserSkill', UserSkillSchema);
