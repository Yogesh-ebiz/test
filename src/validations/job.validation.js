const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const jobSourceEnum = require('../const/sourceType');

// const createUser = {
//   body: Joi.object().keys({
//     email: Joi.string().required().email(),
//     password: Joi.string().required().custom(password),
//     name: Joi.string().required(),
//     role: Joi.string().required().valid('user', 'admin'),
//   }),
// };
//
// const getUsers = {
//   query: Joi.object().keys({
//     name: Joi.string(),
//     role: Joi.string(),
//     sortBy: Joi.string(),
//     limit: Joi.number().integer(),
//     page: Joi.number().integer(),
//   }),
// };

const getJobLanding = {
};



const searchJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    query:Joi.string().allow(null).allow('').optional(),
    hasSave:Joi.boolean(),
    allowRemote:Joi.boolean(),
    isPromoted:Joi.boolean(),
    createdBy:Joi.array(),
    createdDate:Joi.string().allow('').optional(),
    category:Joi.array(),
    city:Joi.array(),
    companySize:Joi.array(),
    datePosted:Joi.string(),
    department:Joi.array(),
    distance:Joi.array(),
    district:Joi.array(),
    endingSoonTimeLeft:Joi.number().integer().allow(null).optional(),
    state:Joi.array(),
    country:Joi.array(),
    company:Joi.array(),
    employmentType:Joi.array(),
    jobFunction:Joi.array(),
    jobs:Joi.array(),
    jobTitles:Joi.array(),
    industry:Joi.array(),
    level:Joi.array(),
    locations:Joi.array(),
    openForWork:Joi.boolean(),
    pool:Joi.array(),
    rating:Joi.array(),
    sortBy:Joi.string(),
    sources:Joi.array(),
    skills:Joi.array(),
    stages:Joi.array(),
    status:Joi.array(),
    tags:Joi.array(),
    workFromHome:Joi.string(),
    publishedDate:Joi.string(),
  }),
  query: Joi.object().keys({
    query:Joi.string().allow(''),
    page:Joi.number(),
    size:Joi.number(),
    direction:Joi.string(),
    sortBy:Joi.string(),
  }),
};


const searchSuggestions = {
  query: Joi.object().keys({
    query:Joi.string().allow(''),
  }),
};

const getTitleSuggestion = {
  query: Joi.object().keys({
    query:Joi.string(),
  }),
};

const getJobById = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    id:Joi.number().integer(),
  }),
};


const searchCampaigns = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    level:Joi.array(),
    city:Joi.array(),
    state:Joi.array(),
    country:Joi.array(),
    company:Joi.array(),
    employmentType:Joi.array(),
    industry:Joi.array(),
    tags:Joi.array(),
    sources:Joi.array(),
    skills:Joi.array(),
    stages:Joi.array(),
    status:Joi.array(),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
};
const addSourceApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
    sourceId:Joi.string().custom(objectId)
  })
};



const publishJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    type:Joi.string(),
  }),
};
const payJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    customer:Joi.object(),
    dailyBudget:Joi.number(),
    cart:Joi.object(),
    payment:Joi.object(),
  }),
};






const uploadAvatar = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  })
};
const uploadCandidateResume = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    file:Joi.any(),
  }),
};
const getCandidateResume = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  })
};
const deleteCandidateResume = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    resumeId:Joi.string().custom(objectId)
  })
};
const assignCandidatesJobs = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  })
};
const assignCandidatesPools = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  })
};
const getCompanyDepartments = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};
const addCompanyDepartment = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    background:Joi.string().allow('').optional(),
  }),
};
const updateCompanyDepartment = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    departmentId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    background:Joi.string(),
  }),
};
const deleteCompanyDepartment = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    departmentId:Joi.string().custom(objectId)
  }),
};


const getCompanyLabels = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    query: Joi.string(),
    types: Joi.array()
  }),
};
const addCompanyLabel = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    _id:Joi.string().optional(),
    name:Joi.string(),
    name:Joi.string(),
    required:Joi.boolean(),
    questions:Joi.array(),
  }),
};
const updateCompanyLabel = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    labelId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    _id:Joi.string().optional(),
    name:Joi.string(),
    type:Joi.string(),
  }),
};
const deleteCompanyLabel = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    labelId:Joi.string().custom(objectId)
  }),
};

