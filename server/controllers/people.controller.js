const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let Pagination = require('../utils/pagination');

let JobSearchParam = require('../const/jobSearchParam');
let SearchParam = require('../const/searchParam');

let statusEnum = require('../const/statusEnum');
const {convertToCandidate} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');
const memberService = require('../services/member.service');
const candidateService = require('../services/candidate.service');
const flagService = require('../services/flag.service');
const poolService = require('../services/pool.service');


module.exports = {
  searchPeople,
  getPeopleSuggestions,
  getPeopleById,
  addPeopleToBlacklist,
  removePeopleFromBlacklist
}

async function searchPeople(companyId, filter, sort, locale) {
  if(!companyId || !filter || !sort){
    return null;
  }

  result = await feedService.searchPeople(filter, sort);
  let pools = await poolService.findByCompany(companyId)
  let candidates = await candidateService.getListofCandidates(_.map(result.content, 'id'), companyId)
  result.content = _.reduce(result.content, function(res, people){
    let hasSaved = false;
    for(let candidate of candidates){
      if(candidate.userId==people.id) {
        for (let pool of pools) {
          let found = _.includes(pool.candidates, candidate._id);
          for (let c of pool.candidates) {
            if(candidate._id.equals(c)){
              hasSaved=true;
            }
          }
          if (found) {
            hasSaved = true;
          }
        }
      }
    }

    people.hasSaved=hasSaved;
    res.push(convertToCandidate(people));
    return res;
  }, []);

  return result;
}


async function getPeopleSuggestions(filter, sort, locale) {

  if(!filter || !sort){
    return null;
  }

  result = await feedService.searchPeople(filter, sort);

  return result;
}


async function getPeopleById(peopleId, locale) {

  if(!peopleId){
    return null;
  }
  let result = await feedService.findCandidateById(peopleId);
  return result;

}



async function addPeopleToBlacklist(currentUserId, flag) {
  if(!currentUserId || !flag){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, flag.companyId);

  if(!member){
    return null;
  }

  let result = null;
  try {
    let candidate = await candidateService.findByUserIdAndCompanyId(flag.userId, flag.companyId);
    if(!candidate){
      let user = await feedService.findCandidateById(flag.userId);
      if(user){
        candidate = await candidateService.addCandidate({userId: user.id, avatar: user.avatar, company: flag.companyId, firstName: user.firstName, middleName: user.middleName, lastName: user.lastName,
          jobTitle: user.jobTitle?user.jobTitle:'', email: '', phoneNumber: '',
          city: user.primaryAddress.city, state: user.primaryAddress.state, country: user.primaryAddress.country,
          skills: _.map(user.skills, 'id'), url: user.shareUrl
        });
      }
    }

    result = await flagService.add(flag);
    candidate.flag = result._id;
    await candidate.save();

  } catch(e){
    console.log('addPeopleToBlacklist: Error', e);
  }


  return result
}



async function removePeopleFromBlacklist(currentUserId, companyId, userId) {
  if(!currentUserId || !companyId || !userId){
    return null;
  }

  let member = await memberService.findMemberByUserIdAndCompany(currentUserId, companyId);

  if(!member){
    return null;
  }

  let result = null;
  try {
    let candidate = await candidateService.findByUserIdAndCompanyId(userId, companyId).populate('flag');
    if(candidate && candidate.flag) {
      await candidate.flag.delete();
      candidate.flag = null;
      await candidate.save();

      result = {success: true}
    }
  } catch(e){
    console.log('addPeopleToBlacklist: Error', e);
  }


  return result
}


