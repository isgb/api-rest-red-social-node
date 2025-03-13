const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const check = require('../middlewares/auth');

//Definir rutas
router.get('/prueba-usuario', check.auth ,userController.pruebasUsuario);
router.post('/register', userController.register)
router.post("/login", userController.login)
router.get("/profile/:id", check.auth, userController.profile)
router.get("/list/:page?", check.auth, userController.list)

module.exports = router;