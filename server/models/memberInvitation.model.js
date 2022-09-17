const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const MemberInvitationSchema = new mongoose.Schema({
  createdBy: {
    type: Number,
    required:false
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  email: {
    type: String,
    required:true
  },
  hasSent: {
    type: Boolean,
    default: false
  },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  role: { type: Schema.Types.ObjectId, ref: 'Role' }
}, {
  versionKey: false
});


module.exports = mongoose.model('MemberInvitation', MemberInvitationSchema);
