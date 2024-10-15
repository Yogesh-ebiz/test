const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const roleCtl = require('../controllers/role.controller');
let Response = require('../const/response');
const validate = require("../middlewares/validate");
const roleValidation = require("../validations/role.validation");

const router = express.Router();
module.exports = router;

router.route('/').post(asyncHandler(addRole));
router.route('/').get(asyncHandler(getAllRoles));
router.route('/:id').put(asyncHandler(updateRole));
router.route('/:id').delete(asyncHandler(removeRole));
router.get('/privileges', validate(roleValidation.getAllPrivileges), roleCtl.getAllPrivileges);




async function addRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let policy = req.body;
  policy.createdBy = currentUserId;

  let data = await roleCtl.addPolicy(currentUserId, policy);
  res.json(new Response(data, data?'role_added_successful':'not_found', res));
}

async function getAllRoles(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await roleCtl.getAllRoles(currentUserId, company, res.locale);
  res.json(new Response(data, data?'roles_retrieved_successful':'not_found', res));
}


async function updateRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let id = req.params.id;
  let role = req.body;
  role.createdBy = currentUserId;

  let data = await roleCtl.updateRole(id, currentUserId, role);
  res.json(new Response(data, data?'role_updated_successful':'not_found', res));
}


async function removeRole(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let id = req.params.id;

  let data = await roleCtl.deleteRole(id, currentUserId);
  res.json(new Response(data, data?'role_deleted_successful':'not_found', res));
}




async function getAllPrivileges(req, res) {
  let currentUserId = req.header('UserId') ? parseInt(req.header('UserId')) : null;
  let company = parseInt(req.params.id);

  let data = await roleCtl.getAllPrivileges(currentUserId, company, res.locale);
  res.json(new Response(data, data?'privileges_retrieved_successful':'not_found', res));
}
