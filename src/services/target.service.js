const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const statusEnum = require('../const/statusEnum');
const Target = require('../models/target.model');


const targetSchema = Joi.object({
  ageMin: Joi.number(),
  ageMax: Joi.number(),
  genders: Joi.array(),
  geoLocations: Joi.object(),
  adPositions: Joi.array()
});

async function add(target) {

  if(!target){
    return;
  }

  await targetSchema.validate(target, {abortEarly: false});
  target = await new Target(target).save();

  return target;
}


module.exports = {
  add:add

}
