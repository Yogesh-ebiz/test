const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let CustomPagination = require('../utils/custompagination');
let Pagination = require('../utils/pagination');

let JobSearchParam = require('../const/jobSearchParam');
const partyEnum = require('../const/partyEnum');
let statusEnum = require('../const/statusEnum');
let employmentTypeEnum = require('../const/employmentTypeEnum');

const {categoryMinimal, roleMinimal, convertToCandidate, convertToTalentUser, convertToAvatar, convertToCompany, isUserActive, validateMeetingType, orderAttendees} = require('../utils/helper');
const {lookupUserIds, createJobFeed, followCompany, findCategoryByShortCode, findSkillsById, findIndustry, findJobfunction, findByUserId, findCompanyById, searchUsers, searchCompany, searchPopularCompany} = require('../services/api/feed.service.api');
const {getPartyById, getPersonById, getCompanyById,  isPartyActive, getPartySkills, searchParties, populatePerson} = require('../services/party.service');
const jobService = require('../services/jobrequisition.service');
const applicationService = require('../services/application.service');
const {getEmploymentTypes} = require('../services/employmenttype.service');
const {getExperienceLevels} = require('../services/experiencelevel.service');
const {getPromotions, findPromotionById, findPromotionByObjectId} = require('../services/promotion.service');
const {getDepartments, addDepartment} = require('../services/department.service');
const {getQuestionTemplates, addQuestionTemplate, updateQuestionTemplate, deleteQuestionTemplate} = require('../services/questiontemplate.service');
const {getPipelineByJobId, getPipelineById, getPipelines, addPipeline} = require('../services/pipeline.service');
const {getPipelineTemplateById, getPipelineTemplates, addPipelineTemplate} = require('../services/pipelineTemplate.service');
const {addApplicationProgress} = require('../services/applicationprogress.service');
const roleService = require('../services/role.service');
const labelService = require('../services/label.service');
const memberService = require('../services/member.service');
const poolService = require('../services/pool.service');


const {findCurrencyRate} = require('../services/currency.service');

const {} = require('../services/company.service');
const JobRequisition = require('../models/jobrequisition.model');
const Application = require('../models/application.model');
const Role = require('../models/role.model');
const Department = require('../models/department.model');


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
  pipelineTemplateId: Joi.string().required(),
  stages: Joi.array().required()
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
  getStats,
  getUserSession,
  createJob,
  updateJob,
  searchJobs,
  getJobById,
  updateJobPipeline,
  getJobPipeline,
  updateJobApplicationForm,
  getBoard,
  payJob,
  searchApplications,
  rejectApplication,
  updateApplicationProgress,
  getApplicationLabels,
  addApplicationLabel,
  deleteApplicationLabel,
  getApplicationComments,
  addApplicationComment,
  deleteApplicationComment,
  updateApplicationComment,
  searchCandidates,
  addCompanyDepartment,
  updateCompanyDepartment,
  deleteCompanyDepartment,
  getCompanyDepartments,
  addCompanyQuestionTemplate,
  updateCompanyQuestionTemplate,
  deleteCompanyQuestionTemplate,
  getCompanyQuestionTemplates,
  addCompanyPipelineTemplate,
  updateCompanyPipelineTemplate,
  deleteCompanyPipelineTemplate,
  getCompanyPipelineTemplate,
  getCompanyPipelineTemplates,
  addCompanyRole,
  getCompanyRoles,
  updateCompanyRole,
  deleteCompanyRole,
  addCompanyLabel,
  getCompanyLabels,
  updateCompanyLabel,
  deleteCompanyLabel,
  inviteMembers,
  getCompanyMemberInvitations,
  getCompanyMembers,
  addCompanyMember,
  updateCompanyMember,
  updateCompanyMemberRole,
  deleteCompanyMember,
  getCompanyPools,
  addCompanyPool,
  updateCompanyPool,
  deleteCompanyPool
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function getUserSession(currentUserId, preferredCompany) {

  if(!currentUserId){
    return null;
  }


  let result;
  let user = await findByUserId(currentUserId);
  let allAccounts = await memberService.findMemberByUserId(currentUserId);

  let companies = await searchCompany('', _.map(allAccounts, 'company'), currentUserId);


  companies = _.reduce(companies.content, function(res, item){
    let found = _.find(allAccounts, {company: item.id});
    item = convertToCompany(item);
    item.role = roleMinimal(found.role);
    item.memberId = found._id
    res.push(item)

    return res;
  }, [])
  user = convertToTalentUser(user);
  user.company = companies;
  user.currentCompanyId = preferredCompany? _.some(companies, {id: preferredCompany})?preferredCompany:companies.length?companies[0].id:null:companies.length?companies[0].id:null;



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
    ]
  }



  return result;

}

