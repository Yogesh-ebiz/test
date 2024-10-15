const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const DegreeSchema = new mongoose.Schema({
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
DegreeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Degree', DegreeSchema);


