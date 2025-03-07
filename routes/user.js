const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

//Definir rutas
router.get('/prueba-usuario', userController.pruebasUsuario);
router.post('/register', userController.register)

module.exports = router;