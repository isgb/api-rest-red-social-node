// Acciones de prueba

const pruebasUsuario = (req,res) => {
    res.status(200).send({
        'message': 'Mensaje enviado desde los controlles user.js'
    })
}

module.exports = {
    pruebasUsuario
}