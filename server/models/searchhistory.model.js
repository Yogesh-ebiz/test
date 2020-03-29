const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');


const SearchHistorySchema = new mongoose.Schema({
  partyId: {
    type: Number,
    required: false
  },
  keyword: {
    type: String,
    required: false
  },
  count: {
    type: Number,
    default: 1
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  }
}, {
  versionKey: false
});

SearchHistorySchema.plugin(autoIncrement, {
  model: 'SearchHistory',
  field: 'searchHistoryId',
  startAt: 100000,
  incrementBy: 1
});
SearchHistorySchema.plugin(mongoosePaginate);


module.exports = mongoose.model('SearchHistory', SearchHistorySchema);

