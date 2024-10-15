const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Label = require('../models/label.model');
const JobPreference = require("../models/jobpreferences.model");



function add(label) {
  let data = null;

  if(!label){
    return;
  }

  label = new Label(label).save();
  return label;

}

function findById(labelId) {

  if(!labelId){
    return;
  }

  return Label.findById(labelId);

}


async function findOneBy(params) {
  let data = null;
  return await Label.findOne(params);
}

function findByIds(ids) {

  if(!ids){
    return [];
  }
  return Label.find({ _id: { $in: ids } });
}
async function updateAndAdd(form, user) {
  let data = null;

  if(!form){
    return;
  }

  
  let label = await Label.findOne({...form});
  console.log(label)
  if(label){
    throw new Error('Label already exists');
  }
  
  label = await Label.create({...form, createdBy: user})
  return label;
}

async function search(query, types, company) {
  let data = null;


  let match = {name: { $regex: query, $options: "si" }};

  if(types){
    match.type = {$in: types};
  }

  if(company){
    match.company = company;
  }

  return Label.find(match);
}

async function getLabels(query, types) {
  let data = null;


  let match = {name: { $regex: query, $options: "si" }};

  if(types){
    match.type = {$in: types};
  }

  return Label.find(match);
}




async function getLabelByCompany(company, query, types) {
  let data = null;


  let match = {name: { $regex: query, $options: "si" }, $or: [{company: company}, {default: true}]};

  if(types){
    match.type = {$in: types};
  }

  console.log(match)
  return Label.find(match);
}
async function remove(id) {
  let data = null;

  if(!id){
    return;
  }

  return Label.findByIdAndDelete(id);
}

module.exports = {
  add,
  findById,
  findOneBy,
  findByIds,
  updateAndAdd,
  search,
  getLabels,
  getLabelByCompany,
  remove
}
