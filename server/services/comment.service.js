const _ = require('lodash');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');

const Comment = require('../models/comment.model');
const feedService = require('../services/api/feed.service.api');
const activityService = require('../services/activity.service');
const jobService = require('../services/jobrequisition.service');
const applicationService = require('../services/application.service');


const commentSchema = Joi.object({
  subject: Joi.object(),
  subjectType: Joi.string().required(),
  createdBy: Joi.object().required(),
  message: Joi.string().required()
});



async function findBy_Id(commentId) {
  let data = null;

  if(commentId==null){
    return;
  }

  let comment = Comment.findById(commentId);
  return comment
}


async function getComments(subjectType, subjectId, sort) {
  let data = null;

  if(!subjectType || !subjectId || !sort){
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
  let aMatch = {$match: {subjectType: subjectType, subject: ObjectID(subjectId)}};
  let aSort = {$sort: {createdDate: direction} };

  aList.push(aMatch);

  aList.push(
    {$lookup:{
        from:"members",
        let:{user:"$createdBy"},
        pipeline:[
          {$match:{$expr:{$eq:["$_id","$$user"]}}}
        ],
        as: 'createdBy'
      }
    },
    { $unwind: '$createdBy'}
  );

  if(sort && sort.sortBy=='rating'){
    aSort = { $sort: { rating: direction} };
    aList.push(aSort);
  } else {
    aList.push(aSort);
  }


  const aggregate = Comment.aggregate(aList);

  return await Comment.aggregatePaginate(aggregate, options);

  // return Comment.paginate({subjectType: subjectType, subject: ObjectID(subjectId)}, options); //Comment.paginate({subjectType: subjectType, subjectId: ObjectID(subjectId)}, options);

}


async function addComment(comment, member) {
  let data = null;

  if(!comment || !member){
    return;
  }

  comment = await Joi.validate(comment, commentSchema, {abortEarly: false});

  comment = await new Comment(comment).save();


  let job, application;
  let activity = {causer: comment.createdBy, causerType: subjectType.MEMBER, subjectType: comment.subjectType, subject: comment.subject, action: actionEnum.COMMENTED};


  if(comment.subjectType==subjectType.JOB){
    job = await jobService.findJob_Id(comment.subject);

    activity.meta= {name: member.firstName + ' ' + member.lastName, jobTitle: job.title, jobId: job._id};
  } else if(comment.subjectType==subjectType.APPLICATION) {
    application = await applicationService.findApplicationBy_Id(comment.subject).populate('user');
    if(application){
      job = await jobService.findJob_Id(application.jobId);
    }

    activity.meta= {name: member.firstName + ' ' + member.lastName, candidateName: application.user.firstName + ' ' + application.user.lastName,candidate: application.user._id, jobTitle: job.title, job: job._id};
  }

  await activityService.addActivity(activity);


  return comment;

}



module.exports = {
  findBy_Id:findBy_Id,
  getComments:getComments,
  addComment:addComment
}
