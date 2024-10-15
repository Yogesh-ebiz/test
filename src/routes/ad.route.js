const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const adCtl = require('../controllers/ad.controller');
let Response = require('../const/response');
const validate = require("../middlewares/validate");
const adValidation = require("../validations/ad.validation");


const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
router.get('', validate(adValidation.getAds), adCtl.getAds);