async function getStats(currentUserId, companyId) {


  if(!currentUserId || !companyId){
    return null;
  }


  let data = [];

  let jobs = await JobRequisition.find({company: companyId}).limit(10);

  jobs = _.reduce(jobs, function(res, job){
    job.responsibilities=null;
    job.qualifications=null;
    job.skills = null;
    res.push(job);
    return res;
  }, []);

  let result = {
    newCandidates: [
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Yu",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_0_1609948186560.jpg",
        "id": 0,
        "headline": "I am Yu Nguyen",
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
      },
      {
        "cover": "person_63_1613525639.jpg",
        "lastName": "Doe",
        "firstName": "Austin",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_63_1613525674523.jpg",
        "id": 63,
        "headline": "I am Austin Doe",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Doe",
        "firstName": "Brooklyn",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_75_1603789930127.png",
        "id": 75,
        "headline": "I am Brooklyn",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Doe",
        "firstName": "Cade",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_80_1603790011021.jpg",
        "id": 80,
        "headline": "I am Cade Doe",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Trang",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_85_1617007079881.jpg",
        "id": 85,
        "headline": "I am Trang Nguyen",
        "matches": 50
      },
      {
        "cover": "cover.png",
        "lastName": "Nguyen",
        "firstName": "Minh",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_89_1603790258619.jpg",
        "id": 89,
        "headline": "I am Minh Nguyen",
        "matches": 50
      },
      {
        "cover": "cover4.png",
        "lastName": "Nguyen",
        "firstName": "Tuan",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "A",
        "avatar": "person_91_1612156489438.jpg",
        "id": 91,
        "headline": "I am Tuan Nguyen",
        "matches": 50
      },
      {
        "cover": "person_187_1614103679.jpg",
        "lastName": "Doe",
        "firstName": "Casey",
        "currentPosition": {
          "employmentTitle": "Android",
          "company": {
            "name": "name",
            "id": 1
          }
        },
        "rating": 0,
        "middleName": "",
        "avatar": "person_187_1614103672779.jpg",
        "id": 187,
        "headline": "I am Casey Doe",
        "matches": 50
      }
    ],
    mostActiveJobs: jobs
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

  let company = await findCompanyById(companyId, currentUserId);

  let result = await JobRequisition.paginate(new JobSearchParam(filter), options);

  const loadPromises = result.docs.map(job => {
    job.isHot = false;
    job.isNew = false;
    job.company = convertToCompany(company);
    return job;
  });
  // result = await Promise.all(loadPromises);

  return new Pagination(result);

}

async function createJob(currentUserId, job) {

  if(!job || !currentUserId){
    return null;
  }


  let result;
  let currentParty = await findByUserId(currentUserId);

  if (isPartyActive(currentParty)) {
    result = await jobService.addJob(job, currentUserId);

  }

  return result;
}

async function updateJob(jobId, currentUserId, form) {

  if(!jobId || !form || !currentUserId){
    return null;
  }


  let result;
  let currentParty = await findByUserId(currentUserId);

  if (isPartyActive(currentParty)) {
    result = await jobService.updateJob(jobId, currentUserId, form);
  }

  return result;
}

