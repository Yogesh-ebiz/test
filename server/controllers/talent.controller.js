const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
let CustomPagination = require('../utils/custompagination');
let Pagination = require('../utils/pagination');

let JobSearchParam = require('../const/jobSearchParam');
const partyEnum = require('../const/partyEnum');
let statusEnum = require('../const/statusEnum');
let employmentTypeEnum = require('../const/employmentTypeEnum');

const {convertToTalentUser, convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const {lookupUserIds, createJobFeed, followCompany, findSkillsById, findIndustry, findJobfunction, findUserSkillsById, findByUserId, findCompanyById, searchUsers, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');
const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties, populatePerson} = require('../services/party.service');
const {findJobId} = require('../services/jobrequisition.service');
const {findApplicationsByJobId, findApplicationByUserIdAndJobId, findApplicationById, applyJob, findAppliedCountByJobId} = require('../services/application.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');
const {getDepartments, addDepartment} = require('../services/department.service');
const {getPipelines, addPipeline} = require('../services/pipeline.service');
const roleService = require('../services/role.service');
const labelService = require('../services/label.service');


const {findCurrencyRate} = require('../services/currency.service');

const {} = require('../services/company.service');
const JobRequisition = require('../models/jobrequisition.model');
const Application = require('../models/application.model');
const Role = require('../models/role.model');


const invitationSchema = Joi.object({
  createdBy: Joi.number().required(),
  userId: Joi.number().required(),
  email: Joi.string().required(),
  role: Joi.string().required()
});


const departmentSchema = Joi.object({
  name: Joi.string().required(),
  company: Joi.number().required(),
  createdBy: Joi.number().required()
});

const pipelineSchema = Joi.object({
  name: Joi.string().required(),
  department: Joi.number().required(),
  category: Joi.string().required(),
  company: Joi.number().required(),
  stages: Joi.array().required(),
  createdBy: Joi.number()
});

const roleSchema = Joi.object({
  name: Joi.string().required(),
  createdBy: Joi.number().required(),
  company: Joi.number().required(),
  description: Joi.object().required(),
  privileges: Joi.array().required(),
  default: Joi.boolean()
});

const labelSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  company: Joi.number().required()
});


