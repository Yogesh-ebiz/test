const Joi = require('joi');
const { password, objectId } = require('./custom.validation');


const addCandidateToBlacklist = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    companyId: Joi.number().integer(),
    type: Joi.string(),
    comment: Joi.string().allow('').optional(),
  }),
};

const addCandidatesToBlacklist = {
  body: Joi.object().keys({
    candidateIds: Joi.array().items(Joi.string().custom(objectId)).required(),
    companyId: Joi.number().integer(),
    type: Joi.string(),
    comment: Joi.string().allow('').optional(),
  }),
};

const removeCandidateFromBlacklist = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  })
};

const getCandidateJobPreferences = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  })
};

const getCandidateAccomplishments = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    id:Joi.string().custom(objectId)
  })
};


const addCandidateLanguages = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    id:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    language:Joi.string(),
    name:Joi.string(),
    level:Joi.string(),
  }),
};
const updateCandidateLanguage = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
    language:Joi.string()
  }),
  body: Joi.object().keys({
    level:Joi.string().required(),
  }),
}
const removeCandidateLanguage = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    id:Joi.string().custom(objectId),
    language:Joi.string()
  })
};
const updateCandidateJobPreferences = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    jobTitles: Joi.array().optional(),
    jobTypes: Joi.array().optional(),
    jobLocations: Joi.array().required().optional(),
    openToRelocate: Joi.boolean().optional(),
    openToJob: Joi.boolean().optional(),
    openToRemote: Joi.boolean().optional(),
    startDate: Joi.string().allow(''),
  }),
};

const lookupCandidatesByIds = {
  body: Joi.object().keys({
    ids: Joi.array().items(Joi.string().custom(objectId)),
    messengerIds: Joi.array().items(Joi.string().custom(objectId)),
  }),
}

module.exports = {
  addCandidateToBlacklist,
  addCandidatesToBlacklist,
  removeCandidateFromBlacklist,
  getCandidateJobPreferences,
  getCandidateAccomplishments,
  addCandidateLanguages,
  updateCandidateLanguage,
  removeCandidateLanguage,
  updateCandidateJobPreferences,
  lookupCandidatesByIds,
};
