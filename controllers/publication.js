const Publication = require('../models/publication');
//Importar modulos
const fs = require("fs");
const path = require("path");

// importar servicios
const followService = require("../services/followServices");
const { following } = require('./follow');

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
                             .paginate(page, itemsPerPage);
                            //  .skip((page - 1) * itemsPerPage) // Saltar publicaciones según la página
                            //  .limit(itemsPerPage); // Limitar el número de publicaciones por página

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

//Subir archivos
const update = async (req, res) => {
  // Recoger datos del usuario
  let userIdentity = req.user;
  let userToUpdate = req.body;

  console.log("userIdentity: ",userIdentity);

  // Eliminar campos sobrantes
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;

  // Comprobar si usuario ya existe
  let duplicated_user = await User.find({
    $or: [
      { email: userToUpdate.email.toLowerCase() },
      { nick: userToUpdate.nick.toLowerCase() },
    ],
  }).exec();

  let userIsset = false;
  duplicated_user.forEach((user) => {
    if (user && user._id != userIdentity.id) {
      userIsset = true;
    }
  });

  if (userIsset) {
    return res.status(400).json({
      status: "error",
      message: "El usuario ya ha sido registrado",
    });
  }

  // Cifrar la contraseña
  if (userToUpdate.password) {
    let pwd = await bcrypt.hash(userToUpdate.password, 10);
    userToUpdate.password = pwd;
  }

  // Buscar y actualizar
  try {
    const userUpdated = await User.findByIdAndUpdate(
      {_id:userIdentity.id},
      userToUpdate,
      { new: true }
    );

    if (!userUpdated) {
      return res.status(404).send({
        status: "error",
        message: "No se ha podido actualizar el usuario",
      });
    }

    // Devolver resultado
    return res.status(200).send({
      status: "success",
      user: userUpdated,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error en la petición",
    });
  }

}

const upload = async (req,res) =>{

    // SACAR la id de publication
    const publicationId = req.params.id;

  if(!req.file) {
    return res.status(400).send({
      status: "error",
      message: "No se han subido archivos",
    });
  }

  let image = req.file.originalname;

  const imageSplit = image.split("\.");
  const extension = imageSplit[1];

  // Comprobar la extensión
  const valid_extensions = ["png", "jpg", "jpeg", "gif"];
  if (!valid_extensions.includes(extension)) {
    const filePath = req.file.path;
    const fileDeleted = fs.unlinkSync(filePath);

    return res.status(400).send({
      status: "error",
      message: "La extensión no es válida",
    });
  }

  //Si es correcta, guardar imagen en la base de datos
  try {
    const publicationUpdated = await Publication.findByIdAndUpdate(
      {user:req.user.id, _id: publicationId},
      { file: req.file.filename },
      { new: true }
    );

    if (!publicationUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error al guardar la imagen de usuario",
      });
    }

    return res.status(200).send({
      status: "success",
      user: publicationUpdated,
      file: req.file,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error al guardar la imagen de usuario",
      error: err,
    });
  }
}

const media = async (req, res) => {
  // Recoger el parámetro de la url
  const file = req.params.file;

  // Comprobar si existe el fichero
  const filePath = "./uploads/publications/" + file;
  fs.stat(filePath, (err, exists) => {
    if (err || !exists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la imagen",
      });
    }

    // Devolver el archivo
    return res.sendFile(path.resolve(filePath));
  });
}

// CAMBIAR: Lista de publicaciones (FEED)
const feed  = async(req,res) => {

    // Sacar la pagina actual
    let page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    // Establecer numero de elemmentos por pagina
    let itemsPerPage = 5;

    try {
    // Sacar un array de identificadores de usuarios que yo sigo como usuario logueado
    const myFollows = await followService.followUsersIds(req.user.id);

    // Find a publcicaciones in, ordenar, popular, paginar  
    const publications = await Publication.find({
        user: myFollows.following
        // user: {"$in": myFollows.following }
    }).populate("user", "password -role -__v -email")
      .sort("-created_at")
      .paginate(page, itemsPerPage)

    const total = await Publication.countDocuments({ user: userId }); // Total de publicaciones del usuario

    return res.status(200).send({
        status: "error",
        message: "Feed de publicaciones",
        following: myFollows.following,
        publications,
        total,           
        page,
        itemsPerPage,
        total,
        pages: Math.ceil(total / itemsPerPage), // Total de páginas
    })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No se han listado las pblicaciones del feed",
        })
    }


}

module.exports = {
    pruebasPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}