const express = require('express');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;

const asyncHandler = require('express-async-handler');
const taskCtl = require('../controllers/task.controller');
let Response = require('../const/response');


let taskValidation = require('../validations/task.validation');
const { authorize } = require("../middlewares/authMiddleware");
const validate = require('../middlewares/validate');

const router = express.Router();
module.exports = router;

//router.use(passport.authenticate('jwt', { session: false }))
//router.route('').post(asyncHandler(addTask));
router.route('').post(authorize('manage_task'), validate(taskValidation.addTask), taskCtl.addTask);
router.route('/search').post(authorize('manage_task'), validate(taskValidation.searchTasks), taskCtl.searchTasks);
router.route('/:taskId').get(authorize('manage_task'), validate(taskValidation.getTask), taskCtl.getTask);
router.route('/:taskId').put(authorize('manage_task'), validate(taskValidation.updateTask), taskCtl.updateTask);
router.route('/:taskId/remove').post(authorize('manage_task'), validate(taskValidation.removeTask), taskCtl.removeTask);
router.route('/:taskId/complete').post(authorize('manage_task'), validate(taskValidation.markComplete), taskCtl.markComplete);
