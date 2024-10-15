const mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum');

const BookmarkSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  partyId: {
    type: Object,
    required: true
  },
  company: {
    type: Object,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    default: "ACTIVE"
  },
  notification: {
    type: String,
    required: false,
    default: statusEnum.NONE
  },
  token: {
    type: String
  },
  job: { type: Schema.Types.ObjectId, ref: 'JobRequisition', required: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false }
}, {
  versionKey: false
});


BookmarkSchema.plugin(autoIncrement, {
  model: 'Bookmark',
  field: 'bookmarkId',
  startAt: 100000,
  incrementBy: 1
});
BookmarkSchema.plugin(mongoosePaginate);



module.exports = mongoose.model('Bookmark', BookmarkSchema);
