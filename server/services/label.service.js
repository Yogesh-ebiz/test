const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Label = require('../models/label.model');



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



async function getLabels(query, types) {
  let data = null;


  let match = {name: { $regex: query, $options: "si" }};

  if(types){
    match.type = {$in: types};
  }

  return Label.find(match);
}



function addLabel(label) {
  let data = null;

  if(label==null){
    return;
  }

  label = new Label(label).save();
  return label;

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


module.exports = {
  findById,
  findOneBy,
  getLabels,
  addLabel,
  getLabelByCompany
}
