const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const ApplicationLabel = require('../models/app.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


const commentSchema = Joi.object({
  applicationId: Joi.object().required(),
  candidate: Joi.number().required(),
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


async function getComments(applicationId) {
  let data = null;

  if(!applicationId){
    return;
  }

  let comments = Comment.find({applicationId: ObjectID(applicationId)});
  return comments
}


async function addComment(comment) {
  let data = null;

  if(comment==null){
    return;
  }

  comment = await Joi.validate(comment, commentSchema, {abortEarly: false});

  comment = new Comment(comment).save();
  return comment;

}



module.exports = {
  findBy_Id:findBy_Id,
  getComments:getComments,
  addComment:addComment
}
