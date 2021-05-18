const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const EvaluationSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Object,
    required: true
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
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  assessment: { type: Schema.Types.ObjectId, ref: 'Assessment'},
  answers: [{ type: Schema.Types.ObjectId, ref: 'Answer'}]
}, {
  versionKey: false
});

EvaluationSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Evaluation', EvaluationSchema);


