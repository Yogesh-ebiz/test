const Joi = require('joi');
const { password, objectId } = require('./custom.validation');


const getProjects = {
  params: Joi.object().keys({
    companyId:Joi.number().integer()
  })
};
const getProject = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId),
  }),
};
const addProject = {
  params: Joi.object().keys({
    companyId:Joi.number().integer()
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string().allow(''),
  }),
};

const updateProject = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string().allow(''),
  }),
};
const updateProjectName = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
  }),
};
const deleteProject = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string().allow(''),
  }),
};
const getProjectPeoples = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    query: Joi.string().allow(''),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string(),
    type: Joi.string(),
  }),
};
const addProjectPeoples = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    peoples: Joi.array()
  }),
};
const addProjectPeople = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId),
    peopleId:Joi.string().custom(objectId),
  })
};
const removeProjectPeoples = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId)
  })
};
const removeProjectPeople = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId),
    peopleId:Joi.string().custom(objectId),
  })
};
const getProjectSettings = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId),
  })
};
const getProjectViewers = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    projectId:Joi.string().custom(objectId),
  })
};
const addProjectViewer = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  })
};
const removeProjectViewer = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  })
};

module.exports = {
  getProjects,
  getProject,
  updateProject,
  updateProjectName,
  deleteProject,
  getProjectPeoples,
  addProjectPeople,
  removeProjectPeoples,
  removeProjectPeople,
  getProjectViewers,
  addProjectViewer,
  removeProjectViewer
};
