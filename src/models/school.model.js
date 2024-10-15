const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  count: {
    type: Number,
  },
  meta: {
    type: Object
  },
}, {
  timestamps: true,
  versionKey: false
});
SchoolSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('School', SchoolSchema);