module.exports = {
  getInsights,
  inviteMember,
  getUserSession,
  searchJobs,
  getJobById,
  searchApplications,
  rejectApplication,
  searchCandidates,
  addCompanyDepartment,
  updateCompanyDepartment,
  deleteCompanyDepartment,
  getCompanyDepartments,
  addCompanyPipeline,
  updateCompanyPipeline,
  deleteCompanyPipeline,
  getCompanyPipelines,
  addCompanyRole,
  getCompanyRoles,
  updateCompanyRole,
  deleteCompanyRole,
  addCompanyLabel,
  getCompanyLabels,
  updateCompanyLabel,
  deleteCompanyLabel
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function inviteMember(currentUserId, invitation) {

  if(!currentUserId || !invitation){
    return null;
  }

  let result;
  job = await Joi.validate(job, jobRequisitionSchema, { abortEarly: false });


  return result;

}


async function getUserSession(currentUserId, preferredCompany) {

  if(!currentUserId){
    return null;
  }


  let result;
  let user = await findByUserId(currentUserId);
  let companies = await searchCompany('', [25, 100, 101, 102], currentUserId);
  let role = await Role.findOne({name: 'Administrator'});
  delete role.description;
  delete role.company;

  companies = _.reduce(companies.content, function(res, item){
    item = convertToCompany(item);
    item.role = role;
    res.push(item)

    return res;
  }, [])
  user = convertToTalentUser(user);
  user.company = companies;
  user.currentCompanyId = preferredCompany? _.some(companies, {id: preferredCompany})?preferredCompany:companies.length?companies[0].id:null:companies.length?companies[0].id:null;
  user.timezone = "Asia/Ho_Chi_Minh";
  user.timeFormat = 24;


  return user;

}


async function getCompanies(currentUserId) {

  if(currentUserId==null){
    return null;
  }

  let company = await findCompanyById(companyId, currentUserId);


  const loadPromises = result.docs.map(job => {

    job.company = convertToCompany(company);
    return job;
  });
  // result = await Promise.all(loadPromises);

  return new Pagination(result);

}


async function getInsights(currentUserId, companyId, timeframe) {


  console.log(currentUserId, companyId)
  if(!currentUserId || !companyId){
    return null;
  }


  let data = [];
  let min = 10, max = 100;
  let numOfItems = timeframe=='3M'?12:timeframe=='6M'?24:timeframe=='1Y'?52:30;

    for(var i=0; i<4; i++){
      let sample = [];
      for(var j=0; j<numOfItems; j++){
        let random = getRandomInt(min, max);
        min = random - 10;
        max = random + 10;
        sample.push(random);
      }
      data.push(sample);
    }

  let result = {
    impressions: [
      {
        type: 'VIEWED',
        data: data[0],
        total: getRandomInt(1, 2000),
        changes: getRandomInt(1,100)
      },
      {
        type: 'APPLIED',
        data: data[1],
        total: getRandomInt(1, 2000),
        changes: getRandomInt(1,100)
      },
      {
        type: 'LIKED',
        data: data[2],
        total: getRandomInt(1, 2000),
        changes: getRandomInt(1,100)
      },
      {
        type: 'SHARED',
        data: data[3],
        total: getRandomInt(1, 2000),
        changes: getRandomInt(1,100)
      }
    ],
    impressionByRoles: [
      {
        name: 'Senior',
        value: 85.7
      },
      {
        name: 'Entry',
        value: 14.9
      },
      {
        name: 'Director',
        value: 12.3
      },{
        name: 'Owner',
        value: 11.9
      },
      {
        name: 'Other',
        value: 11.9
      },
      {
        name: 'Manager',
        value: 9
      },
      {
        name: 'VP',
        value: 7.9
      },
      {
        name: 'CXO',
        value: 5.6
      }
    ],
    newCandidates: [
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Chan",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_5_1603790757692.jpg",
        "id": 5,
        "headline": "I am Chan Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Chan",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_5_1603790757692.jpg",
        "id": 5,
        "headline": "I am Chan Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Chan",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_5_1603790757692.jpg",
        "id": 5,
        "headline": "I am Chan Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Chan",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_5_1603790757692.jpg",
        "id": 5,
        "headline": "I am Chan Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Chan",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_5_1603790757692.jpg",
        "id": 5,
        "headline": "I am Chan Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Winnie",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_7_1603790822635.jpg",
        "id": 7,
        "headline": "I am Winnie Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Winnie",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_7_1603790822635.jpg",
        "id": 7,
        "headline": "I am Winnie Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Winnie",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_7_1603790822635.jpg",
        "id": 7,
        "headline": "I am Winnie Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Winnie",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_7_1603790822635.jpg",
        "id": 7,
        "headline": "I am Winnie Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Winnie",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_7_1603790822635.jpg",
        "id": 7,
        "headline": "I am Winnie Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Winnie",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_7_1603790822635.jpg",
        "id": 7,
        "headline": "I am Winnie Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Winnie",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_7_1603790822635.jpg",
        "id": 7,
        "headline": "I am Winnie Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Pete",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_12_1603912315336.jpg",
        "id": 12,
        "headline": "I am Pete nhe ban",
        "matches": 50
      }
    ]
  }





  return result;

}

async function searchJobs(currentUserId, companyId, filter, locale) {

  if(currentUserId==null || companyId==null){
    return null;
  }

  let select = '';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;


  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  filter.company = companyId;
  let company = await findCompanyById(companyId, currentUserId);


  let result = await JobRequisition.paginate(new JobSearchParam(filter), options);

  const loadPromises = result.docs.map(job => {

    job.company = convertToCompany(company);
    return job;
  });
  // result = await Promise.all(loadPromises);

  return new Pagination(result);

}


