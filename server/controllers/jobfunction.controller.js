const bcrypt = require('bcrypt');
const Joi = require('joi');
var mongoose = require('mongoose');
const JobFunction = require('../models/jobfunctions.model');
const filterService = require('../services/filter.service');


const jobFunctionSchema = Joi.object({
  name: Joi.string().required()
})


module.exports = {
  insert,
  getAllJobFunctions,
  getJobFunctionById
}

async function insert(jobfunction) {
  return await new Industry(jobfunction).save();
}


async function getAllJobFunctions(query, locale) {
  let localeStr = locale? locale : 'en';
  let data = await filterService.getAllJobFunctions(query, locale);
  return data;
}



async function getJobFunctionById(id, locale) {
  let localeStr = locale? locale : 'en';
  let data = await JobFunction.aggregate([
    { $lookup: { from: "jobfunctions", localField: "jobFunctionId", foreignField: "parent", as: "children" } },
    { $match: { _id: mongoose.Types.ObjectId(id) },  },
    { $project: {
        children: { $map: { input: '$children', as: "child", in: { _id: '$$child._id', parent: '$$child.parent', shortCode: '$$child.shortCode', icon: '$$child.icon', jobFunctionId: '$$child.jobFunctionId', sequence: '$$child.sequence', name: '$$child.name.' + localeStr} } },
        parent: 1, shortCode: 1, icon: 1, jobFunctionId: 1, sequence: 1, name: ('$name.' + localeStr) } }
    ]);
  //jobFunction.name = jobFunction.name['en'];
  return data?data[0]:null;

}
