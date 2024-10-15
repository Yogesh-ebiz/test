const _ = require('lodash');
const dateEnum = require('../const/dateEnum')
const ObjectID = require('mongodb').ObjectID;
const experiencePrimaryType = require('../const/experiencePrimaryType');


function SearchPeopleParam(filter) {
  const {must, must_not, options } = filter;
  const list = [];
  const query = {};

  const experience = {};
  const education = {};
  const mustReduced = _.reduce(must, function(res, val, key){
    if(key.startsWith("experience") && (val && val.length>0 || (val===false || val===true))){
      experience[key] = val;
    } else if(key.startsWith("education")){
      education[key] = val;
    } else {
      res[key] = val;
    }
    return res;
  }, {});


  let experienceMatch = { experience: { $elemMatch: {} }};
  for (const key in experience) {
    switch(key){
      case 'experience.title.name':
        experienceMatch.experience.$elemMatch['title.name'] = { $in: experience[key] };
        break;
      case 'experience.is_primary':
        experienceMatch.experience.$elemMatch['is_primary'] = experience[key];
        break;
    }
  }

  if(experienceMatch.experience.$elemMatch){
    list.push(experienceMatch);
  }

  for (const key in mustReduced) {
    // console.log(key, must[key])
    if(mustReduced[key]){
      let obj = {};

      if (typeof mustReduced[key]==='string') {
        obj[key] = must[key];
        list.push(obj);
      } else if (Array.isArray(mustReduced[key]) && mustReduced[key].length>0) {
        obj[key] = {$all: mustReduced[key]};
        list.push(obj);
      }


    }

  }


  for (const key in must_not) {
    // console.log(typeof must_not[key], must_not[key])
    if(must_not[key]){
      let obj = {};
      if (typeof must_not[key]==='string') {
        obj[key] = {$ne: must_not[key] };
        list.push(obj);
      } else if (Array.isArray(must_not[key]) && must_not[key].length>0) {
        obj[key] = {$nin: must_not[key]};
        list.push(obj);
      }

    }

  }



  if(list.length>0){
    query.$and = list;
  }

  // console.log(query.$and[1])
  return query;
}

module.exports = SearchPeopleParam;
