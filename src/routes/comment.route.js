const express = require('express');
const _ = require('lodash');
const validate = require('../middlewares/validate');
const { authorize } = require("../middlewares/authMiddleware");

const commentValidation = require('../validations/comment.validation');

const commentCtrl = require('../controllers/comment.controller');

const router = express.Router();
module.exports = router;

router.route('/:commentId').delete(authorize('update_comment'), validate(commentValidation.deleteComment), commentCtrl.deleteComment);
router.route('/:commentId').put(authorize('update_comment'), validate(commentValidation.updateComment), commentCtrl.updateComment);
router.route('/:commentId/replies').post(authorize('update_comment'), validate(commentValidation.replyToComment), commentCtrl.replyToComment);
router.route('/:commentId/replies').get(authorize('update_comment'), validate(commentValidation.getCommentReplies), commentCtrl.getCommentReplies);
router.route('/:commentId/reaction').post(authorize('update_comment'), validate(commentValidation.addReactionToCommentById), commentCtrl.addReactionToCommentById);
