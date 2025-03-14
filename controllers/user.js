const User = require("../models/user");
const bcrypt = require("bcrypt");
// const mongoosePagination = require("mongoose-pagination");

const jwt = require("../services/jwt");

const pruebasUsuario = (_, res) => {
  res.status(200).send({
    message: "Mensaje enviado desde los controlles user.js",
  });
};

const register = async (req, res) => {
  //Recoger datos de la petición
  let params = req.body;

  if (!params.name || !params.nick || !params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

  // Crear objeto de usuario
  let user_to_save = new User(params);
  try {
    // Control usuarios duplicados
    let duplicated_user = await User.find({
      $or: [
        { email: user_to_save.email.toLowerCase() },
        { nick: user_to_save.nick.toLowerCase() },
      ],
    }).exec();

    if (duplicated_user && duplicated_user.length >= 1) {
      return res.status(400).json({
        status: "error",
        message: "El usuario ya ha sido registrado",
      });
    }

    // Cifrar la contraseña
    let pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;

    // Crear objeto de usuario
    user_to_save = new User(params);

    // Guardar usuario en la BD
    let user_saved = await user_to_save.save();
    if (!user_saved) {
      // Devolver resultado si marca error en registro
      return res.status(500).send({
        message: "Error saving user",
        status: "error",
      });
    }

    // Devolver resultado
    return res.status(200).json({
      message: "Register action",
      status: "success",
      user_to_save,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Error al registrar",
      error,
    });
  }
};

const login = async (req, res) => {
  let params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).json({
      status: "error",
      message: "Alguno de los campos esta vacío",
    });
  }

  let user_searched = await User.findOne({ email: params.email });

  if (!user_searched) {
    return res.status(404).send({
      status: "error",
      message: "The user does not exist.",
    });
  }

  // Comprobar la contraseña
  const pwd = bcrypt.compareSync(params.password, user_searched.password);
  // CompareSync regresa true o false
  if (!pwd) {
    return res.status(404).send({
      status: "error",
      message: "The authentication is incorrect, check your data.",
    });
  }

  // Si es correcta devolver token
  const token = jwt.createToken(user_searched);

  // Devolver los datos del usuario
  return res.status(200).json({
    status: "success",
    message: "Successful login",
    searched_user: {
      id: user_searched._id,
      name: user_searched.name,
      nick: user_searched.nick,
    },
    token,
  });

};

const profile = async (req, res) => {
  // Recibir el parámetro del id del usuario
  let id = req.params.id;

  // Consulta para sacar los datos del usuario
  try {
    let user = await User.findById(id)
      .select({ password: 0, role: 0 })

    if (!user) {
      return res.status(404).send({
        message: "El usuario no existe",
        status: "error",
      });
    }

    // Devolver resultado
    return res.status(200).send({
      status: "success",
      user,
    });
  } catch (err) {
    return res.status(500).send({
      message: "Error en la petición",
      status: "error",
    });
  }
}

const list = async (req, res) => {
  // Controlar en que pagina estamos
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }

  page = parseInt(page);

  // Consulta con mongoose para sacar los usuarios
  let items_per_page = 5;
  try {
    const users = await User.find()
      .select({ password: 0, role: 0 })
      .sort("_id")
      .skip((page - 1) * items_per_page)
      .limit(items_per_page);

    const total = await User.countDocuments();

    if (!users) {
      return res.status(404).send({
        status: "error",
        message: "No hay usuarios disponibles",
      });
    }

    return res.status(200).send({
      status: "success",
      users,
      page,
      items_per_page,
      total,
      pages: Math.ceil(total / items_per_page),
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: "Error en la petición",
      err
    });
  }
}

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
      userIdentity.id,
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
  
}

module.exports = {
  pruebasUsuario,
  register,
  login,
  profile,
  list,
  update,
  upload
};
