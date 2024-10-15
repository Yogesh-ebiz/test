const Joi = require('joi');
const { ObjectId } = require('mongodb');
const moment = require('moment-timezone');
const {convertToCompany, convertToAvatar} = require('../utils/helper');

const _ = require('lodash');

let SearchParam = require('../const/searchParam');
const statusEnum = require('../const/statusEnum');
const dateEnum = require('../const/dateEnum');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');
const labelType = require('../const/labelType');
const adPosition = require('../const/adPosition');
const notificationType = require('../const/notificationType');
const notificationEvent = require('../const/notificationEvent');
const jobTypeEnum = require('../const/jobType');
const { myEmitter } = require('../config/eventemitter');

const JobAlert = require('../models/jobalert.model');
const JobRequisition = require('../models/jobrequisition.model');
const QuestionTemplate = require('../models/questiontemplate.model');
const AdImpression = require('../models/adimpression.model');
const Ad = require('../models/ad.model');

const Promotion = require('../models/promotion.model');
const bookmarkService = require('../services/bookmark.service');
const pipelineService = require('./jobpipeline.service');
const jobTemplateService = require('../services/jobpipeline.service');
const pipelineTemplateService = require('../services/pipelineTemplate.service');
const memberService = require('../services/member.service');
const feedService = require('../services/api/feed.service.api');
const activityService = require('../services/activity.service');
const labelService = require('../services/label.service');
const companyService = require('../services/company.service');
const applicationProgressService = require('../services/applicationprogress.service');
const CompanySalary = require("../models/companysalary.model");
const config = require('../config/config');




const jobSchema = Joi.object({
  jobId: Joi.number().optional(),
  createdBy: Joi.object(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  durationMonths: Joi.number().optional(),
  minMonthExperience: Joi.number().optional(),
  maxMonthExperience: Joi.number().optional(),
  companyId: Joi.number().optional(),
  currency: Joi.string(),
  noOfResources: Joi.number(),
  type: Joi.string(),
  department: Joi.object().optional(),
  industry: Joi.array(),
  internalCode: Joi.string().optional(),
  jobFunction: Joi.string(),
  expirationDate: Joi.number(),
  requiredOnDate: Joi.number(),
  salaryRangeLow: Joi.number().optional(),
  salaryRangeHigh: Joi.number().optional(),
  salaryFixed: Joi.any(),
  level: Joi.string(),
  responsibilities: Joi.array(),
  qualifications: Joi.array(),
  minimumQualifications: Joi.array(),
  skills: Joi.array().optional(),
  employmentType: Joi.string(),
  allowRemote: Joi.boolean(),
  education: Joi.string().allow(''),
  district: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow(''),
  stateCode: Joi.string().allow('').optional(),
  country: Joi.string().allow(''),
  countryCode: Joi.string().allow(''),
  postalCode: Joi.string(),
  externalUrl: Joi.string().allow('').optional(),
  hasApplied: Joi.boolean(),
  questions: Joi.array(),
  tags: Joi.array(),
  applicationPreferences: Joi.object(),
  profileField: Joi.object(),
  autoConfirmationEmail: Joi.object(),
  // pipeline: Joi.object(),
  type: Joi.string(),
  displaySalary: Joi.boolean(),
});



async function addJob(form) {
  if(!form){
    return;
  }
  const {error} = await jobSchema.validate(form, {abortEarly: false});

  let result;

  let pipelineTemplate;
  let savedPipeline;
  if(!form.pipeline){
    pipelineTemplate = await pipelineTemplateService.getDefaultTemplate();
  }else {
    pipelineTemplate = await pipelineTemplateService.findById(new ObjectId(form.pipeline));
  }

  if (pipelineTemplate){
    savedPipeline = await pipelineService.add({
      pipelineTemplateId: pipelineTemplate._id,
      name: pipelineTemplate.name,
      stages: pipelineTemplate.stages,
      createdBy: form.createdBy,
      company: form.company,
      department: pipelineTemplate.department,
      category: pipelineTemplate.category,
      autoRejectBlackList: pipelineTemplate.autoRejectBlackList,
      custom: pipelineTemplate.custom,
    });
    form.pipeline = savedPipeline?._id;
  }

  if(form.tags){
    let tags = [];
    for (let tag of form.tags) {
      if(!tag._id) {
        tag.company = form.company;
        tag.type = labelType.TAG;
        tag = await labelService.add(tag);
        tags.push(tag._id);
      } else {

        tags.push(new ObjectId(tag._id));
      }
    }
    form.tags = tags;
  }

  if(form.industry){
    let industry = [];
    for (let item of form.industry) {
      industry.push(new ObjectId(item));
    }
    form.industry = industry;
  }

  if(form.skills){
    let skills = [];
    for (let item of form.skills) {
      skills.push(new ObjectId(item));
    }
    form.skills = skills;
  }

  form.isExternal = form.externalUrl?true:false;
  result = await new JobRequisition(form).save();

  if(result){
    let subscription = {member: form.createdBy, createdBy: form.createdBy, subjectType: subjectType.JOB, subject: result._id};
    await memberService.subscribe(subscription);

    if (form.pipeline) {
      savedPipeline.jobId = result._id;
      await savedPipeline.save();
    }
  }

  return result;
}


async function updateJob(jobId, member, form) {
  if(!jobId || !member || !form){
    return;
  }

  await jobSchema.validate(form, {abortEarly: false});
  let job = await findById(jobId);
  let result;

  if(job){
    console.log(form.skills)
    job.updatedDate = Date.now();
    job.updatedBy = form.updatedBy;
    job.title =  form.title,
    job.description =  form.description,
    job.internalCode =  form.internalCode,
    job.salaryRangeLow =  form.salaryRangeLow,
    job.salaryRangeHigh =  form.salaryRangeHigh,
    job.salaryFixed =  form.salaryFixed,
    job.currency =  form.currency,
    job.level =  form.level,
    job.category = form.category,
    job.district = form.district
    job.city =  form.city;
    job.state =  form.state;
    job.stateCode =  form.stateCode;
    job.country =  form.country;
    job.countryCode =  form.countryCode;
    job.responsibilities=  form.responsibilities;
    job.qualifications = form.qualifications;
    job.minimumQualifications = form.minimumQualifications;
    job.minMonthExperience = form.minMonthExperience;
    job.maxMonthExperience = form.maxMonthExperience;
    job.employmentType = form.employmentType;
    job.education = form.education;
    job.industry = form.industry;
    job.skills = form.skills;
    job.jobFunction = form.jobFunction;
    job.department = form.department;
    job.allowRemote=form.allowRemote;
    job.isExternal = form.externalUrl?true:false;
    job.noOfResources = form.noOfResources;
    job.externalUrl = form.externalUrl;
    job.displaySalary = (form.displaySalary !== undefined) ? form.displaySalary : job.displaySalary ;

    let tags = [];
    for (let tag of form.tags) {
      if(!tag._id) {
        tag.company = member.company;
        tag.type = labelType.KEYWORD;
        tag = await labelService.updateAndAdd(tag);
        tags.push(tag._id);
      } else {

        tags.push(new ObjectId(tag._id));
      }
    }
    job.tags = tags;

    result = await job.save();

    let activity = await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.JOB, subject: job._id, action: actionEnum.UPDATED, meta: {job: job._id, jobTitle: job.title}});

  }

  return result;

}

function searchTitle(keyword) {
  let data = null;

  if(keyword==null){
    return;
  }
  var regex = new RegExp(keyword, 'i');
  console.log(regex)

  return JobRequisition.aggregate([
    { $match: {title: regex} },
    { $group: {_id:{title:'$title'}} },
    { $project: {_id: 0, keyword: '$_id.title'}}
  ])
}


function findById(id) {
  if(!id){
    return;
  }

  return JobRequisition.findById(id);
}


async function findByIds(ids) {
  let data = null;

  if(ids==null){
    return;
  }


  return JobRequisition.find({_id: {$in: ids }});
}


function findJobId(jobId, locale) {
  let data = null;

  if(!jobId){
    return;
  }
  // let localeStr = locale? locale.toLowerCase() : 'en';
  // let propLocale = '$name.'+localeStr;


  data = JobRequisition.findOne({jobId: jobId});

  // Promotion.populate(data, {path: "promotion"});


  return data;

  // return JobRequisition.findOne({jobId: jobId});
}


async function findJob_Id(jobId, locale) {
  let data = null;

  if(!jobId){
    return;
  }
  data = await JobRequisition.findById(jobId).populate('department').populate('tags').populate('members').populate('createdBy');
  return data;

}

async function findJobIds(jobIds) {
  let data = null;

  if(jobIds==null){
    return;
  }


  return JobRequisition.find({jobId: {$in: jobIds }});
}

async function findJob_Ids(jobIds) {
  let data = null;

  if(!jobIds){
    return;
  }


  return JobRequisition.find({_id: {$in: jobIds }});
}


async function updateJobPipeline(jobId, form, locale) {
  let data = null;

  if(!jobId || !form){
    return;
  }

  let result;
  let job = await JobRequisition.findById(jobId);
  const pipeline = await pipelineTemplateService.findById( new ObjectId(form.pipelineTemplateId) );

  if(job && pipeline) {
    pipeline.autoRejectBlackList = form.autoRejectBlackList;
    pipeline.stages = form.stages;
    pipeline.stageMigration = form.stageMigration;
    //result = await pipelineTemplateService.update(new ObjectId(form.pipelineTemplateId), pipeline, new ObjectId(jobId));
    result = await pipelineService.update(new ObjectId(form.pipelineTemplateId), pipeline, job._id)
    //await pipeline.save();
  }else{
    throw new Error('job or pipeline not found');
  }

  return result;
}

