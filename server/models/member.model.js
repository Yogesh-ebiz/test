const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');


const MemberSchema = new mongoose.Schema({
  createdBy: {
    type: Number,
    required:false
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  company: {
    type: Number,
    required:true
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  firstName: {
    type: String,
    required:true
  },
  lastName: {
    type: String,
    required:true
  },
  middleName: {
    type: String,
    required:false
  },
  imageUrl: {
    type: String,
    required:false
  },
  phone: {
    type: String,
    required:false
  },
  email: {
    type: String,
    required:true
  },
  avatar: {
    type: String,
    required:false
  },
  isMember: {
    type: Boolean,
    default: true
  },
  isOwner: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    required:false
  },
  timezone: {
    type: String,
    required:false,
    default: 'America/Los_Angeles'
  },
  currency: {
    type: String,
    required:false,
    default: 'USD'
  },
  preferTimeFormat: {
    type: String,
    required:false,
    default: '24'
  },
  id: {
    type: Number
  },
  userId: {
    type: Number,
    required:true
  },
  role: { type: Schema.Types.ObjectId, ref: 'Role' },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  notificationPreference: { type: Schema.Types.ObjectId, ref: 'NotificationPreference' },
  followedJobs: [{ type: Schema.Types.ObjectId, ref: 'JobRequisition' }],
  followedCandidates: [{ type: Schema.Types.ObjectId, ref: 'Candidate' }]
}, {
  versionKey: false
});
MemberSchema.plugin(mongoosePaginate);



module.exports = mongoose.model('Member', MemberSchema);
