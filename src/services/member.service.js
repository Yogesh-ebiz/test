const _ = require('lodash');
const { ObjectId } = require('mongodb');
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const Member = require('../models/member.model');
const Company = require('../models/company.model');
const MemberInvitation = require('../models/memberInvitation.model');
const MemberSubscribe = require('../models/membersubscribe.model');
const feedService = require('../services/api/feed.service.api');
const roleService = require("./role.service");
const activityService = require("./activity.service");
const calendarService = require('./api/calendar.service.api');
const messagingService = require('./api/messaging.service.api');
const actionEnum = require("../const/actionEnum");


const memberSchema = Joi.object({
  userId: Joi.number(),
  // companyId: Joi.number(),
  createdBy: Joi.number().required(),
  firstName: Joi.string(),
  middleName: Joi.string().allow('').optional(),
  lastName: Joi.string(),
  countryCode: Joi.string().allow(''),
  phone: Joi.string().allow(''),
  email: Joi.string().allow(''),
  status: Joi.string().optional(),
  language: Joi.string().allow('').optional(),
  timezone: Joi.string().allow('').optional(),
  preferTimeFormat: Joi.string().allow('').optional(),
  currency: Joi.string().allow('').optional(),
  role: Joi.object().optional(),
  avatar: Joi.string().optional(),
  isOwner: Joi.boolean().optional(),
});

const subscriptionSchema = Joi.object({
  createdBy: Joi.object().required(),
  member: Joi.object().required(),
  subjectType: Joi.string().required(),
  subject: Joi.object().required()
});



async function add(member) {
  if(!member){
    return;
  }


  let result;
  memberSchema.validate(member, {abortEarly: true});

  result = new Member(member).save();
  return result;

}

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

function findById(id) {

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

  return Member.find({userId: userId}).populate('role').populate('company');
}


async function findAllByUserId(userId) {
  let data = null;

  if(!userId){
    return;
  }

  return Member.find({userId: userId}).populate('role');
}

async function inviteMembers(company, member, form) {
  let data = null;

  const {emails, role, note} = form;
  if(!company || !member || !emails || !role){
    return;
  }
  let invitations = [];
  const foundRole = await roleService.findById(role);
  const hasRole = _.find(company.roles, function(o){ return o.equals(role)});

  if(!company && (!foundRole && !hasRole)){
    return null;
  }

  emails.forEach(function (email) {
    let invitation = {email:email, role:foundRole, company:company, createdBy:member, note: note};
    invitations.push(invitation);
  });

    invitations = await MemberInvitation.insertMany(invitations);

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


async function searchMembers(companyId, status, query) {
  let data = null;

  if(!companyId){
    return;
  }

  query = query || '';
  status = status || statusEnum.ACTIVE;

  const words = query.trim().split(/\s+/); // Splitting the query into individual words
  const searchConditions = words.map(word => ({
    $or: [
      { firstName: { $regex: word, $options: 'i' } },
      { lastName: { $regex: word, $options: 'i' } },
      { email: { $regex: word, $options: 'i' } }
    ]
  }));

  //let result = Member.find({companyId: companyId, status: status, $or: [{firstName: { $regex: query, $options: 'i' }}, {lastName: { $regex: query, $options: 'i' }}, {email: { $regex: query, $options: 'i' }}]})
  //  .populate('role');
  let result = Member.find({companyId: companyId, status: status, $and: searchConditions}).populate('role');

  return result;
}


async function findMember(userId, companyId) {
  let data = null;

  if(!userId || !companyId){
    return;
  }

  const member = Member.aggregate(
    [
      { $match : { userId : userId } },
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'role',
        },
      },
      { $unwind: '$role' },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      { $match: { 'company.companyId': companyId} }
    ]
  ).then(items => items[0]);

  return member;
}
async function findMembersByIds(ids){
  try {
    const members = await Member.find({ _id: { $in: ids } });
    return members;
  } catch (error) {
    console.error('Error finding members by IDs:', error);
    throw new Error('Error finding members by IDs');
  }
}
function findMemberByUserId(userId) {
  let data = null;

  if(userId==null){
    return;
  }

  let allAccounts = Member.find({userId: userId});
  return allAccounts;
}



