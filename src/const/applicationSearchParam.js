const _ = require('lodash');
const dateEnum = require('../const/dateEnum');
const statusEnum = require('./statusEnum');
const {ObjectId} = require('mongodb');


function ApplicationSearchParam(filter, subscribedApplicationIds=[]) {
  this.query = {};

  if (filter.job) {
    this.query.job = filter.job;
  }

  if (filter.query && filter.query!="") {
    this.query.$text = { $search: filter.query, $diacriticSensitive: true, $caseSensitive: false };
  }

  if(filter.status && filter.status.length){
    this.query.status =  { $in: filter.status };
  }else{
    this.query.status =  { $nin: [statusEnum.DELETED] }
  }


  if(filter.tags && filter.tags.length>0){
    this.query['user.tags.name'] =  { $in: filter.tags };
  }


  if (filter.level && filter.level.length) {
    this.query['user.level'] = { $in: filter.level.map(level => new RegExp(`^${level}$`, 'i')) };
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

  if (filter.company && filter.company!="") {

    this.query.company = { $in: filter.company };
  }

  if (filter.city && filter.city.length) {
    this.query['user.city'] =  { $in: filter.city};
  }

  if (filter.state && filter.state.length) {
    this.query['user.state'] =  { $in: filter.state};
  }

  if (filter.country && filter.country.length) {
    this.query['user.country'] =  { $in: filter.country};
  }

  if (filter.createdBy && filter.createdBy.length) {
    this.query.createdBy =  { $in: filter.createdBy};
  }

  if (filter.skills && filter.skills.length) {
    let skillIds = filter.skills.map(id => new ObjectId(id));
    this.query['user.skills'] =  { $in: skillIds};
  }

  if (filter.sources && filter.sources.length) {
    this.query['user.sources.name'] =  { $in: filter.sources};
  }

  if (filter.stages && filter.stages.length) {
    this.query['currentProgress.stage'] =  { $in: filter.stages};
  }


  if (filter.distance && filter.distance!="") {
    this.query.distance =  { $in: filter.distance};
  }


  if (filter.noOfMonthsExperience) {
    // this.query['user.noOfMonthExperiences.$gte'] = {};
    //
    // if (filter.noOfMonthsExperience[0]){
    //   this.query['user.noOfMonthExperiences.$gte'] = filter.noOfMonthsExperience[0];
    // }
    // if (filter.noOfMonthsExperience[1]){
    //   this.query['user.noOfMonthExperiences.$lte'] = filter.noOfMonthsExperience[1];
    // }

    // this.query['user.noOfMonthExperiences'] = {$gte: filter.minYear * 12, $lte: filter.maxYear * 12}
  }

  if (filter.minYear){
    this.query['user.noOfMonthExperiences'] = {$gte: (filter.minYear * 12)}
  }

  if (filter.maxYear){
    this.query['user.noOfMonthExperiences'] = {
      ...this.query['user.noOfMonthExperiences'],
      $lte: (filter.maxYear * 12)
    };
  }

  if (filter.minRating != null && filter.maxRating != null) {
    if (filter.minRating === 0) {
      // Include entries where rating is null or between 0 and maxRating
      this.query.$or = [
        { rating: { $gte: 0, $lte: filter.maxRating } },
        { rating: null }
      ];
    } else {
      // Only include entries with rating between minRating and maxRating
      this.query.rating = {
        $gte: filter.minRating,
        $lte: filter.maxRating
      };
    }
  } else if (filter.minRating != null) {
    if (filter.minRating === 0) {
      // Include entries where rating is null or >= 0
      this.query.$or = [
        { rating: { $gte: 0 } },
        { rating: null }
      ];
    } else {
      this.query.rating = { $gte: filter.minRating };
    }
  } else if (filter.maxRating != null) {
    this.query.rating = {
      $lte: filter.maxRating
    };
  }

  if(filter.hasFollowed && subscribedApplicationIds && subscribedApplicationIds.length){
    this.query._id = { $in: subscribedApplicationIds };
  }
  
  return this.query;
}

module.exports = ApplicationSearchParam;