async function getJobById(currentUserId, jobId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    job = await findJobId(jobId, locale);

    if(job) {;

      let jobSkills = await findSkillsById(job.skills);
      // console.log('jobSkils', jobSkills)

      let noApplied = await findAppliedCountByJobId(job.jobId);
      job.noApplied = noApplied;

      let employmentType = await getEmploymentTypes(_.map(job, 'employmentType'), locale);
      job.employmentType = employmentType[0];

      let experienceLevel = await getExperienceLevels(_.map(job, 'level'), locale);
      job.level = experienceLevel[0];

      let industry = await findIndustry('', job.industry, locale);
      job.industry = industry;

      let jobFunction = await findJobfunction('', job.jobFunction, locale);
      job.jobFunction = jobFunction;

      if(job.promotion){
        let promotion = await findPromotionById(job.promotion);
        job.promotion = promotion[0];
      }

      let users  = await lookupUserIds(job.panelist.concat(job.createdBy));
      job.createdBy = _.find(users, {id: job.createdBy});
      job.panelist = _.reject(users, {id: job.createdBy});;

      let currentParty, partySkills=[];

      job.skills = jobSkills;
      job.jobFunction=jobFunction[0];


    }

  } catch (error) {
    console.log(error);
  }

  return job;
}


async function searchApplications(currentUserId, jobId, filter, locale) {

  if(currentUserId==null || jobId==null){
    return null;
  }

  let applications = await findApplicationsByJobId(jobId, filter);

  let userIds = _.map(applications, 'partyId');
  let users = await lookupUserIds(userIds);

  applications.forEach(function(app){
    let user = _.find(users, {id: app.partyId});
    if(user){
      app.user = user;
    }
  })

  return applications;


}


async function updateApplication(currentUserId, jobId, applicationId, newStatus) {

  if(!jobId || !applicaitonId || !currentUserId || !newStatus){
    return null;
  }

  let application;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    application = await findApplicationById(applicationId, locale);

    if(application) {




    }

  } catch (error) {
    console.log(error);
  }

  return application;
}


async function rejectApplication(currentUserId, jobId, applicationId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    job = await findApplicationById(applicationId, locale);

    if(job) {;




    }

  } catch (error) {
    console.log(error);
  }

  return job;
}




async function searchCandidates(currentUserId, filter, locale) {

  if(!currentUserId || !filter){
    return null;
  }

  let result;
  let select = '';
  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;

  let options = {
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  // let company = await findCompanyById(companyId, currentUserId);


  let jobs = await JobRequisition.find(new JobSearchParam(filter));
  let jobIds = _.map(jobs, 'jobId');


  // result = await Application.paginate({ $text: { $search: foundJob.title, $diacriticSensitive: true, $caseSensitive: false } } , options);

  var myAggregate = Application.aggregate([ {$group:{_id:{partyId:'$partyId'}, applications: {$push: '$$ROOT'}}}, {$project: {_id: 0, userId: '$_id.partyId', applications: '$applications'}} ]);

  result = await Application.aggregatePaginate(myAggregate , options);
  let userIds = _.map(result.docs, 'userId');
  let users = await lookupUserIds(userIds)

  let loadPromises = result.docs.map(function(user){
      let foundUser = _.find(users, {id: user.userId})
      if(foundUser){
        foundUser.noOfMonthExperiences = 68;
        foundUser.level = 'SENIOR'
        foundUser.match = 87;

        let isNew = _.some(user.applications, function(application){
          let appliedDate = new Date(application.createdDate);
          var timeStamp = Math.round(new Date().getTime() / 1000);
          var timeStampYesterday = timeStamp - (24 * 3600);
          var is24 = appliedDate >= new Date(timeStampYesterday*1000).getTime();
          return is24;
        });

        foundUser.isNew = isNew;

        foundUser.applications = user.applications.map(function(app){
          // let job = await JobRequisition.findOne({jobId: app.jobId});
          app.jobTitle = "Senior iOS Developer";
          app.progress = {
            title: 'INTERVIEWED',
            status: 'FAILED'
          }
          return app;
        });
        return foundUser;
      }
  });
  result.docs = await Promise.all(loadPromises);

  return new Pagination(result);

}


/************************** DEPARTMENTS *****************************/
async function addCompanyDepartment(company, currentUserId, form) {
  form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await addDepartment(form);
    }
  } catch(e){
    console.log('addCompanyDepartment: Error', e);
  }


  return result
}

async function updateCompanyDepartment(company, departmentId, currentUserId, form) {
  form = await Joi.validate(form, departmentSchema, { abortEarly: false });
  if(!company || !currentUserId || !departmentId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let department = await Department.findById(departmentId);
      if(department){
        department.name = form.name;
        department.updatedBy = currentUserId;
        result = await department.save();
      }

    }
  } catch(e){
    console.log('updateCompanyDepartment: Error', e);
  }


  return result
}

