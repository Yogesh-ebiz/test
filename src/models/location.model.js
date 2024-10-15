const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const LocationSchema = new mongoose.Schema({
  name: {
    type: String
  },
  meta: {
    type: Object
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Location', LocationSchema);
