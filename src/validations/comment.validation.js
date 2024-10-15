const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const reactionTypeEnum = require('../const/reactionTypeEnum');

const updateComment = {
    params: Joi.object().keys({
      companyId:Joi.number().integer(),
      jobId:Joi.string().custom(objectId),
      commentId:Joi.string().custom(objectId),
    }),
    body: Joi.object().keys({
      message: Joi.string()
    }),
};

const deleteComment = {
    params: Joi.object().keys({
      companyId:Joi.number().integer(),
      jobId:Joi.string().custom(objectId),
      commentId:Joi.string().custom(objectId),
    }),
};

const replyToComment = {
    params: Joi.object().keys({
      companyId:Joi.number().integer(),
      jobId:Joi.string().custom(objectId),
      commentId: Joi.string().custom(objectId),
    }),
    body: Joi.object().keys({
      message: Joi.string(),
    }),
};

const getCommentReplies = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    size: Joi.number().integer(),
    page: Joi.number().integer(),
    sortBy: Joi.string(),
    direction: Joi.string()
  }),
};

const addReactionToCommentById = {
  params: Joi.object().keys({
    commentId:Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reactionType: Joi.string().valid('', ...Object.values(reactionTypeEnum)).required(),
  }),
};

module.exports = {
    updateComment,
    deleteComment,
    replyToComment,
    getCommentReplies,
    addReactionToCommentById,
}