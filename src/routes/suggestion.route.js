const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const suggestionCtl = require('../controllers/suggestion.controller');
const validate = require("../middlewares/validate");
const suggestionValidation = require("../validations/suggestion.validation");

const router = express.Router();
module.exports = router;


// router.route('/search').get(asyncHandler(getSuggestion));
router.get('/search', validate(suggestionValidation.getSuggestion), suggestionCtl.getSuggestion);


