const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const config = require('../config/config');

const statusEnum = require('../const/statusEnum');
const {buildCandidateUrl} = require('../utils/helper');
const Activity = require('../models/activity.model');

const candidateService = require('../services/candidate.service');

const activitySchema = Joi.object({
  causer: Joi.any().optional(),
  causerType: Joi.string(),
  causerId: Joi.string(),
  action: Joi.string().required(),
  subject: Joi.object(),
  subjectType: Joi.string(),
  subjectId: Joi.string(),
  meta: Joi.object().optional(),
});


async function addActivity(activity) {

  if(!activity){
    return;
  }

  activity = await Joi.validate(activity, activitySchema, {abortEarly: false});
  activity = await new Activity(activity).save();

  return activity;

}


async function findBySubjectTypeAndSubjectId(subjectType, subjectId, filter) {
  if(!subjectType || !subjectId || !filter){
    return;
  }


  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;


  let select = '';
  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  return Activity.paginate({subjectType: subjectType, subjectId: subjectId}, options);
  // return Activity.find({subjectType: subjectType, subjectId: subjectId});

}



async function findBySubjectTypeAndSubject(companyId, subjectType, subject, filter) {
  if(!companyId || !subjectType || !subject || !filter){
    return;
  }


  let limit = (filter.size && filter.size>0) ? filter.size:20;
  let page = (filter.page && filter.page==0) ? filter.page:1;
  let sortBy = {};
  sortBy[filter.sortBy] = (filter.direction && filter.direction=="DESC") ? -1:1;


  let select = '';
  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: parseInt(filter.page)+1
  };

  let aList = [];

  // aList.push(
  //   // {$pipeline: [
  //   //     { $unionWith: { coll: "candidates", pipeline: [ { $project: { _id: 1, firstName: 1, lastName: 1} } ]} }
  //   // ]}
  //
  //   {
  //     $lookup: {
  //       from: "candidates",
  //       pipeline: [
  //         { $unionWith: { coll: "members", pipeline: [ {_id: 1, firstName: 1, lastName: 1, userId: 1, avatar: 1} ] } },
  //       ],
  //       as: "users"
  //     }
  //   }
  // );

  let aMatch = {$match: {subjectType: subjectType, subject: subject} };
  aList.push(aMatch);

  console.log(aList)

  let aggregate = Activity.aggregate(aList);

  return Activity.aggregatePaginate(aList, options);
  // return Activity.find({subjectType: subjectType, subjectId: subjectId});

}



async function findBySubjectTypeAndSubject(companyId, subjectType, subject, sort) {

  if(!companyId || !subjectType || !subject  || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? parseInt(sort.size):20;
  let page = (sort.page && sort.page==0) ? 1:parseInt(sort.page)+1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;



  const options = {
    page: page,
    limit: limit,
  };


  let aList = [];
  let aLookup = [];
  let aMatch = { $match: {subjectType: subjectType, subject: subject}};
  let aSort = { $sort: {createdDate: direction} };


  aList.push(aMatch);

  aList.push(
    {
      $lookup: {
        let:{causer: '$causer'},
        from: "candidates",
        pipeline: [
          { $match: {company: companyId} },
          { $project: {_id: 1, firstName: 1, lastName: 1, avatar: 1, company: 1} },
          {
            $unionWith: {
              coll: "members",
              pipeline: [
                { $match: {company: companyId}}
              ]
            }
          },
          { $match: {$expr: {$eq: ["$_id", "$$causer"]}}},
          { $project: {_id: 1, firstName: 1, lastName: 1, avatar: 1, company: 1, userId: 1} },
        ],
        as: "causer"
      }
    },
    { $unwind: '$causer'}
  );

  const aggregate = Activity.aggregate(aList);

  return await Activity.aggregatePaginate(aggregate, options);
}

async function findByJobId(companyId, jobId, sort) {
  if(!companyId || !jobId || !sort){
    return;
  }

  console.log(jobId, companyId)

  let select = '';
  let limit = (sort.size && sort.size>0) ? parseInt(sort.size):20;
  let page = (sort.page && sort.page==0) ? 1:parseInt(sort.page)+1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;

  const options = {
    page: page,
    limit: limit,
  };

  let aList = [];
  let aLookup = [];
  let aMatch = { $match: {'meta.job': jobId}};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);
  aList.push(
    {
      $lookup: {
        let:{causer: '$causer'},
        from: "candidates",
        pipeline: [
          { $match: {company: companyId} },
          { $project: {_id: 1, firstName: 1, lastName: 1, avatar: 1, _avatar: 1, company: 1, userId: 1} },
          {
            $unionWith: {
              coll: "members",
              pipeline: [
                { $match: {company: companyId}}
              ]
            }
          },
          { $match: {$expr: {$eq: ["$_id", "$$causer"]}}},
          { $project: {_id: 1, firstName: 1, lastName: 1, avatar: 1, _avatar: 1, company: 1, userId: 1, isMember: true} },
        ],
        as: "causer"
      }
    },
    { $unwind: { path: '$causer', preserveNullAndEmptyArrays: true } },
  );

  const aggregate = Activity.aggregate(aList);

  let result = Activity.aggregatePaginate(aggregate, options);

  result.docs = _.reduce(result.docs, function(res, activity){
    if(activity.causer) {
      activity.causer = buildCandidateUrl(activity.causer)
    }
    res.push(activity);
    return res;
  }, []);

  return result;

}


