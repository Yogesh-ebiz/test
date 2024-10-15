const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const { getFromCache, saveToCache, deleteFromCache } = require('../services/cacheService');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  legalName: {
    type: String,
    required: false
  },
  companyId: {
    type: Number,
    required: true
  },
  tagname: {
    type: String
  },
  partyType: {
    type: String
  },
  type: {
    type: String
  },
  customerId: {
    type: String
  },
  email: {
    type: String,
    default: '',
  },
  countryCode: {
    type: String,
    required:false
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  createdBy: {
    type: Number,
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  updatedBy: {
    type: Object,
  },
  updatedDate: {
    type: Number
  },
  inMailCredit: {
    type: Number,
    default: 0
  },
  credit: {
    type: Number,
    default: 0
  },
  status: {
    type: String
  },
  avatar: {
    type: String
  },
  cover: {
    type: String
  },
  website: {
    type: String
  },
  primaryAddress: {
    type: Object
  },
  role: {
    type: Object
  },
  memberId: {
    type: Object
  },
  members: {
    type: Array,
    default: []
  },
  benefits: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Benefit' }],
    default: []
  },
  images: {
    type: Array,
    default: []
  },
  videos: {
    type: Array,
    default: []
  },
  about: {
    type: String
  },
  mission: {
    type: String
  },
  yearFounded: {
    type: Number
  },
  size: {
    type: String
  },
  peopleSearchCredit: {
    type: Number,
    default: 0
  },
  peopleViewCredit: {
    type: Number,
    default: 0
  },
  noOfJobs: {
    type: Number,
    default: 0
  },
  talentSubscription: {
    type: Object
  },
  subscriptions: {
    type: Array
  },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  industry: [{ type: Schema.Types.ObjectId, ref: 'Industry' }],

}, {
  timestamps: true,
  versionKey: false
});
CompanySchema.plugin(mongoosePaginate);

CompanySchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'companyId', 'name', 'tagname', 'benefits', 'avatar', 'cover', 'partyType', 'type', 'primaryAddress'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
  minimal() {
    const transformed = {};
    const fields = ['_id', 'companyId', 'name', 'avatar', 'cover', 'partyType', 'type', 'primaryAddress'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  }
});

CompanySchema.post('save', async function (company) {
  if (company) {
    let cacheKey = `company:${company.companyId}`;
    await deleteFromCache(cacheKey);
  }
});

CompanySchema.post('findByIdAndUpdate', async function (company) {
  if (company) {
    let cacheKey = `company:${company.companyId}`;
    await deleteFromCache(cacheKey);
  }
});

CompanySchema.post('findByIdAndDelete', async function (company) {
  if (company) {
    let cacheKey = `company:${company.companyId}`;
    await deleteFromCache(cacheKey);
  }
});

module.exports = mongoose.model('Company', CompanySchema);


