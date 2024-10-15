const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const getCompany = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};

const addSubscription = {
  body: Joi.object().keys({
    category: Joi.string().required(),
    startsAt: Joi.string().required().allow(''),
    endsAt: Joi.string().required().allow(''),
    cancelAtPeriodEnd: Joi.boolean(),
    couponCode: Joi.string().allow(''),
    autoCollect: Joi.boolean(),
    trialDays: Joi.number().optional().allow(null),
    salePersonId: Joi.number().integer().optional().allow(null),
    tags: Joi.array().optional(),
    payment: Joi.object().optional().required(),
    customer: Joi.object().required(),
    plan: Joi.object().required(),
    metadata: Joi.object().optional()
  }),
};


const getSubscriptionById = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  })
};


const updateSubscription = {
  params: Joi.object().keys({
    id: Joi.string(),
  }),
  body: Joi.object().keys({
    payment: Joi.object().required(),
    plan: Joi.object().required()
  }),
};


const updateSubscriptionPlan = {
  params: Joi.object().keys({
    id: Joi.string(),
  }),
  body: Joi.object().keys({
    id: Joi.string().required(),
    priceId: Joi.string().required()
  }),
};
const activateSubscription = {
  params: Joi.object().keys({
    id: Joi.string(),
  })
};

const cancelSubscription = {
  params: Joi.object().keys({
    id: Joi.string(),
  }),
  body: Joi.object().keys({
    partyId: Joi.number(),
    cancelAtPeriodEnd: Joi.boolean(),
  }),
};



const addPaymentMethod = {
  params: Joi.object().keys({
    companyId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    type: Joi.string().required(),
    password: Joi.boolean().required(),
    card: Joi.object().required(),
  }),
};


module.exports = {
  addSubscription,
  getSubscriptionById,
  updateSubscription,
  updateSubscriptionPlan,
  activateSubscription,
  cancelSubscription
};
