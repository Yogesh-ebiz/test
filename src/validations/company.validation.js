const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const reactionTypeEnum = require('../const/reactionTypeEnum');

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


const getInsights = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};

const searchCompany = {
  params: Joi.object().keys({
  }),
  query: Joi.object().keys({
    query: Joi.string().allow('').optional(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
};

const getCompany = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};

const register = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    legalName: Joi.string().required(),
    partyType: Joi.string().required(),
    type: Joi.string().required(),
    about: Joi.string().optional().allow(''),
    mission: Joi.string().optional().allow(''),
    size: Joi.string().optional().allow(''),
    website: Joi.string().optional().allow(''),
    yearFounded: Joi.number().integer().optional(),
    industry: Joi.array().optional(),
    primaryAddress: Joi.object().optional(),
    email: Joi.string(),
    countryCode: Joi.string().optional().allow(''),
    phoneNumber: Joi.string(),
    createdBy: Joi.number(),
    firstName: Joi.string().optional().allow('').allow(null),
    middleName: Joi.string().optional().allow('').allow(null),
    lastName: Joi.string().optional().allow('').allow(null),
    jobTitle: Joi.string().optional().allow('').allow(null)
  }),
};
const updateCompany = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    legalName: Joi.string().required(),
    partyType: Joi.string().optional().allow(''),
    type: Joi.string().allow('').optional(),
    about: Joi.string().optional().allow(''),
    mission: Joi.string().optional().allow(''),
    size: Joi.string().optional().allow(''),
    website: Joi.string().optional().allow(''),
    yearFounded: Joi.number().integer().optional(),
    industry: Joi.array().optional(),
    primaryAddress: Joi.object().optional(),
    email: Joi.string(),
    countryCode: Joi.string().allow('').optional(),
    phoneNumber: Joi.string(),
    createdBy: Joi.number(),
  }),
};

const uploadCompanyAvatar = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};

const uploadCompanyCover = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};

const getInsight = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};

const getInmailCredits = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};
const getTaxAndFee = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};
const getImpressionCandidates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    jobId:Joi.string().allow('').optional().custom(objectId),
    timeframe: Joi.string(),
    type: Joi.string().allow('').optional(),
    level: Joi.string().allow('').optional(),
    source: Joi.string().allow('').optional().custom(objectId),
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};
const getDashboard = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    jobcompanyId:Joi.string().custom(objectId),
    timeframe: Joi.string(),
    type: Joi.string(),
    level: Joi.string(),
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};
const getCompanyJobSummary = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    timeframe: Joi.string(),
  }),
};
const getCards = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  })
};
const addPaymentMethod = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    type: Joi.string().required(),
    isDefault: Joi.boolean().required(),
    card: Joi.object().required(),
  }),
};
const removeCard = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    cardId:Joi.number().integer(),
  })
};
const verifyCard = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  })
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

const getSubscriptions = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  })
};
const getSubscription = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    subscriptionId:Joi.string(),
  })
};
const updateSubscription = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    subscriptionId:Joi.string(),
  }),
  body: Joi.object().keys({
    customer: Joi.object().required(),
    plan: Joi.object().required()
  }),
};

const getInvoices = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    subscriptionId:Joi.string(),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
};

// MEMBERS
const getCompanyMembers = {
  params: Joi.object().keys({
    companyId:Joi.number().integer()
  }),
  query: Joi.object().keys({
    query: Joi.string().allow('').allow(null),
    status: Joi.string().allow('').optional(),
  }),
};
const getCompanyMember = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  })
};
const updateCompanyMember = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    firstName:Joi.string(),
    middleName:Joi.string().allow(''),
    lastName:Joi.string(),
    email:Joi.string(),
    countryCode: Joi.string().optional().allow(''),
    phone:Joi.string(),
    language:Joi.string().allow(''),
    timezone:Joi.string().allow(''),
    preferTimeFormat:Joi.string().allow(''),
    currency:Joi.string().allow(''),
  }),
};
const deleteCompanyMember = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  })
};
const updateCompanyMemberRole = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    role:Joi.string().custom(objectId).allow('').allow(null)
  }),
};
const uploadMemberAvatar = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId)
  }),
};
const uploadMemberCover = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId)
  }),
};
const leaveCompany = {
  params: Joi.object().keys({
    id:Joi.number()
  }),
};
const inviteMembers = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    emails:Joi.array(),
    note:Joi.string(),
    role:Joi.string().custom(objectId)
  }),
};
const getCompanyMemberInvitations = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    query:Joi.string().allow(null).allow('')
  }),
};
const cancelMemberInvitation = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    invitationId:Joi.string().custom(objectId)
  })
};
const acceptMemberInvitation = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    invitationId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    firstName:Joi.string(),
    middleName:Joi.string().allow(''),
    lastName:Joi.string(),
    email:Joi.string(),
    countryCode: Joi.string().optional().allow(''),
    phone:Joi.string().allow(''),
    language:Joi.string().allow(''),
    timezone:Joi.string().allow(''),
    preferTimeFormat:Joi.string().allow(''),
    password:Joi.string(),
  }),
};

// ROLES
const getCompanyRoles = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};
const addCompanyRole = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    company:Joi.number(),
    description:Joi.string(),
    privileges:Joi.array()
  }),
};
const updateCompanyRole = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    roleId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    company:Joi.number(),
    description:Joi.string(),
    privileges:Joi.array()
  }),
};
const deleteCompanyRole = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    roleId:Joi.string().custom(objectId)
  }),
};
const disableCompanyRole = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    roleId:Joi.string().custom(objectId)
  }),
};
const enableCompanyRole = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    roleId:Joi.string().custom(objectId)
  }),
};

