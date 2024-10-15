const bcrypt = require('bcrypt');
const Joi = require('joi');
var mongoose = require('mongoose');
const JobFunction = require('../models/jobfunction.model');
const jobfunctionService = require('../services/jobfunction.service');
const filterService = require('../services/filter.service');
const catchAsync = require("../utils/catchAsync");



const search = catchAsync(async (req, res) => {
  const { query, locale } = req;

  let data = await jobfunctionService.search(query, locale);
  res.json(data);
});



async function getJobFunctionById(id, locale) {
  let data = await JobFunction.aggregate([
    { $lookup: { from: "jobfunctions", localField: "jobFunctionId", foreignField: "parent", as: "children" } },
    { $match: { _id: mongoose.Types.ObjectId(id) },  },
    { $project: {
        children: { $map: { input: '$children', as: "child", in: { _id: '$$child._id', parent: '$$child.parent', shortCode: '$$child.shortCode', icon: '$$child.icon', jobFunctionId: '$$child.jobFunctionId', sequence: '$$child.sequence', name: '$$child.name.' + locale} } },
        parent: 1, shortCode: 1, icon: 1, id: 1, sequence: 1, name: ('$name.' + locale) } }
    ]);
  //jobFunction.name = jobFunction.name['en'];
  return data?data[0]:null;

}


module.exports = {
  search,
  getJobFunctionById
}