async function getJobPipeline(jobId) {
  let data;

  if(!jobId){
    return;
  }

  let job = await JobRequisition.findById(jobId).populate({
    path: 'pipeline',
    model: 'Jobpipeline'
  });


  //console.log(job.pipeline)
  if(job){
    data = job.pipeline;

  }


  return data;
}


async function updateJobMembers(jobId, members, member) {
  if(!jobId || !members || !member){
    return;
  }

  let job = await JobRequisition.updateOne({_id: jobId}, {$set: {members: members, updatedBy: member._id, updatedDate: Date.now()}});
  return job;
}

async function getJobMembers(jobId) {
  let data = null;

  if(!jobId){
    return;
  }

  let job = await JobRequisition.findById(jobId).populate([
    {
      path: 'createdBy',
      model: 'Member'
    },
    {
      path: 'members',
      model: 'Member'
    }
  ]);

  // let members = _.reduce(job.pipeline.stages, function(res, stage){
  //   res = res.concat(stage.members);
  //   return res;
  // }, []);
  //
  // members = members.concat(job.members);
  // members.push(job.createdBy);
  //
  // let reduceMembers = [];
  // members.forEach(function(member){
  //   if(!_.find(reduceMembers, {userId: member.userId})){
  //     reduceMembers.push(member);
  //   }
  //
  // });

  return job.members;
}

async function updateJobApplicationForm(id, form, memberId) {
  let data = null;

  if(!id || !form || !memberId){
    return;
  }

  let updates = {};
  updates.updatedBy = memberId;
  updates.questionTemplate = form.questionTemplate
  updates.applicationForm = form.applicationForm;
  updates.hasQuestions = !!form.questionTemplate;

  data = await JobRequisition.updateOne({_id: id}, updates);

  return data;
}


async function getSimilarJobList(jobId, sort) {
  if(!jobId){
    return null;
  }

  let select = '';
  let limit = (sort?.size && parseInt(sort?.size)>0) ? parseInt(sort.size):20;
  let page = (sort?.page && parseInt(sort?.page)==0) ? 1:parseInt(sort.page)+1;

  const options = {
    page: page,
    limit: limit,
  };

  let baseJob  = await JobRequisition.findById(jobId).populate('skills').lean();
  const baseJobSkills = baseJob.skills ? baseJob.skills.map(skill => skill.name) : [];
  const baseJobSkillsSize = baseJobSkills.length;

  const escapedTitle = baseJob.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = new RegExp(escapedTitle, 'i');

  const aggregationPipeline = [
    {
      $match: {
        _id: { $ne: jobId },
        status: 'ACTIVE'
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: '$company'},
    {
      $lookup: {
        from: 'skills',
        localField: 'skills',
        foreignField: '_id',
        as: 'skillsDetails'
      }
    },
    {
      $addFields: {
        // Converting skillsDetails to an array of skill names
        resolvedSkills: {
          $map: {
            input: '$skillsDetails',
            as: 'skill',
            in: '$$skill.name'
          }
        }
      }
    },
    {
      $addFields: {
        // Title similarity (using regex pattern)
        titleScore: {
          $cond: {
            if: { $regexMatch: { input: "$title", regex: regexPattern } },
            then: 0.3,
            else: 0
          }
        },
        // Location similarity (city, state, country)
        locationScore: {
          $cond: {
            if: {
              $and: [
                { $eq: ["$city", baseJob.city] },
                { $eq: ["$state", baseJob.state] },
                { $eq: ["$country", baseJob.country] }
              ]
            },
            then: 0.2,
            else: 0
          }
        },
        // Skills similarity
        skillsScore: {
          $let: {
            vars: {
              intersectionSize: { $size: { $setIntersection: ["$resolvedSkills", baseJobSkills] } },
              maxSize: { $max: [{ $size: "$resolvedSkills" }, baseJobSkillsSize] }
            },
            in: {
              $cond: {
                if: { $gt: ["$$maxSize", 0] },
                then: { $multiply: [{ $divide: ["$$intersectionSize", "$$maxSize"] }, 0.3]},
                else: 0
              }
            }
          }
        },
        // Employment type similarity
        employmentTypeScore: {
          $cond: {
            if: { $eq: [{ $toLower: "$employmentType" }, { $toLower: baseJob.employmentType }] },
            then: 0.1,
            else: 0
          }
        },
        // Level similarity
        levelScore: {
          $cond: {
            if: { $eq: [{$toLower: "$level"}, {$toLower: baseJob.level}] },
            then: 0.1,
            else: 0
          }
        }
      }
    },
    {
      $addFields: {
        similarityScore: {
          $add: [
            "$titleScore",
            "$locationScore",
            "$skillsScore",
            "$employmentTypeScore",
            "$levelScore"
          ]
        }
      }
    },
    {
      $sort: { similarityScore: -1 }
    },
    {
      $project: {
        skillsDetails: 0,
        resolvedSkills: 0,
        titleScore: 0,
        locationScore: 0,
        skillsScore: 0,
        employmentTypeScore: 0,
        levelScore: 0,
        description: 0,
        updatedBy: 0,
        minimumQualifications: 0,
        qualifications: 0,
        responsibilities: 0
      }
    }
  ];

  const similarJobs = await JobRequisition.aggregatePaginate(aggregationPipeline, options);

  return similarJobs;
}


async function getSimilarJobsByTitle(title) {
  let data = [];

  if(!title){
    return data;
  }

  data = await JobRequisition.aggregate([
    { $match: {
        status: statusEnum.ACTIVE,
        $text: {
          $search: title,
          $diacriticSensitive: true,
          $caseSensitive: false
        }
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: '$company'},
    { $limit: 10}
  ])


  return data;
}

async function getJobAds(jobId) {
  let data = null;

  if(!jobId){
    return;
  }

  /*
  let job = await JobRequisition.aggregate([
    {$match: {_id: jobId}},
    {$lookup:{
        from:"ads",
        let:{ads:"$ads"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$ads"]}}},
          // {
          //   $lookup: {
          //     from: 'targets',
          //     localField: 'targeting',
          //     foreignField: '_id',
          //     as: 'targeting',
          //   },
          // }
        ],
        as: 'ads'
      }},
    // {$unwind: '$user'},
  ]);
 */

  let job = await JobRequisition.findOne({_id: jobId}).populate([
    {
      path: 'searchAd',
      populate: {
        path: 'targeting',
        model: 'Target'
      }
    },
    {
      path: 'ads',
      model: 'Ad',
      populate: {
        path: 'targeting',
        model: 'Target'
      }
    }]);

  return job;
}


async function closeJob(jobId, member) {
  if(!jobId || !member){
    return;
  }

  let result = null;
  let job = await JobRequisition.findById(jobId).populate('createdBy');
  if(job && job.status===statusEnum.ACTIVE){
    job.status = statusEnum.CLOSED;
    job.updatedBy = member._id;
    job.updatedDate = Date.now();
    result = await job.save();
    await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.JOB, subject: job._id, action: actionEnum.CLOSED, meta: {name: member.firstName + ' ' + member.lastName, jobTitle: job.title, job: job._id}});

    //Create Notification
    let meta = {
      companyId: job.companyId,
      jobId: job._id,
      jobTitle: job.title,
      updatedDate: new Date(job.updatedDate).toISOString(),
      name: member.firstName + ' ' + member.lastName,
      userId: member.userId,
      avatar: member.avatar,
    };
    if(job.createdBy.messengerId !== member.messengerId){
      myEmitter.emit('create-notification', job.createdBy.messengerId, job.company, notificationType.JOB, 'JOB_CLOSED', meta);
    }
    // Notify each job member
    const jobmembers = await getJobMembers(job._id);
    if (jobmembers && jobmembers.length > 0) {
      for (const jobmember of jobmembers) {
        if (jobmember.messengerId && jobmember.messengerId !== member.messengerId) {
          myEmitter.emit('create-notification', jobmember.messengerId, job.company, notificationType.JOB, 'JOB_CLOSED', meta);
        }
      }
    }
  }

  return {status: result?.status};

}


async function archiveJob(jobId, member) {
  if(!jobId || !member){
    return;
  }

  let job = await JobRequisition.findById(jobId);
  if(job && (job.status!==statusEnum.ARCHIVED || job.status===statusEnum.DELETED)){
    job.status = statusEnum.ARCHIVED;
    job.updatedBy = member._id;
    job.updatedDate = Date.now();
    job = await job.save();
    await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.JOB, subject: job._id, action: actionEnum.ARCHIVED, meta: {name: member.firstName + ' ' + member.lastName, jobTitle: job.title, job: job._id}});
  }

  return job;
}



async function unarchiveJob(jobId, member) {
  if(!jobId || !member){
    return;
  }
  let job = await JobRequisition.findById(jobId);
  if(job && job.status!==statusEnum.DELETED) {
    job.status = statusEnum.ARCHIVED;
    job.updatedBy = member._id;
    job.updatedDate = Date.now();
    job.status = statusEnum.DRAFT;
    job = await job.save();
    await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.JOB, subject: job._id, action: actionEnum.UNARCHIVED, meta: {name: member.firstName + ' ' + member.lastName, jobTitle: job.title, job: job._id}});
  }

  return {status: job?.status};
}


