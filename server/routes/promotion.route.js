const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const promotionCtl = require('../controllers/promotion.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))

router.route('/').post(asyncHandler(insert));
router.route('/search').get(asyncHandler(searchPromotions));
router.route('/:id').get(asyncHandler(getPromotionById));
router.route('/:id').delete(asyncHandler(removePromotion));




async function addPromotion(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let jobId = parseInt(req.params.id);
  let data = await promotionCtl.addPromotion(currentUserId, jobId, req.body);

  res.json(new Response(data, data?'promotion_added_successful':'not_found', res));
}


async function removePromotion(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let promotionId = parseInt(req.params.id);
  let data = await promotionCtl.removePromotion(currentUserId, promotionId);


  res.json(new Response(data, data?'promotion_removed_successful':'not_found', res));
}

async function getPromotionById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let promotionId = parseInt(req.params.id);
  let data = await promotionCtl.getPromotionById(currentUserId, promotionId, res.locale);

  res.json(new Response(data, data?'promotion_retrieved_successful':'not_found', res));
}


async function searchPromotions(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let filter = req.query;
  let data = await promotionCtl.searchPromotions(currentUserId, null, filter, res.locale);
  res.json(new Response(data, data?'promotions_retrieved_successful':'not_found', res));
}
