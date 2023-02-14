const _ = require('lodash');
const dateEnum = require('../const/dateEnum')
const ObjectID = require('mongodb').ObjectID;


function TaskSearchParam(filter) {
  this.query = {};


  if(filter.status && filter.status.length){
    this.query.status =  { $in: filter.status };
  }

  if (filter.members && filter.members.length) {
    this.query.$or =  [{members: { $in: filter.members} }, {owner: { $in: filter.members}}];
  }

  if(filter.application){
    this.query['meta.applicationId'] =  { $exists: true };
  }


  if(filter.tags && filter.tags.length>0){
    this.query.tags =  { $in: filter.tags };
  }

  if(filter.startDate){
    let start, end;



    start = new Date(filter.startDate);
    start.setHours(0,0,0,0);
    console.log(filter.startDate, start)

    end = new Date(filter.endDate );
    end.setHours(23,59,59,0);
    console.log(filter.endDate, end)
    this.query.$and =  [{startDate: { $gte: start.getTime() }}, {startDate: { $lte: end.getTime()} }];
  }


  if (filter.title && filter.title!="") {
    this.query.title = { $regex: filter.title, $options: 'i' };
  }

  if (filter.company && filter.company!="") {
    this.query.company = { $in: filter.company };
  }



  if (filter.createdBy && filter.createdBy.length) {
    this.query.createdBy =  { $in: filter.createdBy};
  }

  console.log(this.query)
  console.log(this.query.$and)
  return this.query;
}

module.exports = TaskSearchParam;
