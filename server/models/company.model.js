const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  companyId: {
    type: Number,
    required: true
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
    type: String
  },
  createdBy: {
    type: Number,
  },
  createdDate: {
    type: Number,
    default: Date.now
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
    type: Array,
    default: []
  },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  talentSubscription: {
    type: Object
  },
  subscriptions: {
    type: Array
  }

}, {
  versionKey: false
});
CompanySchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Company', CompanySchema);


