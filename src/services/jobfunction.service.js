const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const JobFunction = require('../models/jobfunction.model');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');


const jobFunctionSchema = Joi.object({
  _id: Joi.object().optional(),
  name: Joi.object().required(),
  description: Joi.string().allow('').optional(),
  longDescription: Joi.string().allow('').optional(),
  parent: Joi.number().optional(),
  sequence: Joi.number().optional(),
  shortCode: Joi.string(),
  icon: Joi.string().allow('').optional()
});


function findById(id) {
  if(!id){
    return;
  }

  return JobFunction.findById(id);
}

function findByShortCode(shortCode) {
  if(!shortCode){
    return;
  }

  return JobFunction.find({shortCode});
}



async function add(form) {

  if(!form){
    return;
  }
  jobFunctionSchema.validate(form, {abortEarly: false});
  const jobFunction = new JobFunction(form).save();

  return jobFunction;
}


async function update(id, form) {
  if(!id || !form){
    return;
  }

  form = await Joi.validate(form, jobFunctionSchema, {abortEarly: false});

  let jobFunction = await findById(id);

  if(jobFunction){
    jobFunction.lastUpdatedDate = Date.now();
    jobFunction.name = form.name;
    jobFunction.description = form.description;
    jobFunction.longDescription = form.longDescription;
    jobFunction.shortCode = form.shortCode;
    jobFunction.parent = form.parent;
    jobFunction.sequence = form.sequence;
    jobFunction.icon = form.icon;

    jobFunction = await jobFunction.save();
  }
  return jobFunction;

}




async function search(query, locale) {
  let data = [];
  let localeStr = locale? locale.toLowerCase() : 'en';
  let pipeline = [];
  if (query) {
    const matchStage = {
      $match: {
        [`name.${localeStr}`]: { $regex: query, $options: 'i' }
      },
    };
    pipeline.push(matchStage);
  }
  pipeline.push(
    {
      $lookup: {
        let:{shortCode: '$shortCode'},
        from: "jobrequisitions",
        pipeline: [
          { $match: {$expr: {$eq: ["$jobFunction", "$$shortCode"]}} },
          { $group: {_id: {shortCode: '$jobFunction'}, count: {$sum: 1} }},
        ],
        as: "count"
      }
    },
    { $project: {name: 1, shortCode: 1, id: 1, icon: 1, count: { $cond: [ { $eq: ["$count", []] }, 0, { $first: "$count.count" }] } } },
    { $sort : { [`name.${localeStr}`] : 1 } },
  );
  data = await JobFunction.aggregate(pipeline);

  data = _.reduce(data, function(res, i){
    i.name = i.name[localeStr]?i.name[localeStr]:i.name.en;
    i.icon = `${process.env.CDN}/images/jobfunctions/${i.id}/${i.icon}`;
    res.push(i);
    return res;

  }, []);
  return data;
}


async function getJobFunctionsAndJobCount(locale) {
  let data = [];
  data = await JobFunction.aggregate([
    {
      $lookup: {
        let:{shortCode: '$shortCode'},
        from: "jobrequisitions",
        pipeline: [
          { $match: {$expr: {$eq: ["$jobFunction", "$$shortCode"]}} },
          { $group: {_id: {shortCode: '$jobFunction'}, count: {$sum: 1} }},
        ],
        as: "count"
      }
    },
    { $project:
        {name: 1, shortCode: 1, id: 1, icon: 1, count: { $cond: [ { $eq: ["$count", []] }, 0, { $first: "$count.count" }] } } },
  ])

  data = _.reduce(data, function(res, i){
    i.name = i.name[locale]?i.name[locale]:i.name.en;
    i.icon = `${process.env.CDN}/images/jobfunctions/${i.id}/${i.icon}`;
    res.push(i);
    return res;

  }, []);
  return data;
}

async function getPopularJobFunctions(locale) {
  let data = [];
  data = await JobFunction.aggregate([
    {
      $lookup: {
        let:{shortCode: '$shortCode'},
        from: "jobrequisitions",
        pipeline: [
          { $match: {$expr: {$eq: ["$jobFunction", "$$shortCode"]}} },
          { $group: {_id: {shortCode: '$jobFunction'}, count: {$sum: 1} }},
        ],
        as: "count"
      }
    },
    { $project: {name: 1, shortCode: 1, id: 1, icon: 1, count: { $cond: [ { $eq: ["$count", []] }, 0, { $first: "$count.count" }] } } },
    { $sort : { count : -1 } },
    { $limit : 8 }
  ])

  data = _.reduce(data, function(res, i){
    i.name = i.name[locale]?i.name[locale]:i.name.en;
    i.icon = `${process.env.CDN}/images/jobfunctions/${i.id}/${i.icon}`;
    res.push(i);
    return res;

  }, []);
  return data;
}




module.exports = {
  add,
  findById,
  findByShortCode,
  search,
  getJobFunctionsAndJobCount,
  getPopularJobFunctions,
  update
}
