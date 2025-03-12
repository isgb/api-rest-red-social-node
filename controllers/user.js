const User = require("../models/user");
const bcrypt = require("bcrypt");

const jwt = require("../services/jwt");

const pruebasUsuario = (req, res) => {
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

module.exports = {
  pruebasUsuario,
  register,
  login,
};
