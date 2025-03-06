// Acciones de prueba
const pruebasPublication = (req,res) => {
    res.status(200).send({
        'message': 'Mensaje enviado desde los controlles publication.js'
    })
}

module.exports = {
    pruebasPublication
}