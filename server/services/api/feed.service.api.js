const ApiClient = require('../apiManager');

const options = { headers: {'userId': null } };
let client = new ApiClient('http://accessed-feed-service.us-west-2.elasticbeanstalk.com/api');
// let client = new ApiClient('http://localhost:5000/api');

async function createJobFeed(jobId, partyType, partyId, text, userId){
  const options = {
    headers: {'userId': userId}
  };

  let data = {};
  data.type = "JOB";
  data.text = text;
  data.policy = {type: partyType, destinationId: partyId};
  data.shareRefId = jobId;
  data.shareRefType = "JOB";

  let response = await client.post(`/feeds`, data, options);
  return response.data.data;

};

async function register(user){
    if(!user){
    return null;
  }

  user.type = "EMAIL";
  let response = await client.post(`/user/register`, user, null);
  return response.data
};



async function registerCompany(userId, form){
  if(!userId || !form){
    return null;
  }

  const options = {
    headers: {'userId': userId}
  };


  let response = await client.post(`/company/register`, form, options);
  return response.data.data;
};


async function updateCompany(id, userId, form){
  if(!id || !userId || !form){
    return null;
  }

  const options = {
    headers: {'userId': userId}
  };


  let response = await client.put(`/company/${id}`, form, options);
  return response.data.data;
};

async function uploadCompanyAvatar(id, userId, file){
  if(!id || !userId || !file){
    return null;
  }

  const options = {
    headers: {'userId': userId},
    'content-type': 'multipart/form-data'
  };


  let response = await client.post(`/company/${id}/upload/avatar`, file, options);
  return response.data.data;
};


async function registerInstitute(userId, form){
  if(!userId || !form){
    return null;
  }

  const options = {
    headers: {'userId': userId}
  };


  let response = await client.post(`/institute/register`, form, options);
  return response.data.data;
};

async function updateInstitute(id, userId, form){
  if(!id || !userId || !form){
    return null;
  }

  const options = {
    headers: {'userId': userId}
  };


  let response = await client.put(`/institute/${id}`, form, options);
  return response.data.data;
};



async function createCompany(company){
  if(!company){
    return null;
  }

  let response = await client.post(`/company/create`, company, null);
  return response.data.data;
};


async function createInstitute(institute){
  if(!institute){
    return null;
  }

  let response = await client.post(`/institute/create`, institute, null);
  return response.data.data;
};

async function syncUserCompanies(userId){
  if(!userId){
    return null;
  }

  const options = {
    headers: {'userId': userId}
  };


  let response = await client.get(`/user/${userId}/party/managed?types=COMPANY,INSTITUTE&roles=ROLE_OWNER,ROLE_ADMIN`, null, options);
  return response.data.data;
};

async function getUserCompaniesOwned(userId){
  if(!userId){
    return null;
  }


  let response = await client.get(`/user/${userId}/company/owned`, null, null);
  return response.data.data;
};

async function getUserCompaniesHasAdminRole(userId){
  if(!userId){
    return null;
  }


  let response = await client.get(`/user/${userId}/company/hasAdminRole`, null, null);
  return response.data.data;
};

async function findUserById(id) {
  let user = null;
  try {
    let response = await client.get(`/user/${id}?isMinimal=true`);
    user = response.data.data;
  } catch(error) {
    console.log("findUserById: error", error);
  }
  return user;
};


async function getUserExperiences(id) {
  let user = null;
  try {
    let response = await client.get(`/user/${id}/experiences`);
    user = response.data.data;
  } catch(error) {
    console.log("getUserExperiences: error", error);
  }
  return user;
};


async function getUserEducations(id) {
  let user = null;
  try {
    let response = await client.get(`/user/${id}/educations`);
    user = response.data.data;
  } catch(error) {
    console.log("getUserEducations: error", error);
  }
  return user;
};

async function getUserSkills(id) {
  let user = null;
  try {
    let response = await client.get(`/user/${id}/skills/list`);
    user = response.data.data;
  } catch(error) {
    console.log("getUserEducations: error", error);
  }
  return user;
};


async function getCurrentUser(id) {
  let user = null;

  const options = {
    headers: {'userId': id}
  };

  try {
    let response = await client.get(`/user/current`, options);
    user = response.data.data;
  } catch(error) {
    console.log("findUserByIdFull: error", error);
  }
  return user;
};

async function findUserByIdFull(id) {
  let user = null;

  const options = {
    headers: {'userId': id}
  };

  try {
    let response = await client.get(`/user/${id}/update`, options);
    user = response.data.data;
  } catch(error) {
    console.log("findUserByIdFull: error", error);
  }
  return user;
};

async function getUserExperienceById(id) {
  let experiences = null;
  try {
    let response = await client.get(`/user/${id}/experiences`);
    experiences = response.data.data;
  } catch(error) {
    console.log("getUserExperienceById: error", error);
  }
  return experiences;
};

