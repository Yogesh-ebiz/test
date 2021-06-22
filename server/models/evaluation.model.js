const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const EvaluationSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  applicationId: {
    type: Object,
    required: true
  },
  applicationProgressId: {
    type: Object,
    required: true
  },
  candidateId: {
    type: Object,
    required: true
  },
  partyId: {
    type: Number,
    required: true
  },
  companyId: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member'},
  assessment: { type: Schema.Types.ObjectId, ref: 'Assessment'},
  evaluationForm: [{ type: Schema.Types.ObjectId, ref: 'Answer'}]
}, {
  versionKey: false
});

EvaluationSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Evaluation', EvaluationSchema);


