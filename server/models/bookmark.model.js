const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');

const BookmarkSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  partyId: {
    type: Number,
    required: true
  },
  jobId: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
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
  }
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
