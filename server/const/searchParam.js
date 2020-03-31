const _ = require('lodash');
const dateEnum = require('../const/dateEnum')


function SearchParam(filter) {
  this.query = {};


  // if(filter.partyId){
  //   console.log('partyId', filter.partyId)
  //   this.query.partyId =  { $eq: filter.partyId };
  // }

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

    this.query.createdDate =  { $gte: start.getTime(), $lte: end.getTime() };
  }


  if (filter.query && filter.query!="") {
    this.query.title =  { $regex: filter.query, $options: 'i' };
    // this.query.$text = { $search: filter.query, $caseSensitive: true };
  }

  if (filter.level && filter.level!="") {
    this.query.level =  { $in: filter.level.split(',') };
  }

  if (filter.jobFunction && filter.jobFunction!="") {
    let jobFunctions = _.reduce(filter.jobFunction.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);
    this.query.jobFunction =  { $in: jobFunctions };
  }

  if (filter.employmentType && filter.employmentType!="") {
    let employmentType = _.reduce(filter.employmentType.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);
    this.query.employmentType =  { $in: employmentType};
  }

  if (filter.industry && filter.industry!="") {
    let industry = _.reduce(filter.industry.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);
    this.query.industry =  { $in: industry };
  }

  if (filter.company && filter.company!="") {

    let company = _.reduce(filter.company.split(','), function(result, value, key) {
      result.push(parseInt(value));
      return result;
    }, []);

    this.query.company = { $in: company };
  }

  if (filter.city && filter.city!="") {
    let city = _.reduce(filter.city.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);

    this.query.city =  { $in: city};
  }

  if (filter.state && filter.state!="") {
    let state = _.reduce(filter.state.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);
    this.query.state =  { $in: state};
  }

  if (filter.country && filter.country!="") {
    let country = _.reduce(filter.country.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);

    this.query.country =  { $in: country};
  }

  if (filter.distance && filter.distance!="") {
    let distance = _.reduce(filter.distance.split(','), function(result, value, key) {
      result.push(value.trim());
      return result;
    }, []);

    this.query.distance =  { $in: distance};
  }

  console.log('query', this.query);
  return this.query;
}

module.exports = SearchParam;
