const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Label = require('../models/label.model');


function getLabels(company, type) {
  let data = null;

  if(company==null){
    return;
  }

  return Label.find({company: company, type: type});
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