async function findByCandidateId(companyId, candidateId, sort) {
  if(!companyId || !candidateId || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size > 0) ? parseInt(sort.size) : 20;
  let page = (sort.page && sort.page == 0) ? 1 : parseInt(sort.page) + 1;
  let direction = (sort.direction && sort.direction == "DESC") ? -1 : 1;

  const options = {
    page: page,
    limit: limit,
  };

  let aList = [];
  let aLookup = [];
  let aMatch = {$match: {$or: [{subject: candidateId}, {'meta.candidate': candidateId}] }};
  let aSort = {$sort: {createdDate: direction}};

  aList.push(aMatch);
  aList.push(
    {
      $lookup: {
        let: {causer: '$causer'},
        from: "candidates",
        pipeline: [
          {$match: {company: companyId}},
          {$project: {_id: 1, firstName: 1, lastName: 1, avatar: 1, _avatar: 1, company: 1, userId: 1}},
          {
            $unionWith: {
              coll: "members",
              pipeline: [
                {$match: {company: companyId}}
              ]
            }
          },
          {$match: {$expr: {$eq: ["$_id", "$$causer"]}}},
          {$project: {_id: 1, firstName: 1, lastName: 1, avatar: 1, _avatar: 1, company: 1, userId: 1, isMember: true}},
        ],
        as: "causer"
      }
    },
    { $unwind: { path: '$causer', preserveNullAndEmptyArrays: true } },
  );

  const aggregate = Activity.aggregate(aList);

  let result = await Activity.aggregatePaginate(aggregate, options);
  result.docs = _.reduce(result.docs, function(res, activity){
    if(activity.causer) {
      activity.causer = buildCandidateUrl(activity.causer)
    }
    res.push(activity);
    return res;
  }, []);

  return result;

}


async function findByApplicationId(companyId, applicationId, sort) {
  if(!companyId || !applicationId || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size > 0) ? parseInt(sort.size) : 20;
  let page = (sort.page && sort.page == 0) ? 1 : parseInt(sort.page) + 1;
  let direction = (sort.direction && sort.direction == "DESC") ? -1 : 1;

  const options = {
    page: page,
    limit: limit,
  };

  let aList = [];
  let aLookup = [];
  let aMatch = {$match: {$or: [{'meta.application': applicationId}, {subject: applicationId}] }};
  let aSort = {$sort: {createdDate: direction}};

  aList.push(aMatch);
  aList.push(
    {
      $lookup: {
        let: {causer: '$causer'},
        from: "candidates",
        pipeline: [
          {$match: {company: companyId}},
          {$project: {_id: 1, firstName: 1, lastName: 1, avatar: 1, _avatar: 1, company: 1, userId: 1}},
          {
            $unionWith: {
              coll: "members",
              pipeline: [
                {$match: {company: companyId}},
                {$project: {_id: 1, firstName: 1, lastName: 1, avatar: 1, company: 1, userId: 1}},
              ]
            }
          },
          {$match: {$expr: {$eq: ["$_id", "$$causer"]}}},
          {$project: {_id: 1, firstName: 1, lastName: 1, avatar: 1, _avatar: 1, company: 1, userId: 1, isMember: true}},
        ],
        as: "causer"
      }
    },
    // {$unwind: '$causer', preserveNullAndEmptyArrays: true}
    { $unwind: { path: '$causer', preserveNullAndEmptyArrays: true } },
  );

  const aggregate = Activity.aggregate(aList);
  let result = await Activity.aggregatePaginate(aggregate, options);

  result.docs = _.reduce(result.docs, function(res, activity){
    if(activity.causer) {
      activity.causer = buildCandidateUrl(activity.causer)
    }
    res.push(activity);
    return res;
  }, []);
  
  return result;

}

module.exports = {
  addActivity:addActivity,
  findBySubjectTypeAndSubjectId:findBySubjectTypeAndSubjectId,
  findBySubjectTypeAndSubject:findBySubjectTypeAndSubject,
  findByJobId:findByJobId,
  findByCandidateId:findByCandidateId,
  findByApplicationId:findByApplicationId

}
