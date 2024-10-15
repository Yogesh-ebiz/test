const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const reactionTypeEnum = require('../const/reactionTypeEnum');

const getNotificationPreference = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  }),
};

const updateNotificationPreference = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  }),
  boy: Joi.object().keys({
    isNotificationOn: Joi.boolean(),
    isApplicationUpdated: Joi.boolean(),
    isAppliedOn: Joi.boolean(),
    isEventCancelled: Joi.boolean(),
    isEventDeclinedOn: Joi.boolean(),
    isEventAcceptedOn: Joi.boolean(),
    isJobUpdated: Joi.boolean(),
    isJobCommented: Joi.boolean(),
    isJobMembered: Joi.boolean(),
    isMessaged: Joi.boolean()
  }),
};

const getSignatures = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
};

const addSignature = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
  boy: Joi.object().keys({
    name: Joi.string(),
    bodyHtml: Joi.string(),
  }),
};

const getSignature = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
    templateId:Joi.string().custom(objectId),
  }),
};

const updateSignature = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
    templateId:Joi.string().custom(objectId),
  }),
  boy: Joi.object().keys({
    name: Joi.string(),
    bodyHtml: Joi.string(),
  }),
};

const deleteSignature = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
    templateId:Joi.string().custom(objectId),
  }),
};
module.exports = {
  getNotificationPreference,
  updateNotificationPreference,
  getSignatures,
  addSignature,
  getSignature,
  updateSignature,
  deleteSignature,
};
