const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

//Definir rutas
router.get('/prueba-usuario', userController.pruebasUsuario);
router.post('/register', userController.register)
router.post("/login", userController.login)

module.exports = router;