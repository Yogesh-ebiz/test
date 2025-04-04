const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const statusEnum = require('../const/statusEnum');


const NoteSchema = new mongoose.Schema({
  subjectType: {
    type: String,
    required: true
  },
  subject: {
    type: Object
  },
  message: {
    type: String,
    required: true
  },
  createdDate: {
    type: Number,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Number,
    required: false
  },
  viewers: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
}, {
  versionKey: false
});
NoteSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Note', NoteSchema);

