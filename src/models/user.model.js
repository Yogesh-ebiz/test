const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const statusEnum = require('../const/statusEnum');
const _ = require("lodash");
const { User } = require("./index");
const { getFromCache, saveToCache, deleteFromCache } = require('../services/cacheService');

const UserSchema = new mongoose.Schema({
  userId: {
    type: Number
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    default: Date.now
  },
  lastApplied: {
    type: Date,
    required:false
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  firstName: {
    type: String,
    required:true
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
    required:true
  },
  email: {
    type: String,
    required:false
  },
  emails: {
    type: Array,
    required:false,
    default: []
  },
  phoneNumber: {
    type: String,
    required:false
  },
  rating: {
    type: Number,
    required:false,
    default: 0
  },
  phones: {
    type: Array,
    required:false,
    default: []
  },
  jobTitle: {
    type: String,
    required:false
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  countryCode: {
    type: String,
    default: ''
  },
  latlong: {
    type: Array
  },
  timezone: {
    type: String,
    default: ''
  },
  emails: {
    type: Array,
    required:false,
    default: []
  },
  mobilePhone: {
    type: String,
  },
  phones: {
    type: Array,
    required:false,
    default: []
  },
  highlySkills: {
    type: Array,
    default: []
  },
  preferences: {
    type: Object,
    default: {
      openToRelocate: false,
      openToRemote: false,
      openToJob: false,
      jobTitles: [],
      jobLocations: [],
      jobTypes: [],
      startDate: ""
    }
  },
  experiences: [{ type: Schema.Types.ObjectId, ref: 'Experience' }],
  educations: [{ type: Schema.Types.ObjectId, ref: 'Education' }],
  skills: [{ type: Schema.Types.ObjectId, ref: 'PartySkill' }],
  resumes: [{ type: Schema.Types.ObjectId, ref: 'File' }],
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' }
},
{
  timestamps: true,
  versionKey: false
});
UserSchema.plugin(mongoosePaginate);



/**
 * Methods
 */
UserSchema.method({
  async create(party) {
    const date = new Date();
    let user = new User({ createdDate: date });

    if (party) {
      user.userId = party.id;
      user.firstName = party.firstName;
      user.middleName = party.middleName;
      user.lastName = party.lastName;
      user.city = party.city;
      user.state = party.state;
      user.country = party.country;
      user.jobTitle = party.jobTitle;

      if(party.primaryAddress){
        user.primaryAddress = party.primaryAddress;
        user.city = party.city;
        user.state = party.state;
        user.country = party.country;
      }

      if(party.primaryPhone && party.primaryPhone?.value){
        user.phoneNumber = party.primaryPhone.value;
        user.phoneNumbers.push(party.primaryPhone.value);
      }

      if(party.primaryEmail && party.primaryEmail?.value){
        user.email = party.primaryEmail.value;
        user.emails.push(party.primaryEmail.value);
      }

    }

    user = await user.save();
    return user;
  },
  basic() {
    const transformed = {};
    const fields = ['_id', 'userId', 'avatar', 'firstName', 'lastName', 'status', 'headline', 'jobTitle'];
    fields.forEach((field) => {
      transformed[field] = this[field];

    });
    return transformed;
  },
  systemUser() {
    const transformed = {};
    const fields = ['_id', 'userId', 'avatar', 'firstName', 'lastName', 'status', 'headline', 'jobTitle'];
    transformed.id = this.userId;
    transformed.firstName = this.firstName;
    transformed.lastName = this.lastName;
    transformed.avatar = this.avatar || '';

    return transformed;
  },
  transform() {
    const transformed = {};
    const fields = _.keys(UserSchema.paths);
    fields.forEach((field) => {
      transformed[field] = this[field];

    });


    return transformed;
  },
  minimal() {
    const transformed = {};
    const fields = ['_id', 'userId', 'highly_skills', 'firstName', 'lastName', 'status', 'headline', 'jobTitle'];
    fields.forEach((field) => {
      transformed[field] = this[field];

    });


    return transformed;
  }
});

UserSchema.post('findByIdAndUpdate', async function (user) {
  if (user) {
    let cacheKey = `user:${user.userId}`;
    await deleteFromCache(cacheKey);
  }
});

UserSchema.post('save', async function (user) {
  if (user) {
    let cacheKey = `user:${user.userId}`;
    await deleteFromCache(cacheKey);
  }
});

UserSchema.post('findByIdAndDelete', async function (user) {
  if (user) {
    let cacheKey = `user:${user.userId}`;
    await deleteFromCache(cacheKey);
  }
});

module.exports = mongoose.model('User', UserSchema);
// module.exports = mongoose.models['User'] || mongoose.model('User', SectionSchema);
