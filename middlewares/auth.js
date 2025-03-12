// Importar módulos
const jwt = require('jwt-simple')
const moment = require('moment')

// Importar clave secreta
const libjwt = require('../services/jwt')
const secret = libjwt.secret

// Crear middleware
const auth = (req, res, next) => {
    // Comprobar si llega autorización
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'No authorization header'
        })
    }

    // Limpiar token y comillas
    let token = req.headers.authorization.replace(/['"]+/g, '')

    // Decodificar token
    try {
        var payload = jwt.decode(token, secret)

        // Comprobar si token ha expirado
        // Si la fecha de expiración es menor a la fecha actual
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                message: 'Token has expired'
            })
        }
    } catch (ex) {
        return res.status(404).send({
            message: 'Invalid token'
        })
    }

    // Adjuntar usuario identificado a la request
    req.user = payload

    // Pasar a la acción
    next()
}

module.exports = {auth}