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


async function getComments(subjectType, subjectId, filter) {
  let data = null;

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

  return Comment.paginate({subjectType: subjectType, subjectId: ObjectID(subjectId)}, options); //Comment.paginate({subjectType: subjectType, subjectId: ObjectID(subjectId)}, options);

}


async function addComment(comment, member) {
  let data = null;

  if(!comment || !member){
    return;
  }

  comment = await Joi.validate(comment, commentSchema, {abortEarly: false});

  comment = await new Comment(comment).save();

  let job, application;
  if(comment.subjectType==subjectType.JOB){
    job = await jobService.findJob_Id(comment.subject);
  } else if(comment.subjectType==subjectType.APPLICATION) {
    application = await applicationService.findApplicationBy_Id(comment.subject);
    if(application){
      job = await jobService.findJob_Id(application.jobId);
    }

  }

  await activityService.addActivity({causer: comment.createdBy, causerType: subjectType.MEMBER, subjectType: comment.subjectType, subject: comment.subjectId, action: actionEnum.COMMENTED, meta: {name: member.firstName + ' ' + member.lastName, candidate: application.user, jobTitlte: job.title, jobId: job._id}});


  return comment;

}



module.exports = {
  findBy_Id:findBy_Id,
  getComments:getComments,
  addComment:addComment
}
