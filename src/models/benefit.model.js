const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const BenefitSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  companyId: {
    type: Number,
    required: false
  },
  type: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  shortCode: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    required: true
  }
}, {
  versionKey: false
});

BenefitSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Benefit', BenefitSchema);


