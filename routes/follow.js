const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow');

router.get('/prueba-follow', followController.pruebasFollow);

module.exports = router;