const ApiClient = require('../apiManager');

const options = { headers: {'userId': null } };
let client = new ApiClient('http://accessed-feed-service.us-west-2.elasticbeanstalk.com/api');
// let client = new ApiClient('http://localhost:90/api');

async function createJobFeed(jobId, partyId, text, userId){


  let data = {};
  data.type = "JOB";
  data.text = text;
  data.policy = {type: "COMPANY", destinationId: partyId};
  data.shareRefId = jobId;
  data.shareRefType = "JOB";

  options.headers.userId = userId;
  return client.post(`/feeds`, data, options);
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


async function findCompanyById(companyId, userId) {
  const options = {
    headers: {'userId': userId}
  };

  let response = await client.get(`/company/${companyId}`, options);

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

async function hasFollowed(id, userId){

  const options = {
    headers: {'userId': userId}
  };
  return await client.get(`/company/${id}/hasfollow`, {}, options);
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
  let response = await client.get(`/common/skills/search?query=&id=${ids}`);
  return response.data.data;
};

async function findCategoryById(id, isMinimal) {
  let response = await client.get(`/categories/${id}?isMinimal=${isMinimal}`);
  return response.data.data;
};


async function findCategoryByShortCode(shortCode) {
  let response = await client.get(`/categories/shortcode/${shortCode}?isMinimal=true`);
  return response.data.data;
};


async function findIndustry(query, shortCodes, locale) {
  const options = {
    'Accept-Language': locale
  };
  let response = await client.get(`/common/industry/search?query={query}&shortCodes=${shortCodes}`);
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

async function lookupUserIds(ids) {
  let response = await client.get(`/search/users/lookup?ids=${ids}`, null, options);
  return response.data.data;
};

async function syncExperiences(id, experiences){

  const options = {
    headers: {'userId': id}
  };
  return await client.post(`/user/${id}/sync/experiences`, experiences, options);
};




async function createNotification(userId, notificationType, eventType, meta) {
  const options = {
    headers: {'userId': userId}
  };

  let body = {
    userId:  userId,
    notificationType: notificationType,
    eventType: eventType,
    meta: meta

  };
  console.log('createNote', body)
  let response = await client.post(`/notifications`, body, options);
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

module.exports = {
  createNotification:createNotification,
  findByUserId: findUserById,

  findCompanyById: findCompanyById,

  followCompany: followCompany,
  hasFollowed:hasFollowed,
  searchCompany:searchCompany,
  searchPopularCompany:searchPopularCompany,

  createJobFeed: createJobFeed,

  findSkillsById:findSkillsById,
  findUserSkillsById:findUserSkillsById,
  findIndustry:findIndustry,
  findJobfunction:findJobfunction,
  searchUsers: searchUsers,
  lookupUserIds:lookupUserIds,
  syncExperiences:syncExperiences,
  getUserEmployers:getUserEmployers,
  findCategoryById:findCategoryById,
  findCategoryByShortCode:findCategoryByShortCode,
  getUserLast5Resumes:getUserLast5Resumes,
  addUserResume:addUserResume,
  update(userId, data) {
    return client.put(`/user/${userId}`, data);
  }

}
