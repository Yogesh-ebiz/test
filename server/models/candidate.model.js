const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');

const CandidateSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  company: {
    type: Number,
    required: true
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
  city: {
    type: String,
    required:false
  },
  state: {
    type: String,
    required:false
  },
  country: {
    type: String,
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
  jobTitle: {
    type: String,
    required:false
  },
  match: {
    type: Number,
    required:false
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
  overallRating: {
    type: Number,
    required:false,
    default: 0
  },
  teamRating: {
    type: Number,
    required:false,
    default: 0
  },
  links: {
    type: Array,
    required:false
  },
  skills: {
    type: Array,
    required:false
  },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  sources: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
  applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
  evaluations: [{ type: Schema.Types.ObjectId, ref: 'Evaluation' }]
}, {
  versionKey: false
});
CandidateSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Candidate', CandidateSchema);
