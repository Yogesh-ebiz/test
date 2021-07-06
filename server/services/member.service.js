const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const Member = require('../models/member.model');
const MemberInvitation = require('../models/memberInvitation.model');
const MemberSubscribe = require('../models/membersubscribe.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const feedService = require('../services/api/feed.service.api');


const memberSchema = Joi.object({
  createdBy: Joi.number().required(),
  company: Joi.number().required(),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow('').optional(),
  lastName: Joi.string().required(),
  phone: Joi.string().allow('').required(),
  email: Joi.string().allow('').required(),
  status: Joi.string().optional(),
  language: Joi.string().allow('').optional(),
  timezone: Joi.string().allow('').optional(),
  preferTimeFormat: Joi.string().allow('').optional(),
  userId: Joi.number(),
  role: Joi.object().optional()
});

const subscriptionSchema = Joi.object({
  createdBy: Joi.number().required(),
  member: Joi.object().required(),
  subjectType: Joi.string().required(),
  subject: Joi.object().required()
});



async function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return Member.findById(id).populate('role');
}


async function findByUserId(company, id) {
  let data = null;

  if(!company || !id){
    return;
  }

  return Member.findOne({company: company, userId: id}).populate('role');
}

async function inviteMembers(company, currentUserId, emails, role) {
  let data = null;

  if(!company || !emails || !role){
    return;
  }

  let newMembers = [];
  emails.forEach(function(email){
    let member = {};
    member.email = email;
    member.createdBy = currentUserId;
    member.company = company;
    member.role = role;
    newMembers.push(member);
  });

  let invitations = await MemberInvitation.insertMany(newMembers);
  return invitations;
}

async function getMemberInvitations(company, query) {
  let data = null;

  if(!company){
    return;
  }

  let match = {company: company};

  if(query){
    match.email = { $regex: query, $options: 'i'};
  }

  let invitations = await MemberInvitation.find(match).populate('role');
  return invitations
}



async function cancelMemberInvitation(company, invitationId) {
  let data = null;

  if(!company || !invitationId){
    return;
  }


  let invitations = await MemberInvitation.deleteOne({_id: invitationId});
  return invitations
}


async function getMembers(company) {
  let data = null;
  if(company==null){
    return;
  }

  let members = Member.find({company: company}).populate('role');
  console.log(members)
  return members
}


async function searchMembers(company, query) {
  let data = null;

  if(!company){
    return;
  }

  let result = Member.find({company: company, $or: [{firstName: { $regex: query.toLowerCase(), $options: 'i' }}, {lastName: { $regex: query, $options: 'i' }}]});
  return result
}

async function findMemberBy_Id(memberId) {
  let data = null;

  if(memberId==null){
    return;
  }

  let member = Member.findById(memberId);
  return member
}

async function findMemberByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  let allAccounts = Member.find({userId: userId}).populate('role');
  return allAccounts
}


async function findMemberByUserIdAndCompany(userId, company) {
  let data = null;

  if(!userId || !company){
    return;
  }

  let member = Member.findOne({userId: userId, company: company}).populate('role');
  return member
}


async function addMember(member) {
  if(!member){
    return;
  }


  let result;
  console.log(member)
  member = await Joi.validate(member, memberSchema, {abortEarly: false});

  result = new Member(member).save();
  return result;

}


async function addMemberFromInvitation(member, role, invitationId) {
  if(!member || !role || !invitationId){
    return;
  }


  let result;
  let invitation = await MemberInvitation.findById(invitationId);
  if(invitation) {
    member.createdBy = invitation.createdBy;
    member = await Joi.validate(member, memberSchema, {abortEarly: false});

    let user = await feedService.register(member);

    if(user) {
      member.userId = user.id;
      member.role = role;

      result = new Member(member).save();
      if (result) {
        await invitation.delete();
      }
    }
  }
  return result;

}

