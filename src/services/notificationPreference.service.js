const Joi = require('joi');
const NotificationPreference = require('../models/notificationpreference.model');

const notificationPreferenceSchema = Joi.object({
    isNotificationOn: Joi.boolean().default(true),
    isApplied: Joi.boolean().default(true),
    isApplicationUpdated: Joi.boolean().default(true),
    isCandidateRecommended: Joi.boolean().default(true),
    isEventInvited: Joi.boolean().default(true),
    isEventCancelled: Joi.boolean().default(true),
    isEventConfirmed: Joi.boolean().default(true),
    isEventUpdated: Joi.boolean().default(true),
    isEventDeclined: Joi.boolean().default(true),
    isJobUpdated: Joi.boolean().default(true),
    isJobCommented: Joi.boolean().default(true),
    isJobMembered: Joi.boolean().default(true),
    isMessaged: Joi.boolean().default(true)
});

async function validateNotificationData(data) {
    const { error } = notificationPreferenceSchema.validate(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
}

async function createNotificationPreference(notificationData) {
    await validateNotificationData(notificationData);
    const newPreference = new NotificationPreference(notificationData);
    return await newPreference.save();
}

async function updateNotificationPreference(id, notificationData) {
    await validateNotificationData(notificationData);
    return await NotificationPreference.findByIdAndUpdate(id, notificationData, { new: true }); 
}

module.exports = {
  createNotificationPreference,
  updateNotificationPreference
};
