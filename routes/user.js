const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const check = require('../middlewares/auth');

//Definir rutas
router.get('/prueba-usuario', check.auth ,userController.pruebasUsuario);
router.post('/register', userController.register)
router.post("/login", userController.login)

module.exports = router;