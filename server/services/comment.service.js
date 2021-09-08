const _ = require('lodash');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;

const statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');
const notificationType = require('../const/notificationType');
const notificationEvent = require('../const/notificationEvent');

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


  let job, application = null;

  if(comment.subjectType==subjectType.JOB){
    job = comment.subject;
    comment.subject = comment.subject._id;
  } else if(comment.subjectType==subjectType.APPLICATION) {
    application = comment.subject;
    comment.subject = comment.subject._id;
  }

  comment = await new Comment(comment).save();


  let activity = {causer: comment.createdBy, causerType: subjectType.MEMBER, subjectType: comment.subjectType, subject: comment.subject, action: actionEnum.COMMENTED};


  if(comment.subjectType==subjectType.JOB){
    activity.meta= {name: member.firstName + ' ' + member.lastName, jobTitle: job.title, jobId: job._id};

    //Create Notification
    let meta = {
      causer: member.userId,
      jobId: job._id,
      jobTitle: job.title,
      memberId: member._id,
      name: member.firstName + ' ' + member.lastName,
      avatar: member.avatar
    };

    await await feedService.createNotification(job.createdBy.userId, notificationType.JOB, notificationEvent.ADDED_JOB_COMMENT, meta);

  } else if(comment.subjectType==subjectType.APPLICATION) {
    activity.meta= {name: member.firstName + ' ' + member.lastName, candidateName: application.user.firstName + ' ' + application.user.lastName,candidate: application.user._id, jobTitle: application.job.title, application:application._id, job: application.job._id};
  }

  await activityService.addActivity(activity);


  return comment;

}



module.exports = {
  findBy_Id:findBy_Id,
  getComments:getComments,
  addComment:addComment
}
