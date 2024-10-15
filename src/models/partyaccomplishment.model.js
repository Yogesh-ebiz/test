const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const { autoIncrement } = require('mongoose-plugin-autoinc');
const statusEnum = require('../const/statusEnum');


const PartyAccomplishmentSchema = new mongoose.Schema({
  partyAccomplishmentId: {
    type: Number,
    required: true
  },
  partyId: {
    type: Number,
    required: true
  },
  language: [{ type: Schema.Types.ObjectId, ref: 'Endorsement' }],
  publications: [{ type: Schema.Types.ObjectId, ref: 'Endorsement' }],
  certificates: [{ type: Schema.Types.ObjectId, ref: 'Endorsement' }]

}, {
  versionKey: false
});


PartyAccomplishmentSchema.plugin(autoIncrement, {
  model: 'PartyAccomplishment',
  field: 'partyAccomplishmentId',
  startAt: 100000,
  incrementBy: 1
});
PartyAccomplishmentSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('PartyAccomplishment', PartyAccomplishmentSchema);
