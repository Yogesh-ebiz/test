const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const AssessmentSchema = new mongoose.Schema({
  createdBy: {
    type: Object,
    required: true
  },
  createdDate: {
    type: Number,
    default: Date.now()
  },
  candidateId: {
    type: Object,
    required: true
  },
  workExperience: {
    type: Number
  },
  skillCompetencies: {
    type: Object
  },
  attitude: {
    type: Number
  },
  communication: {
    type: Number
  },
  criticalThinking: {
    type: Number
  },
  updatedDate: {
    type: Number,
    required: false
  },
  updatedBy: {
    type: Object
  },
}, {
  versionKey: false
});
AssessmentSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Assessment', AssessmentSchema);