async function getJobById(currentUserId, jobId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    job = await jobService.findJob_Id(jobId, locale);

    if(job) {


      // console.log('jobSkils', jobSkills)

      let noApplied = await applicationService.findAppliedCountByJobId(job.jobId);
      job.noApplied = noApplied;


      let experienceLevel = await getExperienceLevels(_.map(job, 'level'), locale);
      job.level = experienceLevel[0];

      let industry = await findIndustry('', job.industry, locale);
      job.industry = industry;

      let jobFunction = await findJobfunction('', job.jobFunction, locale);
      if(jobFunction.length){
        job.jobFunction = jobFunction[0];
      }

      if(job.category){
        let cateogry = await findCategoryByShortCode(job.category, locale);
        job.category = categoryMinimal(cateogry);
      }

      if(job.skills.length) {
        let jobSkills = await findSkillsById(job.skills);
        job.skills = jobSkills;
      }

      let users  = await lookupUserIds(job.createdBy);
      job.createdBy = _.find(users, {id: job.createdBy});

      let currentParty, partySkills=[];



    }

  } catch (error) {
    console.log(error);
  }

  return job;
}

async function updateJobPipeline(jobId, currentUserId, form) {
  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });
  if(!jobId || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);

  try {
    if (isPartyActive(currentParty)) {
      result = await jobService.updateJobPipeline(jobId, form, currentUserId);
    }
  } catch(e){
    console.log('updateJobPipeline: Error', e);
  }


  return result
}


async function getJobPipeline(jobId, currentUserId) {
  if(!jobId || !currentUserId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);

  try {
    if (isPartyActive(currentParty)) {
      result = await jobService.getJobPipeline(jobId);

    }
  } catch(e){
    console.log('getJobPipeline: Error', e);
  }


  return result
}


async function updateJobApplicationForm(jobId, currentUserId, form) {
  if(!jobId || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);

  try {
    if (isPartyActive(currentParty)) {
      result = await jobService.updateJobApplicationForm(jobId, form, currentUserId);
    }
  } catch(e){
    console.log('updateJobApplicationForm: Error', e);
  }


  return result
}



async function payJob(currentUserId, jobId, payment) {

  if(!currentUserId || !jobId || !payment){
    return null;
  }

  let job = await jobService.findJob_Id(jobId);

  if(job){
    job.status = statusEnum.ACTIVE;
    await job.save();
  }

  return job;


}

async function searchApplications(currentUserId, jobId, filter, locale) {

  if(currentUserId==null || jobId==null){
    return null;
  }

  let results = await applicationService.findApplicationsByJobId(jobId, filter);

  let userIds = _.map(results.content, 'user');
  let users = await lookupUserIds(userIds);

  results.content.forEach(function(app){
    let user = _.find(users, {id: app.user});
    if(user){
      app.user = user;
    }
  })

  return results;


}


async function rejectApplication(currentUserId, jobId, applicationId, locale) {

  if(!jobId || !currentUserId){
    return null;
  }

  let job;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    job = await applicationService.findApplicationById(applicationId, locale);

    if(job) {;




    }

  } catch (error) {
    console.log(error);
  }

  return job;
}


async function updateApplication(currentUserId, jobId, applicationId, newStatus) {

  if(!jobId || !applicationId || !currentUserId || !newStatus){
    return null;
  }

  let application;
  try {
    let localeStr = locale? locale : 'en';
    let propLocale = '$name.'+localeStr;
    application = await applicationService.findApplicationById(applicationId, locale);

    if(application) {




    }

  } catch (error) {
    console.log(error);
  }

  return application;
}

