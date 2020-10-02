const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobView = require('../models/jobview.model');


function findJobViewByUserId(userId, size) {
  let data = null;

  if(userId==null){
    return;
  }

  return size?JobView.find({partyId: userId}).sort({createdDate: -1}).limit(size):JobView.find({partyId: userId}).sort({createdDate: -1});
}

function findJobViewByUserIdAndJobId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }

  return JobView.findOne({partyId: userId, jobId: jobId});
}

function addJobViewByUserId(userId, jobId) {
  let data = null;

  if(userId==null || jobId==null){
    return;
  }


  let timestamp = Date.now();

  let jobView = {partyId: userId, jobId: jobId, createdDate: timestamp}
  return new JobView(jobView).save();
}


async function findMostViewed() {
  let data = null;

  let group = {
    _id: {jobId: '$jobId'},
    count: {'$sum': 1}
  };

  data = await JobView.aggregate([
    {$match: {}},
    {
      $group: group
    },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        jobId: '$_id.jobId',
        count: '$count'
      }
    }
  ]);

  return data;
}

module.exports = {
  findJobViewByUserId: findJobViewByUserId,
  findJobViewByUserIdAndJobId:findJobViewByUserIdAndJobId,
  addJobViewByUserId: addJobViewByUserId,
  findMostViewed:findMostViewed
}