const getCompanyJobCount = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    customer:Joi.object(),
    dailyBudget:Joi.number(),
    cart:Joi.object(),
    payment:Joi.object(),
  }),
};
const searchJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    hasSaved:Joi.boolean(),
    allowRemote:Joi.boolean(),
    isPromoted:Joi.boolean(),
    mostViewedJobs:Joi.boolean(),
    jobsEndingSoon:Joi.boolean(),
    createdBy:Joi.array(),
    members: Joi.array().optional(),
    createdDate:Joi.string().allow('').optional(),
    city:Joi.array(),
    department:Joi.array(),
    distances:Joi.array(),
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
    ratings:Joi.array(),
    sources:Joi.array(),
    skills:Joi.array(),
    stages:Joi.array(),
    status:Joi.array(),
    tags:Joi.array(),
  }),
};


const lookupJobs = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    query:Joi.string().allow(''),
  }),
};

const searchJobTitle = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    query:Joi.string().allow('').optional()
  }),
};

const getJobById = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
};
const createJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    currency: Joi.string().required(),
    internalCode: Joi.string().optional().allow(''),
    expirationDate: Joi.number().integer().optional().allow(null),
    requiredOnDate: Joi.number().integer().optional().allow(null),
    minMonthExperience: Joi.number().integer().optional().allow(null),
    maxMonthExperience: Joi.number().integer().optional().allow(null),
    salaryRangeLow: Joi.number().integer().optional().allow(null),
    salaryRangeHigh: Joi.number().integer().optional().allow(null),
    salaryFixed: Joi.boolean().optional().allow(null),
    employmentType: Joi.string().required(),
    jobFunction: Joi.string().custom(objectId),
    level: Joi.string().required(),
    industry: Joi.array().optional(),
    department: Joi.string().custom(objectId),
    education: Joi.string().optional(),
    district: Joi.string().optional().allow(''),
    city: Joi.string().optional(),
    state: Joi.string().allow('').allow(null).optional(),
    stateCode: Joi.string().allow('').allow(null).optional(),
    country: Joi.string().optional(),
    countryCode: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    yearFounded: Joi.number().integer().optional(),
    responsibilities: Joi.array().optional(),
    qualifications: Joi.array().optional(),
    minimumQualifications: Joi.array().optional(),
    skills: Joi.array().optional(),
    tags: Joi.array().optional(),
    externalUrl: Joi.string().optional(),
    allowRemote: Joi.boolean().optional(),
    noOfResources: Joi.number().integer(),
    displaySalary: Joi.boolean(),
    pipeline: Joi.string().custom(objectId).optional(),
  }),
};
const updateJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    currency: Joi.string().required(),
    internalCode: Joi.string().optional().allow(''),
    salaryRangeLow: Joi.number().integer().optional().allow(null),
    salaryRangeHigh: Joi.number().integer().optional().allow(null),
    salaryFixed: Joi.boolean().optional().allow(null),
    minMonthExperience: Joi.number().integer().optional().allow(null),
    maxMonthExperience: Joi.number().integer().optional().allow(null),
    employmentType: Joi.string().required(),
    jobFunction: Joi.string().required(),
    level: Joi.string(),
    industry: Joi.array().optional(),
    education: Joi.string().optional(),
    district: Joi.string().optional().allow(''),
    city: Joi.string().optional(),
    state: Joi.string().allow('').allow(null).optional(),
    stateCode: Joi.string().allow('').allow(null).optional(),
    country: Joi.string().optional(),
    countryCode: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    department: Joi.string().custom(objectId),
    responsibilities: Joi.array().optional(),
    qualifications: Joi.array().optional(),
    minimumQualifications: Joi.array().optional(),
    skills: Joi.array().optional(),
    tags: Joi.array().optional(),
    externalUrl: Joi.string().allow('').optional(),
    allowRemote: Joi.boolean().optional(),
    noOfResources: Joi.number().integer(),
    displaySalary: Joi.boolean().optional()
  }),
};
const closeJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
};
const archiveJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
};
const unarchiveJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
};
const deleteJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
};
const shareJobToSocialAccount = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
    socialAccountType: Joi.string(),
  }),
};


const getJobComments = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
};
const addJobComment = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    message: Joi.string()
  }),
};

const addJobTag = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    _id: Joi.string().custom(objectId),
    name: Joi.string().allow('').optional()
  }),
};
const updateJobTags = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    tags: Joi.array().optional(),
  }),
};
const removeJobTags = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    tags: Joi.array().optional(),
  }),
};

const getJobInsights = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
};
const getJobActivities = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
};
const getJobPipeline = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    jobTitles: Joi.array().optional(),
    locations: Joi.array().optional(),
    skills: Joi.array().optional(),
    companies: Joi.array().optional(),
    schools: Joi.array().optional(),
    industries: Joi.array().optional(),
    employmentTypes: Joi.array().optional(),
  }),
};

const updateJobPipeline = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    pipelineTemplateId: Joi.string().custom(objectId),
    autoRejectBlackList: Joi.boolean().optional(),
    stages: Joi.array().optional(),
    stageMigration: Joi.array().optional(),
  }),
};

const getJobMembers = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  })
};
const updateJobMembers = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    members: Joi.array().optional()
  }),
};


const subscribeJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    members: Joi.array().optional()
  }),
};
const unsubscribeJob = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    members: Joi.array().optional()
  }),
};
const updateJobApplicationForm = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    questionTemplateId:Joi.string().allow('').optional().custom(objectId),
    applicationForm: Joi.object()
  }),
};
const getBoard = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  })
};


