const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const policyCtl = require('../controllers/policy.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.route('/').post(asyncHandler(addPolicy));
router.route('/').get(asyncHandler(getAllPolicies));
router.route('/:id').put(asyncHandler(updatePolicy));
router.route('/:id').delete(asyncHandler(removePolicy));
router.route('/category/:category').get(asyncHandler(getPoliciesByCategory));



async function addPolicy(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let policy = req.body;
  policy.createdBy = currentUserId;

  let data = await policyCtl.addPolicy(currentUserId, policy);
  res.json(new Response(data, data?'policy_added_successful':'not_found', res));
}

async function getAllPolicies(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await policyCtl.getAllPolicies(res.locale);
  res.json(new Response(data, data?'policies_retrieved_successful':'not_found', res));
}


async function updatePolicy(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let id = req.params.id;
  let policy = req.body;
  policy.createdBy = currentUserId;

  let data = await policyCtl.updatePolicy(id, currentUserId, policy);
  res.json(new Response(data, data?'policy_updated_successful':'not_found', res));
}


async function removePolicy(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let id = req.params.id;

  let data = await policyCtl.deletePolicy(id, currentUserId);
  res.json(new Response(data, data?'policy_deleted_successful':'not_found', res));
}






async function getPoliciesByCategory(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);
  let category = req.params.category;

  let data = await policyCtl.getPoliciesByCategory(category, res.locale);
  res.json(new Response(data, data?'policies_retrieved_successful':'not_found', res));
}




