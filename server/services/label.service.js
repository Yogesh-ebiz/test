const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Label = require('../models/label.model');


async function getLabels(company, query, type) {
  let data = null;

  if(company==null){
    return;
  }

  console.log(company, query, type)
  return Label.find({company: company, name: { $regex: query, $options: "si" },type: type});
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
  getLabels:getLabels,
  addLabel:addLabel
}
