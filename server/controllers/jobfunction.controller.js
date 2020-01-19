const bcrypt = require('bcrypt');
const Joi = require('joi');
var mongoose = require('mongoose');
const JobFunction = require('../models/jobfunctions.model');

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


async function getAllJobFunctions(locale) {
  let jobFunction = await JobFunction.aggregate([
    { $project: {parent: 1, children: 1, shortCode: 1, icon: 1, sequence: 1, name: ('$name.' + 'en') } }
  ]);
  return jobFunction;
}



async function getJobFunctionById(id, locale) {
  let jobFunction = await JobFunction.aggregate([
    { $lookup: { from: "jobfunctions", localField: "jobFunctionId", foreignField: "parent", as: "children" } },
    { $match: { _id: mongoose.Types.ObjectId(id) },  },
    { $project: {
        children: { $map: { input: '$children', as: "child", in: { _id: '$$child._id', parent: '$$child.parent', shortCode: '$$child.shortCode', icon: '$$child.icon', sequence: '$$child.sequence', name: '$$child.name.en'} } },
        parent: 1, shortCode: 1, icon: 1, sequence: 1, name: ('$name.' + 'en') } }
    ]);
  //jobFunction.name = jobFunction.name['en'];
  return jobFunction;

}
