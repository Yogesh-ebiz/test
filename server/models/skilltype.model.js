const mongoose = require('mongoose');
const { autoIncrement } = require('mongoose-plugin-autoinc');


const SkillTypeSchema = new mongoose.Schema({
  skillTypeId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  parent: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  createdDate: {
    type: Number,
    required: false
  },

}, {
  versionKey: false
});


SkillTypeSchema.plugin(autoIncrement, {
  model: 'SkillType',
  field: 'skillTypeId',
  startAt: 100000,
  incrementBy: 1
});

module.exports = mongoose.model('SkillType', SkillTypeSchema);