const getJobsSubscribed = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string(),
    type: Joi.string(),
    query:Joi.string().allow('').optional(),
  }),
};
const getApplicationsSubscribed = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string(),
    type: Joi.string(),
    query:Joi.string().allow('').optional(),
  }),
};

const getCandidatesSubscribed = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string(),
    type: Joi.string(),
    query:Joi.string().allow('').optional(),
  }),
};


const getJobQuestionaires = {
  params: Joi.object().keys({
    jobId:Joi.number().integer(),
  }),
};

const submitJobQuestionaires = {
  params: Joi.object().keys({
    jobId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    jobId:Joi.number().integer().optional(),
    email:Joi.string(),
    firstName:Joi.string().optional().allow('').allow(null),
    lastName:Joi.string().optional().allow('').allow(null),
    phoneNumber:Joi.string().optional().allow('').allow(null),
    token:Joi.string().optional().allow('').allow(null),
    availableDate:Joi.number().integer().optional(),
    resumeId:Joi.number().integer().optional().allow(null),
    source:Joi.string().allow('').optional(),
    desiredSalary:Joi.number().integer().optional(),
    currency:Joi.string().optional().allow(null),
    applicationQuestions:Joi.object().optional(),
    photo:Joi.object().optional(),
    resume:Joi.object().optional(),
    coverLetter:Joi.string().allow('').optional(),
    follow:Joi.boolean()
  })
};

const reportJobById = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    reason: Joi.array().required(),
    note: Joi.string().required(),
  })
};

const applyJobById = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    jobId:Joi.number().integer().optional(),
    email:Joi.string(),
    firstName:Joi.string().optional().allow('').allow(null),
    lastName:Joi.string().optional().allow('').allow(null),
    phoneNumber:Joi.string().optional().allow('').allow(null),
    countryCode:Joi.string().optional().allow('').allow(null),
    token:Joi.string().allow('').allow(null).optional(),
    availableDate:Joi.number().integer().optional(),
    resumeId:Joi.number().integer().optional().allow(null),
    source:Joi.string().allow('').optional(),
    desiredSalary:Joi.number().integer().optional(),
    currency:Joi.string().allow('').allow(null).optional(),
    applicationQuestions:Joi.object().optional(),
    photo:Joi.object().optional(),
    resume:Joi.object().optional(),
    coverLetter:Joi.string().allow('').optional(),
    follow:Joi.boolean()
  }),
  query: Joi.object().keys({
    source: Joi.string().valid(...Object.values(jobSourceEnum)).required(),
    token:Joi.string().optional().allow('').allow(null),
  })
};

const addBookmark = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId)
  }),
  query: Joi.object().keys({
    token:Joi.string().optional().allow(''),
    source: Joi.string().valid(...Object.values(jobSourceEnum)).required()
  })
};

const removeBookmark = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId)
  })
};

const captureJob = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
};

const getJobInsight = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
};


const getSimilarCompany = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
};


const getMarketSalary = {
  query: Joi.object().keys({
    jobTitle:Joi.string().optional().allow(''),
    industry:Joi.string().optional().allow(''),
    jobType:Joi.string().optional().allow(''),
    city:Joi.string().optional().allow(''),
    state:Joi.string().optional().allow(''),
    country:Joi.string().optional().allow(''),
  })
};

const markJobAsExpired = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId).required(),
  }),
}

module.exports = {
  getJobLanding,
  searchJob,
  searchSuggestions,
  getTitleSuggestion,
  getJobById,
  searchCampaigns,
  addSourceApplication,
  publishJob,
  payJob,


  getJobsSubscribed,
  getApplicationsSubscribed,
  getCandidatesSubscribed,
  uploadAvatar,
  uploadCandidateResume,
  getCandidateResume,
  deleteCandidateResume,
  assignCandidatesJobs,
  assignCandidatesPools,
  getCompanyDepartments,
  addCompanyDepartment,
  updateCompanyDepartment,
  deleteCompanyDepartment,


  getJobQuestionaires,
  reportJobById,
  applyJobById,
  addBookmark,
  removeBookmark,
  captureJob,
  getJobInsight,
  getSimilarCompany,
  getMarketSalary,

  markJobAsExpired

};
