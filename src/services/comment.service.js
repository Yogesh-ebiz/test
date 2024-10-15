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
const candidateService = require('./candidate.service');
const { Member } = require("../models");
const {myEmitter} = require('../config/eventemitter');
const { memberService } = require('.');

const commentSchema = Joi.object({
  subject: Joi.object(),
  subjectType: Joi.string().required(),
  createdBy: Joi.object().required(),
  message: Joi.string().required()
});



function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return Comment.findById(id);
}

async function findBy_Id(commentId) {
  let data = null;

  if(commentId==null){
    return;
  }

  let comment = Comment.findById(commentId);
  return comment
}

async function findByIdAndDelete(id) {
  if(id == null){
    return;
  }

  return Comment.findByIdAndDelete(id);
}


async function getComments(subjectType, subjectId, sort, currentUserId) {
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
  let aMatch = {$match: {subjectType: subjectType, subject: subjectId, $or: [{parentComment: { $exists: false }},{ parentComment: null }]}};
  let aSort = {$sort: {createdDate: direction} };

  aList.push(aMatch);

  aList.push(
    {
      $lookup: {
        from: 'members',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: '$createdBy'},
    {
      $lookup: {
          from: 'reactions',
          let: { commentId: '$_id' },
          pipeline: [
              { $match: { $expr: { $eq: ['$subject', '$$commentId'] } } },
              {
                  $group: {
                      _id: '$reactionType',
                      count: { $sum: 1 },
                      hasReacted: {
                        $sum: {
                          $cond: [{ $eq: ['$reactionBy', currentUserId] }, 1, 0]
                        }
                      }
                  }
              }
          ],
          as: 'reactions'
      }
    },
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'parentComment',
        as: 'replies'
      }
    },
    {
      $addFields: {
        noOfReplies: { $size: '$replies' },
        reactionCount: { $sum: { $map: { input: '$reactions', as: 'reaction', in: '$$reaction.count' } } },
      }
    },
    {
      $project: {
        replies: 0,
      }
    }
  );

  if (sort && sort.sortBy === 'popular') {
    // Define popularity based on reaction count and number of replies
    aList.push({
      $addFields: {
        popularity: { $add: ['$reactionCount', '$noOfReplies'] },
      },
    });
    aList.push({ $sort: { popularity: direction } });
  } else if (sort && sort.sortBy === 'latest') {
    aList.push({ $sort: { createdDate: direction } });
  }


  const aggregate = Comment.aggregate(aList);
  data = await Comment.aggregatePaginate(aggregate, options);
  data.docs.forEach(function (comment) {
    const member = Member(comment?.createdBy);
    comment.createdBy = member?.transform();

    const reactions = comment.reactions.map(reaction => ({
      reactionType: reaction._id,
      count: reaction.count,
      hasReacted: reaction.hasReacted > 0
    }));
    comment.reactions = reactions;

  });

  return data;
}


