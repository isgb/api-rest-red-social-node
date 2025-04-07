const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication');
const check = require('../middlewares/auth'); // Middleware de autenticación

router.get('/prueba-publication', publicationController.pruebasPublication);
router.post('/save', check.auth ,publicationController.save); // Guardar publicación
router.get('/detail/:id', check.auth ,publicationController.detail); // Sacar 
router.delete('/remove/:id', check.auth ,publicationController.remove); // Eliminar publicación

module.exports = router;