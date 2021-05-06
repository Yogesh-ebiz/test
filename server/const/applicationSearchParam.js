const _ = require('lodash');


function ApplicationSearchParam(filter) {
  this.query = {};


  if(filter.user){

    this.query.user =  { $eq: filter.user };
  }

  if(filter.id){
    let ids = _.reduce(filter.id.split(','), function(res, i){
      res.push(parseInt(i));
      return res;
    }, []);
    this.query.applicationId =  { $in: ids };
  }

  if(filter.jobId){
    this.query.jobId =  filter.jobId;
  }

  if (filter.query && filter.query!="") {
    this.query.title =  { $regex: filter.query, $options: 'i' };
  }


  return this.query;
}

module.exports = ApplicationSearchParam;
