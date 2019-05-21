const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const PlanSchema = new mongoose.Schema({
  createdBy: {
    type: Number
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
}, {
  versionKey: false
});

PlanSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Plan', PlanSchema);

