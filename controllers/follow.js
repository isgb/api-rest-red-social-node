// Acciones de prueba
const pruebasFollow = (req,res) => {
    res.status(200).send({
        'message': 'Mensaje enviado desde los controlles follow.js'
    })
}

module.exports = {
    pruebasFollow
}