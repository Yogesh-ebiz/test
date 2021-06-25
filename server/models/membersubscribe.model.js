const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
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
  member: {
    type: Object,
    required: true
  },
  subjectType: {
    type: String,
    required: true
  },
  subject: {
    type: Object,
    required: true
  },
  subject: {
    type: Object
  }
}, {
  versionKey: false
});

MemberSubscribeSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('MemberSubscribe', MemberSubscribeSchema);


