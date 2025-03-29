const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow');
const check = require('../middlewares/auth'); // Middleware de autenticación

router.get('/prueba-follow', followController.pruebasFollow);
router.post('/follow', check.auth ,followController.save);

module.exports = router;