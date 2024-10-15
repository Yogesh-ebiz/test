const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const addTask = {
    query: Joi.object().keys({
        companyId:Joi.number().integer().required(),
    }),
    body: Joi.object().keys({
      required: Joi.boolean().required(),
      type: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().allow('').optional(),
      members: Joi.array().required(),
      startDate: Joi.number(),
      endDate: Joi.number(),
      meta: Joi.object().optional(),
      reminders: Joi.array().optional(),
      note: Joi.string().allow('').optional(),
      priority: Joi.number().allow(null).optional(),
    }),
};
const searchTasks = {
  query: Joi.object().keys({
    query: Joi.string().allow('').optional(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
  body: Joi.object().keys({
    members:Joi.array().optional(),
    applicationId:Joi.string().custom(objectId).optional(),
    candidateId:Joi.string().custom(objectId).optional(),
    jobId:Joi.string().custom(objectId).optional(),
  }),
};

const getTask = {
    query: Joi.object().keys({
        companyId:Joi.number().integer().required(),
    }),
    params: Joi.object().keys({
        taskId:Joi.string().custom(objectId),
    }),
};

const updateTask = {
    query: Joi.object().keys({
        companyId:Joi.number().integer().required(),
    }),
    params: Joi.object().keys({
        taskId:Joi.string().custom(objectId),
      }),
      body: Joi.object().keys({
        required: Joi.boolean().required(),
        type: Joi.string().required(),
        name: Joi.string().required(),
        description: Joi.string().allow('').optional(),
        members: Joi.array().required(),
        startDate: Joi.number(),
        endDate: Joi.number(),
        meta: Joi.object().optional(),
        reminders: Joi.array().optional(),
        note: Joi.string().allow('').optional(),
        priority: Joi.number().optional(),
      }),
};

const markComplete = {
    query: Joi.object().keys({
      companyId:Joi.number().integer().required(),
      hasCompleted:Joi.string().allow('').optional(),
    }),
    params: Joi.object().keys({
        taskId:Joi.string().custom(objectId),
    }),
};

const removeTask = {
    query: Joi.object().keys({
        companyId:Joi.number().integer().required(),
    }),
    params: Joi.object().keys({
        taskId:Joi.string().custom(objectId),
    }),
};

module.exports = {
    addTask,
    getTask,
    updateTask,
    markComplete,
    removeTask
}