async function deleteJob(jobId, member) {
  let result = null;
  let job = await JobRequisition.findById(jobId);
  if(job && job.status!==statusEnum.DELETED) {
    job.status = statusEnum.DELETED;
    job.updatedBy = member._id;
    job.updatedDate = Date.now();
    result = await job.save();
    await activityService.add({causer: member._id, causerType: subjectType.MEMBER, subjectType: subjectType.JOB, subject: job._id, action: actionEnum.DELETED, meta: {name: member.firstName + ' ' + member.lastName, jobTitle: job.title, job: job._id}});

    if(job.type === jobTypeEnum.PROMOTION && (job.searchAd || (job.ads && job.ads.length > 0))){
      myEmitter.emit('finalize-job-invoice', job, job.invoiceId);
    }

  }

  // JobAlert.remove({partyId: userId, jobId: jobId});
  return {status: result?.status};
}

function getCountsGroupByCompany(match){

  if(!match){
    return;
  }

  let res = JobRequisition.aggregate([
    {$match: match},
    { $group: {_id:{company:"$company"}, count:{$sum:1} } },
    {
      $lookup: {
        from: 'companies',
        localField: '_id.company',
        foreignField: '_id',
        as: '_id.company',
      },
    },
  ]);

  return res;
}


function getJobCount(filter) {
  let data = null;

  if(filter==null){
    return;
  }

  filter = {title: filter.title, jobId: filter.jobId, level: filter.level, jobFunction: filter.jobFunction, industry: filter.industry, city: filter.city, state: filter.state, country: filter.country, company: filter.company};
  let search = new SearchParam(filter);

  let res = JobRequisition.find(search).count();
  return res;
}


function getNewJobs(filter) {
  let data = null;

  if(!filter){
    return;
  }


  filter.publishedDate = dateEnum.PASTMONTH;

  let search = new SearchParam(filter);

  let res = JobRequisition.find(search).populate({
    path: 'company',
    model: 'Company',
  })
  .sort({publishedDate: -1})
  .limit(10);

  return res;
}

async function getNewJobsForDashboard(filter, userId, userLocation) {
  let data = null;

  if(!filter){
    return;
  }
  let currentDate = new Date();
  const millisecondsInADay = 86400000;

  filter.publishedDate = dateEnum.PASTMONTH;

  let search = new SearchParam(filter);

  let jobs = await JobRequisition.aggregate([
    {
      $match: search
    },
    {
      $lookup: {
        from: 'userimpressions',
        localField: '_id',
        foreignField: 'subject',
        as: 'jobViews'
      }
    },
    {
      $addFields: {
        noOfViews: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$jobViews',
                  as: 'view',
                  cond: { $eq: ['$$view.type', 'VIEWED'] }
                }
              },
              as: 'view',
              in: '$$view.viewCount'
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company'
      }
    },
    {
      $unwind: '$company'
    },
    {
      $lookup: {
        from: 'ads',
        let: { ads: '$ads' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$_id', '$$ads'] }
            }
          },
          {
            $lookup: {
              from: 'targets',
              localField: 'targeting',
              foreignField: '_id',
              as: 'targeting'
            }
          },
          {
            $unwind: {path:'$targeting', preserveNullAndEmptyArrays: true}
          },
          {
            $addFields: {
              isJobLandingNew: {
                $in: ['joblanding_new_job', '$targeting.adPositions']
              }
            }
          },
        ],
        as: 'ads'
      }
    },
    {
      $addFields: {
        isJobLandingNewAd: {
          $anyElementTrue: {
            $map: {
              input: '$ads',
              as: 'ad',
              in: '$$ad.isJobLandingNew'
            }
          }
        },
        captureToken: {
          $arrayElemAt: [
            {
              $map: {
                input: {
                  $filter: {
                    input: '$ads',
                    as: 'ad',
                    cond: '$$ad.isJobLandingNew'
                  }
                },
                as: 'ad',
                in: '$$ad._id'
              }
            },
            0
          ]
        }
      }
    },
    {
      $addFields: {
        locationScore: {
          $add: [
            { $cond: [{ $regexMatch: { input: {$toLower: userLocation?.country}, regex: {$toLower: '$country'}, options: 'i' }}, 0.5, 0] },
            { $cond: [{ $regexMatch: {input: { $toLower: '$state' }, regex: { $toLower: userLocation?.state }, options: 'i' }}, 0.25, 0] },
            //{ $cond: [{ $eq: ['$city', userLocation.city] }, 0.25, 0] }
            { $cond: [{ $regexMatch: { input: { $toLower: '$city' }, regex: userLocation?.city?.toLowerCase(), options: 'i' } }, 0.25, 0]}
          ]
        }
      }
    },
    {
      $addFields: {
        'rankingScore':{
          $add: [
            { $cond: ['$isJobLandingNewAd', 0.5, 0] },
            { $multiply: [ {$cond: [{ $eq: [{ $subtract: [currentDate.getTime(), '$publishedDate'] }, 0] }, 1, { $divide: [1, { $divide: [{ $subtract: [currentDate.getTime(), '$publishedDate'] }, millisecondsInADay] }] }]},0.3]},
            { $multiply: ['$noOfViews', 0.1] },
            { $multiply: ['$locationScore', 0.1] }
          ]
        }
      }
    },
    {
      $addFields: {
        hasLiked: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$jobViews',
                      as: 'view',
                      cond: {
                        $and: [ { $eq: ['$$view.partyId', userId] }, { $eq: ['$$view.type', 'LIKED'] } ]
                      }
                    }
                  }
                },
                0
              ]
            },
            then: true,
            else: false
          }
        },
        hasSaved: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$jobViews',
                      as: 'view',
                      cond: {
                        $and: [ { $eq: ['$$view.partyId', userId] }, { $eq: ['$$view.type', 'SAVED'] } ]
                      }
                    }
                  }
                },
                0
              ]
            },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $sort: {
        rankingScore: -1,
      }
    },
    {
      $limit: 10
    },
    {
      $project: {
        jobViews: 0,
        ads: 0,
      }
    }
  ]);

  return jobs;
}

async function getPopularJobs(filter, userLocation){
  if (!filter) {
    return;
  }

  filter.publishedDate = dateEnum.PASTMONTH;

  let search = new SearchParam(filter);

  let jobs = await JobRequisition.aggregate([
    {
      $match: search
    },
    {
      $lookup: {
        from: 'userimpressions',
        localField: '_id',
        foreignField: 'subject',
        as: 'jobViews'
      }
    },
    {
      $unwind: '$jobViews'
    },
    {
      $group: {
        _id: '$_id',
        job: { $first: '$$ROOT' },
        totalViews: { $sum: '$jobViews.viewCount' }
      }
    },
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'job',
        as: 'applications'
      }
    },
    {
      $addFields: {
        noOfApplied: { $size: '$applications' }
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'job.company',
        foreignField: '_id',
        as: 'company'
      }
    },
    {
      $unwind: '$company'
    },
    {
      $lookup: {
        from: 'ads',
        let: { ads: { $ifNull: ['$job.ads', []] } },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$_id', '$$ads'] }
            }
          },
          {
            $lookup: {
              from: 'targets',
              localField: 'targeting',
              foreignField: '_id',
              as: 'targeting'
            }
          },
          {
            $unwind: {path:'$targeting', preserveNullAndEmptyArrays: true}
          },
          {
            $addFields: {
              isJobLandingPopular: {
                $in: ['joblanding_popular_job', '$targeting.adPositions']
              }
            }
          },
        ],
        as: 'job.ads'
      }
    },
    {
      $addFields: {
        'job.isJobLandingPopularAd': {
          $anyElementTrue: {
            $map: {
              input: '$job.ads',
              as: 'ad',
              in: '$$ad.isJobLandingPopular'
            }
          }
        },
        'job.captureToken': {
          $arrayElemAt: [
            {
              $map: {
                input: {
                  $filter: {
                    input: '$job.ads',
                    as: 'ad',
                    cond: '$$ad.isJobLandingPopular'
                  }
                },
                as: 'ad',
                in: '$$ad._id'
              }
            },
            0
          ]
        }
      }
    },
    {
      $addFields: {
        'job.locationScore': {
          $add: [
            { $cond: [{ $regexMatch: { input: {$toLower: userLocation?.country}, regex: {$toLower: '$job.country'}, options: 'i' }}, 0.5, 0] },
            { $cond: [{ $regexMatch: {input: { $toLower: '$job.state' }, regex: { $toLower: userLocation?.state }, options: 'i' }}, 0.25, 0] },
            //{ $cond: [{ $eq: ['$city', userLocation.city] }, 0.25, 0] }
            { $cond: [{ $regexMatch: { input: { $toLower: '$job.city' }, regex: userLocation?.city?.toLowerCase(), options: 'i' } }, 0.25, 0]}
          ]
        }
      }
    },
    {
      $addFields: {
        'job.noOfViews': '$totalViews',
        'job.noOfApplied': '$noOfApplied',
        'job.company': '$company',
        'job.rankingScore':{
          $add: [
            { $cond: ['$job.isJobLandingPopularAd', 0.4, 0] },
            { $multiply: ['$noOfApplied', 0.2]},
            { $multiply: ['$totalViews', 0.2] },
            { $multiply: ['$job.locationScore', 0.2] }
          ]
        }
      }
    },
    {
      $sort: {
        'job.rankingScore': -1,
      }
    },
    {
      $limit: 10
    },
    {
      $replaceRoot: {
        newRoot: '$job'
      }
    },
    {
      $project: {
        jobViews: 0,
        ads: 0,
      }
    }
  ]);

  return jobs;
}

