const Follow = require('../models/follow'); // Importamos el modelo de Follow
const User = require('../models/user'); // Importamos el modelo de User

// Acciones de prueba
const pruebasFollow = (req,res) => {
    res.status(200).send({
        'message': 'Mensaje enviado desde los controlles follow.js'
    })
}

const save = (req, res) => {
    
    // Recoger los datos de la petición
    const params = req.body; // Recogemos el body de la petición

}

module.exports = {
    pruebasFollow,
    save
}