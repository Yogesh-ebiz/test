const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const EvaluationSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  sender: {
    type: Object
  },
  receiver: {
    type: Object
  },
  subject: {
    type: String,
    required: false
  },
  bodyHtml: {
    type: String,
    required: true
  },
  attachments: {
    type: Array
  },
  user: {
    type: Object,
    required: true
  },
  createdDate: {
    type: Number,
    required: false
  },
  createdBy: {
    type: Object
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
EvaluationSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Evaluation', EvaluationSchema);

