const mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');

const JobImpressionSchema = new mongoose.Schema({
    jobId: { type: Schema.Types.ObjectId, ref: 'JobRequisition', required: true },
    liked: { type: Number, default: 0 },
    saved: { type: Number, default: 0 },
    applied: { type: Number, default: 0 },
    shared: { type: Number, default: 0 },
    viewed: { type: Number, default: 0 },
}, {
  versionKey: false,
  timestamps: true
});

JobImpressionSchema.method({
  minimal() {
    const transformed = {};
    const fields = ['liked', 'saved', 'applied', 'shared', 'viewed'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  }
});

JobImpressionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('JobImpression', JobImpressionSchema);
