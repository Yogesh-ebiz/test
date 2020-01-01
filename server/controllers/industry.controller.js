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


async function getIndustry(industryId) {


  industryId=(typeof industryId !== 'undefined') ? industryId : null;

  console.log('id', typeof industryId);
  return await Industry.find({parent: parseInt(industryId)});
}
