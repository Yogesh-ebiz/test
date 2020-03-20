const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobAlert = require('../models/job_alert.model');
const JobRequisition = require('../models/jobrequisition.model');




function findJobId(jobId) {
  let data = null;

  if(jobId==null){
    return;
  }

  return JobRequisition.findOne({jobId: jobId});
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


module.exports = {
  findJobId: findJobId,
  findJobIds: findJobIds,
  removeByJobId: removeByJobId
}
