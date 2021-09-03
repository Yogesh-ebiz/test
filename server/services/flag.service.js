const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');

const statusEnum = require('../const/statusEnum');
const subjectType = require('../const/subjectType');
const actionEnum = require('../const/actionEnum');

const Flag = require('../models/flag.model');

const candidateService = require('../services/candidate.service');
const activityService = require('../services/activity.service');


const flagSchema = Joi.object({
  createdBy: Joi.object(),
  companyId: Joi.number(),
  candidate: Joi.object(),
  userId: Joi.number(),
  type: Joi.string(),
  comment: Joi.string().allow('')
});


async function add(flag) {
  if(!flag){
    return;
  }


  let result;
  flag = await Joi.validate(flag, flagSchema, {abortEarly: false});
  result = new Flag(flag).save();

  await activityService.addActivity({
    causer: flag.createdBy,
    causerType: subjectType.MEMBER,
    subjectType: subjectType.CANDIDATE,
    subject: flag.candidate,
    action: actionEnum.FLAGGED
  });

  return result;

}

async function remove(company, userId, member) {
  if(!company || !userId || !member){
    return;
  }

  let result;
  let candidate = await candidateService.findByUserIdAndCompanyId(userId, company).populate('flag');
  if(candidate){
    if(candidate.flag) {
      await candidate.flag.delete();
      delete candidate.flag;
      await candidate.save();

      await activityService.addActivity({
        causer: member._id,
        causerType: subjectType.MEMBER,
        subjectType: subjectType.CANDIDATE,
        subject: candidate._id,
        action: actionEnum.UNFLAGGED
      });
    }
  }

  return result;
}


async function findByCompanyId(companyId, sort) {

  if(!companyId || !sort){
    return;
  }

  let select = '';
  let limit = (sort.size && sort.size>0) ? sort.size:20;
  let page = (sort.page && sort.page==0) ? sort.page:1;
  let direction = (sort.direction && sort.direction=="DESC") ? -1:1;
  let options = {
    select:   select,
    sort:     null,
    lean:     true,
    limit:    limit,
    page: parseInt(sort.page)+1
  };

  let aList = [];
  let aMatch = { $match: {companyId: companyId}};
  let aSort = { $sort: {createdDate: direction} };

  aList.push(aMatch);
  aList.push(
    {
      $lookup: {
        from: 'candidates',
        localField: "candidate",
        foreignField: "_id",
        as: "candidate"
      }
    },
    { $unwind: '$candidate'}
  );


  aList.push(aSort);

  const aggregate = Flag.aggregate(aList);
  let blacklist = await Flag.aggregatePaginate(aggregate, options);
  return blacklist;
}

module.exports = {
  add:add,
  remove:remove,
  findByCompanyId:findByCompanyId
}
