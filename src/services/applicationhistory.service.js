const _ = require('lodash');
const applicationEnum = require('../const/applicationEnum');
const statusEnum = require('../const/statusEnum');
const Application = require('../models/application.model');
const ApplicationHistory = require('../models/applicationhistory.model');


function findApplicationHistoryById(applicationHistoryId) {
  let data = null;

  if(applicationHistoryId==null){
    return;
  }

  return ApplicationHistory.find({applicationProgressId: applicationProgressId}).sort({createdDate: -1});
}



function addApplicationHistory(applicationHistory) {

  if(applicationHistory==null){
    return;
  }

  return new ApplicationHistory(applicationHistory).save();
}

module.exports = {
  findApplicationHistoryById: findApplicationHistoryById,
  addApplicationHistory:addApplicationHistory
}