async function findByUserIdAndCompany(userId, companyId) {
  let data = null;

  if(!userId || !companyId){
    return;
  }

  // let member = await Member.findOne({userId: userId, company: company}).populate('role');
  const company = await Company.findOne({companyId: companyId}).populate({
    path: 'members',
    model: 'Member',
    populate: [
      {
        path: 'role',
        model: 'Role'
      }
    ]
  })

  const member = _.find(company.members, function(o){ return o.userId===userId});
  return member
}


function findByEmail(email) {
  let data = null;

  if(!email){
    return;
  }

  let member = Member.findOne({email: email});
  return member
}
function findByEmailAndCompany(email, company) {
  let data = null;

  if(!email || !company){
    return;
  }

  let member = Member.findOne({email, company});
  return member;
}



async function addMemberFromInvitation(form, invitationId) {
  if(!form || !invitationId){
    return;
  }


  let result;
  let invitation = await MemberInvitation.findById(invitationId).populate('createdBy').populate('company');
  if(!invitation){
    throw new Error('Invitation does not exist');
  }
  if (invitation.email !== form.email) {
    throw new Error('Email in invitation does not match the email in the form');
  }
  let user;
  let currentFeedUser = await feedService.findUserByEmail(form.email.toLowerCase());

  if(!currentFeedUser){
    const userForm = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      password: form.password,
    };
    const response = await feedService.register(userForm);
    user = response.user;
  }else {
    user = currentFeedUser;
  }

  if(user) {
    form.company = invitation.company._id;
    form.companyId = invitation.company.companyId;
    form.role = new ObjectId(invitation.role);
    form.createdBy = invitation.createdBy.userId;
    memberSchema.validate(form, {abortEarly: false});
    form.userId = user.id;
    result = await new Member(form).save();
    if (result) {
      await MemberInvitation.findByIdAndDelete(invitationId);
    }
  }
  return result;

}

async function updateMember(memberId, form, member) {
  if(!memberId || !form || !member){
    return;
  }

  await memberSchema.validate(form, {abortEarly: false});
  let found = await findById(memberId);

  if(found && found.status===statusEnum.ACTIVE){
    const updates = {};

    if (found.firstName !== form.firstName) {
      updates.firstName = form.firstName;
      found.firstName = form.firstName;
    }
    if (found.lastName !== form.lastName) {
      updates.lastName = form.lastName;
      found.lastName = form.lastName;
    }
    if (found.email !== form.email) {
      updates.email = form.email;
      found.email = form.email;
    }
    found.middleName = form.middleName;
    found.countryCode = form.countryCode;
    found.phone = form.phone;
    found.language = form.language;
    found.timezone = form.timezone;
    found.preferTimeFormat = form.preferTimeFormat;
    found.currency = form.currency;
    found = await found.save();

    if (found.calendarUserId && Object.keys(updates).length > 0) {
      await calendarService.updateUser(found.calendarUserId, updates);
    }
    if(found.messengerId && Object.keys(updates).length > 0){
      await messagingService.updateUser(found.messengerId, updates);
    }

    await activityService.add({
      causer: member._id,
      causerType: subjectType.MEMBER,
      subjectType: subjectType.MEMBER,
      subject: found._id,
      action: actionEnum.UPDATED_MEMBER,
      meta: {name: found.firstName + ' ' + found.lastName}
    });
  }
  return found;

}


async function updateMemberRole(memberId, companyId, roleId, member) {
  if(!memberId || !companyId || !member){
    return;
  }

  const found = await Member.findById(memberId);

  if(found){
    if (roleId === '') {
      found.role = null;
    }else {
      const role = await roleService.findById(roleId);
      if (role) {
        found.role = role;
      }
    }
    await found.save();
    await activityService.add({
      causer: member._id,
      causerType: subjectType.MEMBER,
      subjectType: subjectType.MEMBER,
      subject: found._id,
      action: actionEnum.UPDATED_MEMBER_ROLE,
      meta: {name: found.firstName + ' ' + found.lastName}
    });
  }

  return found;
}


