const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let mongoosePaginate = require('mongoose-aggregate-paginate-v2');
const { autoIncrement } = require('mongoose-plugin-autoinc');



const NotificationPrefereneceSchema = new mongoose.Schema({
  isNotificationOn: {
    type: Boolean,
    default: true
  },
  isAppliedOn: {
    type: Boolean,
    default: true
  },
  isApplicationUpdated: {
    type: Boolean,
    default: true
  },
  isCandidateRecommended: {
    type: Boolean,
    default: true
  },
  isEventInvited: {
    type: Boolean,
    default: true
  },
  isEventCancelled: {
    type: Boolean,
    default: true
  },
  isEventConfirmed: {
    type: Boolean,
    default: true
  },
  isEventUpdated: {
    type: Boolean,
    default: true
  },
  isJobUpdated: {
    type: Boolean,
    default: true
  },
  isJobCommented: {
    type: Boolean,
    default: true
  },
  isJobMembered: {
    type: Boolean,
    default: true
  },
  isMessaged: {
    type: Boolean,
    default: true
  }
}, {
  versionKey: false
});

NotificationPrefereneceSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('NotificationPreference', NotificationPrefereneceSchema);


