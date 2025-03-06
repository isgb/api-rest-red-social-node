const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication');

router.get('/prueba-publication', publicationController.pruebasPublication);

module.exports = router;