async function getHighlightJobs(filter, userLocation){
  if (!filter) {
    return;
  }
  filter.publishedDate = dateEnum.PASTMONTH;
  let search = new SearchParam(filter);

  let jobs = await JobRequisition.aggregate([
    {
      $match: search
    },
    {
      $lookup: {
        from: 'userimpressions',
        localField: '_id',
        foreignField: 'subject',
        as: 'jobViews'
      }
    },
    {
      $unwind: '$jobViews'
    },
    {
      $group: {
        _id: '$_id',
        job: { $first: '$$ROOT' },
        totalViews: { $sum: '$jobViews.viewCount' }
      }
    },
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'job',
        as: 'applications'
      }
    },
    {
      $addFields: {
        noOfApplied: { $size: '$applications' }
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'job.company',
        foreignField: '_id',
        as: 'company'
      }
    },
    {
      $unwind: '$company'
    },
    {
      $lookup: {
        from: 'ads',
        let: { ads: { $ifNull: ['$job.ads', []] } },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$_id', '$$ads'] }
            }
          },
          {
            $lookup: {
              from: 'targets',
              localField: 'targeting',
              foreignField: '_id',
              as: 'targeting'
            }
          },
          {
            $unwind: {path:'$targeting', preserveNullAndEmptyArrays: true}
          },
          {
            $addFields: {
              isJobLandingHighlight: {
                $in: ['joblanding_highlight_job', '$targeting.adPositions']
              }
            }
          },
        ],
        as: 'job.ads'
      }
    },
    {
      $addFields: {
        'job.isJobLandingHighlightAd': {
          $anyElementTrue: {
            $map: {
              input: '$job.ads',
              as: 'ad',
              in: '$$ad.isJobLandingHighlight'
            }
          }
        },
        'job.captureToken': {
          $arrayElemAt: [
            {
              $map: {
                input: {
                  $filter: {
                    input: '$job.ads',
                    as: 'ad',
                    cond: '$$ad.isJobLandingHighlight'
                  }
                },
                as: 'ad',
                in: '$$ad._id'
              }
            },
            0
          ]
        }
      }
    },
    {
      $addFields: {
        'job.locationScore': {
          $add: [
            { $cond: [{ $regexMatch: { input: {$toLower: userLocation?.country}, regex: {$toLower: '$job.country'}, options: 'i' }}, 0.5, 0] },
            { $cond: [{ $regexMatch: {input: { $toLower: '$job.state' }, regex: { $toLower: userLocation?.state }, options: 'i' }}, 0.25, 0] },
            //{ $cond: [{ $eq: ['$city', userLocation.city] }, 0.25, 0] }
            { $cond: [{ $regexMatch: { input: { $toLower: '$job.city' }, regex: userLocation?.city?.toLowerCase(), options: 'i' } }, 0.25, 0]}
          ]
        }
      }
    },
    {
      $addFields: {
        'job.noOfViews': '$totalViews',
        'job.noOfApplied': '$noOfApplied',
        'job.company': '$company',
        'job.rankingScore':{
          $add: [
            { $cond: ['$job.isJobLandingHighlightAd', 0.4, 0] },
            { $multiply: ['$noOfApplied', 0.2]},
            { $multiply: ['$totalViews', 0.2] },
            { $multiply: ['$job.locationScore', 0.2] }
          ]
        }
      }
    },
    {
      $sort: {
        'job.rankingScore': -1,
      }
    },
    {
      $limit: 10
    },
    {
      $replaceRoot: {
        newRoot: '$job'
      }
    },
    {
      $project: {
        jobViews: 0,
        ads: 0,
      }
    }
  ]);

  return jobs;
}

async function getRelatedJobs(job) {
  let data = null;

  if(job==job){
    return;
  }

  let listOfRoles = ['Team Leader', 'Manager', 'Assistant Manager', 'Executive', 'Director', 'Coordinator', 'Administrator', 'Controller', 'Officer', 'Organizer', 'Supervisor', 'Superintendent', 'Head', 'Overseer', 'Chief', 'Foreman', 'Controller', 'Principal', 'President', 'Lead']

  let marketing = ['Marketing Specialist', 'Marketing Manager', 'Marketing Director', 'Graphic Designer', 'Marketing Research Analyst', 'Marketing Communications Manager', 'Marketing Consultant', 'Product Manager', 'Public Relations', 'Social Media Assistant', 'Brand Manager', 'SEO Manager', 'Content Marketing Manager', 'Copywriter', 'Media Buyer', 'Digital Marketing Manager', 'eCommerce Marketing Specialist', 'Brand Strategist', 'Vice President of Marketing', 'Media Relations Coordinator']
  let sales = ['Sales Associate', 'Sales Representative', 'Sales Manager', 'Retail Worker', 'Store Manager', 'Sales Representative', 'Sales Manager', 'Real Estate Broker', 'Sales Associate', 'Cashier', 'Store Manager', 'Account Executive', 'Account Manager', 'Area Sales Manager', 'Direct Salesperson', 'Director of Inside Sales', 'Outside Sales Manager', 'Sales Analyst', 'Market Development Manager', 'B2B Sales Specialist', 'Sales Engineer', 'Merchandising Associate']
  let constructions = ['Construction Worker', 'Taper', 'Plumber', 'Heavy Equipment Operator', 'Vehicle or Equipment Cleaner', 'Carpenter', 'Electrician', 'Painter', 'Welder', 'Handyman', 'Boilermaker', 'Crane Operator', 'Building Inspector', 'Pipefitter', 'Sheet Metal Worker', 'Iron Worker', 'Mason', 'Roofer', 'Solar Photovoltaic Installer', 'Well Driller'];
  let it = ['Computer Scientist', 'IT Professional', 'UX Designer & UI Developer', 'SQL Developer', 'Web Designer', 'Web Developer', 'Help Desk Worker/Desktop Support', 'Software Engineer', 'Data Entry', 'DevOps Engineer', 'Computer Programmer', 'Network Administrator', 'Information Security Analyst', 'Artificial Intelligence Engineer', 'Cloud Architect', 'IT Manager', 'Technical Specialist', 'Application Developer', 'Chief Technology Officer (CTO)', 'Chief Information Officer (CIO)'];
  let helpdesk = ['Virtual Assistant', 'Customer Service', 'Customer Support', 'Concierge', 'Help Desk', 'Customer Service Manager', 'Technical Support Specialist', 'Account Representative', 'Client Service Specialist', 'Customer Care Associate'];
  let operation = ['Operations Manager', 'Operations Assistant', 'Operations Coordinator', 'Operations Analyst', 'Operations Director', 'Vice President of Operations', 'Operations Professional', 'Scrum Master', 'Continuous Improvement Lead', 'Continuous Improvement Consultant'];
  let finance = ['Credit Authorizer', 'Benefits Manager', 'Credit Counselor', 'Accountant', 'Bookkeeper', 'Accounting Analyst', 'Accounting Director', 'Accounts Payable/Receivable Clerk', 'Auditor', 'Budget Analyst', 'Controller', 'Financial Analyst', 'Finance Manager', 'Economist', 'Payroll Manager', 'Payroll Clerk', 'Financial Planner', 'Financial Services Representative', 'Finance Director', 'Commercial Loan Officer'];
  let engineering = ['Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Assistant Engineer', 'Chemical Engineer', 'Chief Engineer', 'Drafter', 'Engineering Technician', 'Geological Engineer', 'Biological Engineer', 'Maintenance Engineer', 'Mining Engineer', 'Nuclear Engineer', 'Petroleum Engineer', 'Plant Engineer', 'Production Engineer', 'Quality Engineer', 'Safety Engineer', 'Sales Engineer'];
  let researchAnalyst = ['Researcher', 'Research Assistant', 'Data Analyst', 'Business Analyst', 'Financial Analyst', 'Biostatistician', 'Title Researcher', 'Market Researcher', 'Title Analyst', 'Medical Researcher'];
  let teach = ['Mentor', 'Tutor/Online Tutor', 'Teacher', 'Teaching Assistant', 'Substitute Teacher', 'Preschool Teacher', 'Test Scorer', 'Online ESL Instructor', 'Professor', 'Assistant Professor'];
  let artistic = ['Graphic Designer', 'Artist', 'Interior Designer', 'Video Editor', 'Video or Film Producer', 'Playwright', 'Musician', 'Novelist/Writer', 'Computer Animator', 'Photographer', 'Camera Operator', 'Sound Engineer', 'Motion Picture Director', 'Actor', 'Music Producer', 'Director of Photography'];
  let healthcare = ['Nurse', 'Travel Nurse', 'Nurse Practitioner', 'Doctor', 'Caregiver', 'CNA', 'Physical Therapist', 'Pharmacist', 'Pharmacy Assistant', 'Medical Administrator', 'Medical Laboratory Tech', 'Physical Therapy Assistant', 'Massage Therapy', 'Dental Hygienist', 'Orderly', 'Personal Trainer', 'Massage Therapy', 'Medical Laboratory Tech', 'Phlebotomist', 'Medical Transcriptionist', 'Telework Nurse/Doctor', 'Reiki Practitioner']
  let hospitality = ['Housekeeper', 'Flight Attendant', 'Travel Agent', 'Hotel Front Door Greeter', 'Bellhop', 'Cruise Director', 'Entertainment Specialist', 'Hotel Manager', 'Front Desk Associate', 'Front Desk Manager', 'Concierge', 'Group Sales', 'Event Planner', 'Porter', 'Spa Manager', 'Wedding Coordinator', 'Cruise Ship Attendant', 'Casino Host', 'Hotel Receptionist', 'Reservationist', 'Events Manager', 'Meeting Planner', 'Lodging Manager', 'Director of Maintenance', 'Valet']
  let foodservice = ['Waiter', 'Waitress', 'Server', 'Chef', 'Fast Food Worker', 'Barista', 'Line Cook', 'Cafeteria Worker', 'Restaurant Manager', 'Wait Staff Manager', 'Bus Person', 'Restaurant Chain Executive']
  let scientist = ['Political Scientist', 'Chemist', 'Conservation Scientist', 'Sociologist', 'Biologist', 'Geologist', 'Physicist', 'Astronomer', 'Atmospheric Scientist', 'Molecular Scientist']
  let onthephone = ['Call Center Representative', 'Customer Service', 'Telemarketer', 'Telephone Operator', 'Phone Survey Conductor', 'Dispatcher for Trucks or Taxis', 'Customer Support Representative', 'Over the Phone Interpreter', 'Phone Sales Specialist', 'Mortgage Loan Processor']
  let counseling = ['Counselor', 'Mental Health Counselor', 'Addiction Counselor', 'School Counselor', 'Speech Pathologist', 'Guidance Counselor', 'Social Worker', 'Therapist', 'Life Coach', 'Couples Counselor']
  let cosmetology = ['Beautician', 'Hair Stylist', 'Nail Technician', 'Cosmetologist', 'Salon Manager', 'Makeup Artist', 'Esthetician', 'Skin Care Specialist', 'Manicurist', 'Barber']
  let writing = ['Journalist', 'Copy Editor', 'Editor/Proofreader', 'Content Creator', 'Speechwriter', 'Communications Director', 'Screenwriter', 'Technical Writer', 'Columnist', 'Public Relations Specialist', 'Proposal Writer', 'Content Strategist', 'Grant Writer', 'Video Game Writer', 'Translator', 'Film Critic', 'Copywriter', 'Travel Writer', 'Social Media Specialist', 'Ghostwriter']
  let physicallabor = ['Warehouse Worker', 'Painter', 'Truck Driver', 'Heavy Equipment Operator', 'Welding', 'Physical Therapy Assistant', 'Housekeeper', 'Landscaping Worker', 'Landscaping Assistant', 'Mover']
  let jobswithanimals = ['Animal Breeder', 'Veterinary Assistant', 'Farm Worker', 'Animal Shelter Worker', 'Dog Walker / Pet Sitter', 'Zoologist', 'Animal Trainer', 'Service Dog Trainer', 'Animal Shelter Manager', 'Animal Control Officer']
  let driver = ['Delivery Driver', 'School Bus Driver', 'Truck Driver', 'Tow Truck Operator', 'UPS Driver', 'Mail Carrier', 'Recyclables Collector', 'Courier', 'Bus Driver', 'Cab Driver']
  let volunteer = ['Animal Shelter Board Member', 'Office Volunteer', 'Animal Shelter Volunteer', 'Hospital Volunteer', 'Youth Volunteer', 'Food Kitchen Worker', 'Homeless Shelter Worker', 'Conservation Volunteer', 'Meals on Wheels Driver', 'Habitat for Humanity Builder', 'Emergency Relief Worker', 'Red Cross Volunteer', 'Community Food Project Worker', 'Women’s Shelter Jobs', 'Suicide Hotline Volunteer', 'School Volunteer', 'Community Volunteer Jobs', 'Sports Volunteer', 'Church Volunteer ']
  let other = ['Archivist', 'Actuary', 'Architect', 'Personal Assistant', 'Entrepreneur', 'Security Guard', 'Mechanic', 'Recruiter', 'Mathematician', 'Locksmith', 'Management Consultant', 'Shelf Stocker', 'Caretaker or House Sitter', 'Library Assistant', 'Translator', 'HVAC Technician', 'Attorney', 'Paralegal', 'Executive Assistant', 'Personal Assistant', 'Bank Teller', 'Parking Attendant', 'Machinery Operator', 'Manufacturing Assembler', 'Funeral Attendant', 'Assistant Golf Professional', 'Yoga Instructor']

  return res;
}