const importResumes = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    file:Joi.any(),
    photo:Joi.any().optional()
  }),
};
const searchCandidates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    query: Joi.string().allow(null).allow(''),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
  body: Joi.object().keys({
    query:Joi.string().allow('').allow(null),
    job:Joi.string().allow('').allow(null),
    isNew:Joi.boolean().optional(),
    hasSaved:Joi.boolean().optional(),
    hasFlagged:Joi.boolean().optional(),
    hasApplied:Joi.boolean().optional(),
    hasImported:Joi.boolean().optional(),
    openForWork:Joi.boolean().optional(),
    minYear:Joi.number().integer().optional(),
    maxYear:Joi.number().integer().optional(),
    createdBy:Joi.array().optional(),
    department:Joi.array().optional(),
    distances:Joi.array().optional(),
    endingSoonTimeLeft:Joi.number().optional(),
    jobs:Joi.array().optional(),
    jobTitles:Joi.array().optional(),
    locations:Joi.array().optional(),
    status:Joi.array().optional(),
    level:Joi.array().optional(),
    district:Joi.array().optional(),
    city:Joi.array().optional(),
    state:Joi.array().optional(),
    country:Joi.array().optional(),
    company:Joi.array().optional(),
    employers: Joi.array().optional(),
    employmentType:Joi.array().optional(),
    industry:Joi.array().optional(),
    pool:Joi.array().optional(),
    ratings:Joi.array().optional(),
    labels:Joi.array().optional(),
    tags:Joi.array().optional(),
    skills:Joi.array().optional(),
    stages:Joi.array().optional(),
    sources:Joi.array().optional(),
    locations:Joi.array().optional(),
    hasSaved:Joi.boolean().optional(),
    hasFlag:Joi.boolean().optional(),
    openForWork:Joi.boolean().optional(),
    noOfMonthsExperience:Joi.array().optional(),
  }),
};
const addCandidate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    firstName:Joi.string(),
    lastName:Joi.string(),
    email:Joi.string(),
    phoneNumber:Joi.string(),
    emails:Joi.array().optional(),
    phones:Joi.array().optional(),
    countryCode:Joi.string(),
    primaryAddress:Joi.object(),
    jobTitle:Joi.string(),
    about:Joi.string().optional().allow(''),
    gender:Joi.string().optional().allow(''),
    maritalStatus:Joi.string().optional().allow(''),
    dob:Joi.string().optional().allow(''),
    resumes:Joi.array().optional().allow(null),
    links:Joi.array().optional(),
    experiences:Joi.array().optional(),
    educations:Joi.array().optional(),
    languages:Joi.array().optional(),
    level: Joi.string().optional().allow(''),
  }),
};
const getCandidateById = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  })
};
const updateCandidateById = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    firstName:Joi.string(),
    middleName:Joi.string().allow('').optional(),
    lastName:Joi.string(),
    email:Joi.string().allow(''),
    phoneNumber:Joi.string().allow(''),
    emails:Joi.array().optional(),
    phones:Joi.array().optional(),
    countryCode: Joi.string().allow(''),
    jobTitle:Joi.string().allow('').optional(),
    primaryAddress:Joi.object(),
    about:Joi.string().allow(''),
    gender:Joi.string().allow(''),
    maritalStatus:Joi.string().allow(''),
    dob:Joi.string().allow(''),
    links:Joi.array(),
    level: Joi.string().optional().allow(''),
  }),
};
const removeCandidateById = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  })
};

const removeCandidates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    candidateIds: Joi.array().items(Joi.string().custom(objectId).required()).required(),
  })
};

const getCandidatePreferences = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  }),
};

const getCandidateExperiences = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
  })
};
const addCandidateExperience = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    experienceId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    isCurrent:Joi.boolean(),
    employmentTitle:Joi.string().allow(''),
    employmentType:Joi.string(),
    description:Joi.string().allow(''),
    terminationReason:Joi.string().allow(''),
    terminationType:Joi.string().allow(''),
    employer:Joi.object(),
    fromDate:Joi.string(),
    thruDate:Joi.string().allow('').allow(null),
    district:Joi.string().allow(''),
    city:Joi.string().allow(''),
    state:Joi.string().allow(''),
    country:Joi.string().allow(''),
    website:Joi.string().allow('').optional(),
    jobType: Joi.string().allow('').optional(),
    jobFunction:Joi.string().allow('').optional(),
  }),
};
const updateCandidateExperience = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    experienceId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    _id:Joi.string().optional(),
    isCurrent:Joi.boolean(),
    employmentTitle:Joi.string().allow(''),
    employmentType:Joi.string(),
    description:Joi.string().allow(''),
    terminationReason:Joi.string().allow(''),
    terminationType:Joi.string().allow(''),
    employer:Joi.object(),
    fromDate:Joi.string(),
    thruDate:Joi.string().allow('').allow(null),
    district:Joi.string().allow(''),
    city:Joi.string().allow(''),
    state:Joi.string().allow(''),
    country:Joi.string().allow(''),
    jobFunction: Joi.string().allow('').optional(),
    jobType: Joi.string().allow('').optional(),
    website:Joi.string().allow('').optional(),
    salary: Joi.number().optional(),
    tasks: Joi.array().optional()
  }),
};
const removeCandidateExperience = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    experienceId:Joi.string().custom(objectId),
  })
};
const getCandidateEducations = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
  })
};
const addCandidateEducation = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    experienceId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    fieldOfStudy:Joi.string().custom(objectId),
    degree:Joi.string().allow(''),
    gpa:Joi.number(),
    hasGraduated:Joi.boolean(),
    isCurrent:Joi.boolean(),
    institute:Joi.object(),
    fromDate:Joi.string(),
    thruDate:Joi.string().allow('').allow(null),
    district:Joi.string().allow(''),
    city:Joi.string().allow(''),
    state:Joi.string().allow(''),
    country:Joi.string().allow(''),
  }),
};
const updateCandidateEducation = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    educationId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    _id:Joi.string().optional(),
    fieldOfStudy:Joi.string().custom(objectId),
    degree:Joi.string().allow(''),
    gpa:Joi.number(),
    hasGraduated:Joi.boolean(),
    isCurrent:Joi.boolean(),
    institute:Joi.object(),
    fromDate:Joi.string(),
    thruDate:Joi.string().allow('').allow(null),
    district:Joi.string().allow(''),
    city:Joi.string().allow(''),
    state:Joi.string().allow(''),
    country:Joi.string().allow(''),
  }),
};
const removeCandidateEducation = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    educationId:Joi.string().custom(objectId),
  })
};


