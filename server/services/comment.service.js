const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Comment = require('../models/comment.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


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

  comment = new Comment(comment).save();
  return comment;

}



module.exports = {
  findBy_Id:findBy_Id,
  getComments:getComments,
  addComment:addComment
}
