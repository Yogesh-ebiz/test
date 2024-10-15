const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const statusEnum = require('../const/statusEnum');


const ProjectSchema = new mongoose.Schema({
  createdDate: {
    type: Number,
    default: Date.now
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  shareType: {
    type: String,
    default: 'NONE',
    enum: ['NONE', 'LINK', 'ORGANIZATION']
  },
  sharePermission: {
    type: String,
    default: 'NONE',
    enum: ['NONE', 'CAN_VIEW', 'CAN_COMMENT', 'CAN_EDIT']
  },
  shareLink: {
    type: "String",
    default: ''
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  people: [{ type: Schema.Types.ObjectId, ref: 'People' }],
  viewers: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
  emails: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
}, {
  versionKey: false
});

ProjectSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Project', ProjectSchema);
