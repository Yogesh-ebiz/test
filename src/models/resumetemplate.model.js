const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const ResumeTemplateSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
  },
  updatedAt: {
    type: Number,
    default: Date.now
  },
  updatedBy: {
    type: Number
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  modules: {
    type: Array,
    default: [
      {id: 'employment_history', show: true},
      {id: 'education', show: true},
      {id: 'skills', show: true},
      {id: 'languages', show: true},
      {id: 'courses', show: true},
      {id: 'website_links', show: true},
      {id: 'hobbies', show: true},
      {id: 'references', show: false},
      {id: 'extra_curricular_activities', show: false}
    ]
  },
  content: {
    type: String,
    required: true
  },
  defaultConfig: {
    type: Object,
    default: {
      lineSpacing: 1,
      fontSize: 14,
      sectionHeader: 18,
      sidebar: {},
      header: {}
    }
  },
  styles: {
    type: Object
  },
  // modules: [{ type: Schema.Types.ObjectId, ref: 'ResumeModule' }],
  // personalDetails: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
  // professionalSummary: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
  // employment: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
  // education: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
  // websitesLinks: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
  // skills: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
  // languages: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
  // references: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
  // courses: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
  // hobbies: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
  // extraCurricularActivities: { type: Schema.Types.ObjectId, ref: 'ResumeModule' },
}, {
  versionKey: false
});


ResumeTemplateSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('ResumeTemplate', ResumeTemplateSchema);


