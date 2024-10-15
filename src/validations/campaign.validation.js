const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addCampaign = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    content: Joi.array(),
    settings: Joi.object()
  }),
};
const getCampaignById = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
};

const updateCampaignById = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    content: Joi.array(),
    settings: Joi.object()
  }),
};

const removeCampaignById = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
};

const searchCampaigns = {
  query: Joi.object().keys({
    query: Joi.string().allow('').optional(),
    createdBy: Joi.string().custom(objectId).allow(null).optional(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    direction: Joi.string(),
    sortBy: Joi.string(),
  }),
};

module.exports = {
  addCampaign,
  getCampaignById,
  updateCampaignById,
  removeCampaignById,
  searchCampaigns
};
