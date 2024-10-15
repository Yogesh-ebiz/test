const Joi = require('joi');
const {ObjectId} = require('mongodb');
const _ = require('lodash');

const statusEnum = require('../const/statusEnum');
const catchAsync = require("../utils/catchAsync");
const campaignService = require("../services/campaign.service");
const Pagination = require("../utils/pagination");

const addCampaign = catchAsync(async (req, res) => {
  const {user, params, body} = req;

  let campaign = await campaignService.add(body);

  res.json(campaign);

});
const getCampaignById = catchAsync(async (req, res) => {
  const {user, params} = req;
  const {campaignId} = params;

  const campaign = await campaignService.findById(new ObjectId(campaignId));
  console.log(campaign)
  // const result = _.find(campaign, function(o){
  //   console.log(o)
  //   return o._id.equals(new ObjectId(campaignId))});
  res.json(campaign);
});
const updateCampaignById = catchAsync(async (req, res) => {
  const {user, params, body} = req;
  const {campaignId} = params;

  let result;
  let campaign = await campaignService.findById(new ObjectId(candidateId));

  if(campaign) {
    campaign.name = body.name;
    campaign.content = body.content;
    campaign.settings = body.settings;
    result = await campaign.save();
  }

  res.json(result);

});
const removeCampaignById = catchAsync(async (req, res) => {
  const {user, params} = req;
  const { campaignId} = params;

  let result;
  await campaignService.remove(new ObjectId(campaignId));

  res.json({success: true});

});

const searchCampaigns = catchAsync(async (req, res) => {
  const {user, params, query} = req;
  let result = await campaignService.search({type: query.type}, query);
  res.json(new Pagination(result));
});

module.exports = {
  addCampaign,
  getCampaignById,
  updateCampaignById,
  removeCampaignById,
  searchCampaigns
}
