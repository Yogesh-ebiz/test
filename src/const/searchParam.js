const _ = require('lodash');
const dateEnum = require('../const/dateEnum')
const { ObjectId } = require('mongodb');


function SearchParam(filter) {
  this.query = {};

  let titleConditions = [];

  if (filter.query && filter.query!="") {
    //this.query.$text = { $search: filter.query, $diacriticSensitive: true, $caseSensitive: false };
    //this.query.title = { $regex: filter.query, $options: 'i'};
    titleConditions.push({ title: { $regex: filter.query, $options: 'i' } });
  }

  if (filter.jobTitles && filter.jobTitles.length) {
    const jobTitles = filter.jobTitles.map(title => new RegExp(title, 'i'));
   // this.query.title = { $in: jobTitles };
    titleConditions.push({ title: { $in: jobTitles } });
  }
  if (titleConditions.length) {
    this.query.$or = titleConditions;
  }

  if(filter.status && filter.status.length){
    this.query.status =  { $in: filter.status };
  }

  if(filter.partyId){
    this.query.partyId =  { $eq: filter.partyId };
  }

  if(filter._id){
    let ids = _.reduce(filter.id.split(','), function(res, i){
      res.push(new ObjectId(i));
      return res;
    }, []);
    this.query._id =  { $in: ids };
  }

  if(filter.id){
    let ids = _.reduce(filter.id.split(','), function(res, i){
      res.push(parseInt(i));
      return res;
    }, []);
    this.query.jobId =  { $in: ids };
  }

  if(filter.similarId){
    this.query.jobId =  { $nin: [filter.similarId] };
  }


  if(filter.tags && filter.tags.length>0){
    this.query.tags =  { $in: filter.tags.map(id => new ObjectId(id)) };
  }

  if(filter.createdDate){
    let start, end;


    start = new Date();
    start.setHours(0,0,0,0);

    end = new Date();

    switch (filter.createdDate) {
      case dateEnum.PASTDAY:
        start.setDate(start.getDate() - 1);
        break;
      case dateEnum.PASTWEEK:
        start.setDate(start.getDate() - 7);
        break;
      case dateEnum.PASTBIWEEK:
        start.setDate(start.getDate() - 14);
        break;
      case dateEnum.PASTMONTH:
        start.setDate(start.getDate() - 30);
        break;
    }

    this.query.publishedDate =  { $gte: start.getTime()};
  }

  if(filter.publishedDate && filter.publishedDate!='ANY'){
    let start, end;


    start = new Date();
    start.setHours(0,0,0,0);

    end = new Date();

    switch (filter.publishedDate) {
      case dateEnum.PASTDAY:
        start.setDate(start.getDate() - 1);
        console.log(dateEnum.PASTDAY, start)
        break;
      case dateEnum.PASTWEEK:
        start.setDate(start.getDate() - 7);
        console.log(dateEnum.PASTWEEK, start)
        break;
      case dateEnum.PASTBIWEEK:
        start.setDate(start.getDate() - 14);
        break;
      case dateEnum.PASTMONTH:
        start.setDate(start.getDate() - 30);
        break;
    }

    this.query.publishedDate =  { $gte: start.getTime()};
  }

  if (filter.level && filter.level.length) {
    this.query.level = { $in: filter.level };
  }

  if (filter.jobFunction && filter.jobFunction.length) {
    this.query.jobFunction =  { $in: filter.jobFunction.map(id => new ObjectId(id)) };
  }

  if (filter.employmentType && filter.employmentType.length) {
    this.query.employmentType =  { $in: filter.employmentType.map(type => new RegExp(`^${type}$`, 'i'))};
  }

  if (filter.industry && filter.industry.length) {
    this.query.industry =  { $in: filter.industry };
  }

  if (filter.company && filter.company!="") {

    this.query.company = { $in: filter.company };
  }

  if (filter.companyId && filter.companyId.length) {

    this.query.companyId = { $in: filter.companyId };
  }

  if (filter.district && filter.district.length) {
    this.query.district =  { $in: filter.district};
  }

  if (filter.types && filter.types.length) {
    this.query.type =  { $in: filter.types};
  }

  if (filter.city && filter.city.length) {
    const city = _.reduce(filter.city, function(res, item){
      res.push(new RegExp(item, 'i'));
      return res;
    }, []);
    this.query.city =  { $in: city};
  }

  if (filter.state && filter.state.length) {
    const state = _.reduce(filter.state, function(res, item){
      res.push(new RegExp(item, 'i'));
      return res;
    }, []);
    this.query.state =  { $in: state};
  }

  if (filter.country && filter.country.length) {
    const country = _.reduce(filter.country, function(res, item){
      res.push(new RegExp(item, 'i'));
      return res;
    }, []);
    this.query.country =  { $in: country};
  }

  if (filter.department && filter.department.length) {
    filter.department = _.reduce(filter.department, function(res, item){
      res.push(new ObjectId(item));
      return res;
    }, []);
    this.query.department =  { $in: filter.department};
  }

  if (filter.distance && filter.distance!="") {
    this.query.distance =  { $in: filter.distance};
  }

  if (filter.members && filter.members.length) {
    this.query.members =  { $in: filter.members.map(id => new ObjectId(id))};
  }

  if (filter.createdBy && filter.createdBy.length) {
    this.query.createdBy =  { $in: filter.createdBy.map(id => new ObjectId(id))};
  }

  if (filter.skills && filter.skills.length) {
    this.query.skills =  { $in: filter.skills.map(id => new ObjectId(id))};
  }


  if (filter.minYear && filter.maxYear) {
    this.query.$and =  [{noOfMonthExperiences:  {$gte: (filter.minYear * 12)} }, {noOfMonthExperiences: { $lte: (filter.maxYear * 12)}}];
  }

  if(filter.endDate){
    this.query.endDate = { $gt: filter.endDate }
  }

  if (filter.jobsEndingSoon) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5); // 5 days from today

    this.query.endDate = { $gte: today.getTime(), $lte: fiveDaysFromNow.getTime() };
  }

  console.log(this.query.$or)
  return this.query;
}

module.exports = SearchParam;
