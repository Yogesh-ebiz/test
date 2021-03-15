const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
let SearchParam = require('../const/searchParam');
const Template = require('../models/template.model');



async function getTemplateById(templateId) {
  let data = null;

  if(templateId==null){
    return;
  }

  data = await Template.findOne({templateId: templateId});
  return data;
}

async function deleteTemplateById(templateId) {
  let data = null;

  if(templateId==null){
    return;
  }

  return await Template.remove({templateId: templateId});
}


module.exports = {
  getTemplateById: getTemplateById,
  deleteTemplateById: deleteTemplateById
}