async function updateApplicationProgress(currentUserId, applicationId, newStage) {

  if(!currentUserId || !applicationId || !newStage){
    return null;
  }


  let progress;
  try {

    let application = await findApplicationBy_Id(applicationId).populate([
      {
        path: 'currentProgress',
        model: 'ApplicationProgress'
      },
      {
        path: 'progress',
        model: 'ApplicationProgress'
      }
    ]);


    if(application) {
      progress = _.find(application.progress, {stageId: ObjectID(newStage)})

      if(progress){
        application.currentProgress = progress;
        await application.save();
      } else {
        let pipeline = await getPipelineByJobId(application.jobId);
        if(pipeline) {
          foundStage = _.find(pipeline.stages, {_id: ObjectID(newStage)})
          if(foundStage) {
            progress = await  addApplicationProgress({
              applicationId: application.applicationId,
              stageId: foundStage._id
            });

            application.currentProgress = progress;
            application.progress.push(progress);
            application.progress = _.orderBy(application.progress, ['stageId'], []);
            await application.save();

          }
        }
      }

    }

  } catch (error) {
    console.log(error);
  }

  return progress;
}



async function getJobApplications(currentUserId, jobId) {

  if(!currentUserId || !jobId){
    return null;
  }

  let result;
  try {


    result = await app.getComments(jobId);

  } catch (error) {
    console.log(error);
  }

  return result;
}



