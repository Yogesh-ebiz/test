const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const InterestSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  user: {
    type: Object,
    required: true
  },
  company: {
    type: Object,
    required: true
  },
}, {
  versionKey: false
});

InterestSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Interest', InterestSchema);