async function removeMember(memberId, member) {
  if(!memberId || !member){
    return;
  }

  let found = await findById(memberId);

  if(found){
    found.status = statusEnum.DELETED;
    found = await found.save();

    await activityService.add({
      causer: member._id,
      causerType: subjectType.MEMBER,
      subjectType: subjectType.MEMBER,
      subject: found._id,
      action: actionEnum.DELETED,
      meta: {name: found.firstName + ' ' + found.lastName}
    });
  }
  return found;
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

  await subscriptionSchema.validate(subscription, {abortEarly: false});
  subscription = await new MemberSubscribe(subscription).save();

  return subscription;

}


async function unsubscribe(memberId, subjectType, subjectId) {

  if(!memberId || !subjectType || !subjectId){
    return;
  }

  let result;
  let subscription = await MemberSubscribe.findOneAndDelete({member: memberId, subjectType: subjectType, subject: subjectId});
  console.log(subscription)
  if(subscription){
      result = {success: true};
  }

  return result;

}



async function findMemberSubscribed(userId, subjectType, subjectId) {

  if(!userId || !subjectType || !subjectId){
    return;
  }

  let result = await MemberSubscribe.find({createdBy: userId, subjectType: subjectType, subject: new ObjectId(subjectId)});
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
async function findSubscribeByUserIdAndSubjectTypeAndSubjectIds(memberId, sType, subjectIds) {
  if(!memberId || !sType || !subjectIds){
    return;
  }

  let result = await MemberSubscribe.find({
    createdBy: memberId,
    subjectType: sType,
    subject: { $in: subjectIds }
  });
  return result;

}


async function findJobSubscriptions(memberId, sort) {
  if(!memberId || !sort){
    return;
  }


  let select = '';
  let limit = (sort.size && sort.size>0) ? parseInt(sort.size) : 20;
  let page = (sort.page && sort.page==0) ? 1 : parseInt(sort.page) + 1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };

  let pipeline = [
    {
      $match: {
        member: memberId,
        subjectType: subjectType.JOB
      }
    },
    {$lookup:{
        from:"jobrequisitions",
        let:{subject: '$subject'},
        pipeline:[
          {$match:{$expr:{$eq:["$$subject","$_id"]}}},
          { $match: { status: statusEnum.ACTIVE } },
          {
            $lookup: {
              from: 'companies',
              localField: "company",
              foreignField: "_id",
              as: "company"
            }
          },
          { $unwind: '$company'},
          {
            $lookup: {
              from: 'members',
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy"
            }
          },
          { $unwind: '$createdBy'},
          {
            $lookup: {
              from: 'companydepartments',
              localField: "department",
              foreignField: "_id",
              as: "department"
            }
          },
          { $unwind: '$department'},
          {
            $lookup: {
              from: 'applications',
              localField: '_id',
              foreignField: 'job',
              as: 'applications'
            }
          },
          {
            $set: {
              noOfApplied: { $size: "$applications" }
            }
          }
        ],
        as: 'subject'
      }},
    { $unwind: '$subject'}
  ];

  // Add search for job title if sort.query is present
  if (sort.query) {
    pipeline.push(
      {
        $match: {
          'subject.title': new RegExp(sort.query, 'i')
        }
      }
    );
  }

  let result = await MemberSubscribe.aggregatePaginate(pipeline, options);
  return result;

}


