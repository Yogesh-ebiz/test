const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const CategorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String
  },
  locale: {
    type: Object,
    required: true
  },
  shortCode: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  icon: {
    type: String,
    required: false,
    default: ""
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  sequence: {
    type: Number,
    default: 0
  },
  categoryId: {
    type: Number
  }
}, {
  versionKey: false
});


CategorySchema.plugin(autoIncrement, {
  model: 'Category',
  field: 'categoryId',
  startAt: 100000,
  incrementBy: 1
});
CategorySchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Category', CategorySchema);


