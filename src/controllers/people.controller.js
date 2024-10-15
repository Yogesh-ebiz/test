const bcrypt = require('bcrypt');
const Joi = require('joi');
const ObjectID = require('mongodb').ObjectID;
const _ = require('lodash');
let { myEmitter } = require('../config/eventemitter');
const sovrenService = require('../services/api/sovren.service.api');
const { Base64Encode } = require('base64-stream');
const React = require('react');
const path = require('path');


let Pagination = require('../utils/pagination');
let PeoplePagination = require('../utils/PeoplePagination');

let JobSearchParam = require('../const/jobSearchParam');
let SearchParam = require('../const/searchParam');
let peopleData = require('../../data/people.json');

let statusEnum = require('../const/statusEnum');
let experiencePrimaryType = require('../const/experiencePrimaryType');
let People = require('../models/people.model');
const {buildUserUrl, convertToCandidate} = require('../utils/helper');
const feedService = require('../services/api/feed.service.api');
const peopleService = require('../services/people.service');
const companyService = require('../services/company.service');
const candidateService = require('../services/candidate.service');
const flagService = require('../services/flag.service');
const poolService = require('../services/pool.service');
const sourceService = require('../services/source.service');
const elasticsearch = require('../services/elasticsearch/elasticsearch');
const querybuilder = require('../services/elasticsearch/querybuilder');
const catchAsync = require("../utils/catchAsync");
const { unflatten, replaceCharacter, generateUUID } = require("../utils/helper");
const fs = require('fs');
const peopleMapping = require('../../migrations/elasticsearch/people.mapping.json');
const pdl = require('../services/peopledatalabs/pdl');


const searchPeople = catchAsync(async (req, res) => {
  const {user, params, query, body} = req;
  const {options, must, must_not} = body;
  const {page, size, sort, direction, scroll_token} = query;

  // console.log(body)
  let result = null;
  const form = replaceCharacter('__', body);
  // const existing = await peopleService.searchForExisting(form);
  // const result = _.reduce(existing, function(res, p){
  //   const people = new People(p);
  //   res.push(people.transform());
  //   return res;
  //   }, []);

  try {
    // const data = await fs.readFileSync(path.join(__dirname, '../demo.txt'), 'utf8');
    // await createIndex('people');
    // await addDocument(
    //   'people',
    //   123,
    //   null,
    //   {
    //     firstname: 'Ned',
    //     lastname: 'Johnson'
    //   }
    // );

    // await elasticsearch.createIndex('people');
    // await elasticsearch.initMapping('people', null, peopleMapping);


    // await elasticsearch.updateDocument(
    //   'people',
    //   'YjxWc4gBR7LCQRX0BiGy',
    //   null,
    //   {
    //       firstname: 'Laura',
    //       lastname: 'Kane'
    //     }
    //   );

    // await elasticsearch.updateDocumentByQuery(
    //   'people',
    //   'YjxWc4gBR7LCQRX0BiGy',
    //   null,
    //   false,
    //   {
    //       match: {
    //         firstname: 'Viet'
    //       }
    //    },
    //   {
    //     lang:"painless",
    //     source:`ctx._source.data='This is updated test data';ctx._source.updatedAt=params.date;ctx._source.segmentId=params.segmentId`,
    //     params:{
    //       date: Date.now(),
    //       segmentId: null
    //     }
    //   },
    //   { firstname: 'Ben', lastname: 'Doan' }
    // );

    // await elasticsearch.deleteByQuery(
    //   'people',
    //   null,
    //   {
    //       match: {
    //         firstname: 'Ned'
    //       }
    //     }
    //   );

    // result = querybuilder.build(form).toJSON();
    const sorts = [];
    const sortBy = {};
    sortBy[sort + '.keyword'] = direction;
    if(sortBy){
      sorts.push(sortBy);
    }

    let query = querybuilder.build(form).toJSON();

    console.log(query)

    if(page===0){
      const count = await elasticsearch.getCount(
        'people',
        query
      );

      if(count>200){
        result = await elasticsearch.searchDocuments(
          'people',
          query,
          page,
          size,
          sorts
        );
      } else {
        /*  Compile list of existing users to not include int PDL.
            To keep cost from existing users.
         */

        const existings = await elasticsearch.searchDocuments(
          'people',
          query,
          0,
          10000,
          null,
          false,
          ['recommended_personal_email']
        );
        const excludeList = _.reduce(existings.data, function(res, item){
          if(item['recommended_personal_email']){
            res.push(item['recommended_personal_email']);
          }
          return res;
        }, []);
        form.must_not = _.merge({}, form.must_not, {recommended_personal_email: excludeList});
        query = querybuilder.build(form, true).toJSON();

      }

    } else if(page && page>0){
      result = await elasticsearch.searchDocuments(
        'people',
        query,
        page*size,
        size,
        sorts
      );
    }

    if(scroll_token || !result){
      // result = await elasticsearch.scroll(scroll_token);
      // result = await elasticsearch.searchDocuments(
      //   'people',
      //   query,
      //   page+1,
      //   size,
      //   sorts
      // );
      // peopleData.slice(0, 3).forEach((p) => myEmitter.emit('add-people', p));
      console.log(query, scroll_token)
      // result = await pdl.search(query, size, scroll_token);
      console.log(result, result)
      if(result && result.data){

        // Temporary for demo
        // result.data.forEach((p) => myEmitter.emit('add-people', p));
      }


    }


  } catch (err) {
    console.error(err);
  }


  // myEmitter.emit('add-people', peopleData);

  // let people = new People(existing[0]);
  // people = people.transformWithContacts();
  //
  // let resume = null;
  // const stream = await resumeToStream(people);
  // if(stream){
  //
  //   try {
  //     const chunks = [];
  //     const modifiedDate = (new Date()).toISOString().substring(0, 10);
  //     const base64 = new Base64Encode();
  //     // stream.pipe(base64);
  //     stream.on('data', function (chunk) {
  //       chunks.push(chunk);
  //     });
  //     stream.on('end', async () => {
  //       console.log('Done streaming, response sent.')
  //       let result = Buffer.concat(chunks);
  //       console.log('final result:', result.length);
  //       // console.log(result.toString('base64'));
  //       resume = await sovrenService.uploadResumeBase64(result.toString('base64'), modifiedDate, 'resume', people._id);
  //       // console.log(resume);
  //       res.json(resume)
  //     });
  //     // console.log(stream.read().toString('base64'))
  //   } catch (err) {
  //     console.error(err)
  //   }
  // }

  // const result = await peopleService.bulkAdd(peopleData);
  res.json(new PeoplePagination(result));
});



const getPeopleContact = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {id, type} = params;

  let result = await peopleService.getPeopleContact(id, type);

  res.json(result);
})

async function getPeopleSuggestions(filter, sort, locale) {

  if(!filter || !sort){
    return null;
  }

  result = await feedService.searchPeople(filter, sort);

  return result;
}

const getPeopleById = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {id} = params;

  let result = await peopleService.findById(id);
  res.json(result.transform());
});



async function assignPeopleJobs(companyId, currentUserId, userId, jobIds) {
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
    console.log('assignPeopleJobs: Error', e);
  }


  return {success: true}
}


module.exports = {
  searchPeople,
  getPeopleContact,
  getPeopleSuggestions,
  getPeopleById,
  assignPeopleJobs
}
