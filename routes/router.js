const router = require('express').Router();

// router.use('/v1', require('./v1/v1routes'));
router.use('/v2', require('./v2/v2routes'));

module.exports = router