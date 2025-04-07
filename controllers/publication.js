const Publication = require('../models/publication');

// Acciones de prueba
const pruebasPublication = (req,res) => {
    res.status(200).send({
        'message': 'Mensaje enviado desde los controlles publication.js'
    })
}

// Guardar una publicación
const save = async (req, res) => {
    // Recoger los datos de la petición
    const params = req.body; // Recogemos el body de la petición

    // Si no me llega el texto, devolver error
    if (!params.text) {
        return res.status(400).send({
            status: 'error',
            message: 'Debes enviar un texto'
        });
    }

    // Sacar el id del usuario que sigue
    const identity = req.user; // Sacamos el id del usuario que sigue desde el token

    // Crear objeto con modelo publication
    let publication = new Publication({
        user: identity.id, // Usuario que sigue
        text: params.text, // Texto de la publicación
        file: params.file // Archivo de la publicación
    });

    // Guardar objeto en bbdd
    try {
        const publicationStored = await publication.save();
        if (!publicationStored) {
            return res.status(400).send({
                status: 'error',
                message: 'Error al guardar la publicación'
            });
        }
        return res.status(200).send({
            status: 'success',
            message: 'Publicación guardada correctamente',
            publication: publicationStored
        });
    } catch (err) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al guardar la publicación',
            error: err.message
        });
    }
}

// Sacar una publicación
const detail = async (req, res) => {
    // Recoger el id de la publicación
    const publicationId = req.params.id;

    // Comprobar que existe la publicación
    try {
        const publication = await Publication.findById(publicationId)
                             .populate('user', '_id').exec();
        if (!publication) {
            return res.status(404).send({
                status: 'error',
                message: 'No se ha encontrado la publicación'
            });
        }
        return res.status(200).send({
            status: 'success',
            message: 'Publicación encontrada',
            publication
        });
    } catch (err) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al buscar la publicación',
            error: err.message
        });
    }
}

// Eliminar publicaciones
const remove = async (req, res) => {
    // Recoger el id de la publicación
    const publicationId = req.params.id;

    // Comprobar que existe la publicación
    try {
        const publication = await Publication.findById(publicationId)
                             .populate('user', '_id').exec();
        if (!publication) {
            return res.status(404).send({
                status: 'error',
                message: 'No se ha encontrado la publicación'
            });
        }
        // Eliminar publicación
        await Publication.findByIdAndDelete(publicationId);
        return res.status(200).send({
            status: 'success',
            message: 'Publicación eliminada correctamente'
        });
    } catch (err) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al eliminar la publicación',
            error: err.message
        });
    }
}

// Listar publicaciones de un usuario
const user = async (req, res) => {
    // Recoger el id de la publicación
    const userId = req.params.id;

    // Controlar la página 
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    let itemsPerPage = 5; // Número de publicaciones por página

    // Comprobar que existe la publicación
    try {
        const publication = await Publication.find({ user: userId })
                             .sort('-created_at') // Ordenar por fecha de creación descendente
                             .populate('user', '_id')
                             .skip((page - 1) * itemsPerPage) // Saltar publicaciones según la página
                             .limit(itemsPerPage); // Limitar el número de publicaciones por página

        if (!publication || publication.length === 0) {
            return res.status(404).send({
                status: 'error',
                message: 'No se han encontrado publicaciones'
            });
        }

        const total = await Publication.countDocuments({ user: userId }); // Total de publicaciones del usuario

        return res.status(200).send({
            status: 'success',
            message: 'Publicaciones encontradas',
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage), // Total de páginas
            publication
        });
    } catch (err) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al buscar las publicaciones',
            error: err.message
        });
    }
}

module.exports = {
    pruebasPublication,
    save,
    detail,
    remove,
    user
}