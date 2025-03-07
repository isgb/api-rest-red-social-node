const User = require('../models/user');

const pruebasUsuario = (req,res) => {
    res.status(200).send({
        'message': 'Mensaje enviado desde los controlles user.js'
    })
}

const register = (req,res) => {
    //Recoger datos de la petición
    let params = req.body

    if(!params.name || !params.nick || !params.email || !params.password){
        return res.status(400).send({
            status: 'error',
            message: 'Faltan datos por enviar'
        })
    }


    res.status(200).send({
        message: "Acción de registro de usuario"
    })
}

module.exports = {
    pruebasUsuario,
    register
}