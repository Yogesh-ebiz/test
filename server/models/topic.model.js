const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const TopicSchema = new mongoose.Schema({

  topicId: {
    type: Number,
    required: true
  },
  name: {
    type: Object,
    required: true
  },
  shortCode: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: false,
    default: null
  },
  parent: {
    type: String,
    required: false,
    default: null
  },
  sequence: {
    type: Number,
    required: false,
    default: 0
  },
  status: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  versionKey: false
});

TopicSchema.plugin(autoIncrement, {
  model: 'Topic',
  field: 'topicId',
  startAt: 100000,
  incrementBy: 1
});
TopicSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Topic', TopicSchema);

