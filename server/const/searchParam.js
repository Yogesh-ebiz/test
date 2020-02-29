const _ = require('lodash');


function SearchParam(filter) {
  this.query = {};


  if(filter.id){
    let ids = _.reduce(filter.id.split(','), function(res, i){
      res.push(parseInt(i));
      return res;
    }, []);
    this.query.jobId =  { $in: ids };
  }

  if (filter.query && filter.query!="") {
    this.query.title =  { $regex: filter.query, $options: 'i' };
  }

  if (filter.level && filter.level!="") {
    this.query.level =  { $in: filter.level.split(',') };
  }

  if (filter.jobFunction && filter.jobFunction!="") {
    this.query.jobFunction =  { $in: filter.jobFunction.split(',') };
  }

  if (filter.employmentType && filter.employmentType!="") {
    this.query.employmentType =  { $in: filter.employmentType.split(',') };
  }

  if (filter.company && filter.company!="") {

    let company = _.reduce(filter.company.split(','), function(result, value, key) {
      result.push(parseInt(value));
      return result;
    }, []);

    this.query['company.id'] = { $in: company } ;
  }

  if (filter.company && filter.company!="") {

    let company = _.reduce(filter.company.split(','), function(result, value, key) {
      result.push(parseInt(value));
      return result;
    }, []);

    this.query['company.id'] = { $in: company } ;
  }

  if (filter.city && filter.city!="") {
    this.query.city =  { $regex: filter.city, $options: 'i' };
  }

  if (filter.state && filter.state!="") {
    this.query.state =  { $regex: filter.state, $options: 'i' };
  }

  if (filter.country && filter.country!="") {
    this.query.country =  { $regex: filter.country, $options: 'i' };
  }

  return this.query;
}

module.exports = SearchParam;
