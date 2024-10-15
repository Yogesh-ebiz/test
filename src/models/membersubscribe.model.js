const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const MemberSubscribeSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  subjectType: {
    type: String,
    required: true
  },
  subject: {
    type: Object,
    required: true
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  member: { type: Schema.Types.ObjectId, ref: 'Member' }
}, {
  versionKey: false
});

MemberSubscribeSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('MemberSubscribe', MemberSubscribeSchema);


