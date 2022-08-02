const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');

const CandidateSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: false
  },
  company: {
    type: Number,
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
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
  email: {
    type: String,
    required:false
  },
  phoneNumber: {
    type: String,
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
    required:false
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
  teamRating: {
    type: Number,
    required:false,
    default: 0
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
  skills: {
    type: Array,
    required:false
  },
  languages: {
    type: Array
  },
  publications: {
    type: Array
  },
  certifications: {
    type: Array
  },
  preferences: {
    type: Object,
    default: {
      openToRelocate: true,
      openToRemote: true,
      openToJob: true,
      jobTitles: [],
      jobLocations: [],
      jobTypes: [],
      startDate: "IMMEDIATE"
    }
  },
  experiences: [{ type: Schema.Types.ObjectId, ref: 'Experience' }],
  educations: [{ type: Schema.Types.ObjectId, ref: 'Education' }],
  resumes: [{ type: Schema.Types.ObjectId, ref: 'File' }],
  flag: { type: Schema.Types.ObjectId, ref: 'Flag' },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  sources: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
  evaluations: [{ type: Schema.Types.ObjectId, ref: 'Evaluation' }]
}, {
  versionKey: false
});

/**
 * Methods
 */
CandidateSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'email', 'picture', 'role', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  }
});


CandidateSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Candidate', CandidateSchema);