async function getUserEmployers(id) {
  let employe
  try {
    let response = await client.get(`/user/${id}/experiences/employers`);
    employers = response.data.data;
  } catch(error) {
    console.log("getUserEmployers: error", error);
  }
  return employers;
};


async function findCompanyById(companyId) {

  let response = await client.get(`/company/${companyId}`, null);

  return response.data.data;
};

async function findInstituteById(instituteId, userId) {

  let response = await client.get(`/institute/${instituteId}`, null);

  return response.data.data;
};


async function findEmployeeById(companyId, employeeId) {
  let response = await client.get(`/company/${companyId}/employees/${employeeId}?source=JOB`, options);

  return response.data.data;
};


async function getCompanyHrMember(id, userId) {
  const options = {
    headers: {'userId': userId}
  };

  let response = await client.get(`/company/${id}/departments/{1}?source=JOB`, options);

  return response.data.data;
};

async function followCompany(id, userId){

  const options = {
    headers: {'userId': userId}
  };
  return await client.post(`/company/${id}/follow`, {}, options);
};


async function followInstitute(id, userId){

  const options = {
    headers: {'userId': userId}
  };
  return await client.post(`/institute/${id}/follow`, {}, options);
};

async function hasFollowed(id, userId){

  const options = {
    headers: {'userId': userId}
  };
  return await client.get(`/company/${id}/hasfollow`, {}, options);
};


async function syncPeople(form) {
  let response = await client.post(`/people/sync`, form, null);
  return response.data.data;
};


async function searchCompany(query, ids, userId){

  const options = {
    headers: {'userId': userId}
  };

  query = query?query:'';
  let res = await client.post(`/search/all?type=COMPANY&query=${query}`, {ids: ids}, options);
  return res.data.data;
};

async function searchPopularCompany(query){

  let res = await client.get(`/company/popular?query=${query}`);
  return res.data.data;
};

async function findUserSkillsById(id) {
  let response = await client.get(`/user/${id}/skills/all`);
  return response.data.data;
};

async function findSkillsById(ids) {
  if(!ids){
    return;
  }

  let response = await client.get(`/common/skills/search?query=&id=${ids}`);
  return response.data.data;
};

async function findCategoryById(id, isMinimal) {
  let response = await client.get(`/categories/${id}?isMinimal=${isMinimal}`);
  return response.data.data;
};


async function findCategoryByShortCode(shortCode, locale) {
  const options = {
    'Accept-Language': locale
  };
  let response = await client.get(`/categories/shortcode/${shortCode}?isMinimal=true`, options);
  return response.data.data;
};


async function findCategoryByType(type, locale) {
  const options = {
    'Accept-Language': locale
  };
  let response = await client.get(`/categories/list?query=&type=${type}`, options);
  return response.data.data;
};


async function findIndustry(query, shortCodes, locale) {
  const options = {
    'Accept-Language': locale
  };
  query = query?query:'';
  let response = await client.get(`/common/industry/search?query=${query}&shortCodes=${shortCodes}`);
  return response.data.data;
};

async function getIndustryFeatured(locale) {
  const options = {
    'Accept-Language': locale
  };
  let response = await client.get(`/common/industry/feature}`);
  return response.data.data;
};

async function findJobfunction(query, shortCodes, locale) {
  const options = {
    'Accept-Language': locale
  };
  let response = await client.get(`/common/jobfunction/search?query=${query}&shortCodes=${shortCodes}`);
  return response.data.data;
};

async function searchUsers(userId, query, ids) {
  const requestBody = {
    "ids": ids,
    "city": [],
    "state": [],
    "country":[],
    "rating": []
  };

  const options = {
    headers: {'userId': userId}
  };

  let response = await client.post(`/search/users/all?query=${query}`, requestBody, options);
  return response.data.data;
};


async function searchPeople(filter, params) {

  params = new URLSearchParams(params).toString();
  let response = await client.post(`/people/search?${params}`, filter, null);
  return response.data.data;
};

async function searchPeopleByIds(userId, query, ids, sort) {
  const requestBody = {
    "ids": ids,
    "city": [],
    "state": [],
    "country":[],
    "rating": []
  };

  const options = {
    headers: {'userId': userId}
  };

  let response = await client.post(`/people/search?query=${query}`, requestBody, options);
  return response.data.data;
};



async function lookupUserIds(ids) {
  let response = await client.get(`/search/users/lookup?ids=${ids}`, null, options);
  return response.data.data;
};


async function lookupPeopleIds(ids) {
  let response = await client.get(`/people/lookup?ids=${ids}`, null, options);
  return response.data.data;
};


async function lookupCandidateIds(ids) {
  let response = await client.get(`/people/candidates/lookup?ids=${ids}`, null, options);
  return response.data.data;
};


async function lookupContacts(ids, type) {
  let response = await client.get(`/people/contacts/lookup?ids=${ids.join(',')}&type=${type}`, null, options);
  return response.data.data;
};


async function lookupCompaniesIds(ids) {
  let response = await client.get(`/search/company/lookup?ids=${ids}`, null, options);
  return response.data.data;
};


