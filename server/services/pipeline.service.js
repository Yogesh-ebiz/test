const _ = require('lodash');
const statusEnum = require('../const/statusEnum');
const Pipeline = require('../models/pipeline.model');


function getPipelines(company) {
  let data = null;

  if(company==null){
    return;
  }

  return Pipeline.find({$or: [{company: company}, {default: true}]}).sort({default: -1});
}


function addPipeline(pipeline) {
  let data = null;

  if(pipeline==null){
    return;
  }

  pipeline = new Pipeline(pipeline).save();
  return pipeline;

}



module.exports = {
  getPipelines:getPipelines,
  addPipeline:addPipeline
}