const getCandidateSkills = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
  })
};
const updateCandidateSkills = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    skills:Joi.array()
  }),
};
const addCandidateSkill = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    experienceId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    skill:Joi.string().custom(objectId),
    name:Joi.string(),
    noOfMonths:Joi.number().allow(null),
    rating:Joi.number(),
  }),
};
const updateCandidateSkill = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    skillId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    skill:Joi.string().custom(objectId),
    noOfMonths:Joi.number().allow(null),
    rating:Joi.number(),
  }),
};
const removeCandidateSkill = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    skillId:Joi.string().custom(objectId),
  })
};



const getCandidateNotes = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  })
};
const addCandidateNote = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    message:Joi.string()
  }),
};
const updateCandidateNote = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    noteId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    message:Joi.string()
  }),
};
const removeCandidateNote = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    noteId:Joi.string().custom(objectId),
  })
};
const addCandidateTag = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    tags:Joi.array()
  }),
};
const addTagsToMultipleCandidates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    candidateIds: Joi.array().items(Joi.string().custom(objectId)).required(),
    tags: Joi.array().required()
  }),
};
const removeCandidateTag = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    tagId:Joi.string().custom(objectId),
  })
};

const addCandidateSources = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    sources:Joi.array()
  }),
};
const removeCandidateSource = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    sourceId:Joi.string().custom(objectId),
  })
};


const getCandidateReferences = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
  })
};
const addCandidateReference = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    experienceId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    email:Joi.string().optional().allow(''),
    phone:Joi.string().optional().allow(''),
    title:Joi.string().optional().allow(''),
    company:Joi.string().optional().allow(''),
    relationship:Joi.string().optional().allow(''),
  }),
};
const updateCandidateReference = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    referenceId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    email:Joi.string().optional().allow(''),
    phone:Joi.string().optional().allow(''),
    title:Joi.string().optional().allow(''),
    company:Joi.string().optional().allow(''),
    relationship:Joi.string().optional().allow(''),
  }),
};
const removeCandidateReference = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    referenceId:Joi.string().custom(objectId),
  })
};


const getCandidateEvaluations = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
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
    stages:Joi.array(),
    internal:Joi.boolean().optional(),
    external:Joi.boolean().optional()
  }),
};
const getCandidateEvaluationsStats = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    type:Joi.string().allow(''),
    companyId:Joi.number().integer().allow(null),
    applicationId:Joi.string().allow('').allow(null),
    stages:Joi.array(),
    internal:Joi.boolean().optional(),
    external:Joi.boolean().optional()
  }),
};
const getCandidateEvaluationById = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    evaluationId:Joi.string().custom(objectId),
  })
};

const getCandidatesSimilar = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
  })
};

const getCandidatesFlagged = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    query: Joi.string().allow('').optional(),
    direction: Joi.string(),
    sort: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer()
  }),
};


const checkCandidateEmail = {
  params: Joi.object().keys({
    companyId:Joi.number().integer()
  })
};

const getCandidateComments = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
};

const addCandidateComment = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    message:Joi.string()
  }),
}

const updateCandidateComment = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    commentId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    message:Joi.string()
  }),
};

const deleteCandidateComment = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    commentId:Joi.string().custom(objectId),
  }),
};

const addReactionToCandidateCommentById = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
    commentId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reactionType: Joi.string().valid('', ...Object.values(reactionTypeEnum)).required(),
  }),
};

const getCandidateActivities = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string(),
    type: Joi.string(),
  }),
};

const searchPeopleSuggestions = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    jobTitles: Joi.array().optional(),
    locations: Joi.array().optional(),
    skills: Joi.array().optional(),
    companies: Joi.array().optional(),
    schools: Joi.array().optional(),
    industry: Joi.array().optional(),
    district: Joi.array().optional(),
    city: Joi.array().optional(),
    state: Joi.array().optional(),
    country: Joi.array().optional(),
    level: Joi.array().optional(),
    sort: Joi.string().optional(),
    min: Joi.number().optional().integer(),
    max: Joi.number().optional().integer(),
  }),
};

const searchApplications = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    createdBy:Joi.array(),
    level:Joi.array(),
    district:Joi.array(),
    city:Joi.array(),
    state:Joi.array(),
    country:Joi.array(),
    locations:Joi.array(),
    company:Joi.array(),
    employmentType:Joi.array(),
    industry:Joi.array(),
    tags:Joi.array(),
    jobTitles:Joi.array(),
    jobs:Joi.array(),
    pool:Joi.array(),
    ratings:Joi.array(),
    minRating: Joi.number().optional(),
    maxRating: Joi.number().optional(),
    sources:Joi.array(),
    skills:Joi.array().optional(),
    stages:Joi.array(),
    status:Joi.array(),
    department:Joi.array(),
    distances:Joi.array(),
    endingSoonTimeLeft:Joi.number().integer(),
    minYear: Joi.number(),
    maxYear: Joi.number(),
    hasFollowed: Joi.boolean().optional(),
    noOfMonthExperiences: Joi.array().optional(),
    openForWork:Joi.boolean().allow(null).optional(),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
};

const shortlistApplications = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    applications:Joi.array(),
  }),
};
const removeShortlistApplications = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    applications:Joi.array(),
  }),
};
const addApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    jobId:Joi.string().custom(objectId),
    user:Joi.string().custom(objectId),
    token:Joi.string().optional().allow(''),
    firstName:Joi.string(),
    lastName:Joi.string(),
    phoneNumber:Joi.string(),
    email:Joi.string(),
    availableDate:Joi.number().optional().allow(null),
    source:Joi.string().optional().allow(''),
    desiredSalary:Joi.number().optional().allow(null),
    currency:Joi.string().optional().allow(''),
    coverLetter:Joi.string().optional().allow(''),
  }),
};


