const mongoose = require('mongoose');
const { autoIncrement } = require('mongoose-plugin-autoinc');


const SkillTypeSchema = new mongoose.Schema({
  skillTypeId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: false
  },
  locale: {
    type: Object,
    required: true
  },
  parent: {
    type: Number,
    required: false,
    default: 1
  },
  description: {
    type: String,
    required: false
  },
  sequence: {
    type: Number,
    required: false,
    default: 0
  },
  createdDate: {
    type: Number,
    required: false
  }

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
