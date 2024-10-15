const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const catchAsync = require("../utils/catchAsync");
const Project = require('../models/project.model');
let Pagination = require('../utils/pagination');
let JobSearchParam = require('../const/jobSearchParam');
let SearchParam = require('../const/searchParam');
const projectService = require('../services/project.service');


const searchProject = catchAsync(async (req, res) => {
  const {user, params, query} = req;


  const projects = await projectService.getMemberProjects(user._id, query.query);
  res.json(projects);
})


async function getProjectSuggestions(filter, sort, locale) {

  if(!filter || !sort){
    return null;
  }

  result = await feedService.searchProject(filter, sort);

  return result;
}


async function getProjectById(projectId, locale) {

  if(!projectId){
    return null;
  }
  let result = await feedService.findCandidateById(projectId);
  return result;

}



async function addProjectToBlacklist(currentUserId, flag) {
  if(!currentUserId || !flag){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, flag.companyId);

  if(!memberRole){
    return null;
  }

  let result = null;
  let candidate = await candidateService.findByUserIdAndCompanyId(flag.userId, flag.companyId);
  if(!candidate){
    let user = await feedService.findCandidateById(flag.userId);
    if(user){
      user.skills = null;
      user.experiences = null;
      user.educations = null;
      candidate = await candidateService.addCandidate(flag.companyId, user, false, false);
    }
  }

  flag.createdBy = memberRole.member._id;
  flag.candidate = candidate;
  result = await flagService.add(flag);
  candidate.flag = result._id;
  await candidate.save();

  return result
}



async function removeProjectFromBlacklist(currentUserId, companyId, userId) {
  if(!currentUserId || !companyId || !userId){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result = null;
  // let candidate = await candidateService.findByUserIdAndCompanyId(userId, companyId).populate('flag');
  // if(candidate && candidate.flag) {
  //   await candidate.flag.delete();
  //   candidate.flag = null;
  //   await candidate.save();

    await flagService.remove(companyId, userId, memberRole.member);
    result = {success: true}

  return result
}


async function assignProjectJobs(companyId, currentUserId, userId, jobIds) {
  if(!companyId || !currentUserId || !userId || !jobIds){
    return null;
  }

  let memberRole = await memberService.findByUserIdAndCompany(currentUserId, companyId);

  if(!memberRole){
    return null;
  }

  let result;
  let candidate = await candidateService.findByUserIdAndCompanyId(userId, companyId);
  if(!candidate){
    let user = await feedService.findCandidateById(userId);
    if(user){
      user.skills = null;
      user.experiences = null;
      user.educations = null;
      candidate = await candidateService.addCandidate(companyId, user, false, false);
    }
  }

  try {

    let sources = await sourceService.findByCandidateId(candidate._id);
    if (sources) {
      let sourcesRemoving = _.reduce(sources, function(res, source){
        let exist = _.includes(jobIds, source.jobId);
        if(!exist){
          res.push(source.jobId);
        }
        return res;
      }, []);

      await sourceService.remove(sourcesRemoving)

      let sourcesAdding = _.reduce(jobIds, function(res, id){
        let exist = _.find(sources, {jobId: id});
        if(!exist){
          res.push(id);
        }
        return res;
      }, []);

      result = await sourceService.addSources(candidate, sourcesAdding, memberRole.member);

    }



  } catch(e){
    console.log('assignProjectJobs: Error', e);
  }


  return {success: true}
}


module.exports = {
  searchProject,
  getProjectSuggestions,
  getProjectById,
  addProjectToBlacklist,
  removeProjectFromBlacklist,
  assignProjectJobs
}