async function addComment(comment, member) {
  let data = null;

  if(!comment || !member){
    return;
  }

  await commentSchema.validate(comment, {abortEarly: false});
  let job, application, candidate = null;

  // if(comment.subjectType==subjectType.JOB){
  //   job = comment.subject;
  //   comment.subject = comment.subject._id;
  // } else if(comment.subjectType==subjectType.APPLICATION) {
  //   application = comment.subject;
  //   comment.subject = comment.subject._id;
  // }else if(comment.subjectType==subjectType.CANDIDATE){
  //   candidate = comment.subject;
  //   comment.subject = comment.subject._id;
  // }

  const {subject} = comment;
  comment.subject = subject._id;
  comment = await new Comment(comment).save();

  let newActivity = {causer: comment.createdBy, causerType: subjectType.MEMBER, subjectType: comment.subjectType, subject: subject._id, action: actionEnum.COMMENTED};
  if(comment.subjectType===subjectType.JOB){
    newActivity.meta= {name: member.firstName + ' ' + member.lastName, jobTitle: subject.title, job: subject._id};

    //Create Notification
    let notificationMeta = {
      userId: member.userId,
      jobId: subject._id,
      jobTitle: subject.title,
      memberId: member._id,
      name: member.firstName + ' ' + member.lastName,
      avatar: member.avatar,
      commentId: comment._id,
    };
    
    let jobCreatedBy = await memberService.findById(subject.createdBy);
    if(jobCreatedBy.messengerId !== member.messengerId){
      myEmitter.emit('create-notification', jobCreatedBy.messengerId, subject.company, notificationType.JOB, notificationEvent.ADDED_JOB_COMMENT, notificationMeta);
    }
    // Notify each job member
    const jobmembers = await jobService.getJobMembers(subject._id);
    if (jobmembers && jobmembers.length > 0) {
      for (const jobmember of jobmembers) {
        if (jobmember.messengerId && jobmember.messengerId !== member.messengerId) {
          myEmitter.emit('create-notification', jobmember.messengerId, subject.company, notificationType.JOB, notificationEvent.ADDED_JOB_COMMENT, notificationMeta);
        }
      }
    }
  } else if(comment.subjectType==subjectType.APPLICATION) {
    const candidate = await candidateService.findById(subject.user);
    newActivity.meta= {name: member.firstName + ' ' + member.lastName, candidateName: candidate.firstName + ' ' + candidate.lastName,candidate: candidate._id, jobTitle: subject.jobTitle, application: subject._id, job:  subject.job};
  } else if(comment.subjectType==subjectType.CANDIDATE) {
    newActivity.meta= {name: member.firstName + ' ' + member.lastName, candidateName: subject.firstName + ' ' + subject.lastName,candidate: subject._id, jobTitle: subject.jobTitle};
  }
  const activity = await activityService.add(newActivity);

  return comment;

}

/*async function getReplies(commentId) {
  //return await Comment.find({ parentComment: { $in: commentIds } }).populate('createdBy').exec();
  const replies = await Comment.aggregate([
    {
      $match: { parentComment: { $in: commentIds } }
    },
    {
      $lookup: {
        from: 'members',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: '$createdBy' },
  ]);

  return replies.map(reply => {
    const member = Member(reply?.createdBy);
    reply.createdBy = member?.transform();
    return reply;
  });
}*/

async function getReplies(commentId, sort, currentUserId) {
  let data = null;

  if(!commentId || !sort){
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
  let aMatch = {$match: {parentComment: commentId}};
  let aSort = {$sort: {createdDate: direction} };

  aList.push(aMatch);

  aList.push(
    {
      $lookup: {
        from: 'members',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: '$createdBy'},
    {
      $lookup: {
          from: 'reactions',
          let: { commentId: '$_id' },
          pipeline: [
              { $match: { $expr: { $eq: ['$subject', '$$commentId'] } } },
              {
                  $group: {
                      _id: '$reactionType',
                      count: { $sum: 1 },
                      hasReacted: {
                        $sum: {
                          $cond: [{ $eq: ['$reactionBy', currentUserId] }, 1, 0]
                        }
                      }
                  }
              }
          ],
          as: 'reactions'
      }
    }
  );

  if(sort && sort.sortBy=='rating'){
    aSort = { $sort: { rating: direction} };
    aList.push(aSort);
  } else {
    aList.push(aSort);
  }


  const aggregate = Comment.aggregate(aList);
  data = await Comment.aggregatePaginate(aggregate, options);
  data.docs.forEach(function (comment) {
    const member = Member(comment?.createdBy);
    comment.createdBy = member?.transform();

    const reactions = comment.reactions.map(reaction => ({
      reactionType: reaction._id,
      count: reaction.count,
      hasReacted: reaction.hasReacted > 0
    }));
    comment.reactions = reactions;

  });

  return data;
}



module.exports = {
  findById:findById,
  findBy_Id:findBy_Id,
  getComments:getComments,
  addComment:addComment,
  findByIdAndDelete:findByIdAndDelete,
  getReplies,
}
