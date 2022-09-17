const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const Member = require('../models/member.model');
const Company = require('../models/company.model');
const MemberInvitation = require('../models/memberInvitation.model');
const MemberSubscribe = require('../models/membersubscribe.model');
const feedService = require('../services/api/feed.service.api');


const memberSchema = Joi.object({
  createdBy: Joi.number().required(),
  company: Joi.number().optional(),
  firstName: Joi.string().required(),
  middleName: Joi.string().allow('').optional(),
  lastName: Joi.string().required(),
  phone: Joi.string().allow('').required(),
  email: Joi.string().allow('').required(),
  status: Joi.string().optional(),
  language: Joi.string().allow('').optional(),
  timezone: Joi.string().allow('').optional(),
  preferTimeFormat: Joi.string().allow('').optional(),
  currency: Joi.string().allow('').optional(),
  userId: Joi.number().optional(),
  role: Joi.object().optional(),
  avatar: Joi.string().optional(),
  isOwner: Joi.boolean().optional(),
});

const subscriptionSchema = Joi.object({
  createdBy: Joi.number().required(),
  member: Joi.object().required(),
  subjectType: Joi.string().required(),
  subject: Joi.object().required()
});



async function sync(user) {
  let data = null;

  if(!user){
    return;
  }

  let form = {firstName: user.firstName, lastName: user.lastName, avatar: user.avatar};
  if(user.primaryAddress){
    form.primaryAddress= user.primaryAddress;
  }

  if(user.primaryEmail){
    form.email= user.primaryEmail.value;
  }
  if(user.primaryPhone){
    form.phone= user.primaryPhone.value;
  }

  await Member.updateMany({userId: user.id}, {$set: form});
}

async function findById(id) {
  let data = null;

  if(!id){
    return;
  }

  return Member.findById(id).populate('role');
}


async function findByUserId(userId) {
  let data = null;

  if(!userId){
    return;
  }

  return Member.findOne({userId: userId}).populate('role').populate('roles');
}


async function findByEmail(email) {
  let data = null;

  if(!email){
    return;
  }

  return Member.findOneBy({email});
}


async function findAllByUserId(userId) {
  let data = null;

  if(!userId){
    return;
  }

  return Member.find({userId: userId}).populate('role');
}

async function inviteMembers(companyId, currentUserId, emails, role) {
  let data = null;

  if(!companyId || !emails || !role){
    return;
  }
  console.log(companyId)
  let invitations = [];
  const company = await Company.findOne({companyId: 106});
  if(company) {
    console.log(company._id)
    emails.forEach(function (email) {
      let member = {};
      member.email = email;
      member.createdBy = currentUserId;
      member.company = company._id;
      member.role = role;
      invitations.push(member);
    });

    invitations = await MemberInvitation.insertMany(invitations);
  }
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
  return members
}


async function searchMembers(company, query) {
  let data = null;

  if(!company){
    return;
  }

  query = query?query:'';

  let result = Member.find({company: company, $or: [{firstName: { $regex: query.toLowerCase(), $options: 'i' }}, {lastName: { $regex: query, $options: 'i' }}]});
  return result
}

