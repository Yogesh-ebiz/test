const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const articleCtl = require('../controllers/article.controller');
let Response = require('../const/response');
const validate = require("../middlewares/validate");
const articleValidation = require("../validations/article.validation");

const router = express.Router();
module.exports = router;

router.post('', validate(articleValidation.createArticle), articleCtl.createArticle);
router.get('', validate(articleValidation.getArticles), articleCtl.getArticles);
router.get('/landing', validate(articleValidation.getLanding), articleCtl.getLanding);
router.get('/trending', validate(articleValidation.getTrending), articleCtl.getTrending);
router.get('/latest', validate(articleValidation.getLatest), articleCtl.getLatest);
// router.route('/trending/:topic').get(asyncHandler(getTrendingByTopic));
// router.route('/search').get(asyncHandler(searchArticles));
router.get('/:id', validate(articleValidation.getArticle), articleCtl.getArticle);
router.post('/:id/featured', validate(articleValidation.updateArticleFeatured), articleCtl.updateArticleFeatured);
// router.route('/topic/:topic').get(asyncHandler(getArticlesByTopic));



