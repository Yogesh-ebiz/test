const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobAlert = require('../models/job_alert.model');




function findAlertByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobAlert.findOne({partyId: userId, jobId: jobId});
}

function addAlertById(userId, alert) {
  let data = null;

  if(userId==null || alert==null){
    return;
  }
  console.log(alert)

  alert.createdDate = Date().now;
  return new JobAlert(alert).save();
}


function removeAlertByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobAlert.remove({partyId: userId, jobId: jobId});
}


module.exports = {
  findAlertByUserIdAndJobId: findAlertByUserIdAndJobId,
  addAlertById: addAlertById,
  removeAlertByUserIdAndJobId: removeAlertByUserIdAndJobId
}
