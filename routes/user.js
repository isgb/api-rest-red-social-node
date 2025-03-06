const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

//Definir rutas
router.get('/prueba-usuario', userController.pruebasUsuario);

module.exports = router;