async function findApplicationSubscriptions(memberId, sort) {
  if(!memberId || !sort){
    return;
  }


  let select = '';
  let limit = (sort.size && sort.size>0) ? parseInt(sort.size):20;
  let page = (sort.page && sort.page==0) ? 1:parseInt(sort.page) + 1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };


  let pipeline =[{
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
          { $match: { status: { $ne: statusEnum.DELETED } } },
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
              ],
              as: "currentProgress"
            }},
          { $unwind: '$currentProgress'},
        ],
        as: 'subject'
      }},
    { $unwind: '$subject'}
  ];

  // Add search for candidates firstName, lastName and email if sort.query is present
  if (sort.query) {
    const queryWords = sort.query.trim().split(/\s+/);
    const regexPatterns = queryWords.map(word => new RegExp(word, 'i'));
    const combinedRegex = new RegExp(regexPatterns.map(pattern => pattern.source).join('|'), 'i');
    pipeline.push({
      $match: {
        $or: [
          { 'subject.user.firstName': combinedRegex },
          { 'subject.user.lastName': combinedRegex },
          { 'subject.user.email': combinedRegex }
        ]
      }
    });
  }

  let result = await MemberSubscribe.aggregatePaginate(pipeline, options);
  return result;

}

async function findCandidateSubscriptions(memberId, sort) {
  if(!memberId || !sort){
    return;
  }


  let select = '';
  let limit = (sort.size && sort.size>0) ? parseInt(sort.size):20;
  let page = (sort.page && sort.page==0) ? 1:parseInt(sort.page) + 1;
  let sortBy = {};
  sortBy[sort.sortBy] = (sort.direction && sort.direction=="DESC") ? -1:1;

  let options = {
    select:   select,
    sort:     sortBy,
    lean:     true,
    limit:    limit,
    page: page
  };

  const aggregate = MemberSubscribe.aggregate([
    {
      $match: {
        member: memberId,
        subjectType: subjectType.CANDIDATE
      }
    },
    {$lookup:{
        from:"candidates",
        let:{subject: '$subject'},
        pipeline:[
          {$match:{$expr:{$eq:["$$subject","$_id"]}}},
          { $match: { status: statusEnum.ACTIVE } },
          {
            $lookup: {
              from: 'companies',
              localField: "company",
              foreignField: "_id",
              as: "company"
            }
          },
          { $unwind: '$company'},
          {
            $lookup: {
              from: 'members',
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy"
            }
          },
          { $unwind: '$createdBy'},
          {
            $lookup: {
              from: 'applications',
              localField: '_id',
              foreignField: 'candidate',
              as: 'applications'
            }
          },
          {
            $set: {
              noOfApplied: { $size: "$applications" }
            }
          }
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

  if(!userId || !filter || !sort){
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
  let aSort = sort.sortBy
  ? { $sort: { [sort.sortBy]: direction, name: direction } }
  : { $sort: { name: direction } };

  aList.push(aMatch);

  aList.push(
    { $lookup: {from: 'roles', localField: 'role', foreignField: '_id', as: 'role' } },
    { $unwind: '$role'}
  );

  aList.push(aSort);

  const aggregate = Member.aggregate(aList);
  return await Member.aggregatePaginate(aggregate, options);
}


async function removeMembersRole(roleId) {
  if(!roleId){
    return;
  }
  return await Member.updateMany({role: roleId}, {$set: {role: null}});
}



module.exports = {
  add,
  sync,
  findByUserId,
  findAllByUserId,
  findByEmail,
  findByEmailAndCompany,
  inviteMembers,
  getMemberInvitations,
  cancelMemberInvitation,
  searchMembers,
  findById,
  findMember,
  findMembersByIds,
  findMemberByUserId,
  findByUserIdAndCompany,
  addMemberFromInvitation,
  updateMember,
  updateMemberRole,
  removeMember,
  followJob,
  unfollowJob,
  subscribe,
  unsubscribe,
  findMemberSubscribed,
  findMemberSubscribedToSubjectType,
  findSubscribeByMemberIdAndSubjectType,
  findSubscribeByUserIdAndSubjectTypeAndSubjectIds,
  findJobSubscriptions,
  findApplicationSubscriptions,
  findCandidateSubscriptions,
  searchCompanyByUserId,
  removeMembersRole
}