async function findById(memberId) {
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


function findByUserIdAndCompany(userId, company) {
  let data = null;

  if(!userId || !company){
    return;
  }

  let member = Member.findOne({userId: userId, company: company}).populate('role');
  return member
}


function findByEmail(email) {
  let data = null;

  if(!email){
    return;
  }

  let member = Member.findOne({email: email}).populate('roles');
  return member
}


async function addMember(member) {
  if(!member){
    return;
  }


  let result;
  member = await Joi.validate(member, memberSchema, {abortEarly: false});

  result = new Member(member).save();
  return result;

}


async function addMemberFromInvitation(member, invitationId) {
  if(!member || !invitationId){
    return;
  }


  let result;
  let invitation = await MemberInvitation.findById(invitationId);
  if(invitation) {
    member.role = ObjectID(member.role);
    member.createdBy = invitation.createdBy;
    member = await Joi.validate(member, memberSchema, {abortEarly: false});

    let user = await feedService.register(member);

    if(user) {
      member.userId = user.id;
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
  let member = await findById(memberId);

  if(member){
    member.firstName = form.firstName;
    member.middleName = form.firstName;
    member.lastName = form.lastName;
    member.email = form.email;
    member.phone = form.phone;
    member.language = form.language;
    member.timezone = form.timezone;
    member.preferTimeFormat = form.preferTimeFormat;
    member.currency = form.currency;
    result = await member.save();
  }
  return member;

}


async function updateMemberRole(memberId, role) {
  if(!memberId || !role){
    return;
  }


  let member = await findById(memberId);

  if(member){
    member.role = role;
    result = await member.save();
  }
  return member;

}


async function removeMember(memberId) {
  if(!memberId){
    return;
  }


  let member = await findById(memberId);

  if(member){
    member = await member.delete();
  }
  return member;

}



async function followJob(memberId, jobId) {
  if(!memberId || !jobId){
    return;
  }

  let member = await findById(memberId);

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


  let member = await findById(memberId);

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


async function findMemberSubscribedToSubjectType(memberId, subjectType) {

  if(!memberId || !subjectType){
    return;
  }

  let result = await MemberSubscribe.find({member: memberId, subjectType: subjectType});
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

  const aggregate = MemberSubscribe.aggregate([{
    $match: {
      member: memberId,
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
        let:{subject: '$subject'},
        pipeline:[
          {$match:{$expr:{$eq:["$$subject","$_id"]}}},
          // {
          //   $lookup: {
          //     from: 'departments',
          //     localField: "department",
          //     foreignField: "_id",
          //     as: "department"
          //   }
          // },
          // { $unwind: '$department', preserveNullAndEmptyArrays: true},
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
      member: memberId,
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
        let:{subject: '$subject'},
        pipeline:[
          {$match:{$expr:{$eq:["$$subject","$_id"]}}},
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
                      rating: {$round: [{$avg: "$evaluations.rating"}, 1] },
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



async function searchCompanyByUserId(userId, filter, sort) {
  let data = null;

  if(userId==null || !filter || !sort){
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
  let aMatch = { $match: {userId: userId}};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);

  aList.push(
    { $lookup: {from: 'roles', localField: 'role', foreignField: '_id', as: 'role' } },
    { $unwind: '$role'}
  );

  const aggregate = Member.aggregate(aList);
  console.log(options)
  return await Member.aggregatePaginate(aggregate, options);
}


async function removeRole(roleId) {
  let data = null;

  if(!roleId){
    return;
  }


  return await Member.updateMany({role: roleId}, {$set: {role: null}});
}



module.exports = {
  sync:sync,
  findByUserId:findByUserId,
  findAllByUserId:findAllByUserId,
  findByEmail:findByEmail,
  inviteMembers:inviteMembers,
  getMemberInvitations:getMemberInvitations,
  cancelMemberInvitation:cancelMemberInvitation,
  getMembers:getMembers,
  searchMembers:searchMembers,
  findById:findById,
  findMemberByUserId:findMemberByUserId,
  findByUserIdAndCompany:findByUserIdAndCompany,
  findByEmail:findByEmail,
  addMember:addMember,
  addMemberFromInvitation:addMemberFromInvitation,
  updateMember:updateMember,
  updateMemberRole:updateMemberRole,
  removeMember:removeMember,
  followJob: followJob,
  unfollowJob: unfollowJob,
  subscribe:subscribe,
  unsubscribe:unsubscribe,
  findMemberSubscribed:findMemberSubscribed,
  findMemberSubscribedToSubjectType:findMemberSubscribedToSubjectType,
  findSubscribeByMemberIdAndSubjectType:findSubscribeByMemberIdAndSubjectType,
  findSubscribeByUserIdAndSubjectTypeAndSubjectIds:findSubscribeByUserIdAndSubjectTypeAndSubjectIds,
  findJobSubscriptions:findJobSubscriptions,
  findApplicationSubscriptions:findApplicationSubscriptions,
  searchCompanyByUserId:searchCompanyByUserId,
  removeRole:removeRole
}
