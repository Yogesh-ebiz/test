const bcrypt = require('bcrypt');
const Joi = require('joi');
const Industry = require('../models/industry.model');

const industrySchema = Joi.object({
  name: Joi.string().required()
})


module.exports = {
  insert,
  getIndustry
}

async function insert(industry) {
  return await new Industry(industry).save();
}


async function getIndustry(industryId, locale) {



  industryId=(typeof industryId !== 'undefined') ? industryId : null;
  //return await Industry.find({parent: parseInt(industryId)});
  return await Industry.aggregate([ { $lookup: { from: "industries", localField: "_id", foreignField: "parent", as: "children" } }, { $match: { _id: parseInt(industryId) } } ])
}
