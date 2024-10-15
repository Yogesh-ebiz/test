const express = require('express');
const passport = require('passport');
const validate = require("../middlewares/validate");
const templateValidation = require("../validations/template.validation");
const templateCtl = require('../controllers/template.controller');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.get('/resume', validate(templateValidation.getResumeTemplates), templateCtl.getResumeTemplates);


