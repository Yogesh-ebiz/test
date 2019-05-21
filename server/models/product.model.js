const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const ProductSchema = new mongoose.Schema({
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
  },
  listPrice: {
    type: Number,
    required: true
  },
  type: {
    type: String
  },
  category: {
    type: String
  },
  image_url: {
    type: String
  }
}, {
  versionKey: false
});

ProductSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Product', ProductSchema);

