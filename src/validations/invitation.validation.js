const Joi = require('joi');
const { password, objectId } = require('./custom.validation');


const getInvitationById = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId)
  }),
};

const acceptInvitation = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId)
  }),
};

module.exports = {
  getInvitationById,
  acceptInvitation,
};
