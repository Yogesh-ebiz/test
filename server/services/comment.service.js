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
  subjectType: Joi.string().required(),
  subjectId: Joi.object().required(),
  createdBy: Joi.number().required(),
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


async function addComment(comment) {
  let data = null;

  if(comment==null){
    return;
  }

  comment = await Joi.validate(comment, commentSchema, {abortEarly: false});

  comment = await new Comment(comment).save();

  let job;
  if(comment.subjectType==subjectType.JOB){
    job = await jobService.findJob_Id(ObjectID(comment.subjectId));
  } else if(comment.subjectType==subjectType.APPLICATION) {
    let application = await applicationService.findApplicationBy_Id(ObjectID(comment.subjectId));
    if(application){
      job = await jobService.findJob_Id(ObjectID(application.jobId));
    }

  }

  let user = await feedService.lookupUserIds([comment.createdBy]);
  await activityService.addActivity({causerId: ''+comment.createdBy, causerType: subjectType.MEMBER, subjectType: comment.subjectType, subjectId: ''+comment.subjectId, action: actionEnum.COMMENTED, meta: {name: user[0].firstName + ' ' + user[0].lastName, jobTitlte: job.title, jobId: job._id}});


  return comment;

}



module.exports = {
  findBy_Id:findBy_Id,
  getComments:getComments,
  addComment:addComment
}