const getAllApplicationsEndingSoon = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    jobId:Joi.string().custom(objectId),
    user:Joi.string().custom(objectId),
    token:Joi.string().optional().allow(''),
    firstName:Joi.string(),
    lastName:Joi.string(),
    phoneNumber:Joi.string(),
    email:Joi.string(),
    availableDate:Joi.number().optional().allow(null),
    source:Joi.string().optional().allow(''),
    desiredSalary:Joi.number().optional().allow(null),
    currency:Joi.string().optional().allow(''),
    coverLetter:Joi.string().optional().allow(''),
  }),
};

const getAllApplicationsNewlyCreated = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    jobId:Joi.string().custom(objectId),
    user:Joi.string().custom(objectId),
    token:Joi.string().optional().allow(''),
    firstName:Joi.string(),
    lastName:Joi.string(),
    phoneNumber:Joi.string(),
    email:Joi.string(),
    availableDate:Joi.number().optional().allow(null),
    source:Joi.string().optional().allow(''),
    desiredSalary:Joi.number().optional().allow(null),
    currency:Joi.string().optional().allow(''),
    coverLetter:Joi.string().optional().allow(''),
  }),
};


const getApplicationById = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
    applicationId:Joi.string().custom(objectId),
  })
};
const disqualifyApplications = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reason:Joi.string(),
    applications:Joi.array().items(Joi.string().custom(objectId)),
  }),
};
const disqualifyApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
    applicationId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reason:Joi.string()
  }),
};
const revertApplications = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    applications:Joi.array().items(Joi.string().custom(objectId)),
  }),
};
const revertApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
    applicationId:Joi.string().custom(objectId),
  })
};
const deleteApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
    applicationId:Joi.string().custom(objectId),
  })
};
const acceptApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
    applicationId:Joi.string().custom(objectId),
  })
};
const rejectApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId),
    applicationId:Joi.string().custom(objectId),
  })
};


const updateApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    jobId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    jobId:Joi.string().custom(objectId),
    user:Joi.string().custom(objectId),
    token:Joi.string().optional().allow(''),
    firstName:Joi.string(),
    lastName:Joi.string(),
    phoneNumber:Joi.string(),
    email:Joi.string(),
    availableDate:Joi.number().optional().allow(null),
    source:Joi.string().optional().allow(''),
    desiredSalary:Joi.number().optional().allow(null),
    currency:Joi.string().optional().allow(''),
    coverLetter:Joi.string().optional().allow(''),
  }),
};
const updateApplicationProgress = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    newStage:Joi.string()
  }),
};
const getApplicationProgress = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
    progressId:Joi.string().custom(objectId)
  })
};
const getApplicationQuestions = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  })
};
const getApplicationEvaluations = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  })
};
const addApplicationEvaluation = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    rating:Joi.number(),
    comment:Joi.string(),
    assessment:Joi.object(),
    evaluationForm:Joi.array(),
  }),
};
const updateApplicationEvaluation = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
    evaluationId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    rating:Joi.number(),
    comment:Joi.string(),
    assessment:Joi.object(),
    evaluationForm:Joi.array(),
  }),
};
const removeApplicationEvaluation = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
    evaluationId:Joi.string().custom(objectId)
  })
};
const getApplicationEmails = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  })
};
const getApplicationLabels = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  })
};
const addApplicationLabel = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    jobId:Joi.string().custom(objectId),
    user:Joi.string().custom(objectId),
    token:Joi.string().optional().allow(''),
    firstName:Joi.string(),
    lastName:Joi.string(),
    phoneNumber:Joi.string(),
    email:Joi.string(),
    availableDate:Joi.number().optional().allow(null),
    source:Joi.string().optional().allow(''),
    desiredSalary:Joi.number().optional().allow(null),
    currency:Joi.string().optional().allow(''),
    coverLetter:Joi.string().optional().allow(''),
  }),
};
const deleteApplicationLabel = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
    labelId:Joi.string().custom(objectId),
  }),
};
const getApplicationComments = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
};

const addApplicationComment = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    message:Joi.string()
  }),
};
const updateApplicationComment = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
    commentId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    message:Joi.string()
  }),
};
const deleteApplicationComment = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
    commentId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    message:Joi.string()
  }),
};
const updateApplicationProgressEvent = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    message:Joi.string()
  }),
};
const subscribeApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  })
};
const unsubscribeApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId)
  })
};
const getApplicationActivities = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
};
const uploadApplication = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    file:Joi.any(),
    photo:Joi.any().optional()
  }),
};
const getFiles = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
  })
};
const removeApplicationFile = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    applicationId:Joi.string().custom(objectId),
    fileId:Joi.string().custom(objectId),
  })
};

const updateCandidatePool = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    pools:Joi.array()
  }),
};


const searchSources = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    openForWork: Joi.boolean(),
    createdBy: Joi.array(),
    city: Joi.array(),
    state: Joi.array(),
    country: Joi.array(),
    company: Joi.array(),
    department: Joi.array(),
    distances: Joi.array(),
    district: Joi.array(),
    endingSoonTimeLeft: Joi.number().integer(),
    employmentType: Joi.array(),
    industry: Joi.array(),
    jobs: Joi.array(),
    jobTitles: Joi.array(),
    level: Joi.array(),
    locations: Joi.array(),
    pool: Joi.array(),
    ratings: Joi.array(),
    skills: Joi.array(),
    sources: Joi.array(),
    stages: Joi.array(),
    status: Joi.array(),
    tags: Joi.array(),
    minYear: Joi.number(),
    maxYear: Joi.number(),
  }),
};

const removeSources = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    sources: Joi.array().items(Joi.string().custom(objectId)),
  })
};
const addInterest = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
};