async function findJobsByCompanyId(company) {
  let data = null;

  if(!company){
    return;
  }

  console.log(company)
  return await JobRequisition.find({company:company})

}


async function getGroupOfCompanyJobs(listOfCompanyIds) {
  let data = null;

  if(listOfCompanyIds==null){
    return;
  }


  return await JobRequisition.aggregate([
    { $match: {company: {$in: listOfCompanyIds }} },
    { $group: {_id:'$company'} },
    {$lookup:{
        from:"jobrequisitions",
        as:"list",
        let:{g:"$_id"},
        pipeline:[
          {$match:{$expr:{$eq:["$company","$$g"]}}},
          {$limit:5},
          // {$project:{_id:0, company:1, jobId:1}}
        ]
      }}
  ])

}



async function getJobsEndingSoon(company) {
  let data = null;

  if(company==null){
    return;
  }

  return await JobRequisition.aggregate([
    {$match: {company: company, status: 'ACTIVE', endDate: { $gt: Date.now() }} },
    {$lookup: {from: "members", localField: "createdBy", foreignField: "_id", as: "createdBy"}},
    {$unwind: '$createdBy' },
    {$lookup: {from: "companydepartments", localField: "department", foreignField: "_id", as: "department"}},
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    { $addFields:
        {
          timeLeft: {$round: [ {$divide : [{$subtract: [{$toDate:"$endDate"}, "$$NOW"]}, 86400000]}, 0 ] } ,
          datePublished: { $toDate: '$publishedDate' },
          description: null,
          responsibilities: [],
          qualifications: [],
          minimumQualifications: []
        }
    },
    {
      $match: { timeLeft: { $gte: 0, $lte: 5 } }
    },
    {
      $sort: { timeLeft: 1 }
    },
    {
      $limit: 10
    }
  ]);


}

async function getCompanyJobCounts(company) {
  if(!company){
    return;
  }

  // const result = { free: 0, promoted: 0, draft: 0, archived: 0 };
  const jobs = await JobRequisition.aggregate([
    { $match: {company, status: 'ACTIVE'} },
    {
      $group: {
        _id: { type: "$type"},
        count:{$sum:1}
      }
    },
    { $project: {_id: 0, type: '$_id.type', count: 1 } }
  ]);



  return jobs;
};

