const _ = require('lodash');
const dateEnum = require('../const/dateEnum')
const statusEnum = require('../const/statusEnum')
const ObjectID = require('mongodb').ObjectId;


function CandidateParam(filter, subscribedCandidateIds=[], poolCandidateIds=[]) {
  this.query = {};
  const orConditions = [];
  // this.query.$or = [];




  // this.query.hasApplied = filter.hasApplied?true:false;
  // this.query.hasImported =  filter.hasImported?true:false;


  if(filter.status && filter.status.length){
    this.query.status =  { $in: filter.status };
  } else {
    this.query.status =  { $in: [statusEnum.ACTIVE] };
  }


  if(filter.userId){
    this.query.userId =  filter.userId;
  }

  if(filter.id){
    let ids = _.reduce(filter.id.split(','), function(res, i){
      res.push(parseInt(i));
      return res;
    }, []);
    this.query.jobId =  { $in: ids };
  }

  if(filter.isNew) {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    this.query.createdDate =  { $gt: date.getTime() }
  }

  if(filter.tags && filter.tags.length){
    let tagIds = filter.tags.map(id => new ObjectID(id));
    this.query.tags =  { $in: tagIds };
  }


  if (filter.query) {
    const words = filter.query.split(/\s+/);
    this.query.$and = words.map(word => ({
      $or: [
        { firstName: { $regex: word, $options: "i" } },
        { lastName: { $regex: word, $options: "i" } },
        { email: { $regex: word, $options: "i" } }
      ]
    }));
  }

  if (filter.level && filter.level.length) {
    this.query.level = { $in: filter.level };
  }

  if (filter.jobFunction && filter.jobFunction.length) {
    this.query.jobFunction =  { $in: filter.jobFunction };
  }

  if (filter.employmentType && filter.employmentType.length) {
    this.query.employmentType =  { $in: filter.employmentType};
  }

  if (filter.industry && filter.industry.length) {
    this.query.industry =  { $in: filter.industry };
  }

  if (filter.company && filter.company.length) {
    let companyIds = filter.company.map(id => (id instanceof ObjectID ? id : new ObjectID(id)));
    this.query.company = { $in: companyIds };
  }

  if (filter.district && filter.district.length) {
    this.query.district =  { $in: filter.district};
  }

  if (filter.city && filter.city.length) {
    this.query['primaryAddress.city'] =  { $in: filter.city};
  }

  if (filter.state && filter.state.length) {
    this.query['primaryAddress.state'] =  { $in: filter.state};
  }

  if (filter.country && filter.country.length) {
    this.query['primaryAddress.country'] =  { $in: filter.country};
  }


  if (filter.distance && filter.distance!="") {
    this.query.distance =  { $in: filter.distance};
  }

  if (filter.members && filter.members.length) {
    this.query.members =  { $in: filter.members};
  }

  if (filter.createdBy && filter.createdBy.length) {
    this.query.createdBy =  { $in: filter.createdBy};
  }


  if (filter.minYear && filter.maxYear) {
    this.query.$and =  [{noOfMonthExperiences:  {$gte: (filter.minYear * 12)} }, {noOfMonthExperiences: { $lte: (filter.maxYear * 12)}}];
  }

  if(filter.sources && filter.sources.length){
    let sourceIds = filter.sources.map(id => new ObjectID(id));
    this.query.sources = { $in: sourceIds};
  }

  if(filter.ratings && filter.ratings.length) {
    const ratingFilters = filter.ratings.map(rating => {
      const lowerBound = rating - 1;
      const upperBound = rating;
      return { rating: { $gt: lowerBound, $lte: upperBound } };
    });
    orConditions.push(...ratingFilters);
  }

  if(filter.openForWork && filter.openForWork !== null && filter.openForWork !== undefined){
    this.query.openToJob = { $eq: filter.openForWork};
  }

  if(filter.hasSaved && subscribedCandidateIds && subscribedCandidateIds.length){
    this.query._id = { $in: subscribedCandidateIds };
  }

  if((filter.hasFlag && filter.hasFlag === true) || (filter.hasFlagged && filter.hasFlagged === true)){
    this.query.flag = {$ne: null};
  }else {
    orConditions.push({ flag: null }, { flag: { $exists: false } });
  }

  if(filter.hasApplied){
    this.query.hasApplied = {$eq: filter.hasApplied}
  }

  if(filter.pool && poolCandidateIds && poolCandidateIds.length){
    this.query._id = { $in: poolCandidateIds};
  }

  if (orConditions.length) {
    this.query.$or = orConditions;
  }

  return this.query;
}

module.exports = CandidateParam;
