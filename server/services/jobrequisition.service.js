const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobAlert = require('../models/job_alert.model');
const JobRequisition = require('../models/jobrequisition.model');
const Promotion = require('../models/promotion.model');




function findJobId(jobId, locale) {
  let data = null;

  if(jobId==null){
    return;
  }
  let localeStr = locale? locale.toLowerCase() : 'en';
  let propLocale = '$name.'+localeStr;

  let match = {jobId: jobId};

  data = JobRequisition.findOne(match);

  // Promotion.populate(data, {path: "promotion"});


  return data;

  // return JobRequisition.findOne({jobId: jobId});
}

function findJobIds(jobIds) {
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


module.exports = {
  findJobId: findJobId,
  findJobIds: findJobIds,
  removeByJobId: removeByJobId,
  getCountsGroupByCompany
}