async function updateMember(memberId, form) {
  if(!memberId || !form){
    return;
  }


  form = await Joi.validate(form, memberSchema, {abortEarly: false});
  let member = await findMemberBy_Id(memberId);

  if(member){
    member.firstName = form.firstName;
    member.middleName = form.firstName;
    member.lastName = form.lastName;
    member.email = form.email;
    member.phone = form.phone;
    member.language = form.language;
    member.timezone = form.timezone;
    member.preferTimeFormat = form.preferTimeFormat;
    result = await member.save();
  }
  return member;

}


async function updateMemberRole(memberId, role) {
  if(!memberId || !role){
    return;
  }


  let member = await findMemberBy_Id(memberId);

  if(member){
    member.role = role;
    result = await member.save();
  }
  return member;

}




async function followJob(memberId, jobId) {
  if(!memberId || !jobId){
    return;
  }

  let member = await findMemberBy_Id(memberId);

  if(member){
    member.followedJobs.push(jobId);
    member = await member.save();
  }
  return member.followedJobs;

}



async function unfollowJob(memberId, jobId) {
  if(!memberId || !jobId){
    return;
  }


  let member = await findMemberBy_Id(memberId);

  if(member){
    member.followedJobs.forEach(function(item, index, object){
      if(item==jobId){
        object.splice(index, 1);
      }
    });
    member = await member.save();
  }
  return member;

}



async function subscribe(subscription) {

  if(!subscription){
    return;
  }

  subscription = await Joi.validate(subscription, subscriptionSchema, {abortEarly: false});
  subscription = new MemberSubscribe(subscription).save();

  return subscription;

}


async function unsubscribe(memberId, subjectType, subjectId) {

  if(!memberId || !subjectType || !subjectId){
    return;
  }

  let result;
  let subscription = await MemberSubscribe.findOne({memberId: memberId, subjectType: subjectType, subjectId: ObjectID(subjectId)});

  if(subscription){
    result = await subscription.delete();
    if(result){
      result = {success: true};
    }
  }

  return result;

}



async function findMemberSubscribed(userId, subjectType, subjectId) {

  if(!userId || !subjectType || !subjectId){
    return;
  }

  let result = await MemberSubscribe.find({createdBy: userId, subjectType: subjectType, subjectId: ObjectID(subjectId)});
  return result;

}


async function findMemberSubscribedToSubjectType(userId, subjectType) {

  if(!userId || !subjectType){
    return;
  }

  let result = await MemberSubscribe.find({createdBy: userId, subjectType: subjectType});
  return result;

}



async function findSubscribeByMemberIdAndSubjectType(memberId, sType, sort) {
  if(!memberId || !sType){
    return;
  }


  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };

  let joinWith = sType==subjectType.JOB?'jobrequisitions':'applications';

  const aggregate = MemberSubscribe.aggregate([{
    $match: {
      memberId: memberId,
      subjectType: sType
    }
  },
    {
      $lookup: {
        from: joinWith,
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subject',
      },
    },
    { $unwind: '$subject'}

  ]);

  let result = await MemberSubscribe.aggregatePaginate(aggregate, options);
  return result;

}
async function findSubscribeByUserIdAndSubjectTypeAndSubjectIds(userId, sType, subjectIds) {
  if(!userId || !sType || !subjectIds){
    return;
  }

  let result = await MemberSubscribe.find({
    createdBy: userId,
    subjectType: sType,
    subjectId: { $in: subjectIds }
  });
  return result;

}