const getBenefits = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
};
const updateBenefits = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    benefits: Joi.array().items(Joi.string()),
  }),
};
const getQuestions = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    direction: Joi.string(),
    sortBy: Joi.string(),
  }),
};
const getDefaultQuestions = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  })
};
const addQuestion = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    text: Joi.string().required(),
    target: Joi.object().keys({
      type: Joi.string().optional().allow(''),
      option: Joi.string().optional().allow(''),
    }).optional().allow(null),
  }),
};

const getQuestion = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
    questionId:Joi.string().custom(objectId),
  })
};

const getCompanyLatestJobs = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
};

const getCompanyJobs = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    level: Joi.array(),
    city: Joi.array(),
    state: Joi.array(),
    country: Joi.array(),
    company: Joi.array(),
    employmentType: Joi.array(),
    jobFunction: Joi.array(),
    industry: Joi.array(),
    tags: Joi.array(),
    category: Joi.array(),
    rating: Joi.array(),
    status: Joi.array(),
    datePosted: Joi.string(),
    companySize: Joi.array(),
    distance: Joi.array(),
    isPromoted: Joi.boolean(),
    workFromHome: Joi.string(),
    sortBy: Joi.string(),
  }),
  query: Joi.object().keys({
    query:Joi.string().optional().allow(''),
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};
const getCompanyJobsJobFunctions = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
};

// QUESTION TEMPLATES
const getCompanyQuestionTemplates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};
const getCompanyQuestionTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    questionTemplateId:Joi.string().custom(objectId)
  })
};
const addCompanyQuestionTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    questionTemplateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    required:Joi.boolean(),
    questions:Joi.array(),
  }),
}
const updateCompanyQuestionTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    questionTemplateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    required:Joi.boolean(),
    questions:Joi.array(),
  }),
};
const deleteCompanyQuestionTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    questionTemplateId:Joi.string().custom(objectId)
  }),
};
const deactivateCompanyQuestionTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    questionTemplateId:Joi.string().custom(objectId)
  }),
};
const activateCompanyQuestionTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    questionTemplateId:Joi.string().custom(objectId)
  }),
};

// PIPELINES
const getCompanyPipelineTemplates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer()
  })
};

const getCompanyPipelineTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    pipelineId:Joi.string().custom(objectId)
  })
};
const addCompanyPipelineTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    required:Joi.boolean(),
    questions:Joi.array(),
  }),
};
const updateCompanyPipelineTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    pipelineId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    _id: Joi.string().custom(objectId),
    pipelineTemplateId: Joi.string().optional(),
    autoRejectBlackList: Joi.boolean().optional(),
    stages: Joi.array().optional(),
    stageMigration: Joi.array().optional(),
  }),
};

const deleteCompanyPipelineTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    pipelineId:Joi.string().custom(objectId)
  }),
};
const deactivateCompanyPipelineTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    pipelineId:Joi.string().custom(objectId)
  }),
};
const activateCompanyPipelineTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    pipelineId:Joi.string().custom(objectId),
    type:Joi.string(),
  }),
};


// EVALUATION TEMPLATES
const getCompanyEvaluationTemplates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    query: Joi.string().allow('').allow(null),
    all: Joi.boolean()
  }),
};
const addCompanyEvaluationTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    required:Joi.boolean(),
    questions:Joi.array(),
  }),
};
const getCompanyEvaluationTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  })
};
const updateCompanyEvaluationTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    required:Joi.boolean(),
    questions:Joi.array(),
  }),
};
const deleteCompanyEvaluationTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  }),
};
const deactivateCompanyEvaluationTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  }),
};
const activateCompanyEvaluationTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  }),
};
const getEvaluationFilters = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
};

// EMAIL TEMPLATES
const getCompanyEmailTemplates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer()
  })
};
const addCompanyEmailTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    subject:Joi.string(),
    bodyHtml:Joi.string(),
  }),
};
const getCompanyEmailTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  })
};
const updateCompanyEmailTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    subject: Joi.string(),
    bodyHtml: Joi.string(),
  }),
};

const deleteCompanyEmailTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  }),
};
const deactivateCompanyEmailTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  }),
};
const activateCompanyEmailTemplate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId),
    type:Joi.string(),
  }),
};


// SIGNATURE
const getCompanyEmailSignatures = {
  params: Joi.object().keys({
    companyId:Joi.number().integer()
  })
};
const addCompanyEmailSignature = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    subject:Joi.string(),
    bodyHtml:Joi.string(),
  }),
};
const getCompanyEmailSignature = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  })
};
const updateCompanyEmailSignature = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    subject: Joi.string(),
    bodyHtml: Joi.string(),
  }),
};

const deleteCompanyEmailSignature = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    templateId:Joi.string().custom(objectId)
  }),
};

const searchContacts = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    query: Joi.string().allow('').required(),
    includes: Joi.string().allow('').optional(),
  }),
};
const searchTasks = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
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


const getCompanyPools = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    query: Joi.string().allow(''),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string(),
    candidateId: Joi.string().custom(objectId).allow('').allow(null),
    id: Joi.number().integer().allow(null).allow(''),
  }),
};
const addCompanyPool = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    description:Joi.string().allow(''),
    candidates:Joi.array()
  }),
};
const getCompanyPoolById = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
    poolId:Joi.string().custom(objectId),
  })
};
const updateCompanyPool = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    poolId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name:Joi.string(),
    description:Joi.string().allow(''),
    candidates:Joi.array(),
  }),
};
const deleteCompanyPool = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    poolId:Joi.string().custom(objectId),
  })
};
const getPoolCandidates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    poolId:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    query: Joi.string().allow(''),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string(),
  }),
};
const addPoolCandidates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    poolId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    candidates: Joi.array()
  }),
};
const removePoolCandidate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    poolId:Joi.string().custom(objectId),
    candidateId:Joi.string().custom(objectId),
  })
};

