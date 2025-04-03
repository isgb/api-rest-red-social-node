const Follow = require('../models/follow'); // Importamos el modelo de Follow

const followUsersIds = async (identityUserId) => {
    try {
        let following = await Follow.find({ user: identityUserId })
                                    .select({ "followed":1 }).exec(); // Sacamos los ids de los usuarios que sigo
        let followers = false;

        return {
            following,
            followers
        };
    } catch (err) {
        console.error('Error fetching follow data:', err.message);
        throw new Error('Error fetching follow data');
    }
}

const followThisUser = async (req, res) => {
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
    followUsersIds,
    followThisUser
}