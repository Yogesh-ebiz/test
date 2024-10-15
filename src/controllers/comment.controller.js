const catchAsync = require("../utils/catchAsync");
const { ObjectId } = require('mongodb');
const _ = require('lodash');

const commentService = require('../services/comment.service');
const reactionService = require('../services/reaction.service');
const jobService = require('../services/jobrequisition.service');
const applicationService = require('../services/application.service');
const candidateService = require('../services/candidate.service');
const {convertToTalentUser} = require('../utils/helper');
let Pagination = require('../utils/pagination');

const subjectType = require('../const/subjectType');
const { memberService } = require("../services");

const updateComment = catchAsync(async (req, res) => {
    const {user, params, body} = req;
    const {commentId} = params;

    let result;
    try {
      let found = await commentService.findBy_Id(commentId);
      if(found) {
        found.message = body.message;
        found.lastUpdatedDate = Date.now();
        result = await found.save()
      }
    } catch (error) {
      console.log(error);
    }

    res.json(result);
});
const deleteComment = catchAsync(async (req, res) => {
    const {user, params} = req;
    const {commentId} = params;
    let result;
    try {
      let comment = await commentService.findByIdAndDelete(new ObjectId(commentId));
      if(comment) {
        result = {success: true};
      }
    } catch (error) {
      console.log(error);
    }

    res.json(result);
});
const replyToComment = catchAsync(async (req, res) => {
    const {user, params, body} = req;
    const {commentId} = params;

    let result, subject;
    const parentComment = await commentService.findById(commentId);
    if(parentComment) {
      switch(parentComment.subjectType){
        case subjectType.JOB:
          subject = await jobService.findById(parentComment.subject);
          break;
        case subjectType.APPLICATION:
          subject = await applicationService.findById(parentComment.subject).populate('user');
          break;
        case subjectType.CANDIDATE:
          subject = await candidateService.findById(parentComment.subject);
          break;
      }

      body.subject = subject;
      body.subjectType = parentComment.subjectType;
      body.createdBy = user._id;
      body.parentComment = parentComment._id;
      result = await commentService.addComment(body, user);
    }
    res.json(result);
});

const getCommentReplies = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  const {commentId} = params;
  let replies;
  try{
    replies = await commentService.getReplies(new ObjectId(commentId), query, user._id);
    replies.docs.forEach(function(comment){
      comment.createdBy = convertToTalentUser(comment.createdBy);
    });
  }catch(error){
    console.log(error);
    res.status(500).send({success: false, error: 'Error getting replies.'})
  }

  res.json(new Pagination(replies));
});

const addReactionToCommentById = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {commentId} = params;

  let result;

  try {
    let reaction = await reactionService.getReaction(subjectType.COMMENT, new ObjectId(commentId), user._id);
    if(reaction){
      if(body.reactionType){
        //Update Reaction
        reaction.reactionType = body.reactionType;
        reaction.createdDate = new Date();
        result = await reaction.save();
      }else{
        //Delete Reaction
        await reactionService.removeReaction(reaction._id).then(async () => {
          result = {success: true};
        });
      }
    }else{
      // Create new Reaction
      let newReaction = {
        subjectType: subjectType.COMMENT,
        subject: new ObjectId(commentId),
        reactionType: body.reactionType,
        reactionBy: user._id,
      }
      result = await reactionService.addReaction(newReaction);
    }

  } catch (error) {
    console.log(error);
    res.status(500).send({success:false, error:'Error updating reaction'})
  }

  res.json(result);
});

module.exports = {
    updateComment,
    deleteComment,
    replyToComment,
    getCommentReplies,
    addReactionToCommentById,
}
