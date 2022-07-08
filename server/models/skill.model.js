const mongoose = require('mongoose');
const { autoIncrement } = require('mongoose-plugin-autoinc');


const SkillSchema = new mongoose.Schema({
  skillId: {
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
    type: Object,
    required: false,
    default: 1
  },
  type: {
    type: Object,
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


SkillSchema.plugin(autoIncrement, {
  model: 'Skill',
  field: 'skillId',
  startAt: 100000,
  incrementBy: 1
});

module.exports = mongoose.model('Skill', SkillSchema);
