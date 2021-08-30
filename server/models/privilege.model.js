const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrivilegeSchema = new mongoose.Schema({
  name: {
    type: String
  },
  status: {
    type: String
  },
  description: {
    type: String
  },
  type: {
    type: String
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Privilege', PrivilegeSchema);
