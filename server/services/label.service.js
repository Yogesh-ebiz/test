const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Label = require('../models/label.model');



function findById(labelId) {

if(!labelId){
    return;
  }

  return Label.findById(labelId);

}


async function getLabels(query, types) {
  let data = null;


  let match = {name: { $regex: query, $options: "si" }};

  console.log(types)
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



module.exports = {
  findById:findById,
  getLabels:getLabels,
  addLabel:addLabel
}