async function getCompanyJobSummary(company, duration, timezone){

  let currentStartDate, groupByField;
  const now = moment().tz(timezone);

  if (duration === '1W') {
    currentStartDate = now.clone().subtract(7, 'days').startOf('day');
    groupByField = { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$publishedDate" } } };
  }else if (duration === '1M') {
    currentStartDate = now.clone().subtract(30, 'days').startOf('day');
    groupByField = { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$publishedDate" } } };
  } else if (duration === '3M') {
    currentStartDate = now.clone().subtract(3, 'months').startOf('month');
    groupByField = { $dateToString: { format: "%Y-%m", date: { $toDate: "$publishedDate" } } };
  } else if (duration === '6M') {
    currentStartDate = now.clone().subtract(6, 'months').startOf('month');
    groupByField = { $dateToString: { format: "%Y-%m", date: { $toDate: "$publishedDate" } } };
  }
  const endDate = now.clone().endOf('day');

  const pipeline = [
    {
      $match: {
        company: company,
        publishedDate: { $gte: currentStartDate.toDate().getTime(), $lte: endDate.toDate().getTime() },
        status: { $in: [statusEnum.CLOSED, statusEnum.ACTIVE] }
      }
    },
    {
      $project: {
        date: groupByField,
        status: 1
      }
    },
    {
      $group: {
        _id: {
          date: "$date",
          status: "$status"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
          _id: "$_id.date",
          newJobs: {
              $sum: {
                  $cond: [{ $eq: ["$_id.status", statusEnum.ACTIVE] }, "$count", 0]
              }
          },
          closedJobs: {
              $sum: {
                  $cond: [{ $eq: ["$_id.status", statusEnum.CLOSED] }, "$count", 0]
              }
          }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ];

  const result = await JobRequisition.aggregate(pipeline);

  const { summary, totalNewJobs, totalClosedJobs } = processResult(result, currentStartDate, now, duration);
  return {totalNewJobs, totalClosedJobs, data: summary.reverse() };
};

const processResult = (result, startDate, endDate, duration) => {
  let data = [];
  let totalNewJobs = 0;
  let totalClosedJobs = 0;
  const date = startDate.clone();
  const isDaily = (duration === '1M' || duration === '1W');

  while (date.isSameOrBefore(endDate)) {
    const dateStr = isDaily ? date.format('YYYY-MM-DD') : date.format('YYYY-MM');
    const found = result.find(item => item._id === dateStr) || { newJobs: 0, closedJobs: 0 };

    data.push({
      date: isDaily? `${date.date()}/${date.month() + 1}` : `${date.month() + 1}/${date.year()}`,
      data: {
        new: found.newJobs,
        closed: found.closedJobs
      }
    });
    totalNewJobs += found ? found.newJobs : 0;
    totalClosedJobs += found ? found.closedJobs : 0;

    isDaily ? date.add(1, 'day') : date.add(1, 'month');
  }
  return { summary: data, totalNewJobs, totalClosedJobs };
};

async function search(member, query, filter, sort, locale) {
  if(!filter || !sort){
    return null;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };



  let result;
  let currentDate = Date.now();
  let aList = [];
  let match = {};
  let aSort;


  // if(query){
  //   let regex = new RegExp(query, 'i');
  //   match['$or'] =  [{title: { $regex: regex} }];
  // }



  // if(filter.company.length){
  //   let companies = await companyService.findByCompanyIds(filter.company, false);
  //   match.company = {$in: _.reduce(companies, function(res, item){res.push(item._id); return res;}, [])};
  //   filter.company = [];
  // }
  //
  // if(filter.status.length){
  //   match.status = {$in:filter.status};
  //   filter.status = [];
  // }



  if(sort && sort.sortBy=='popular'){
    aSort = { $sort: { noOfViews: direction} };
  } else if(sort && sort.sortBy=='title'){
    aSort = { $sort: {title: direction} };
  } else {
    aSort = { $sort: {createdDate: direction} };
  }

  filter.status=filter.status && filter.status.length? filter.status:[statusEnum.ACTIVE, statusEnum.DRAFT];
  filter.query=query;
  filter.companyId = filter.company;
  delete filter.company;
  // console.log(new SearchParam(filter))

  if(filter.hasSaved){
    let jobSubscribed = await memberService.findMemberSubscribedToSubjectType(member._id, subjectType.JOB);
    aList.push({ $match: {_id: {$in: _.map(jobSubscribed, 'subject')}} });
  }

  aList.push({ $match: new SearchParam(filter)});
  aList.push(
    {
      $lookup: {
        from: 'members',
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy"
      }
    },
    { $unwind: '$createdBy'},
    {
      $lookup: {
        from: 'labels',
        localField: "tags",
        foreignField: "_id",
        as: "tags"
      }
    },
    {$lookup:{
        from:"ads",
        let:{ads: '$ads'},
        pipeline:[
          {$match:{$expr:{$in:["$_id", "$$ads"]}}},
          {
            $lookup: {
              from: 'targets',
              localField: "targeting",
              foreignField: "_id",
              as: "targeting"
            }
          },
          {$unwind: '$targeting' }
        ],
        as: 'ads'
    }},
    {
      $lookup: {
        from: 'companies',
        localField: "company",
        foreignField: "_id",
        as: "company"
      }
    },
    { $unwind: {path: '$company', preserveNullAndEmptyArrays: true} },
    {
      $lookup: {
        from: 'applications',
        localField: "applications",
        foreignField: "_id",
        as: "applications"
      }
    },
    {
      $lookup: {
        from: 'companydepartments',
        localField: "department",
        foreignField: "_id",
        as: "department"
      }
    },
    { $unwind: {path: '$department', preserveNullAndEmptyArrays: true} },
    {
      $lookup: {
        from: 'userimpressions',
        let: { jobId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$subject', '$$jobId'] },
                  { $eq: ['$subjectType', 'JOB'] },
                  { $eq: ['$type', 'VIEWED'] }
                ]
              }
            }
          },
          {
            $group: {
              _id: '$subject',
              totalViews: { $sum: '$viewCount' }
            }
          }
        ],
        as: 'viewData'
      }
    },
    { $addFields: {
        hasApplied: {
          '$in': [
            member?.createdBy,
            '$applications.partyId'
          ]
        },
        noOfApplied: {
          $size: "$applications"
        },
        noOfViews: {
          $ifNull: [ { $arrayElemAt: ['$viewData.totalViews', 0] }, 0 ]
        },
        applications: []
      }
    },
    {
      $project: {
        viewData: 0,  // Exclude viewData from the final output
      }
    },
  );

  if (filter.mostViewedJobs) {
    aList.push({
      $match: {
        noOfViews: { $gt: 0 }
      }
    })
  }

  if (!member.role?.isSuper) {
    aList.push({
      $match: {
        $or: [
          { 'createdBy._id': member._id }, // Match jobs created by the user
          { 'members': { $in: [member._id] } } // Match jobs where the user is a member
        ]
      }
    });
  }
  aList.push(aSort);

  const aggregate = JobRequisition.aggregate(aList);
  result = await JobRequisition.aggregatePaginate(aggregate, options);

  const companyIds = _.map(result.docs, 'company.companyId');
  let foundCompanies = await feedService.lookupCompaniesIds(_.reduce(result.docs, function(res, i){ res.push(i.company.companyId); return res;},  []));
  let hasSaves = await bookmarkService.findBookByUserId(member, null);

  let today = Date.now();
  _.forEach(result.docs, function(job){
    job.hasSaved = _.find(hasSaves, {jobId: job._id})?true:false;
    job.company = convertToCompany(job.company);
    job.createdBy = convertToAvatar(job.createdBy);
    job.shareUrl = 'https://www.accessed.co/jobs/'+job.jobId;

    job.skills=[];
    job.industry=[];
    job.members=[];
    job.responsibilities=[];
    job.qualifications = [];
    job.minimumQualifications=[];
    // job.description = null;
    if(job?.ads){
      job.isHot = _.reduce(job.ads, function(res, ad){
        if(_.includes(ad.targeting?.adPositions, adPosition.hottag)){
          if(ad.startTime < today && ad.endTime > today){
            res = true;
          }

        }
        return res;
      }, false);
      job.ads = [];
    }
  })

  return result;
}


async function searchWithBudget(member, query, filter, sort, locale){
  if(!filter || !sort){
    return null;
  }

  const PEAK_HOURS = [
    { start: 8, end: 10 },
    { start: 18, end: 20 }
  ];

  const isPeakHour = () => {
    const currentHour = new Date().getHours();
    return PEAK_HOURS.some(({ start, end }) => currentHour >= start && currentHour < end);
  };

  const calculateCombinedScoreExpression = (isPeakHour, leftoverAmountForTheDay) => {
    return {
      $add: [
        { $multiply: [ leftoverAmountForTheDay, 0.7 ] },
        { $multiply: [ "$qualityScore", 0.3 ] },
        ...(isPeakHour ? [{ $multiply: [{ $add: [ { $multiply: [ leftoverAmountForTheDay, 0.7 ] }, { $multiply: [ "$qualityScore", 0.3 ] } ] }, 0.2 ] }] : [])
      ]
    };
  };

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };

  let result;
  let currentDate = new Date();
  const millisecondsInADay = 86400000;
  let startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
  const costPerImpression = parseFloat(config.ads.cost_per_impression) || 0.01; // cost per impression
  const costPerClick = parseFloat(config.ads.cost_per_click) || 0.50; // cost per click

  let aList = [];
  let match = {};
  let aSort;

  if(sort && sort.sortBy=='popular'){
    aSort = { $sort: { combinedScore: -1, noOfViews: direction} };
  } else if(sort && sort.sortBy=='title'){
    aSort = { $sort: {combinedScore: -1, title: direction} };
  } else {
    aSort = { $sort: {combinedScore: -1, createdDate: direction} };
  }

  filter.status=filter.status && filter.status.length? filter.status:[statusEnum.ACTIVE, statusEnum.DRAFT];
  filter.query=query;
  filter.companyId = filter.company;
  delete filter.company;
  // console.log(new SearchParam(filter))

  if(filter.hasSaved){
    let jobSubscribed = await memberService.findMemberSubscribedToSubjectType(member._id, subjectType.JOB);
    aList.push({ $match: {_id: {$in: _.map(jobSubscribed, 'subject')}} });
  }

  if (filter.query) {
    aList.push({ $match: { $text: { $search: filter.query || '' } } });
  }
  aList.push({ $match: new SearchParam(filter)});

  aList.push(
    {
      $lookup: {
        from: 'ads',
        localField: 'searchAd',
        foreignField: '_id',
        as: 'searchAd'
      }
    },
    { $unwind: { path: '$searchAd', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        bidAmount: '$searchAd.bidAmount',
        lifetimeBudget: '$searchAd.lifetimeBudget',
        totalSpend: '$searchAd.totalSpend',
      }
    },
    {
      $lookup: {
        from: 'adimpressions',
        let: { adId: '$searchAd._id', date: startOfDay },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$adId', '$$adId'] }, { $gte: ['$timestamp', new Date(startOfDay)] }] } } },
          { $group: { _id: null, totalImpressions: { $sum: '$impressions' }, totalClicks: { $sum: '$clicks' }, totalSpend: { $sum: '$spend' } } }
        ],
        as: 'dailyStats'
      }
    },
    { $unwind: { path: '$dailyStats', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        dailySpend: {
          $add: [
            { $multiply: [{ $ifNull: ['$dailyStats.totalImpressions', 0] }, costPerImpression] },
            { $multiply: [{ $ifNull: ['$dailyStats.totalClicks', 0] }, costPerClick] }
          ]
        }
      }
    },
    {
      $addFields: {
        leftoverAmountForTheDay: { $subtract: ['$bidAmount', '$dailySpend'] },
        withinBudget: {
          $and: [
            { $lte: ['$totalSpend', '$lifetimeBudget'] },
            { $lte: ['$dailySpend', '$bidAmount'] }
          ]
        }
      }
    },
    {
      $addFields: {
        relevance: {
          $cond: { if: { $eq: [ filter.query, '' ] }, then: 0, else: { $meta: "textScore" } }
        },
        completeness: { $cond: [{ $and: [{ $ne: ['$title', ''] }, { $gt: [{ $strLenCP: '$description' }, 0] }, { $gt: [{ $strLenCP: '$description' }, 50] }, ]}, 1, 0] },
        freshness: {$cond: [{ $eq: [{ $subtract: [currentDate.getTime(), '$publishedDate'] }, 0] }, 1, { $divide: [1, { $divide: [{ $subtract: [currentDate.getTime(), '$publishedDate'] }, millisecondsInADay] }] }]},
        engagement: '$noOfViews',
      }
    },
    {
      $addFields: {
        qualityScore: {
          $add: [
            { $multiply: [ "$relevance", 0.4 ] },
            { $multiply: [ "$completeness", 0.3 ] },
            { $multiply: [ "$freshness", 0.2 ] },
            { $multiply: [ "$engagement", 0.1 ] }
          ]
        }
      }
    },
    {
      $addFields: {
        combinedScore: {
          $cond: {
            if: { $eq: ['$withinBudget', true] },
            then: calculateCombinedScoreExpression(isPeakHour(), "$leftoverAmountForTheDay"),
            else: null
          }
        }
      }
    },
  );

  aList.push(
    {
      $lookup: {
        from: 'members',
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy"
      }
    },
    { $unwind: '$createdBy'},
    {
      $lookup: {
        from: 'labels',
        localField: "tags",
        foreignField: "_id",
        as: "tags"
      }
    },
    {$lookup:{
        from:"ads",
        let:{ads: '$ads'},
        pipeline:[
          {$match:{$expr:{$in:["$_id", "$$ads"]}}},
          {
            $lookup: {
              from: 'targets',
              localField: "targeting",
              foreignField: "_id",
              as: "targeting"
            }
          },
          {$unwind: '$targeting' }
        ],
        as: 'ads'
    }},
    {
      $lookup: {
        from: 'companies',
        localField: "company",
        foreignField: "_id",
        as: "company"
      }
    },
    { $unwind: {path: '$company', preserveNullAndEmptyArrays: true} },
    {
      $lookup: {
        from: 'applications',
        localField: "applications",
        foreignField: "_id",
        as: "applications"
      }
    },
    {
      $lookup: {
        from: 'companydepartments',
        localField: "department",
        foreignField: "_id",
        as: "department"
      }
    },
    { $unwind: {path: '$department', preserveNullAndEmptyArrays: true} },
    { $addFields: {
        hasApplied: {
          '$in': [
            member?.createdBy,
            '$applications.partyId'
          ]
        },
        noOfApplied: {
          $size: "$applications"
        },
        applications: []
      }
    },
  );
  aList.push(
    {
      $lookup: {
        from: 'userimpressions',
        let: { jobId: '$_id', userId: member },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$subject', '$$jobId'] },
                  { $eq: ['$partyId', '$$userId'] },
                ]
              }
            }
          },
        ],
        as: 'userImpressions'
      }
    },
    {
      $addFields: {
        hasSaved: {
          $cond: {
            if: { $gt: [{ $size: { $filter: { input: '$userImpressions', as: 'impression', cond: { $eq: ['$$impression.type', 'SAVED'] } } } }, 0] },
            then: true,
            else: false
          }
        },
        hasLiked: {
          $cond: {
            if: { $gt: [{ $size: { $filter: { input: '$userImpressions', as: 'impression', cond: { $eq: ['$$impression.type', 'LIKED'] } } } }, 0] },
            then: true,
            else: false
          }
        }
      }
    },
    { $unset: 'userImpressions' },
    {
      $lookup: {
        from: 'jobimpressions',
        localField: 'impression',
        foreignField: '_id',
        as: 'impression'
      }
    },
    {
      $unwind: { path: '$impression', preserveNullAndEmptyArrays: true }
    },
    {
      $addFields: {
        impression: { $ifNull: ['$impression', {}] }
      }
    },
  );
  aList.push(aSort);

  const aggregate = JobRequisition.aggregate(aList);
  result = await JobRequisition.aggregatePaginate(aggregate, options);

  let foundCompanies = await feedService.lookupCompaniesIds(_.reduce(result.docs, function(res, i){ res.push(i.company.companyId); return res;},  []));

  let today = Date.now();
  _.forEach(result.docs, async function(job){
    job.company = convertToCompany(job.company);
    job.createdBy = convertToAvatar(job.createdBy);
    job.shareUrl = 'https://www.accessed.co/jobs/'+job.jobId;

    job.skills=[];
    job.industry=[];
    job.members=[];
    job.responsibilities=[];
    job.qualifications = [];
    job.minimumQualifications=[];
    if(job?.ads){
      job.isHot = _.reduce(job.ads, function(res, ad){
        if(_.includes(ad.targeting?.adPositions, adPosition.hottag)){
          if(ad.startTime < today && ad.endTime > today){
            res = true;
          }

        }
        return res;
      }, false);
      job.ads = [];
    }
    if (job.searchAd && job.dailySpend <= job.bidAmount && job.searchAd.totalSpend <= job.searchAd.lifetimeBudget) {
      const impression = await AdImpression.findOneAndUpdate(
        { adId: job.searchAd._id, timestamp: { $gte: startOfDay, $lt: startOfDay + millisecondsInADay } },
        {
          $inc: { impressions: 1, spend: costPerImpression },
          $setOnInsert: { timestamp: new Date() }
        },
        { upsert: true, new: true }
      );

      await Ad.findByIdAndUpdate(
        job.searchAd._id,
        { $inc: { totalSpend: costPerImpression } },
        { new: true }
      );
    }
  })

  return result;
}

