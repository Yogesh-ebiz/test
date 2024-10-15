const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const campaignCtl = require('../controllers/campaign.controller');
let Response = require('../const/response');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const campaignValidation = require("../validations/campaign.validation");


const router = express.Router();
module.exports = router;
router.route('/search').get(authorize('view_campaign'), validate(campaignValidation.searchCampaigns), campaignCtl.searchCampaigns);
router.route('').post(authorize('update_campaign'), validate(campaignValidation.addCampaign), campaignCtl.addCampaign);
router.route('/:id').get(authorize('view_campaign'), validate(campaignValidation.getCampaignById), campaignCtl.getCampaignById);
router.route('/:id').put(authorize('update_campaign'), validate(campaignValidation.updateCampaignById), campaignCtl.updateCampaignById);
router.route('/:id').delete(authorize('update_campaign'), validate(campaignValidation.removeCampaignById), campaignCtl.removeCampaignById);