async function lookupInstituteIds(ids) {
  console.log(ids)
  let response = await client.get(`/search/institute/lookup?ids=${ids}`, null, options);
  return response.data.data;
};

async function findCandidateById(id) {
  let response = await client.get(`/people/candidates/${id}`, null, options);
  return response.data.data;
};



async function syncExperiences(id, experiences){

  const options = {
    headers: {'userId': id}
  };
  return await client.post(`/user/${id}/sync/experiences`, experiences, options);
};




async function createNotification(userId, companyId, notificationType, eventType, meta) {
  const options = {
    headers: {'userId': userId}
  };

  let body = {
    userId:  userId,
    companyId: companyId,
    notificationType: notificationType,
    eventType: eventType,
    meta: meta

  };
  let response = await client.post(`/notifications`, body, options);
  return response.data.data;
};



async function createMessageThread(userId, type, name, members, contentType, contentTypeId, contentMeta) {
  const options = {
    headers: {'userId': userId}
  };

  let body = {
    type:  type,
    members: members,
    contentType: contentType,
    contentTypeId: contentTypeId,
    contentMeta:contentMeta
  };
  let response = await client.post(`/v1/chat/users/${userId}/threads`, body, options);
  return response.data.data;
};



async function getUserLast5Resumes(id) {
  let files = null;
  try {
    let response = await client.get(`/user/${id}/resumes`);
    files = response.data.data;
  } catch(error) {
    console.log("getUserResumes: error", error);
  }
  return files;
};

async function addUserResume(id, name, fileType) {
  let user = null;
  try {
    let response = await client.post(`/user/${id}/folders/_resumes/add?name=${name}&fileType=${fileType}`);
    file = response.data.data;
  } catch(error) {
    console.log("addUserResume: error", error);
  }
  return user;
};

async function getResumeById(userId, id) {
  let data = null;
  try {
    let response = await client.get(`/user/${userId}/resumes/${id}`);
    data = response.data.data;
  } catch(error) {
    console.log("getResumeById: error", error);
  }
  return data;
};

async function getUserLinks(userId) {
  let data = null;
  try {
    let response = await client.get(`/people/${userId}/links`);
    data = response.data.data;
  } catch(error) {
    console.log("getUserLinks: error", error);
  }
  return data;
};

async function updateResumeDefault(userId, id) {
  let data = null;
  try {
    let response = await client.post(`/user/${userId}/resumes/${id}/default`);
    data = response.data.data;
  } catch(error) {
    console.log("getResumeById: error", error);
  }
  return data;
};



module.exports = {
  register:register,
  syncUserCompanies:syncUserCompanies,
  createInstitute:createInstitute,
  createCompany:createCompany,
  registerCompany:registerCompany,
  updateCompany:updateCompany,
  uploadCompanyAvatar:uploadCompanyAvatar,
  registerInstitute:registerInstitute,
  updateInstitute:updateInstitute,
  createNotification:createNotification,
  createMessageThread:createMessageThread,
  getCurrentUser:getCurrentUser,
  findByUserId: findUserById,
  findUserByIdFull:findUserByIdFull,
  findCompanyById: findCompanyById,
  findInstituteById: findInstituteById,
  getUserExperiences:getUserExperiences,
  getUserEducations:getUserEducations,
  getUserSkills:getUserSkills,
  followCompany: followCompany,
  followInstitute: followInstitute,
  hasFollowed:hasFollowed,
  syncPeople:syncPeople,
  searchCompany:searchCompany,
  searchPopularCompany:searchPopularCompany,

  createJobFeed: createJobFeed,

  findSkillsById:findSkillsById,
  findUserSkillsById:findUserSkillsById,
  findIndustry:findIndustry,
  getIndustryFeatured:getIndustryFeatured,
  findJobfunction:findJobfunction,
  searchUsers: searchUsers,
  searchPeople:searchPeople,
  searchPeopleByIds:searchPeopleByIds,
  findCandidateById:findCandidateById,
  lookupUserIds:lookupUserIds,
  lookupPeopleIds:lookupPeopleIds,
  lookupCandidateIds:lookupCandidateIds,
  lookupContacts:lookupContacts,
  lookupCompaniesIds:lookupCompaniesIds,
  lookupInstituteIds:lookupInstituteIds,
  getUserCompaniesHasAdminRole:getUserCompaniesHasAdminRole,
  syncExperiences:syncExperiences,
  getUserEmployers:getUserEmployers,
  findCategoryById:findCategoryById,
  findCategoryByShortCode:findCategoryByShortCode,
  findCategoryByType:findCategoryByType,
  getUserLast5Resumes:getUserLast5Resumes,
  addUserResume:addUserResume,
  getResumeById:getResumeById,
  getUserLinks:getUserLinks,
  updateResumeDefault:updateResumeDefault,
  update(userId, data) {
    return client.put(`/user/${userId}`, data);
  }

}