async function lookUpJobs(company, query) {

  let result = [];
  let aList = [];
  let match = {};
  let currentDate = Date.now();
  let aSort;

  aList.push({ $match: { company, status: statusEnum.ACTIVE, title: { $regex: query, $options: 'i'}} });
  aList.push(
    {
      $lookup: {
        from: 'members',
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy"
      }
    },
    { $unwind: '$createdBy'},
    {
      $lookup: {
        from: 'companies',
        localField: "company",
        foreignField: "_id",
        as: "company"
      }
    },
    { $unwind: {path: '$company', preserveNullAndEmptyArrays: true} },
    {
      $lookup: {
        from: 'companydepartments',
        localField: "department",
        foreignField: "_id",
        as: "department"
      }
    },
    { $unwind: {path: '$department', preserveNullAndEmptyArrays: true} },
  );
  aList.push({ $limit: 20 });
  aList.push({ $sort: {jobTitle: -1} });
  // aList.push({
  //   $project: {
  //     title: 1,
  //     allowRemote: 1,
  //     employmentType: 1,
  //     city: 1,
  //     state: 1,
  //     country: 1,
  //     company: 1,
  //     createdBy: 1,
  //     createdDate: 1,
  //     jobId: 1,
  //     publishedDate: 1,
  //     jobFunction: 1,
  //     allowRemote: 1
  // } });

  result = await JobRequisition.aggregate(aList);


  return result;
}

async function searchJobTitle(query, locale) {

  const currentDate = Date.now();

  let result = await JobRequisition.aggregate( [
    { $match: { title: { $regex: query, $options: 'i' } } },
    { $project: {title: 1}}
  ])

  result = _.reduce(result, function(res, o){ res.push(o.title); return res; }, []);
  return result;
}

async function getCompanyJobs(currentUserId, query, filter, sort, locale) {
  if(!filter || !sort){
    return null;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };



  let result;
  let currentDate = Date.now();
  let aList = [];
  let match = {};
  let aSort;


  // if(query){
  //   let regex = new RegExp(query, 'i');
  //   match['$or'] =  [{title: { $regex: regex} }];
  // }



  // if(filter.company.length){
  //   let companies = await companyService.findByCompanyIds(filter.company, false);
  //   match.company = {$in: _.reduce(companies, function(res, item){res.push(item._id); return res;}, [])};
  //   filter.company = [];
  // }
  //
  // if(filter.status.length){
  //   match.status = {$in:filter.status};
  //   filter.status = [];
  // }


  filter.status = [statusEnum.ACTIVE];

  if(sort && sort.sortBy=='popular'){
    aSort = { $sort: { noOfViews: direction} };
  } else if(sort && sort.sortBy=='title'){
    aSort = { $sort: {title: direction} };
  } else {
    aSort = { $sort: {createdDate: direction} };
  }

  filter.query=query;
  filter.companyId = filter.company;
  delete filter.company;
  // console.log(new SearchParam(filter))

  aList.push({ $match: new SearchParam(filter)});
  aList.push(
    {
      $lookup: {
        from: 'companies',
        localField: "company",
        foreignField: "_id",
        as: "company"
      }
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'members',
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy"
      }
    },
    { $unwind: '$createdBy'},
    {
      $lookup: {
        from: 'labels',
        localField: "tags",
        foreignField: "_id",
        as: "tags"
      }
    },
    {$lookup:{
        from:"ads",
        let:{ads: '$ads'},
        pipeline:[
          {$match:{$expr:{$in:["$_id", "$$ads"]}}},
          {
            $lookup: {
              from: 'targets',
              localField: "targeting",
              foreignField: "_id",
              as: "targeting"
            }
          },
          {$unwind: '$targeting' }
        ],
        as: 'ads'
      }},
    {
      $lookup: {
        from: 'applications',
        localField: "applications",
        foreignField: "_id",
        as: "applications"
      }
    },
    { $addFields: {
        hasApplied: {
          '$in': [
            currentUserId,
            '$applications.partyId'
          ]
        }
      }
    },
  );
  aList.push(aSort);

  const aggregate = JobRequisition.aggregate(aList);
  result = await JobRequisition.aggregatePaginate(aggregate, options);

  let foundCompanies = await feedService.lookupCompaniesIds(_.reduce(result.docs, function(res, i){ res.push(i.company.companyId); return res;},  []));
  let hasSaves = [];


  let today = Date.now();
  _.forEach(result.docs, function(job){
    job.hasSaved = _.find(hasSaves, {jobId: job._id})?true:false;
    job.company = convertToCompany(job.company);
    job.createdBy = convertToAvatar(job.createdBy);
    job.shareUrl = 'https://www.accessed.co/jobs/'+job.jobId;

    job.skills=[];
    job.industry=[];
    job.members=[];
    job.responsibilities=[];
    job.qualifications = [];
    job.minimumQualifications=[];
    // job.description = null;
    job.isHot = _.reduce(job.ads, function(res, ad){
      if(_.includes(ad.targeting.adPositions, adPosition.hottag)){
        if(ad.startTime < today && ad.endTime > today){
          res = true;
        }

      }
      return res;
    }, false);
    job.ads = [];

  })



  return result;

}

