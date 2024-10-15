const mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const Schema = mongoose.Schema;
const statusEnum = require('../const/statusEnum')


const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    default: statusEnum.ACTIVE
  },
  settings: {
    type: Object,
    default: {
      automatic: true,
      sender: '',
      sendLimit: 200,
      delay: 5,
      start: '',
      deadline: '',
      schedule: [],
      timezone: '',
      cc: [],
      bcc: [],
      tracking: {
        open: true,
        click: true,
        allowUnsubscribe: false
      }
    }
  },
  content: {
    type: Array,
  },
  contacts: {
    type: Array,
  },
}, {
  versionKey: false
});
CampaignSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Campaign', CampaignSchema);

