const express = require('express');
const authRoutes = require('./auth.route');
const articleRoute = require('./article.route');
const topicRoute = require('./topic.route');
const sourceRoute = require('./source.route');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/auth', authRoutes);
router.use('/topics', topicRoute);
router.use('/articles', articleRoute);
router.use('/sources', sourceRoute);

module.exports = router;
