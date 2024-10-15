const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};


const registerNewUser = {
  body: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string(),
    phoneNumber: Joi.string(),
    password: Joi.string(),
    jobTitle: Joi.string().allow('').allow(null).optional(),
    appId: Joi.string().allow('').optional(),
    token: Joi.string().allow('').optional(),
    type: Joi.string().allow('').optional(),
    company: Joi.object().optional(),
  }),
};

const sync = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const syncCompanies = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUserDetail = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  headers: Joi.object().keys({
    UserId: Joi.number().integer(),
  })
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};



const getUserSession = {
  query: Joi.object().keys({
    company: Joi.string().allow('').allow(null),
  }),
};

const getSubscription = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};
const addSubscription = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    category: Joi.string(),
    startsAt: Joi.string().optional().allow(''),
    endsAt: Joi.string().optional().allow(''),
    cancelAtPeriodEnd: Joi.boolean().optional().allow(null),
    couponCode: Joi.string().optional().allow(''),
    autoCollect: Joi.boolean().optional().allow(null),
    trialDays: Joi.number().optional().allow(null),
    tags: Joi.array().optional().allow(null),
    salePersonId: Joi.number().optional().allow(null),
    customer: Joi.object(),
    payment: Joi.object(),
    plan: Joi.object(),
    metadata: Joi.object().optional().allow(null),
  }),
};

const updateSubscription = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    cancelAtPeriodEnd: Joi.string(),
    customer: Joi.object(),
    plan: Joi.object(),
  }),
};

const uploadResume = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  }),
};


const setResumeDefault = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    resumeId: Joi.string().custom(objectId),
  }),
};
const getUserResume = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    resumeId: Joi.string().custom(objectId),
  }),
};


const addUserResume = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    template: Joi.string().custom(objectId),
    resume: Joi.object(),
    source: Joi.string().custom(objectId),
  }),
};

const updateUserResume = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    resumeId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    firstName: Joi.string().optional().allow(''),
    middleName: Joi.string().optional().allow(''),
    lastName: Joi.string().optional().allow(''),
    jobTitle: Joi.string().optional().allow(''),
    summary: Joi.string().optional().allow(''),
    email: Joi.string().optional().allow(''),
    phone: Joi.string().optional().allow(''),
    experiences: Joi.array().optional().allow(null),
    educations: Joi.array().optional().allow(null),
    skills: Joi.array().optional().allow(null),
    languages: Joi.array().optional().allow(null),
    courses: Joi.array().optional().allow(null),
    hobbies: Joi.string().optional().allow(''),
    references: Joi.array().optional().allow(null),
    extraCurricularActivities: Joi.array().optional().allow(null),
    links: Joi.array().optional().allow(null),
  }),
};

const deleteUserResume = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    resumeId: Joi.string().custom(objectId),
  })
};

const updateUserResumeName = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    resumeId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
  }),
};

const getUserResumeTemplates = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};
const updateUserResumeTemplate = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    resumeId: Joi.string().custom(objectId),
    templateId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    modules: Joi.array(),
    config: Joi.object(),
    template: Joi.required().custom(objectId)
  }),
};

const getUserResumesFiles = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};

const getUserResumes = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};

const downloadResume = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};

const getUserExperiences = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};
const addUserExperience = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    employmentTitle: Joi.string(),
    employmentType: Joi.string(),
    jobFunction: Joi.string().optional().allow(''),
    description: Joi.string().optional().allow(''),
    terminationReason: Joi.string().optional().allow(''),
    terminationType: Joi.string().optional().allow(''),
    isCurrent: Joi.boolean(),
    employer: Joi.object(),
    fromDate: Joi.string(),
    thruDate: Joi.string().optional().allow(''),
    salary: Joi.number().integer().allow(null),
    currency: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow('').allow(null),
    state: Joi.string().optional().allow('').allow(null),
    country: Joi.string(),
    website: Joi.string().allow('').allow(null).optional(),
  }),
};
const updateUserExperience = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    experienceId: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    employmentTitle: Joi.string(),
    employmentType: Joi.string(),
    jobFunction: Joi.string().optional().allow(''),
    description: Joi.string().optional().allow(''),
    terminationReason: Joi.string().optional().allow(''),
    terminationType: Joi.string().optional().allow(''),
    isCurrent: Joi.boolean(),
    employer: Joi.object(),
    fromDate: Joi.string(),
    thruDate: Joi.string().optional().allow(''),
    salary: Joi.number().integer().allow(null),
    currency: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    country: Joi.string(),
    website: Joi.string().allow('').allow(null).optional(),
  }),
};
const removeUserExperience = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    experienceId: Joi.required().custom(objectId)
  })
};
const getUserEducations = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
};
const addUserEducation = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    degree: Joi.string(),
    fieldOfStudy: Joi.string(),
    description: Joi.string().optional().allow(''),
    hasGraduated: Joi.boolean(),
    institute: Joi.object(),
    fromDate:Joi.string(),
    thruDate:Joi.string().allow('').allow(null),
    gpa: Joi.number().optional().allow(null),
    city: Joi.string().optional().allow(null),
    state: Joi.string().optional().allow(null),
    country: Joi.string().optional().allow(null),
    district: Joi.string().optional().allow(null),
  }),
};
const updateUserEducation = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    educationId: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    _id: Joi.string().optional().allow(null),
    degree: Joi.string(),
    fieldOfStudy: Joi.string(),
    description: Joi.string().optional().allow(''),
    hasGraduated: Joi.boolean(),
    institute: Joi.object(),
    fromDate:Joi.string(),
    thruDate:Joi.string().allow('').allow(null),
    gpa: Joi.number().optional().allow(null),
    city: Joi.string().optional().allow(null),
    state: Joi.string().optional().allow(null),
    country: Joi.string().optional().allow(null),
    district: Joi.string().optional().allow(null),
  }),
};
const removeUserEducation = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    educationId: Joi.required().custom(objectId)
  })
};
const getUserAccomplishments = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

