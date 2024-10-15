const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');


const MemberInvitationSchema = new mongoose.Schema({
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
  note: {
    type: String
  },
  hasSent: {
    type: Boolean,
    default: false
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  role: { type: Schema.Types.ObjectId, ref: 'Role' }
}, {
  versionKey: false
});


module.exports = mongoose.model('MemberInvitation', MemberInvitationSchema);
