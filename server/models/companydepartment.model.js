const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

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
  company: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number
  },
  updatedBy: {
    type: Number,
    required: false
  }
}, {
  versionKey: false
});


CompanyDepartmentSchema.plugin(autoIncrement, {
  model: 'CompanyDepartment',
  field: 'departmentId',
  startAt: 100000,
  incrementBy: 1
});
CompanyDepartmentSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('CompanyDepartment', CompanyDepartmentSchema);


