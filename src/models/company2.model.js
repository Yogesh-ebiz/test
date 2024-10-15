const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  companyId: {
    type: Number,
    required: true
  },
  meta: {
    type: Object
  },
}, {
  timestamps: true,
  versionKey: false
});
CompanySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('XxxCompany', CompanySchema);