const removePoolCandidates = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    poolId:Joi.string().custom(objectId),
    candidateId:Joi.string().custom(objectId),
  })
};


const getCompanyLatestSalaries = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
};
const getCompanySalaries = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    employmentTitle:Joi.string().allow('').optional(),
    yearsExperience: Joi.string().allow('').optional(),
    jobFunction: Joi.string().allow('').optional(),
    jobFunctions: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    direction: Joi.string().allow('').optional(),
    directions: Joi.string().allow('').optional(),
    sortBy: Joi.string().allow('').optional(),
    sortyBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCompanySalaryLocations = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    query:Joi.string().optional().allow(''),
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};


const getCompanySalariesJobFunctions = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    employmentTitle:Joi.string(),
    city:Joi.string().optional().allow(''),
    state:Joi.string().optional().allow(''),
    country:Joi.string().optional().allow(''),
  }),
};


const getCompanySalaryGroupByGender = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
    salaryId:Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    employmentTitle:Joi.string(),
    city:Joi.string().optional().allow(''),
    state:Joi.string().optional().allow(''),
    country:Joi.string().optional().allow(''),
  }),
};

const addSalaryReaction = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
    salaryId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    employmentTitle:Joi.string(),
    city:Joi.string().optional().allow(''),
    state:Joi.string().optional().allow(''),
    country:Joi.string().optional().allow(''),
  }),
};
const getCompanySalaryEmploymentTitles = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    employmentTitle:Joi.string(),
    city:Joi.string().optional().allow(''),
    state:Joi.string().optional().allow(''),
    country:Joi.string().optional().allow(''),
  }),
};


const getCompanySalaryByEmploymentTitle = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  query: Joi.object().keys({
    employmentTitle:Joi.string(),
    city:Joi.string().optional().allow(''),
    state:Joi.string().optional().allow(''),
    country:Joi.string().optional().allow(''),
  }),
};

const addNewSalary = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    company: Joi.number(),
    employmentTitle: Joi.string(),
    employmentType: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    currency: Joi.string(),
    basePayPeriod: Joi.string(),
    yearsExperience: Joi.string(),
    baseSalary: Joi.number(),
    cashBonus: Joi.number().optional().allow(null),
    stockBonus: Joi.number().optional().allow(null),
    profitSharing: Joi.number().optional().allow(null),
    commision: Joi.number().optional().allow(null),
    tip: Joi.number().optional().allow(null),
    gender: Joi.string().optional().allow(null),

  }),
};

const getCompanyReviews = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    datePosted: Joi.string().allow('').optional(),
    workFromHome: Joi.string().allow('').optional(),
    sortBy: Joi.string().allow('').optional(),
    isPromoted: Joi.boolean(),
    city: Joi.array(),
    state: Joi.array(),
    country: Joi.array(),
    employmentType: Joi.array(),
    category: Joi.array(),
    company: Joi.array(),
    companySize: Joi.array(),
    level: Joi.array(),
    distance: Joi.array(),
    industry: Joi.array(),
    jobFunction: Joi.array(),
    rating: Joi.array(),
    status: Joi.array(),
    tags: Joi.array(),
  }),
  query: Joi.object().keys({
    query:Joi.string().optional().allow(''),
    direction: Joi.string(),
    sortBy: Joi.string(),
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    city: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
  }),
};


const getCompanyReviewStats = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
};

const reportReviewById = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
    companyReviewId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reason: Joi.array().required(),
    note: Joi.string().required(),
  }),
};
const addReview = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
  }),
  body: Joi.object().keys({
    reviewTitle: Joi.string(),
    rating: Joi.number(),
    employmentTitle: Joi.string(),
    employmentType: Joi.string(),
    recommendCompany: Joi.boolean(),
    approveCEO: Joi.boolean(),
    isCurrentEmployee: Joi.boolean(),
    noOfMonthsEmployment: Joi.number().optional(),
    currency: Joi.string(),
    pros: Joi.array(),
    cons: Joi.array(),
    advices: Joi.array(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    overall: Joi.number().required(),
    careerOpportunity: Joi.number().optional(),
    compensationAndBenefits: Joi.number().optional(),
    culture: Joi.number().optional(),
    diversity: Joi.number().optional(),
    management: Joi.number().optional(),
    workLife: Joi.number().optional(),
  }),
};


const reactionToCompanyReviewById = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
    reviewId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reactionType: Joi.string(),
  }),
};

const removeReactionToCompanyReviewById = {
  params: Joi.object().keys({
    id:Joi.number().integer(),
    reviewId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reactionType: Joi.string(),
  }),
};



const getCompanyTopReviews = {};


const getNotificationPreference = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    memberId:Joi.string().custom(objectId),
  })
};

const subscribeCandidate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  })
};
const subscribeCandidates = {
  params: Joi.object().keys({
    companyId: Joi.number().integer(),
  }),
  body: Joi.object().keys({
    candidateIds: Joi.array().items(Joi.string().custom(objectId)).required(),
  }),
};
const unsubscribeCandidate = {
  params: Joi.object().keys({
    companyId:Joi.number().integer(),
    candidateId:Joi.string().custom(objectId)
  })
};

