const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const planCtl = require('../controllers/plan.controller');
let Response = require('../const/response');


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.route('/').get(asyncHandler(getPlans));
router.route('/').post(asyncHandler(addPlan));
router.route('/:id').get(asyncHandler(getPlanById));
router.route('/:id').put(asyncHandler(updatePlan));
router.route('/:id').delete(asyncHandler(deletePlan));



async function getPlans(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let data = await planCtl.getPlans(currentUserId, res.locale);

  res.json(new Response(data, data?'plans_retrieved_successful':'not_found', res));
}


async function addPlan(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let data = await planCtl.addPlan(currentUserId, req.body);
  res.json(new Response(data, data?'plan_created_successful':'not_found', res));
}


async function getPlanById(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await planCtl.getPlanById(currentUserId, id, res.locale);

  res.json(new Response(data, data?'plan_retrieved_successful':'not_found', res));
}



async function deletePlan(req, res) {

  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await planCtl.deletePlan(currentUserId, id);


  res.json(new Response(data, data?'plan_removed_successful':'not_found', res));
}


async function updatePlan(req, res) {
  let currentUserId = parseInt(req.header('UserId'));
  let id = req.params.id;
  let data = await planCtl.updatePlan(currentUserId, id, req.body);
  res.json(new Response(data, data?'plan_updated_successful':'not_found', res));
}
