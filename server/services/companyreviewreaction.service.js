const _ = require('lodash');
const CompanyReviewReaction = require('../models/companyreviewreaction.model');


function findCompanyReviewReactionByPartyId(partyId) {
  let data = null;


  if(partyId==null){
    return;
  }

  return CompanyReviewReaction.find({partyId: partyId});
}




function addCompanyReviewReaction(reaction) {

  if(!reaction){
    return null;
  }
  return new CompanyReviewReaction(reaction).save();
}


module.exports = {
  findCompanyReviewReactionByPartyId: findCompanyReviewReactionByPartyId,
  addCompanyReviewReaction:addCompanyReviewReaction
}
