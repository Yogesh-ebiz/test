const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const UserLanguageSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: false
  },
  language: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: false
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    default: Date.now
  }

}, {
  versionKey: false
});

UserLanguageSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('UserLanguage', UserLanguageSchema);
