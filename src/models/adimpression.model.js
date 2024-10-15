const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdImpressionSchema = new mongoose.Schema({
    adId: {
        type: Schema.Types.ObjectId,
        ref: 'Ad', 
        required: true,
    },
    timestamp: { 
        type: Date, 
        required: true 
    },
    impressions: { 
        type: Number, 
        default: 0 
    },
    clicks: { 
        type: Number, 
        default: 0 
    },
    spend: { 
        type: Number, 
        default: 0 
    }
}, {
    versionKey: false
});
  
module.exports = mongoose.model('AdImpression', AdImpressionSchema);
  