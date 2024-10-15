const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const ReactionSchema = new mongoose.Schema({
    subjectType:{
        type: String,
        required: true,
    },
    subject:{
        type: Schema.Types.ObjectId,
        required: true,
    },
    reactionType: {
        type: String,
        required: true
    },
    createdDate: {
        type: Number,
        default: Date.now
    },
    reactionBy: {
        type: Schema.Types.ObjectId,
        required: true
    },
}, {
    versionKey: false
});

ReactionSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Reaction', ReactionSchema);