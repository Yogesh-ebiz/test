const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const TemplateSchema = new mongoose.Schema({
  templateId: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now
  },
  createdBy: {
    type: Number,
    default: Date.now
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  hasPublished: {
    type: Boolean,
    default: false
  },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }]
}, {
  versionKey: false
});


TemplateSchema.plugin(autoIncrement, {
  model: 'Template',
  field: 'templateId',
  startAt: 100000,
  incrementBy: 1
});
TemplateSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Template', TemplateSchema);


