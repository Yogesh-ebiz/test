const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const MemberSubscribeSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    required: true
  },
  subjectType: {
    type: String,
    required: true
  },
  subjectId: {
    type: Object,
    required: true
  }
}, {
  versionKey: false
});

MemberSubscribeSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('MemberSubscribe', MemberSubscribeSchema);