async function getApplicationLabels(currentUserId, applicationId) {

  if(!currentUserId || !applicationId){
    return null;
  }

  let result;
  try {


    let application = await applicationService.findApplicationBy_Id(applicationId).populate([
      {
        path: 'labels',
        model: 'Label'
      }]);

    if(application){
      retsult = application.labels;
    }

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addApplicationLabel(currentUserId, applicationId, label) {

  if(!currentUserId || !applicationId || !label){
    return null;
  }

  let result;
  try {


    let application = await applicationService.findApplicationBy_Id(applicationId).populate([
      {
        path: 'labels',
        model: 'Label'
      }]);


    if(application) {
      console.log(application)
      console.log(label);
      application.labels.push(label);

      // comment.applicationId = application._id;
      // comment.candidate = application.user;
      // comment.createdBy = currentUserId;
      result = await application.save();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function deleteApplicationLabel(currentUserId, applicationId, labelId) {

  if(!currentUserId || !applicationId || !labelId){
    return null;
  }

  let result;
  try {

    let application = await applicationService.findApplicationBy_Id(applicationId);


    if(application) {
      application = await application.update(
        { $pull: { labels: labelId } }
      );

    }

  } catch (error) {
    console.log(error);
  }

  return application.labels;
}



async function getApplicationComments(currentUserId, applicationId) {

  if(!currentUserId || !applicationId){
    return null;
  }

  let result;
  try {


    result = await commentService.getComments(applicationId);

  } catch (error) {
    console.log(error);
  }

  return result;
}

async function addApplicationComment(currentUserId, applicationId, comment) {

  if(!currentUserId || !applicationId || !comment){
    return null;
  }

  let result;
  try {


    let application = await applicationService.findApplicationBy_Id(applicationId);


    if(application) {
      comment.applicationId = application._id;
      comment.candidate = application.user;
      comment.createdBy = currentUserId;
      result = await commentService.addComment(comment);

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function deleteApplicationComment(currentUserId, applicationId, commentId) {

  if(!currentUserId || !applicationId || !commentId){
    return null;
  }

  let result;
  try {
    let comment = await commentService.findBy_Id(commentId);

    if(comment) {
      result = await comment.delete();

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function updateApplicationComment(currentUserId, applicationId, commentId, comment) {

  console.log(commentId, comment)
  if(!currentUserId || !applicationId || !commentId || !comment){
    return null;
  }

  let result;
  try {


    let found = await commentService.findBy_Id(commentId);


    if(found) {
      found.message = comment.message;
      found.lastUpdatedDate = Date.now();
      result = await found.save()

    }

  } catch (error) {
    console.log(error);
  }

  return result;
}


async function getBoard(currentUserId, jobId, locale) {

  if(currentUserId==null || jobId==null){
    return null;
  }

  let boardStages = [];
  let pipelineStages;
  let job = await jobService.findJobId(jobId, locale);
  let pipeline = await getPipelineByJobId(job.jobId);
  if(pipeline.stages) {


    let pipelineStages = pipeline.stages;


    // let userIds = [5, 7, 12, 63, 75, 80, 85, 89, 91, 187, 188, 197, 198, 276, 277, 279, 286, 288, 289, 290, 4075]
    // let users = await lookupUserIds(userIds);
    //
    //
    // let columns = ['APPLIED', 'PHONE_SCREEN', 'TEST', 'INTERVIEW', 'OFFER'];
    //
    // for(var i=0; i<5; i++){
    //   let column = {type: columns[i], candidates: []};
    //   var items = getRandomInt(1, 5);
    //   for(var j=0; j<items; j++){
    //     let removed = _.pullAt(users, 0);
    //     column.candidates.push(removed[0]);
    //   }
    //   boardStages.push(column);
    // }

    let applicationsGroupByStage = await Application.aggregate([
      {$match: {jobId: job.jobId}},
      {$lookup: {from: 'applicationprogresses', localField: 'currentProgress', foreignField: '_id', as: 'currentProgress' } },
      {$project: {createdDate: 1, user: 1, email: 1, phoneNumber: 1, photo: 1, availableDate: 1, status: 1, sources: 1, note: 1, user: 1, currentProgress: {$arrayElemAt: ['$currentProgress', 0]} }},
      {$group: {_id: '$currentProgress.stageId', applications: {$push: "$$ROOT"}}}
    ]);


    let userIds = _.reduce(applicationsGroupByStage, function(res, item){ res.push(_.map(item.applications, 'user')); return res; }, []);

    let users = await lookupUserIds(_.flatten(userIds));

    pipelineStages.forEach(function(item){
      let found = _.find(applicationsGroupByStage, {'_id': item._id});
      if(found){
        found.applications.forEach(function(application){
          let user = _.find(users, {id: application.user});
          if(user){
            application.user = convertToAvatar(user);
          }

        });

        item.applications = found.applications;
      }

      let stage = {_id: item._id, type: item.type, name: item.name, timeLimit: item.timeLimit, applications: item.applications}
      boardStages.push(stage);


    });
  }
  return boardStages;


}


async function searchCandidates(currentUserId, company, filter, locale) {

  if(!currentUserId || !company || !filter){
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

  result = await applicationService.findCandidatesByCompanyId(company, filter);
  let userIds = _.map(result.docs, 'id');
  let users = await lookupUserIds(userIds)

  for(var i=0; i<result.docs.length; i++){
    let foundUser = _.find(users, {id: result.docs[i].id});
    if(foundUser) {
      foundUser.noOfMonthExperiences = 68;
      foundUser.level = 'SENIOR'
      foundUser.match = 87;

      foundUser = convertToCandidate(foundUser);
      foundUser.applications = result.docs[i].applications;
      result.docs[i] = foundUser

    }

  };


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


/************************** QUESTIONTEMPLATES *****************************/
async function addCompanyQuestionTemplate(company, currentUserId, form) {
  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      form.createdBy = currentUserId;
      form.company = company;
      result = await addQuestionTemplate(form);
    }
  } catch(e){
    console.log('addCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function updateCompanyQuestionTemplate(company, questionId, currentUserId, form) {
  if(!company || !currentUserId || !questionId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await updateQuestionTemplate(questionId, form);
    }
  } catch(e){
    console.log('updateCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function deleteCompanyQuestionTemplate(company, questionId, currentUserId) {
  if(!company || !currentUserId || !questionId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      result = await deleteQuestionTemplate(questionId);

    }
  } catch(e){
    console.log('deleteCompanyQuestionTemplate: Error', e);
  }


  return result
}

async function getCompanyQuestionTemplates(company, query, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getQuestionTemplates(company, query);

  return result;

}


/************************** PIPELINES *****************************/
async function addCompanyPipelineTemplate(company, currentUserId, form) {

  if(!company || !currentUserId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);

  try {
    if (isPartyActive(currentParty)) {
      result = await addPipelineTemplate(form);
    }
  } catch(e){
    console.log('addCompanyPipeline: Error', e);
  }


  return result
}

async function updateCompanyPipelineTemplate(company, pipelineId, currentUserId, form) {
  form = await Joi.validate(form, pipelineSchema, { abortEarly: false });
  if(!company || !currentUserId || !pipelineId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let pipeline = await getPipelineTemplateById(pipelineId);
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

async function deleteCompanyPipelineTemplate(company, pipelineId, currentUserId) {
  if(!company || !currentUserId || !pipelineId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      let pipeline = await getPipelineTemplateById(pipelineId);
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

async function getCompanyPipelineTemplate(company, pipelineId, currentUserId, locale) {

  if(!company || !pipelineId || !currentUserId){
    return null;
  }

  let result = await getPipelineTemplateById(pipelineId);

  return result;

}

async function getCompanyPipelineTemplates(company, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await getPipelineTemplates(company);

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



async function inviteMembers(company, currentUserId, form) {

  if(!company || !currentUserId || !form){
    return null;
  }

  let result = await memberService.inviteMembers(company, currentUserId, form.emails, form.role);


  return result;

}


async function getCompanyMemberInvitations(company) {

  if(!company){
    return null;
  }

  let result = await memberService.getMemberInvitations(company);
  result.forEach(function(member){
    member.role = roleMinimal(member.role);
  });
  return result;

}


async function getCompanyMembers(company, query, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await memberService.getMembers(company, query);
  result.forEach(function(member){
    member.role = roleMinimal(member.role);
  });

  return result;

}


async function addCompanyMember(company, form, invitationId) {
  if(!company || !form || !invitationId){
    return null;
  }

  let result = null;
  try {
      let role = form.role;
      delete form.role

      result = await memberService.addMember(form, role, invitationId);

  } catch(e){
    console.log('addCompanyMember: Error', e);
  }


  return result
}

async function updateCompanyMember(company, memberId, currentUserId, form) {
  if(!company || !currentUserId || !memberId || !form){
    return null;
  }


  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      result = await memberService.updateMember(memberId, form);


    }
  } catch(e){
    console.log('updateCompanyMember: Error', e);
  }


  return result
}

async function updateCompanyMemberRole(company, memberId, currentUserId, role) {
  if(!company || !currentUserId || !memberId || !role){
    return null;
  }


  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {

      result = await memberService.updateMemberRole(memberId, role);


    }
  } catch(e){
    console.log('updateCompanyMember: Error', e);
  }


  return result
}

async function deleteCompanyMember(company, memberId, currentUserId) {
  if(!company || !currentUserId || !memberId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let member = await memberService.findMemberBy_Id(memberId);
      if(member){
        result = await member.delete();
        if(result){
          result = {deleted: 1};
        }

      }

    }
  } catch(e){
    console.log('deleteCompanyMember: Error', e);
  }


  return result
}




async function getCompanyPools(company, query, currentUserId, locale) {

  if(!company || !currentUserId){
    return null;
  }

  let result = await poolService.getPools(company);
  // result.forEach(function(member){
  //   member.role = roleMinimal(member.role);
  // });

  return result;

}

async function addCompanyPool(company, form, currentUserId) {
  if(!company || !form){
    return null;
  }

  let result = null;
  try {

    result = await poolService.addPool(currentUserId, form);

  } catch(e){
    console.log('addCompanyPool: Error', e);
  }


  return result
}

async function updateCompanyPool(company, poolId, currentUserId, form) {
  console.log(company, poolId, currentUserId, form)
  if(!company || !currentUserId || !poolId || !form){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      form.department = ObjectID(form.department);

      result = await poolService.updatePool(poolId, form);


    }
  } catch(e){
    console.log('updateCompanyPool: Error', e);
  }


  return result
}

async function deleteCompanyPool(company, poolId, currentUserId) {
  if(!company || !currentUserId || !poolId){
    return null;
  }

  let result = null;
  let currentParty = await findByUserId(currentUserId);


  try {
    if (isPartyActive(currentParty)) {
      let pool = await poolService.findPoolBy_Id(poolId);
      if(pool){
        result = await pool.delete();
        if(result){
          result = {deleted: 1};
        }

      }

    }
  } catch(e){
    console.log('deleteCompanyPool: Error', e);
  }


  return result
}