async function getCompanyLatestJobs(currentUserId, company, locale) {
  if(!company){
    return null;
  }


  let result;
  let currentDate = Date.now();
  let aList = [];
  let $match = { company: company, status: statusEnum.ACTIVE};


  const aggregate = JobRequisition.aggregate([
    { $match: { company: company, status: statusEnum.ACTIVE} },
    {
      $lookup: {
        from: 'companies',
        localField: "company",
        foreignField: "_id",
        as: "company"
      }
    },
    { $unwind: '$company' },
    { $sort: { createdDate: 1} },
    { $limit: 20 }
  ]);
  result = await JobRequisition.aggregatePaginate(aggregate);
  return result;
}


async function removePipeline(pipeline) {
  let data = null;

  if(!pipeline){
    return;
  }


  return await JobRequisition.updateMany({pipeline: pipeline}, {$set: {pipeline: null, _pipeline: pipeline}})
}



async function getCompanyJobsJobFunctions(company, locale) {
  let data = null;

  if(!company){
    return [];
  }


  let result = [];
  data = await JobRequisition.aggregate([
    {$match: {companyId: company}},
    {$group: {_id: {jobFunction: '$jobFunction'}, jobFunction: {$first: '$jobFunction'}, count: {'$sum': 1}}},
    {$project: {_id: 0, jobFunction: 1, count: 1}}
  ]);

  if(data.length) {

    let jobFunctions = await feedService.findJobfunction('', _.map(data, 'jobFunction'), locale);

    result = _.reduce(data, function (res, val, key) {
      console.log(val)
      if(val.jobFunction===null){
        res.push({name: 'Other', shortCode: '', count: val.count});
      } else {
        let found = _.find(jobFunctions, {shortCode: val.jobFunction});
        if(found){
          res.push({name: found.name, shortCode: found.shortCode, count: val.count});
        }
      }
      return res;
    }, []);
  }
  return result;
}


async function deactivateJobs(filter) {
  let data = null;

  if(!filter){
    return null;
  }


  let result = await JobRequisition.updateMany(new SearchParam(filter), {$set: {status: statusEnum.DEACTIVATED}});
  return result;
}

async function getJobByApplicationId(applicationId) {
  return await JobRequisition.findOne({applications: {$in: [applicationId]}})
}

async function getJobsEndingToday(filter, sort, date) {
  if (!filter || !sort) {
    return;
  }

  let limit = (sort.size && sort.size > 0) ? parseInt(sort.size) : 20;
  let page = (sort.page && sort.page == 0) ? 1 : parseInt(sort.page) + 1;
  let sortBy = sort.sortBy || 'endDate';
  let direction = (sort.direction && sort.direction.toUpperCase() == "DESC") ? -1 : 1;

  const options = {
    page: page,
    limit: limit,
    sort: {
      [sortBy]: direction
    }
  };

  const targetDate = date ? moment(date) : moment();
  const dateStart = targetDate.startOf('day').valueOf();
  const dateEnd = targetDate.endOf('day').valueOf();
  console.log(`GET Jobs with start: ${dateStart} end: ${dateEnd}`);

  const aggregate = JobRequisition.aggregate([
    {
      $lookup: {
        from: 'ads',
        localField: 'ads',
        foreignField: '_id',
        as: 'ads'
      }
    },
    {
      $lookup: {
        from: 'ads',
        localField: 'searchAd',
        foreignField: '_id',
        as: 'searchAd'
      }
    },
    { $unwind: {path: '$searchAd', preserveNullAndEmptyArrays: true}},
    {
      $match: {
        $or: [
          { endDate: { $gte: dateStart, $lte: dateEnd }, status: 'ACTIVE' }, // 1. Jobs ending today with status "ACTIVE"
          { status: 'CLOSED', updatedDate: { $gte: dateStart, $lte: dateEnd }, type: 'PROMOTED' }, // 2. Jobs that were closed today
          {
            $and: [
              { 'searchAd.endTime': { $gte: dateStart, $lte: dateEnd } }, // 3. Jobs with searchAd's endTime today
              { status: 'ACTIVE' }
            ]
          },
          {
            $and: [
              { 'ads.endTime': { $gte: dateStart, $lte: dateEnd } }, // 4. Jobs with ads where ads' endTime is today
              { status: 'ACTIVE' }
            ]
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'members',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        title: 1,
        status: 1,
        type: 1,
        companyId: 1,
        'createdBy._id': 1,
        'createdBy.firstName': 1,
        'createdBy.lastName': 1,
        'createdBy.email': 1,
        'createdBy.messengerId': 1,
        'company._id': 1,
        'company.name': 1,
        'company.legalName': 1,
        'company.companyId': 1,
        'company.email': 1,
        members: 1,
        searchAd: 1,
        ads: 1,
        jobId: 1,
        publishedDate: 1,
        endDate: 1,
        updatedDate: 1,
      }
    },
  ]);

  const result = await JobRequisition.aggregatePaginate(aggregate, options);
  return result;
}

async function getOutdatedDraftJobs(filter, sort, date){
  if (!filter || !sort) {
    return;
  }

  let limit = (sort.size && sort.size > 0) ? parseInt(sort.size) : 20;
  let page = (sort.page && sort.page == 0) ? 1 : parseInt(sort.page) + 1;
  let sortBy = sort.sortBy || 'endDate';
  let direction = (sort.direction && sort.direction.toUpperCase() == "DESC") ? -1 : 1;

  const options = {
    page: page,
    limit: limit,
    sort: {
      [sortBy]: direction
    }
  };

  const threeDaysAgo = moment().subtract(3, 'days').startOf('day').unix() * 1000;
  const aggregate = JobRequisition.aggregate([
    {
      $match: { status: 'DRAFT', updatedDate: { $lt: threeDaysAgo } }
    },
    {
      $lookup: {
        from: 'members',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'members',
        localField: 'members',
        foreignField: '_id',
        as: 'members',
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        status: 1,
        companyId: 1,
        company: 1,
        'createdBy._id': 1,
        'createdBy.firstName': 1,
        'createdBy.lastName': 1,
        'createdBy.email': 1,
        'createdBy.messengerId': 1,
        'createdBy.userId': 1,
        'members._id': 1,
        'members.firstName': 1,
        'members.lastName': 1,
        'members.email': 1,
        'members.messengerId': 1,
        'members.userId': 1,
        jobId: 1,
        publishedDate: 1,
        endDate: 1,
        updatedDate: 1,
      }
    },
  ]);
  const result = await JobRequisition.aggregatePaginate(aggregate, options);
  return result;
}

async function updateJobStatus(jobId, status) {
  try {
    const job = await JobRequisition.findById(jobId);
    if (job) {
      job.status = status;
      await job.save();
      return job;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error('Error updating job status: ' + error.message);
  }
}

module.exports = {
  addJob,
  updateJob,
  searchTitle,
  findById,
  findByIds,
  findJobId,
  findJob_Id,
  findJobIds,
  findJob_Ids,
  updateJobPipeline,
  getJobPipeline,
  updateJobMembers,
  getJobMembers,
  updateJobApplicationForm,
  getSimilarJobList,
  getSimilarJobsByTitle,
  getJobAds,
  closeJob,
  archiveJob,
  unarchiveJob,
  deleteJob,
  getCountsGroupByCompany,
  getJobCount,
  getNewJobs,
  getNewJobsForDashboard,
  getPopularJobs,
  getHighlightJobs,
  findJobsByCompanyId,
  getGroupOfCompanyJobs,
  getJobsEndingSoon,
  getCompanyJobCounts,
  getCompanyJobSummary,
  search,
  searchWithBudget,
  lookUpJobs,
  searchJobTitle,
  getCompanyJobs,
  getCompanyLatestJobs,
  removePipeline,
  getCompanyJobsJobFunctions,
  deactivateJobs,
  getJobByApplicationId,
  getJobsEndingToday,
  updateJobStatus,
  getOutdatedDraftJobs,
}
