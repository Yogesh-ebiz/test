const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');

const QuestionSubmissionSchema = new mongoose.Schema({
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    required: true
  },
  answers: [{ type: Schema.Types.ObjectId, ref: 'Answer'}]
}, {
  versionKey: false
});

QuestionSubmissionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('QuestionSubmission', QuestionSubmissionSchema);


