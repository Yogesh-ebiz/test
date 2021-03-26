const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobAlert = require('../models/job_alert.model');
const JobRequisition = require('../models/jobrequisition.model');
const Promotion = require('../models/promotion.model');
let SearchParam = require('../const/searchParam');



function searchTitle(keyword) {
  let data = null;

  if(keyword==null){
    return;
  }
  var regex = new RegExp(keyword, 'i');
  return JobRequisition.aggregate([
    { $match: {title: regex} },
    { $group: {_id:{title:'$title'}} },
    { $project: {_id: 0, keyword: '$_id.title'}}
  ])
}


async function findJobId(jobId, locale) {
  let data = null;

  if(jobId==null){
    return;
  }
  let localeStr = locale? locale.toLowerCase() : 'en';
  let propLocale = '$name.'+localeStr;


  data = JobRequisition.findOne({jobId: jobId});

  // Promotion.populate(data, {path: "promotion"});


  return data;

  // return JobRequisition.findOne({jobId: jobId});
}

async function findJobIds(jobIds) {
  let data = null;

  if(jobIds==null){
    return;
  }


  return JobRequisition.find({jobId: {$in: jobIds }});
}


function removeByJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobAlert.remove({partyId: userId, jobId: jobId});
}

function getCountsGroupByCompany(match){

  if(!match){
    return;
  }

  let res = JobRequisition.aggregate([
    {$match: match},
    { $group: {_id:{company:"$company"}, count:{$sum:1} } }
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

  // if(filter==null){
  //   return;
  // }

  var twoWeeksAgo = new Date(Date.now() - 12096e5);
  // filter = {createdDate: {$gte: twoWeeksAgo.getTime()},level: filter.level, jobFunction: filter.jobFunction, industry: filter.industry, city: filter.city, state: filter.state, country: filter.country, company: filter.company};
  filter = {createdDate: {$gte: twoWeeksAgo.getTime()}};

  let search = new SearchParam(filter);

  let res = JobRequisition.find(search).limit(10);

  return res;
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




module.exports = {
  searchTitle: searchTitle,
  findJobId: findJobId,
  findJobIds: findJobIds,
  removeByJobId: removeByJobId,
  getCountsGroupByCompany,
  getJobCount:getJobCount,
  getNewJobs:getNewJobs,
  getGroupOfCompanyJobs:getGroupOfCompanyJobs
}
