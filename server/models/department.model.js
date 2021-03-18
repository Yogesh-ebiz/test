const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String
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


DepartmentSchema.plugin(autoIncrement, {
  model: 'Department',
  field: 'departmentId',
  startAt: 100000,
  incrementBy: 1
});
DepartmentSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Department', DepartmentSchema);


