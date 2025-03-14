const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/user');
const check = require('../middlewares/auth');

// Configurar multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/users');
    },
    filename: (req, file, cb) => {
        const date = new Date();
        const dateNow = date.getFullYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds();
        cb(null, dateNow + file.originalname);
    }
});

//Definir rutas
router.get('/prueba-usuario', check.auth ,userController.pruebasUsuario);
router.post('/register', userController.register)
router.post("/login", userController.login)
router.get("/profile/:id", check.auth, userController.profile)
router.get("/list/:page?", check.auth, userController.list)
router.put("/update", check.auth, userController.update)
router.post("/upload", check.auth, userController.upload)

module.exports = router;