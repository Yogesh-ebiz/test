const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const CompanyDepartmentSchema = new mongoose.Schema({
  name: {
    type: String
  },
  background: {
    type: String
  },
  noOfJobs: {
    type: Number,
    required: false
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  updatedBy: {
    type: Number,
    required: false
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
}, {
  versionKey: false
});

CompanyDepartmentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CompanyDepartment', CompanyDepartmentSchema);