async function deleteCompanyDepartment(company, departmentId, currentUserId) {
  if(!company || !currentUserId || !departmentId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let department = await Department.findById(departmentId);
      if(department){
        result = await department.delete();
        if(result){
          result = {deleted: 1};
        }

      }

    }
  } catch(e){
    console.log('deleteCompanyDepartment: Error', e);
  }


  return result
}

async function getCompanyDepartments(company, query, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getDepartments(company, query);

  return result;

}


/************************** PIPELINES *****************************/
async function addCompanyPipeline(company, currentUserId, form) {
  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await addPipeline(form);
    }
  } catch(e){
    console.log('addCompanyPipeline: Error', e);
  }


  return result
}

async function updateCompanyPipeline(company, pipelineId, currentUserId, form) {
  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });
  if(!company || !currentUserId || !pipelineId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let pipeline = await Pipeline.findOne({pipelineId: pipelineId});
      if(pipeline){
        pipeline.name = form.name;
        pipeline.updatedBy = currentUserId;
        pipeline.stages=form.stages;
        pipeline.category=form.category;
        pipeline.department=form.department;
        pipeline.type=form.type;
        result = await pipeline.save();
      }

    }
  } catch(e){
    console.log('updateCompanyPipeline: Error', e);
  }


  return result
}

async function deleteCompanyPipeline(company, pipelineId, currentUserId) {
  if(!company || !currentUserId || !pipelineId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let pipeline = await Pipeline.findOne({pipelineId: pipelineId});
      if(pipeline){
        result = await pipeline.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deleteCompanyPipeline: Error', e);
  }


  return result
}

async function getCompanyPipelines(company, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getPipelines(company);

  return result;

}



/************************** ROLES *****************************/
async function addCompanyRole(company, currentUserId, form) {
  console.log('addCompanyRole', form)
  form = await Joi.validate(form, roleSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await roleService.addRole(form);
    }
  } catch(e){
    console.log('addCompanyRole: Error', e);
  }


  return result
}

async function updateCompanyRole(company, roleId, currentUserId, form) {
  form = await Joi.validate(form, roleSchema, { abortEarly: false });
  if(!company || !currentUserId || !roleId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let role = await Role.findById(roleId);
      if(role){
        role.name = form.name;
        role.updatedBy = currentUserId;
        role.privileges=form.privileges;
        role.description=form.description;
        result = await role.save();
      }

    }
  } catch(e){
    console.log('updateCompanyRole: Error', e);
  }


  return result
}

async function deleteCompanyRole(company, roleId, currentUserId) {
  if(!company || !currentUserId || !roleId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let role = await Role.findById(roleId);
      if(role){
        result = await role.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deleteCompanyRole: Error', e);
  }


  return result
}

async function getCompanyRoles(company, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await roleService.getRoles(company);

  return result;

}



/************************** LABELS *****************************/
async function addCompanyLabel(company, currentUserId, form) {
  form = await Joi.validate(form, labelSchema, { abortEarly: false });
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      form.createdBy = currentUserId;
      result = await labelService.addLabel(form);
    }
  } catch(e){
    console.log('addCompanyLabel: Error', e);
  }


  return result
}

async function updateCompanyLabel(company, labelId, currentUserId, form) {
  form = await Joi.validate(form, labelSchema, { abortEarly: false });
  if(!company || !currentUserId || !labelId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let label = await Label.findById(labelId);
      if(label){
        label.name = form.name;
        label.updatedBy = currentUserId;
        label.type=form.type;
        result = await label.save();
      }

    }
  } catch(e){
    console.log('updateCompanyLabel: Error', e);
  }


  return result
}


async function deleteCompanyLabel(company, labelId, currentUserId) {
  if(!company || !currentUserId || !labelId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let label = await Label.findById(labelId);
      if(label){
        result = await label.delete();
        if(result){
          result = {deleted: 1};
        }
      }

    }
  } catch(e){
    console.log('deleteCompanyLabel: Error', e);
  }


  return result
}

async function getCompanyLabels(company, query, type, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await labelService.getLabels(company, query, type);

  return result;

}


