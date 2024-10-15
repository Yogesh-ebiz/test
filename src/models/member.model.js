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
  countryCode: {
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
  cover: {
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
  messengerId: {
    type: String
  },
  calendarUserId: {
    type: String,
  },
  calendarId: {
    type: String
  },
  companyId: {
    type: Number
  },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  role: { type: Schema.Types.ObjectId, ref: 'Role' },
  notificationPreference: { type: Schema.Types.ObjectId, ref: 'NotificationPreference' },
  followedJobs: [{ type: Schema.Types.ObjectId, ref: 'JobRequisition' }],
  followedCandidates: [{ type: Schema.Types.ObjectId, ref: 'Candidate' }]
}, {
  timestamps: true,
  versionKey: false
});
MemberSchema.plugin(mongoosePaginate);

MemberSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'status', 'isMember', 'name', 'firstName', 'lastName', 'userId', 'role', 'avatar', 'cover', 'messengerId'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  }
});


module.exports = mongoose.model('Member', MemberSchema);