module.exports = {
  getInsights,
  searchCompany,
  getCompany,
  register,
  updateCompany,
  uploadCompanyAvatar,
  uploadCompanyCover,
  getInmailCredits,
  getTaxAndFee,
  getImpressionCandidates,
  getDashboard,
  getCompanyJobSummary,
  getCards,
  addPaymentMethod,
  removeCard,
  verifyCard,
  addSubscription,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  getInvoices,
  getCompanyMembers,
  getCompanyMember,
  updateCompanyMember,
  deleteCompanyMember,
  updateCompanyMemberRole,
  uploadMemberAvatar,
  uploadMemberCover,
  leaveCompany,
  inviteMembers,
  getCompanyMemberInvitations,
  cancelMemberInvitation,
  acceptMemberInvitation,
  getCompanyRoles,
  addCompanyRole,
  updateCompanyRole,
  deleteCompanyRole,
  disableCompanyRole,
  enableCompanyRole,
  getCompanyJobCount,
  searchJob,
  lookupJobs,
  searchJobTitle,
  getJobById,
  createJob,
  updateJob,
  closeJob,
  archiveJob,
  unarchiveJob,
  deleteJob,
  shareJobToSocialAccount,
  getJobComments,
  addJobComment,
  addJobTag,
  updateJobTags,
  removeJobTags,
  getJobInsights,
  getJobActivities,
  getJobPipeline,
  updateJobPipeline,
  getJobMembers,
  updateJobMembers,
  subscribeJob,
  unsubscribeJob,
  updateJobApplicationForm,
  getBoard,
  importResumes,
  searchCandidates,
  addCandidate,
  updateCandidateById,
  removeCandidateById,
  removeCandidates,

  getCandidatePreferences,

  getCandidateExperiences,
  addCandidateExperience,
  updateCandidateExperience,
  removeCandidateExperience,
  getCandidateEducations,
  addCandidateEducation,
  updateCandidateEducation,
  removeCandidateEducation,
  getCandidateSkills,
  updateCandidateSkills,
  addCandidateSkill,
  updateCandidateSkill,
  removeCandidateSkill,
  getCandidateNotes,
  addCandidateNote,
  updateCandidateNote,
  removeCandidateNote,
  addCandidateTag,
  addTagsToMultipleCandidates,
  removeCandidateTag,
  addCandidateSources,
  removeCandidateSource,
  getCandidateReferences,
  addCandidateReference,
  updateCandidateReference,
  removeCandidateReference,
  getCandidateEvaluations,
  getCandidateEvaluationsStats,
  getCandidateEvaluationById,
  getCandidatesSimilar,
  getCandidatesFlagged,
  checkCandidateEmail,
  getCandidateComments,
	addCandidateComment,
	updateCandidateComment,
	deleteCandidateComment,
  addReactionToCandidateCommentById,
  getCandidateActivities,
  searchPeopleSuggestions,

  searchApplications,
  shortlistApplications,
  removeShortlistApplications,
  addApplication,
  getAllApplicationsEndingSoon,
  getAllApplicationsNewlyCreated,
  getApplicationById,
  disqualifyApplication,
  disqualifyApplications,
  revertApplications,
  revertApplication,
  deleteApplication,
  acceptApplication,
  rejectApplication,
  updateApplication,
  updateApplicationProgress,
  getApplicationProgress,
  getApplicationQuestions,
  getApplicationEvaluations,
  addApplicationEvaluation,
  updateApplicationEvaluation,
  removeApplicationEvaluation,
  getApplicationEmails,
  getApplicationLabels,
  addApplicationLabel,
  deleteApplicationLabel,
  getApplicationComments,
  addApplicationComment,
  updateApplicationComment,
  deleteApplicationComment,
  subscribeApplication,
  unsubscribeApplication,
  getApplicationActivities,
  uploadApplication,
  getFiles,
  removeApplicationFile,
  updateCandidatePool,

  searchSources,
  removeSources,

  addInterest,
  getBenefits,
  updateBenefits,
  getQuestions,
  getDefaultQuestions,
  addQuestion,
  getQuestion,
  getCompanyLatestJobs,
  getCompanyJobs,
  getCompanyJobsJobFunctions,
  getCompanyQuestionTemplates,
  getCompanyQuestionTemplate,
  addCompanyQuestionTemplate,
  updateCompanyQuestionTemplate,
  deleteCompanyQuestionTemplate,
  deactivateCompanyQuestionTemplate,
  activateCompanyQuestionTemplate,
  getCompanyPipelineTemplates,
  getCompanyPipelineTemplate,
  addCompanyPipelineTemplate,
  updateCompanyPipelineTemplate,
  deleteCompanyPipelineTemplate,
  deactivateCompanyPipelineTemplate,
  activateCompanyPipelineTemplate,
  getCompanyEvaluationTemplates,
  addCompanyEvaluationTemplate,
  getCompanyEvaluationTemplate,
  updateCompanyEvaluationTemplate,
  deleteCompanyEvaluationTemplate,
  deactivateCompanyEvaluationTemplate,
  activateCompanyEvaluationTemplate,
  getEvaluationFilters,
  getCompanyEmailTemplates,
  addCompanyEmailTemplate,
  getCompanyEmailTemplate,
  updateCompanyEmailTemplate,
  deleteCompanyEmailTemplate,
  deactivateCompanyEmailTemplate,
  activateCompanyEmailTemplate,
  searchContacts,
  getCompanyEmailSignatures,
  addCompanyEmailSignature,
  getCompanyEmailSignature,
  updateCompanyEmailSignature,
  deleteCompanyEmailSignature,
  searchTasks,
  getCompanyPools,
  addCompanyPool,
  getCompanyPoolById,
  updateCompanyPool,
  deleteCompanyPool,
  getPoolCandidates,
  addPoolCandidates,
  removePoolCandidate,
  removePoolCandidates,


  getCompanySalaries,
  getCompanySalaryLocations,
  getCompanySalariesJobFunctions,
  getCompanySalaryGroupByGender,
  getCompanySalariesJobFunctions,
  addSalaryReaction,
  getCompanySalaryEmploymentTitles,
  getCompanySalaryByEmploymentTitle,
  getCompanyLatestSalaries,
  addNewSalary,
  getCompanyReviews,
  getCompanyReviewStats,
  reportReviewById,
  addReview,
  reactionToCompanyReviewById,
  removeReactionToCompanyReviewById,
  getCompanyTopReviews,

  getNotificationPreference,

  subscribeCandidate,
  unsubscribeCandidate,
  subscribeCandidates
};