const getApplications = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  query: Joi.object().keys({
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getApplicationList = {
  query: Joi.object().keys({
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBookmarks = {
  query: Joi.object().keys({
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};


const getAlerts = {
  query: Joi.object().keys({
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const addUserAlert = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  }),
  body: Joi.object().keys({
    distance: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    country: Joi.string().optional().allow(''),
    company: Joi.string().optional().allow(''),
    companySize: Joi.string().optional().allow(''),
    industry: Joi.string().optional().allow(''),
    level: Joi.string().optional().allow(''),
    employmentType: Joi.string().optional().allow(''),
    jobFunction: Joi.string().optional().allow(''),
    remote: Joi.boolean(),
  }),
};
const removeUserAlert = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    alertId: Joi.required().custom(objectId)
  })
};

const updateUserAlert = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    alertId: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    status: Joi.string().optional().allow(''),
    distance: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    country: Joi.string().optional().allow(''),
    company: Joi.string().optional().allow(''),
    companySize: Joi.string().optional().allow(''),
    industry: Joi.string().optional().allow(''),
    level: Joi.string().optional().allow(''),
    employmentType: Joi.string().optional().allow(''),
    jobFunction: Joi.string().optional().allow(''),
    notification: Joi.array().optional().allow(null),
    repeat: Joi.string().optional().allow(''),
    remote: Joi.boolean(),
  }),
};

const getJobViews = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  query: Joi.object().keys({
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};
const getUserSkills = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

const getUserTopSkills = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

const getUserSkillList = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  })
};

const updateUserSkills = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  }),
  body: Joi.object().keys({
    skills: Joi.array(),
  }),
};
const addUserSkill = {
  params: Joi.object().keys({
    userId: Joi.number().integer()
  }),
  body: Joi.object().keys({
    skill: Joi.required().custom(objectId),
    noOfMonths: Joi.number().integer(),
    selfRating: Joi.number(),
  }),
};

const updateUserSkillById = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    partySkillId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    noOfMonths: Joi.number().integer(),
    selfRating: Joi.number(),
  }),
};

const removeUserSkillById = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    partySkillId: Joi.number().integer(),
  })
};

const getUserLanguages = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  })
};
const addUserLanguage = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    language: Joi.string(),
    level: Joi.string()
  }),
};
const removeUserLanguage = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    language:Joi.string()
  })
};

const getUserPublications = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  })
};
const addUserPublication = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    author: Joi.string(),
    publisher: Joi.string().allow('').optional(),
    publishedDate: Joi.date().allow('').optional(),
    url: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    isbn: Joi.string().allow('').optional(),
  }),
};
const removeUserPublication = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    publicationId:Joi.custom(objectId)
  })
};


const getEndorsementsByPartySkill = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    partySkillId: Joi.number().integer(),
  }),
  query: Joi.object().keys({
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const addEndorsement = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    partySkillId: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    rating: Joi.number().integer().allow(null),
    relationship: Joi.string().allow('').allow(null)
  }),
};


const removeEndorsement = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
    partySkillId: Joi.required().custom(objectId)
  })
};
const getJobPreferences = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  })
};

const updateJobPreferences = {
  params: Joi.object().keys({
    userId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    openToRelocate: Joi.boolean(),
    openToRemote: Joi.boolean(),
    openToJob: Joi.boolean(),
    jobLocations: Joi.array(),
    jobTypes: Joi.object(),
    startDate: Joi.string()
  }),
};

const getUserEvaluations = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    id:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string(),
    type: Joi.string(),
  }),
  body: Joi.object().keys({
    companyId:Joi.number().optional().allow(null),
    applicationId:Joi.string().allow(null).allow(''),
    stages:Joi.array()
  }),
};
const getUserEvaluationsStats = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    type:Joi.string().allow(''),
    companyId:Joi.number().integer().allow(null),
    applicationId:Joi.string().allow('').allow(null),
    stages:Joi.array()
  }),
};
const getUserEvaluationById = {
  params: Joi.object().keys({
    id:Joi.string().custom(objectId),
    evaluationId:Joi.string().custom(objectId),
  })
};


module.exports = {
  registerNewUser,
  sync,
  syncCompanies,
  getUserDetail,
  getUserSession,
  getSubscription,
  addSubscription,
  updateSubscription,
  getUserResumesFiles,
  getUserResumes,
  downloadResume,
  getUserResume,
  addUserResume,
  updateUserResume,
  deleteUserResume,
  updateUserResumeName,
  getUserResumeTemplates,
  updateUserResumeTemplate,
  getUserExperiences,
  addUserExperience,
  updateUserExperience,
  removeUserExperience,
  getUserEducations,
  addUserEducation,
  updateUserEducation,
  removeUserEducation,
  getUserAccomplishments,
  uploadResume,
  setResumeDefault,
  getApplications,
  getApplicationList,
  getBookmarks,
  getAlerts,
  addUserAlert,
  removeUserAlert,
  updateUserAlert,
  getJobViews,
  getUserSkills,
  getUserTopSkills,
  getUserSkillList,
  updateUserSkills,
  addUserSkill,
  updateUserSkillById,
  removeUserSkillById,
  getUserLanguages,
  addUserLanguage,
  removeUserLanguage,
  getUserPublications,
  addUserPublication,
  removeUserPublication,
  getEndorsementsByPartySkill,
  addEndorsement,
  removeEndorsement,
  getJobPreferences,
  updateJobPreferences,
  getUserEvaluations,
  getUserEvaluationsStats,
  getUserEvaluationById
};
