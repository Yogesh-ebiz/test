const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');
const contactType = require('../const/contactType');
const Application = require("./application.model");
const ApplicationProgress = require("./applicationprogress.model");
const Evaluation = require("./evaluation.model");
const { User } = require("./index");

const { getFromCache, saveToCache, deleteFromCache } = require('../services/cacheService');

const CandidateSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: false
  },
  companyId: {
    type: Number
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member', required: false },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  firstName: {
    type: String,
    required:false
  },
  middleName: {
    type: String,
    required:false
  },
  lastName: {
    type: String,
    required:false
  },
  about: {
    type: String,
    required:false
  },
  url: {
    type: String
  },
  primaryAddress: {
    type: Object,
    required:false
  },
  primaryEmail: {
    type: Object,
    required:false
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
  countryCode: {
    type: String,
    required:false
  },
  phones: {
    type: Array,
    required:false,
    default: []
  },
  primaryPhone: {
    type: Object,
    required:false
  },
  avatar: {
    type: String,
    required:false
  },
  _avatar: {
    type: String,
    required:false
  },
  jobTitle: {
    type: String,
    required:false
  },
  dob: {
    type: String
  },
  gender: {
    type: String
  },
  maritalStatus: {
    type: String
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
  match: {
    type: Number,
    required:false,
    default: 0
  },
  rating: {
    type: Number,
    required:false,
    default: 0
  },
  noOfMonthExperiences: {
    type: Number,
    required:false,
    default: 0
  },
  level: {
    type: String,
    required:false,
    default: ''
  },
  past: {
    type: Object
  },
  current: {
    type: Object
  },
  isCandidate: {
    type: Boolean
  },
  hasImported: {
    type: Boolean,
    default: false
  },
  hasApplied: {
    type: Boolean,
    default: false
  },
  hasFollowedCompany: {
    type: Boolean,
    default: false
  },
  hasSaved: {
    type: Boolean,
    default: false
  },
  openToJob: {
    type: Boolean,
    default: false
  },
  openToRelocation: {
    type: Boolean,
    default: false
  },
  links: {
    type: Array,
    required:false
  },
  languages: {
    type: Array,
    default: []
  },
  publications: {
    type: Array,
    default: []
  },
  certifications: {
    type: Array,
    default: []
  },
  preferences: {
    type: Object
  },
  conversationId: {
    type: String
  },
  messengerId: {
    type: String
  },
  isNew: {
    type: Boolean
  },
  pools: [{ type: Schema.Types.ObjectId, ref: 'Pool' }],
  references: [{ type: Schema.Types.ObjectId, ref: 'Reference' }],
  // skills: [{ type: Schema.Types.ObjectId, ref: 'UserSkill' }],
  skills: [{ type: Schema.Types.ObjectId, ref: 'PartySkill' }],
  experiences: [{ type: Schema.Types.ObjectId, ref: 'Experience' }],
  educations: [{ type: Schema.Types.ObjectId, ref: 'Education' }],
  resume: { type: Schema.Types.ObjectId, ref: 'File' },
  flag: { type: Schema.Types.ObjectId, ref: 'Flag' },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  sources: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
  evaluations: [{ type: Schema.Types.ObjectId, ref: 'Evaluation' }],
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: false }
}, {
  versionKey: false
});
CandidateSchema.plugin(mongoosePaginate);


/**
 * Methods
 */
CandidateSchema.method({
  async create(user) {
    const date = new Date();
    let candidate = new Candidate({ createdDate: date });

    if (user) {
      candidate.user = user._id;
      candidate.userId = user.userId;
      candidate.firstName = user.firstName;
      candidate.middleName = user.middleName;
      candidate.lastName = user.lastName;
      candidate.jobTitle = user.jobTitle;

      candidate.primaryAddress = user.primaryAddress;
      candidate.city = user.city;
      candidate.state = user.state;
      candidate.country = user.country;


      if(user.phoneNumber){
        candidate.phoneNumber = user.phoneNumber;
        candidate.countryCode = user.countryCode;
        candidate.phones.push({isPrimary: true, value: user.phoneNumber, type: contactType.MOBILE});
      }

      if(user.email){
        candidate.email = user.email
        candidate.emails.push({isPrimary: true, value: user.email, type: contactType.PERSONAL});
      }

    }

    candidate = await candidate.save();
    return candidate;
  },
  transform() {
    const transformed = {};
    const fields = _.keys(CandidateSchema.paths);
    fields.forEach((field) => {
      transformed[field] = this[field];

    });

    if(this.user){
      if(this.user?.skills){
        const userSkills = _.reduce(this.user.skills, function(res, ps){
          if(ps.skill && typeof ps.skill==='object'){
            res.push(ps.skill);
          }
          return res;
        }, []);
        transformed.skills = this.skills.concat(userSkills);
      }

      if(!this.preferences){
        transformed.preferences = this.user?.preferences;
      }

      delete transformed.user;
    }

    if(this.avatar && this.avatar.indexOf('http')<0) {
      transformed.avatar = `${process.env.ACCESSED_CDN}/candidates/${this._id}/images/${this.avatar}`
    } else {
      transformed.avatar = this.avatar;
    }

    transformed.maritalStatus = this.maritalStatus || '';

    transformed.user = this.user?._id;
    transformed.pools = this.pools;
    return transformed;
  }
});

CandidateSchema.post('remove', async function (next) {
  Application.remove({user: this._id}).exec();
  Evaluation.remove({candidate: this._id}).exec();
  next();
});

CandidateSchema.post('findByIdAndUpdate', async function (candidate) {
  if (candidate) {
    let cacheKey = `candidate:${candidate._id}`;
    await deleteFromCache(cacheKey);
  }
});

CandidateSchema.post('save', async function (candidate) {
  if (candidate) {
    let cacheKey = `candidate:${candidate._id}`;
    await deleteFromCache(cacheKey);
  }
});

CandidateSchema.post('findByIdAndDelete', async function (candidate) {
  if (candidate) {
    let cacheKey = `candidate:${candidate._id}`;
    await deleteFromCache(cacheKey);
  }
});



module.exports = mongoose.model('Candidate', CandidateSchema);
