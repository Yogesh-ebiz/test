const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const Assessment = require("./assessment.model");

const EvaluationSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  partyId: {
    type: Number
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
  applicationProgress: { type: Schema.Types.ObjectId, ref: 'ApplicationProgress'},
  application: { type: Schema.Types.ObjectId, ref: 'Application'},
  candidate: { type: Schema.Types.ObjectId, ref: 'Candidate'},
  user: { type: Schema.Types.ObjectId, ref: 'User'},
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member'},
  assessment: { type: Schema.Types.ObjectId, ref: 'Assessment'},
  evaluationForm: [{ type: Schema.Types.ObjectId, ref: 'Answer'}]
}, {
  versionKey: false
});

EvaluationSchema.plugin(mongoosePaginate);

EvaluationSchema.post('remove', async function (next) {
  console.log('removing evaluation')
  Assessment.remove({_id: this.assessment}).exec();
  next();
});


module.exports = mongoose.model('Evaluation', EvaluationSchema);