async function findJobSubscriptions(memberId, sort) {
  if(!memberId || !sort){
    return;
  }


  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page+1:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };

  console.log(memberId, subjectType.JOB)
  const aggregate = MemberSubscribe.aggregate([{
    $match: {
      memberId: memberId,
      subjectType: subjectType.JOB
    }
  },
    // {
    //   $lookup: {
    //     from: 'jobrequisitions',
    //     localField: 'subjectId',
    //     foreignField: '_id',
    //     as: 'subject',
    //   },
    // },
    // { $unwind: '$subject'}
    {$lookup:{
        from:"jobrequisitions",
        let:{subjectId: '$subjectId'},
        pipeline:[
          {$match:{$expr:{$eq:["$$subjectId","$_id"]}}},
          // {
          //   $lookup: {
          //     from: 'departments',
          //     localField: "department",
          //     foreignField: "_id",
          //     as: "department"
          //   }
          // },
          { $unwind: '$department'},
          {
            $lookup: {
              from: 'members',
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy"
            }
          },
          { $unwind: '$createdBy'}
        ],
        as: 'subject'
      }},
    { $unwind: '$subject'}
  ]);

  let result = await MemberSubscribe.aggregatePaginate(aggregate, options);
  return result;

}


async function findApplicationSubscriptions(memberId, sort) {
  if(!memberId || !sort){
    return;
  }


  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page+1:1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };


  const aggregate = MemberSubscribe.aggregate([{
    $match: {
      memberId: memberId,
      subjectType: subjectType.APPLICATION
    }
  },
    // {
    //   $lookup: {
    //     from: 'jobrequisitions',
    //     localField: 'subjectId',
    //     foreignField: '_id',
    //     as: 'subject',
    //   },
    // },
    // { $unwind: '$subject'}
    {$lookup:{
        from:"applications",
        let:{subjectId: '$subjectId'},
        pipeline:[
          {$match:{$expr:{$eq:["$$subjectId","$_id"]}}},
          {$lookup:{
              from:"candidates",
              let:{user:"$user"},
              pipeline:[
                {$match:{$expr:{$eq:["$_id","$$user"]}}},
                {
                  $lookup: {
                    from: 'evaluations',
                    localField: 'evaluations',
                    foreignField: '_id',
                    as: 'evaluations',
                  },
                },
                { $addFields:
                    {
                      rating: {$avg: "$evaluations.rating"},
                      evaluations: [],
                      applications: []
                    }
                },
              ],
              as: 'user'
            }},
          { $unwind: '$user'},
          {$lookup:{
              from:"applicationprogresses",
              let:{currentProgress: '$currentProgress'},
              pipeline:[
                {$match:{$expr:{$eq:["$$currentProgress","$_id"]}}},
                {
                  $lookup: {
                    from: 'stages',
                    localField: "stage",
                    foreignField: "_id",
                    as: "stage"
                  }
                },
                { $unwind: '$stage'},
              ],
              as: "currentProgress"
            }},
          { $unwind: '$currentProgress'},
        ],
        as: 'subject'
      }},
    { $unwind: '$subject'}
  ]);

  let result = await MemberSubscribe.aggregatePaginate(aggregate, options);
  return result;

}



module.exports = {
  findById:findById,
  findByUserId:findByUserId,
  inviteMembers:inviteMembers,
  getMemberInvitations:getMemberInvitations,
  cancelMemberInvitation:cancelMemberInvitation,
  getMembers:getMembers,
  searchMembers:searchMembers,
  findMemberBy_Id:findMemberBy_Id,
  findMemberByUserId:findMemberByUserId,
  findMemberByUserIdAndCompany:findMemberByUserIdAndCompany,
  addMember:addMember,
  addMemberFromInvitation:addMemberFromInvitation,
  updateMember:updateMember,
  updateMemberRole:updateMemberRole,
  followJob: followJob,
  unfollowJob: unfollowJob,
  subscribe:subscribe,
  unsubscribe:unsubscribe,
  findMemberSubscribed:findMemberSubscribed,
  findMemberSubscribedToSubjectType:findMemberSubscribedToSubjectType,
  findSubscribeByMemberIdAndSubjectType:findSubscribeByMemberIdAndSubjectType,
  findSubscribeByUserIdAndSubjectTypeAndSubjectIds:findSubscribeByUserIdAndSubjectTypeAndSubjectIds,
  findJobSubscriptions:findJobSubscriptions,
  findApplicationSubscriptions:findApplicationSubscriptions
}
