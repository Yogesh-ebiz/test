const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const alertEnum = require('../const/alertEnum');

const JobAlert = require('../models/job_alert.model');
const JobRequisition = require('../models/jobrequisition.model');


function findJobAlertById(jobAlertId) {
  let data = null;

  if(jobAlertId==null){
    return;
  }

  return JobAlert.findOne({jobAlertId: jobAlertId});
}


function findAlertByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobAlert.findOne({partyId: userId, jobId: jobId});
}

function addAlertByUserId(userId, alert) {
  let data = null;

  if(userId==null || alert==null){
    return;
  }
  console.log(alert)

  alert.createdDate = Date().now;
  alert.notification = [alertEnum.EMAIL, alertEnum.NOTIFICATION];
  alert.repeat = alertEnum.DAILY;
  return new JobAlert(alert).save();
}


function removeAlertByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobAlert.remove({partyId: userId, jobId: jobId});
}

function removeAlertById(alertId) {
  let data = null;

  if(alertId==null){
    return;
  }

  return JobAlert.remove({jobAlertId: alertId});
}

function getAlertCount(alert) {
  let data = null;

  if(alert==null){
    return;
  }
  let employmentType = [alert.employmentType];
  let industry = [alert.industry];
  let city = [alert.city];
  let state = [alert.state];
  let country = [alert.country];
  let company = alert.company;


  let res = JobRequisition.find({employmentType: {$in: employmentType}, industry: {$in: industry},
    city: {$in: city}, state: {$in: state}, country: {$in: country}, company: {$in: company} }).count();
  return res;
}




module.exports = {
  findJobAlertById:findJobAlertById,
  findAlertByUserIdAndJobId: findAlertByUserIdAndJobId,
  addAlertByUserId: addAlertByUserId,
  removeAlertByUserIdAndJobId: removeAlertByUserIdAndJobId,
  removeAlertById:removeAlertById,
  getAlertCount:getAlertCount
}
