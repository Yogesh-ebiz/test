const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Label = require('../models/label.model');



function findById(labelId) {
  let data = null;

  if(labelId==null){
    return;
  }

  data = Label.findById(labelId);
  return data;

}


async function getLabels(query, type) {
  let data = null;


  let match = {name: { $regex: query, $options: "si" }};

  if(type){
    match.type = type;
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
