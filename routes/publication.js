const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication');
const check = require('../middlewares/auth'); // Middleware de autenticación
const multer = require('multer');
const { upload } = require('../controllers/user');

// Configurar multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/publications');
    },
    filename: (req, file, cb) => {
        cb(null, "pub-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({ storage });

router.get('/prueba-publication', publicationController.pruebasPublication);
router.post('/save', check.auth ,publicationController.save); // Guardar publicación
router.get('/detail/:id', check.auth ,publicationController.detail); // Sacar 
router.delete('/remove/:id', check.auth ,publicationController.remove); // Eliminar publicación
router.get('/user/:id?/:page?', check.auth ,publicationController.user); // Sacar publicaciones de un usuario
router.post('/upload/:id',[check.auth,upload.single('file0')], publicationController.upload)
router.get("/media/:file", check.auth, publicationController.media)
router.get("/feed", check.auth, publicationController.feed)

module.exports = router;