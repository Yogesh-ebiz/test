const mongoose = require('mongoose');
const { autoIncrement } = require('mongoose-plugin-autoinc');


const SkillSchema = new mongoose.Schema({
  skillId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
  },
  locale: {
    type: Object,
    required: true
  },
  parent: {
    type: Object,
    required: false,
  },
  type: {
    type: Object,
    required: false,
  },
  description: {
    type: String,
  },
  sequence: {
    type: Number,
    required: false,
  },
  createdDate: {
    type: Number,
    required: false
  },
  relevant_job_titles: {
    type: Array
  },
  default: {
    type: Boolean
  }

}, {
  timestamps: true,
  versionKey: false
});


// SkillSchema.plugin(autoIncrement, {
//   model: 'Skill',
//   field: 'skillId',
//   startAt: 100000,
//   incrementBy: 1
// });

module.exports = mongoose.model('Skill', SkillSchema);
