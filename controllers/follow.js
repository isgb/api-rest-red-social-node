const Follow = require('../models/follow'); // Importamos el modelo de Follow
const User = require('../models/user'); // Importamos el modelo de User

// Importar dependencias
const mongoosePaginate = require('mongoose-pagination'); // Importamos la dependencia de paginación

// Acciones de prueba
const pruebasFollow = (req,res) => {
    res.status(200).send({
        'message': 'Mensaje enviado desde los controlles follow.js'
    })
}

const save = async (req, res) => {
    
    // Recoger los datos de la petición
    const params = req.body; // Recogemos el body de la petición

    // Sacar el id del usuario que sigue
    const identity = req.user; // Sacamos el id del usuario que sigue desde el token

    // Crear objeto con modelo follow
    let userToFollow = new Follow({
        user: identity.id, // Usuario que sigue
        followed: params.followed // Usuario seguido
    });

    // Guardar objeto en bbdd
    try {
        const followStored = await userToFollow.save();
        if (!followStored) {
            return res.status(400).send({
                status: 'error',
                message: 'Error al seguir el usuario'
            });
        }
        return res.status(200).send({
            status: 'success',
            message: 'Usuario seguido correctamente',
            follow: followStored
        });
    } catch (err) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al seguir el usuario',
            error: err.message
        });
    }
}

const unfollow =async (req, res)=>{
    //recoger el id del usuario identificado
    const userId = req.user.id;
    //recoger el id del usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id;
    //find de las coincidencias y hacer un remove
    try {
        let unFollowUser = await Follow.find({
            "user": userId,
            "followed":followedId
        }).deleteOne()
        return res.status(200).send({
            status:"successs",
            message:"Follow eliminado correctamente",
            unFollowUser
        });
    } catch (error) {
        if (error || !followDeleted) {
            return res.status(500).send({
                status:"error",
                message:"no has dejado de seguir a nadie"
            })
        }
    }
}

// Accion de listado de usuarios que cualquier usuario esta siguiendo
const following = async (req, res) => {
    // Sacar el id del usuario que sigue
    let userId = req.user.id; // Sacamos el id del usuario que sigue desde el token

    // Comprobar si me llego el id por parametro de la url
    if(req.params.id) {
        userId = req.params.id; // Si me llega el id por parametro lo guardo en userId
    }

    // Comprobar si me llega la pagina, si no la pagina es 1
    if(!req.params.page || req.params.page == null || req.params.page == undefined || isNaN(req.params.page)) {
        var page = 1; // Si no me llega la pagina la pongo en 1
    } else {
        var page = req.params.page; // Si me llega la pagina la guardo en page
    }

    // Usuarios por pagina quiero mostrar
    const itemsPerPage = 5; // Definimos cuantas entradas queremos mostrar por pagina

    // Find a follow, porpular datos de los usuarios y paginar con mongoosePaginate
    try {
        const follows = await Follow.find({ user: userId })
                            .populate({ path: 'followed', select: '-password -__v -role' })
                            .paginate(page, itemsPerPage).exec();
        if (!follows) {
            return res.status(404).send({
                status: 'error',
                message: 'No tienes usuarios seguidos'
            });
        }
        return res.status(200).send({
            status: 'success',
            message: 'Usuarios seguidos',
            follows
        });
    } catch (err) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al listar los usuarios seguidos',
            error: err.message
        });
    }

    // Comprobar si existe el usuario
    try {
        const user = await User.findById(userId).populate('followed').exec();
        if (!user) {
            return res.status(404).send({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        return res.status(200).send({
            status: 'success',
            message: 'Usuarios seguidos',
            followed: user.followed
        });
    } catch (err) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al listar los usuarios seguidos',
            error: err.message
        });
    }
}

// Accion de listado de usuarios que siguen a cualquier otro usuario (soy seguido, mis seguidores)
const followers = async (req, res) => {
    // Sacar el id del usuario que sigue
    const userId = req.user.id; // Sacamos el id del usuario que sigue desde el token

    // Comprobar si existe el usuario
    try {
        const user = await User.findById(userId).populate('user').exec();
        if (!user) {
            return res.status(404).send({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        return res.status(200).send({
            status: 'success',
            message: 'Usuarios que me siguen',
            followers: user.user
        });
    } catch (err) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al listar los usuarios que me siguen',
            error: err.message
        });
    }
}

module.exports = {
    pruebasFollow,
    save,
    unfollow,
    following,
    followers
}