const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const captureCtl = require('../controllers/capture.controller');
const captureValidation = require('../validations/capture.validation');
let Response = require('../const/response');

const router = express.Router();
module.exports = router;

router.post('/', validate(captureValidation.capture), captureCtl.capture);