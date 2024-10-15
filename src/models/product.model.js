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
    type: Number
  },
  status: {
    type: String
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  price: {
    type: Object
  },
  type: {
    type: String
  },
  category: {
    type: String
  },
  image_url: {
    type: String
  },
  isRecommended: {
    type: Boolean
  },
  hasPurchased: {
    type: Boolean
  },
  recurring: {
    type: Object
  },
  productId: {
    type: String
  }
}, {
  versionKey: false
});

ProductSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Product', ProductSchema);

