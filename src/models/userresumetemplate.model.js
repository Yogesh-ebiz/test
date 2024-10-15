const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');
const _ = require("lodash");

const UserResumeTemplateSchema = new mongoose.Schema({
  modules: {
    type: Array,
    default: []
  },
  name: {
    type: String
  },
  image: {
    type: String
  },
  template: { type: Schema.Types.ObjectId, ref: 'ResumeTemplate' },
  config: {
    type: Object,
    default: {
      lineSpacing: 1,
      fontSize: 14,
      sectionHeader: 18,
      sidebar: {},
      header: {}
    }
  },
},
{
  timestamps: true,
  versionKey: false
});



module.exports = mongoose.model('UserResumeTemplate', UserResumeTemplateSchema);
